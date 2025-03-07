import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';
import { 
  Caption, 
  CaptionTone, 
  CaptionLength, 
  SpicyLevel, 
  CaptionStyle, 
  CreativeLanguageOptions 
} from '../types/caption';

interface OpenAIError {
  message: string;
  code?: string;
  status?: number;
}

// Simple in-memory cache for API responses
interface CacheEntry {
  timestamp: number;
  response: any;
}

// Cache that expires after 24 hours
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const responseCache: Record<string, CacheEntry> = {};

// Create OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Helper function to extract JSON from a string that might contain additional text
function extractJsonFromString(str: string): any {
  try {
    // First, try direct JSON parsing
    return JSON.parse(str);
  } catch (e) {
    // If direct parsing fails, try to extract JSON from the string
    try {
      // Look for JSON object pattern
      const jsonPattern = /{[\s\S]*}/;
      const match = str.match(jsonPattern);
      
      if (match && match[0]) {
        // Try to parse the extracted JSON
        const extractedJson = JSON.parse(match[0]);
        
        // Validate the extracted JSON structure
        if (extractedJson) {
          // If we have a captions array, return it directly
          if (Array.isArray(extractedJson.captions)) {
            return extractedJson;
          }
          
          // If we have a single caption object with text field, wrap it in a captions array
          if (extractedJson.text) {
            return {
              captions: [validateCaptionFields(extractedJson)]
            };
          }
          
          // If we have a captions field but it's not an array, validate and wrap it
          if (extractedJson.captions && !Array.isArray(extractedJson.captions)) {
            return {
              captions: [validateCaptionFields(extractedJson.captions)]
            };
          }
          
          // For any other structure, return the extracted JSON as is
          return extractedJson;
        }
      }
      
      // If no valid JSON object was found, try to extract multiple JSON objects
      const jsonObjects = str.match(/{[\s\S]*?}/g);
      if (jsonObjects && jsonObjects.length > 0) {
        // Try each extracted object until we find a valid one
        for (const jsonObj of jsonObjects) {
          try {
            const parsed = JSON.parse(jsonObj);
            if (parsed && (parsed.text || parsed.captions)) {
              // If we found a valid caption object or captions array
              if (parsed.captions) {
                return parsed;
              } else if (parsed.text) {
                return {
                  captions: [validateCaptionFields(parsed)]
                };
              }
            }
          } catch (parseError) {
            // Continue to the next object if parsing fails
            continue;
          }
        }
      }
    } catch (extractError) {
      console.error('Error extracting JSON:', extractError);
    }
    
    // If all extraction attempts fail, return a fallback object
    return {
      captions: [
        {
          text: "Unable to generate a proper caption. Please try again.",
          category: "Error",
          hashtags: [],
          viral_score: 5
        }
      ]
    };
  }
}

// Helper function to validate and provide defaults for caption fields
function validateCaptionFields(caption: any): any {
  return {
    text: caption.text || "No caption text provided",
    category: caption.category || "General",
    hashtags: Array.isArray(caption.hashtags) ? caption.hashtags : [],
    emojis: Array.isArray(caption.emojis) ? caption.emojis : [],
    viral_score: typeof caption.viral_score === 'number' ? caption.viral_score : 5
  };
}

// Wrapper for OpenAI chat completions with caching
export const getCachedChatCompletion = async (params: any) => {
  // Check if we should bypass cache (if timestamp is provided)
  const shouldBypassCache = params.timestamp !== undefined;
  
  // Create a cache key based on the request parameters
  // Exclude timestamp from the cache key to avoid cache pollution
  const paramsForCacheKey = { ...params };
  delete paramsForCacheKey.timestamp;
  
  const cacheKey = JSON.stringify({
    model: paramsForCacheKey.model,
    messages: paramsForCacheKey.messages,
    max_tokens: paramsForCacheKey.max_tokens,
  });
  
  // Check if we have a cached response that hasn't expired
  const cachedEntry = responseCache[cacheKey];
  if (!shouldBypassCache && cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_EXPIRY) {
    console.log('Using cached OpenAI response');
    return cachedEntry.response;
  }
  
  // If no cache hit or bypass requested, make the actual API call
  console.log('Making new OpenAI API call');
  
  // Remove timestamp from params before sending to OpenAI
  const openaiParams = { ...params };
  delete openaiParams.timestamp;
  
  try {
    const response = await openai.chat.completions.create(openaiParams);
    
    // Cache the response (even if bypass was requested, for future use)
    responseCache[cacheKey] = {
      timestamp: Date.now(),
      response,
    };
    
    return response;
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // Create a fallback response that won't break the application
    const fallbackResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              captions: [
                {
                  text: "Unable to generate caption. Please try again.",
                  category: "General",
                  hashtags: [],
                  viral_score: 5
                }
              ]
            })
          }
        }
      ]
    };
    
    // Don't cache error responses
    
    // If it's a rate limit error, provide specific information
    if (error.status === 429) {
      console.warn('OpenAI rate limit exceeded. Using fallback response.');
      fallbackResponse.choices[0].message.content = JSON.stringify({
        captions: [
          {
            text: "Rate limit exceeded. Please try again in a moment.",
            category: "Error",
            hashtags: [],
            viral_score: 5
          }
        ]
      });
    } else if (error.message && error.message.includes('maximum context length')) {
      console.warn('OpenAI context length exceeded. Using fallback response.');
      fallbackResponse.choices[0].message.content = JSON.stringify({
        captions: [
          {
            text: "Image is too complex. Please try a different image or reduce image quality.",
            category: "Error",
            hashtags: [],
            viral_score: 5
          }
        ]
      });
    }
    
    return fallbackResponse;
  }
};

export const generateCaption = async (
  imageUri: string,
  tone: CaptionTone = 'casual',
  includeHashtags: boolean = true,
  includeEmojis: boolean = true,
  captionLength: CaptionLength = 'micro',
  spicyLevel: SpicyLevel = 'none',
  captionStyle: CaptionStyle = 'none',
  creativeLanguageOptions: CreativeLanguageOptions = {
    wordInvention: false,
    alliteration: false,
    rhyming: false
  },
  retryCount = 0
): Promise<Caption[]> => {
  try {
    // Prepare a concise system message to save tokens
    let systemMessage = `Generate ${captionLength === 'single-word' ? 'one-word' : 
      captionLength === 'micro' ? '2-3 word' : 
      captionLength === 'short' ? '10-15 word' : 
      captionLength === 'medium' ? '25-40 word' : '50-75 word'} Instagram captions in ${tone} tone.`;
    
    // Add only essential style instructions to save tokens
    if (spicyLevel !== 'none') {
      systemMessage += ` Make it ${spicyLevel} spicy.`;
    }
    
    if (captionStyle !== 'none') {
      systemMessage += ` Use ${captionStyle} style.`;
    }
    
    // Add creative language options only if enabled
    const creativeOptions = [];
    if (creativeLanguageOptions.wordInvention) creativeOptions.push('word invention');
    if (creativeLanguageOptions.alliteration) creativeOptions.push('alliteration');
    if (creativeLanguageOptions.rhyming) creativeOptions.push('rhyming');
    
    if (creativeOptions.length > 0) {
      systemMessage += ` Include ${creativeOptions.join(', ')}.`;
    }
    
    // Format requirements - keep it minimal but clear
    systemMessage += `\n\nReturn exactly 5 captions as JSON: {"captions":[{"text":"caption text","category":"category","hashtags":${includeHashtags ? '["tag1","tag2"]' : '[]'},"emojis":${includeEmojis ? '["emoji1","emoji2"]' : '[]'},"viral_score":7}]}`;

    // Cost-saving measure: Limit token usage
    const MAX_TOKENS = 500; // Reduced from 800

    // Create a timeout promise to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 30000); // 30 second timeout
    });

    // Create the actual API call promise
    const apiCallPromise = getCachedChatCompletion({
      model: "gpt-4o-mini", // Use the mini model to save costs
      messages: [
        { role: "system", content: systemMessage },
        { 
          role: "user", 
          content: [
            { type: "text", text: "Generate Instagram captions for this image:" },
            { 
              type: "image_url", 
              image_url: { url: imageUri }
            }
          ]
        }
      ],
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
      timestamp: Date.now(), // Add timestamp to bypass cache
    });

    // Race the API call against the timeout
    const response = await Promise.race([apiCallPromise, timeoutPromise])
      .catch(error => {
        console.error('Error during OpenAI request:', error);
        // Return a fallback response
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  captions: [
                    {
                      text: error.message === 'OpenAI API request timed out' 
                        ? "Request timed out. Please try again." 
                        : "Unable to generate caption. Please try again.",
                      category: "Error",
                      hashtags: [],
                      viral_score: 5
                    }
                  ]
                })
              }
            }
          ]
        };
      });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    const content = response.choices[0].message.content;
    
    try {
      // Parse the JSON response
      const parsedResponse = extractJsonFromString(content);
      
      if (parsedResponse && parsedResponse.captions && Array.isArray(parsedResponse.captions)) {
        // Map the captions to our Caption interface
        return parsedResponse.captions.map((caption: any) => ({
          id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
          text: caption.text || 'No caption text provided',
          category: caption.category || tone,
          hashtags: caption.hashtags || [],
          emojis: caption.emojis || [],
          createdAt: new Date(),
          viral_score: caption.viral_score || 5,
        }));
      } else {
        // Fallback if the response doesn't have the expected structure
        return [{
          id: Date.now().toString(),
          text: content.substring(0, 200), // Use the raw content as a fallback
          category: tone,
          hashtags: [],
          emojis: [],
          createdAt: new Date(),
          viral_score: 5,
        }];
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      
      // If we can't parse the JSON, return a fallback caption
      return [{
        id: Date.now().toString(),
        text: 'Unable to generate caption. Please try again.',
        category: tone,
        hashtags: [],
        emojis: [],
        createdAt: new Date(),
        viral_score: 5,
      }];
    }
  } catch (error: any) {
    const openAIError = error as OpenAIError;
    console.error('OpenAI API Error:', openAIError);
    
    // Retry logic for rate limiting or temporary errors
    if (retryCount < 3 && (
      openAIError.status === 429 || // Rate limit
      openAIError.status === 500 || // Server error
      openAIError.status === 503    // Service unavailable
    )) {
      const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      console.log(`Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return generateCaption(
        imageUri, 
        tone, 
        includeHashtags, 
        includeEmojis, 
        captionLength, 
        spicyLevel, 
        captionStyle, 
        creativeLanguageOptions, 
        retryCount + 1
      );
    }
    
    // Return a fallback caption if all retries fail
    return [{
      id: Date.now().toString(),
      text: openAIError.message || 'Failed to generate caption. Please try again.',
      category: 'Error',
      hashtags: [],
      emojis: [],
      createdAt: new Date(),
      viral_score: 5,
    }];
  }
};

export default openai; 