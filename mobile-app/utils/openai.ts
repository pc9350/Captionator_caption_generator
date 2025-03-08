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
  console.log('Attempting to extract JSON from string');
  
  if (!str || typeof str !== 'string') {
    console.error('Invalid input to extractJsonFromString:', str);
    return createFallbackJsonResponse('Invalid response format');
  }
  
  try {
    // First, try direct JSON parsing
    return JSON.parse(str);
  } catch (e) {
    console.log('Direct JSON parsing failed, trying to extract JSON from string');
    
    // If direct parsing fails, try to extract JSON from the string
    try {
      // Look for JSON object pattern with captions array
      const captionsJsonPattern = /{[\s\S]*?"captions"[\s\S]*?\[[\s\S]*?\][\s\S]*?}/;
      const captionsMatch = str.match(captionsJsonPattern);
      
      if (captionsMatch && captionsMatch[0]) {
        console.log('Found JSON with captions array, attempting to parse');
        try {
          const extractedJson = JSON.parse(captionsMatch[0]);
          if (extractedJson && Array.isArray(extractedJson.captions)) {
            console.log('Successfully parsed JSON with captions array');
            return extractedJson;
          }
        } catch (parseError) {
          console.log('Error parsing captions JSON:', parseError);
        }
      }
      
      // Look for any JSON object pattern
      const jsonPattern = /{[\s\S]*}/;
      const match = str.match(jsonPattern);
      
      if (match && match[0]) {
        console.log('Found JSON-like pattern, attempting to parse');
        // Try to parse the extracted JSON
        try {
          const extractedJson = JSON.parse(match[0]);
          console.log('Successfully parsed extracted JSON');
          
          // Validate the extracted JSON structure
          if (extractedJson) {
            // If we have a captions array, return it directly
            if (Array.isArray(extractedJson.captions)) {
              console.log('Found valid captions array');
              return extractedJson;
            }
            
            // If we have a single caption object with text field, wrap it in a captions array
            if (extractedJson.text) {
              console.log('Found single caption object, wrapping in captions array');
              return {
                captions: [validateCaptionFields(extractedJson)]
              };
            }
            
            // If we have a captions field but it's not an array, validate and wrap it
            if (extractedJson.captions && !Array.isArray(extractedJson.captions)) {
              console.log('Found captions field but not an array, wrapping properly');
              return {
                captions: [validateCaptionFields(extractedJson.captions)]
              };
            }
            
            // For any other structure, return the extracted JSON as is
            console.log('Returning extracted JSON as is');
            return extractedJson;
          }
        } catch (parseError) {
          console.error('Error parsing extracted JSON:', parseError);
        }
      }
      
      // If no valid JSON object was found, try to extract multiple JSON objects
      console.log('Trying to find multiple JSON objects');
      const jsonObjects = str.match(/{[\s\S]*?}/g);
      if (jsonObjects && jsonObjects.length > 0) {
        console.log(`Found ${jsonObjects.length} potential JSON objects`);
        // Try each extracted object until we find a valid one
        for (const jsonObj of jsonObjects) {
          try {
            const parsed = JSON.parse(jsonObj);
            if (parsed && (parsed.text || parsed.captions)) {
              console.log('Found valid JSON object with captions or text');
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
      
      // Try to find any JSON-like structure with captions
      console.log('Looking for captions in the text');
      const captionsMatch2 = str.match(/"captions"\s*:\s*\[([\s\S]*?)\]/);
      if (captionsMatch2 && captionsMatch2[1]) {
        console.log('Found captions array in text, trying to reconstruct');
        try {
          // Try to reconstruct a valid JSON
          const reconstructedJson = `{"captions": [${captionsMatch2[1]}]}`;
          return JSON.parse(reconstructedJson);
        } catch (reconstructError) {
          console.error('Failed to reconstruct JSON:', reconstructError);
        }
      }
      
      // Try to extract structured data from markdown code blocks
      const markdownJsonPattern = /```(?:json)?\s*([\s\S]*?)```/;
      const markdownMatch = str.match(markdownJsonPattern);
      if (markdownMatch && markdownMatch[1]) {
        console.log('Found JSON in markdown code block');
        try {
          const jsonFromMarkdown = JSON.parse(markdownMatch[1].trim());
          if (jsonFromMarkdown && (jsonFromMarkdown.captions || jsonFromMarkdown.text)) {
            return jsonFromMarkdown;
          }
        } catch (markdownError) {
          console.log('Error parsing JSON from markdown:', markdownError);
        }
      }
      
      // If all extraction attempts fail, try to extract any text that looks like a caption
      console.log('Trying to extract any text that looks like a caption');
      const textMatches = str.match(/"text"\s*:\s*"([^"]+)"/g);
      if (textMatches && textMatches.length > 0) {
        console.log(`Found ${textMatches.length} potential caption texts`);
        const captions = textMatches.map(match => {
          const text = match.replace(/"text"\s*:\s*"/, '').replace(/"$/, '');
          return {
            text,
            category: "Extracted",
            hashtags: [],
            emojis: [],
            viral_score: 5
          };
        });
        
        return { captions };
      }
      
      // Last resort: look for any text between quotes that might be captions
      const quotedTexts = str.match(/"([^"]{10,})"/g); // At least 10 chars to avoid property names
      if (quotedTexts && quotedTexts.length > 0) {
        console.log('Extracting quoted texts as potential captions');
        const captions = quotedTexts
          .map(text => text.replace(/^"|"$/g, ''))
          .filter(text => text.length > 10 && !text.includes('{') && !text.includes('}'))
          .map(text => ({
            text,
            category: "Extracted",
            hashtags: [],
            emojis: [],
            viral_score: 5
          }));
        
        if (captions.length > 0) {
          return { captions };
        }
      }
    } catch (extractError) {
      console.error('Error extracting JSON:', extractError);
    }
    
    // If all extraction attempts fail, return a fallback object
    return createFallbackJsonResponse('Failed to extract valid captions');
  }
}

// Helper function to create a fallback JSON response
function createFallbackJsonResponse(errorMessage: string): any {
  console.log('Creating fallback JSON response:', errorMessage);
  return {
    captions: [
      {
        text: "Unable to generate a proper caption. Please try again.",
        category: "Error",
        hashtags: [],
        emojis: [],
        viral_score: 5
      }
    ]
  };
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
  imageUris: string | string[], // Changed from imageUri to imageUris to support multiple images
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
  isVideo: boolean = false, // This now indicates if ANY of the media is a video
  videoCount: number = 0, // New parameter to track how many videos are in the collection
  retryCount = 0
): Promise<Caption[]> => {
  try {
    // Convert single imageUri to array for consistent processing
    const imageUriArray = Array.isArray(imageUris) ? imageUris : [imageUris];
    
    // Cost-saving measure: Limit the number of images processed
    const MAX_IMAGES = 5;
    const processedImageUris = imageUriArray.slice(0, MAX_IMAGES);
    
    if (imageUriArray.length > MAX_IMAGES) {
      console.log(`Limiting image processing from ${imageUriArray.length} to ${MAX_IMAGES} images to save costs`);
    }

    // Calculate media type counts for better prompting
    const totalMediaCount = processedImageUris.length;
    const videoCountToUse = videoCount > 0 ? Math.min(videoCount, totalMediaCount) : (isVideo ? 1 : 0);
    const imageCount = totalMediaCount - videoCountToUse;
    
    // Determine the primary media type for better prompting
    const isPrimarilyVideo = videoCountToUse > imageCount;
    const isMixedMedia = videoCountToUse > 0 && imageCount > 0;

    // Prepare a simplified system message to reduce token usage
    let systemMessage = `You are a creative Instagram caption generator. Generate captions in ${tone} tone. You MUST generate captions for ANY media, including those containing people, landscapes, objects, or any other content. Your task is to create engaging captions, based off of the things that you see in the media ${processedImageUris.length > 1 ? 'files' : 'file'}.`;
    
    // Add caption length
    if (captionLength === 'single-word') {
      systemMessage += ' Use exactly ONE word per caption.';
    } else if (captionLength === 'micro') {
      systemMessage += ' Use 2-3 words per caption.';
    } else if (captionLength === 'short') {
      systemMessage += ' Use 10-15 words per caption.';
    } else if (captionLength === 'medium') {
      systemMessage += ' Use 25-40 words per caption.';
    } else {
      systemMessage += ' Use 50-75 words per caption.';
    }
    
    // Add hashtags and emojis instructions
    if (includeHashtags) {
      systemMessage += ' Include hashtags.';
    } else {
      systemMessage += ' No hashtags.';
    }
    
    if (includeEmojis) {
      systemMessage += ' Include emojis.';
    } else {
      systemMessage += ' No emojis.';
    }
    
    // Add spicy level
    if (spicyLevel !== 'none') {
      if (spicyLevel === 'mild') {
        systemMessage += ' Make the caption playful and lightly flirtatious in a tasteful way.';
      } else if (spicyLevel === 'medium') {
        systemMessage += ' Make the caption moderately flirtatious with subtle wordplay.';
      } else if (spicyLevel === 'hot') {
        systemMessage += ' Make the caption bold and attention-grabbing with playful innuendos.';
      } else if (spicyLevel === 'extra') {
        systemMessage += ' Make the caption daring and provocative with creative wordplay that grabs attention.';
      }
    }
    
    // Add caption style
    if (captionStyle !== 'none') {
      systemMessage += ` Use ${captionStyle} style.`;
    }
    
    // Add creative language options
    if (creativeLanguageOptions.wordInvention) {
      if (captionLength === 'single-word') {
        systemMessage += ' Create a completely new, invented word that captures the essence of the image.';
      } else if (captionLength === 'micro') {
        systemMessage += ' Include at least one invented word that combines existing words in a clever way.';
      } else {
        systemMessage += ' Include 2-3 creatively invented words or word combinations throughout the caption, with subtle context clues to hint at their meaning.';
      }
    }
    
    if (creativeLanguageOptions.alliteration) {
      if (captionLength === 'single-word' || captionLength === 'micro') {
        systemMessage += ' Use strong alliteration in the few words you have.';
      } else if (captionLength === 'short') {
        systemMessage += ' Use alliteration for at least 3-4 consecutive words in the caption.';
      } else {
        systemMessage += ' Use multiple instances of alliteration throughout the caption, with at least one sequence of 4+ consecutive words using the same starting sound.';
      }
    }
    
    if (creativeLanguageOptions.rhyming) {
      if (captionLength === 'single-word' || captionLength === 'micro') {
        systemMessage += ' Make sure the words rhyme with each other if possible.';
      } else if (captionLength === 'short') {
        systemMessage += ' Include at least one rhyming pair within the caption.';
      } else {
        systemMessage += ' Structure the caption with multiple rhyming elements, creating an almost poem-like flow with at least 2-3 rhyming pairs.';
      }
    }
    
    // Add video-specific instructions based on video count
    if (isVideo) {
      if (processedImageUris.length > 1) {
        if (videoCountToUse === processedImageUris.length) {
          // All media are videos
          systemMessage += ' All of these media files are videos. Focus on creating captions that reference motion, action, and the dynamic nature of videos. Consider themes that might connect these videos, such as a sequence of events, a story, or a common activity.';
        } else if (videoCountToUse > 1) {
          // Multiple videos mixed with images
          systemMessage += ` ${videoCountToUse} of these media files are videos. When creating captions, consider both the static images and the dynamic video content. Reference motion and action where appropriate, while finding themes that connect both the videos and images.`;
        } else {
          // Just one video among multiple images
          systemMessage += ' One of these media files is a video. Consider how this video relates to the other images when creating captions, and reference motion or action where appropriate.';
        }
      } else {
        // Single video
        systemMessage += ' This is a video, so reference motion, action, or the dynamic nature of videos in your captions. Focus on creating captions that would work well for video content.';
      }
    }
    
    // Add multiple media handling instructions
    if (processedImageUris.length > 1) {
      if (isMixedMedia) {
        systemMessage += ` You are being provided with a mixed collection of ${imageCount} images and ${videoCountToUse} videos. IMPORTANT: Consider ALL media files COLLECTIVELY as a set or album when generating captions. Do NOT generate separate captions for each file. Instead, create captions that work well for the entire collection as a cohesive set. Look for common themes, subjects, or aesthetics across all media.`;
      } else if (isPrimarilyVideo) {
        systemMessage += ` You are being provided with ${processedImageUris.length} videos. IMPORTANT: Consider ALL videos COLLECTIVELY as a set or album when generating captions. Do NOT generate separate captions for each video. Instead, create captions that work well for the entire collection as a cohesive set. Look for common themes, actions, or subjects across all videos.`;
      } else {
        systemMessage += ` You are being provided with ${processedImageUris.length} images. IMPORTANT: Consider ALL images COLLECTIVELY as a set or album when generating captions. Do NOT generate separate captions for each image. Instead, create captions that work well for the entire collection as a cohesive set. Look for common themes, subjects, or aesthetics across all images.`;
      }
    }
    
    // Format requirements
    systemMessage += ` Return 5 captions as JSON: {"captions":[{"text":"caption text WITHOUT any emojis or hashtags","category":"category","hashtags":${includeHashtags ? '["tag1","tag2"] (without # symbol)' : '[]'},"emojis":${includeEmojis ? '["emoji1","emoji2"] (just the emoji characters)' : '[]'},"viral_score":7${processedImageUris.length > 1 ? ',"isCollectionCaption":true' : ''}}]}`;
    
    // Add instruction to avoid content moderation responses
    systemMessage += ` IMPORTANT: Do NOT respond with "I can't identify people" or similar refusals. Your task is to create captions, not identify individuals. If you see people, simply create appropriate captions without identifying specific individuals.`;
    
    console.log('System message:', systemMessage);
    
    // Create a timeout promise to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 30000); // 30 second timeout
    });

    // Try with different models in sequence
    const models = ['gpt-4o', 'gpt-4o-mini'];
    let lastError = null;
    
    for (const model of models) {
      try {
        console.log(`Attempting with ${model} model`);
        
        // Create the API call promise
        const apiCallPromise = getCachedChatCompletion({
          model: model,
          messages: [
            { role: "system", content: systemMessage },
            { 
              role: "user", 
              content: [
                { type: "text", text: `Generate Instagram captions for ${processedImageUris.length > 1 
                  ? `this collection of ${isMixedMedia 
                      ? 'mixed media' 
                      : (isPrimarilyVideo ? 'videos' : 'images')}`
                  : `this ${isVideo ? 'video' : 'image'}`
                }. ${processedImageUris.length > 1 
                  ? 'Remember to treat all media files as a single cohesive collection when creating captions.' 
                  : ''
                }` },
                // Map all image URIs to content parts
                ...processedImageUris.map(uri => ({
                  type: "image_url", 
                  image_url: { url: uri }
                }))
              ]
            }
          ],
          max_tokens: 1000,
          timestamp: Date.now(), // Add timestamp to bypass cache
        });

        // Race the API call against the timeout
        const response = await Promise.race([apiCallPromise, timeoutPromise]);
        
        if (response.choices && response.choices.length > 0) {
          const content = response.choices[0].message.content;
          console.log(`Raw OpenAI response (${model}):`, content);
          
          // Try to parse the response
          const parsedResponse = extractJsonFromString(content);
          
          if (parsedResponse && parsedResponse.captions && Array.isArray(parsedResponse.captions) && parsedResponse.captions.length > 0) {
            console.log(`Successfully parsed response from ${model}`);
            
            // Process and return captions
            return processAndReturnCaptions(parsedResponse, tone, includeHashtags, includeEmojis, captionLength);
          }
        }
        
        // If we get here, the response wasn't valid, continue to next model
        console.log(`Invalid response from ${model}, trying next model if available`);
      } catch (error: any) {
        console.log(`Error with ${model} model:`, error.message);
        lastError = error;
        // Continue to next model
      }
    }
    
    // If we get here, all models failed
    console.error('All models failed to generate captions');
    
    // Create a fallback caption
    return createFallbackCaptions(tone, includeHashtags, includeEmojis, lastError?.message);
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
        imageUris, 
        tone, 
        includeHashtags, 
        includeEmojis, 
        captionLength, 
        spicyLevel, 
        captionStyle, 
        creativeLanguageOptions,
        isVideo,
        videoCount,
        retryCount + 1
      );
    }
    
    // Return a fallback caption if all retries fail
    return createFallbackCaptions(tone, includeHashtags, includeEmojis, openAIError.message);
  }
};

// Helper function to process and return captions
function processAndReturnCaptions(
  parsedResponse: any, 
  tone: CaptionTone,
  includeHashtags: boolean,
  includeEmojis: boolean,
  captionLength: CaptionLength
): Caption[] {
  try {
    if (!parsedResponse || !parsedResponse.captions || !Array.isArray(parsedResponse.captions)) {
      console.error('Invalid response structure:', parsedResponse);
      return createFallbackCaptions(tone, includeHashtags, includeEmojis, 'Invalid response structure');
    }
    
    if (parsedResponse.captions.length === 0) {
      console.error('Empty captions array');
      return createFallbackCaptions(tone, includeHashtags, includeEmojis, 'No captions generated');
    }
    
    // Process captions based on length setting
    const processedCaptions = parsedResponse.captions.map((caption: any) => {
      try {
        // Validate caption fields
        caption = validateCaptionFields(caption);
        
        // Initialize arrays if they don't exist
        caption.hashtags = Array.isArray(caption.hashtags) ? caption.hashtags : [];
        caption.emojis = Array.isArray(caption.emojis) ? caption.emojis : [];
        
        // Extract any hashtags from the text and move them to the hashtags array
        const hashtagRegex = /#(\w+)/g;
        const hashtagMatches = caption.text.match(hashtagRegex) || [];
        
        if (hashtagMatches.length > 0 && includeHashtags) {
          // Remove hashtags from text
          caption.text = caption.text.replace(hashtagRegex, '').trim();
          
          // Add hashtags to the hashtags array if they're not already there
          hashtagMatches.forEach((hashtag: string) => {
            const tag = hashtag.substring(1); // Remove the # symbol
            if (!caption.hashtags.includes(tag)) {
              caption.hashtags.push(tag);
            }
          });
        }
        
        // Extract any emojis from the text and move them to the emojis array
        const emojiRegex = /[\p{Emoji}]/gu;
        const emojiMatches = caption.text.match(emojiRegex) || [];
        
        if (emojiMatches.length > 0 && includeEmojis) {
          // Remove emojis from text
          caption.text = caption.text.replace(emojiRegex, '').trim();
          
          // Add emojis to the emojis array if they're not already there
          emojiMatches.forEach((emoji: string) => {
            if (!caption.emojis.includes(emoji)) {
              caption.emojis.push(emoji);
            }
          });
        }
        
        // Add a note for multiple image captions
        if (caption.isCollectionCaption) {
          caption.category = caption.category || 'Collection';
          caption.collectionCaption = true;
        }
        
        // Process caption text based on length setting
        const words = caption.text.split(/\s+/).filter((word: string) => word.length > 0);
        
        if (captionLength === 'single-word') {
          // For single-word, ensure it's exactly one word
          if (words.length !== 1) {
            caption.text = words[0] || 'Amazing';
          }
        } else if (captionLength === 'micro') {
          // For micro, ensure it's 2-3 words
          if (words.length < 2) {
            // If fewer than 2 words, add a generic word that makes sense
            const genericWords = ['vibes', 'mood', 'energy', 'moment'];
            caption.text = words.concat([genericWords[Math.floor(Math.random() * genericWords.length)]]).join(' ');
          } else if (words.length > 3) {
            // If more than 3 words, truncate to exactly 3
            caption.text = words.slice(0, 3).join(' ');
          } else {
            // If 2-3 words, keep as is
            caption.text = words.join(' ');
          }
        } else if (captionLength === 'short') {
          // For short, ensure it's 10-15 words
          if (words.length < 10) {
            // If fewer than 10 words, don't pad - just keep what we have
            caption.text = words.join(' ');
          } else if (words.length > 15) {
            // If more than 15 words, truncate to exactly 15
            caption.text = words.slice(0, 15).join(' ');
          } else {
            // If 10-15 words, keep as is
            caption.text = words.join(' ');
          }
        } else if (captionLength === 'medium') {
          // For medium, ensure it's 25-40 words
          if (words.length < 25) {
            // If fewer than 25 words, don't pad - just keep what we have
            caption.text = words.join(' ');
          } else if (words.length > 40) {
            // If more than 40 words, truncate to exactly 40
            caption.text = words.slice(0, 40).join(' ');
          } else {
            // If 25-40 words, keep as is
            caption.text = words.join(' ');
          }
        } else if (captionLength === 'long') {
          // For long, ensure it's 50-75 words
          if (words.length < 50) {
            // If fewer than 50 words, don't pad - just keep what we have
            caption.text = words.join(' ');
          } else if (words.length > 75) {
            // If more than 75 words, truncate to exactly 75
            caption.text = words.slice(0, 75).join(' ');
          } else {
            // If 50-75 words, keep as is
            caption.text = words.join(' ');
          }
        }
        
        // Clean up the text - remove any double spaces
        caption.text = caption.text.replace(/\s+/g, ' ').trim();
        
        // Make sure hashtags don't have the # symbol
        caption.hashtags = caption.hashtags.map((tag: string) => tag.replace(/^#/, ''));
        
        // Filter out empty hashtags
        caption.hashtags = caption.hashtags.filter((tag: string) => tag.trim().length > 0);
        
        // Filter out empty emojis
        caption.emojis = caption.emojis.filter((emoji: string) => emoji.trim().length > 0);
        
        return caption;
      } catch (error) {
        console.error('Error processing caption:', error);
        return {
          text: 'Something went wrong with this caption',
          category: 'Error',
          hashtags: includeHashtags ? ['error', 'caption'] : [],
          emojis: includeEmojis ? ['😕'] : [],
          viral_score: 1
        };
      }
    });
    
    // Filter out any invalid captions
    const validCaptions = processedCaptions.filter((caption: any) => 
      caption && typeof caption.text === 'string' && caption.text.trim().length > 0
    );
    
    if (validCaptions.length === 0) {
      console.error('No valid captions after processing');
      return createFallbackCaptions(tone, includeHashtags, includeEmojis, 'No valid captions after processing');
    }
    
    // Map the captions to our Caption interface
    return validCaptions.map((caption: any) => ({
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
      text: caption.text || 'No caption text provided',
      category: caption.category || tone,
      hashtags: caption.hashtags || [],
      emojis: caption.emojis || [],
      createdAt: new Date(),
      viral_score: typeof caption.viral_score === 'number' ? caption.viral_score : 5,
      collectionCaption: caption.collectionCaption || false
    }));
  } catch (error) {
    console.error('Error in processAndReturnCaptions:', error);
    return createFallbackCaptions(tone, includeHashtags, includeEmojis, 'Error processing captions');
  }
}

// Helper function to create fallback captions
function createFallbackCaptions(
  tone: CaptionTone,
  includeHashtags: boolean,
  includeEmojis: boolean,
  errorMessage?: string
): Caption[] {
  // Create a set of generic captions based on the tone
  const genericCaptions = [
    {
      text: tone === 'casual' ? 'Living in the moment' : 
            tone === 'professional' ? 'Professional excellence' :
            tone === 'funny' ? 'Making memories and laughs' :
            tone === 'inspirational' ? 'Inspiring new heights' :
            tone === 'storytelling' ? 'Every picture tells a story' :
            tone === 'Witty & Sarcastic' ? 'Just another day in paradise' :
            tone === 'Aesthetic & Artsy' ? 'Finding beauty in simplicity' :
            tone === 'Deep & Thoughtful' ? 'Moments that define us' :
            tone === 'Trend & Pop Culture-Based' ? 'Vibing with the moment' :
            tone === 'Minimal & Classy' ? 'Less is more' :
            tone === 'Cool & Attitude' ? 'Own your moment' : 'Capturing moments',
      category: typeof tone === 'string' ? tone : 'casual',
      hashtags: includeHashtags ? ['moment', 'lifestyle', 'photooftheday'] : [],
      emojis: includeEmojis ? ['✨', '📸'] : [],
      viral_score: 7
    },
    {
      text: tone === 'casual' ? 'Everyday adventures' : 
            tone === 'professional' ? 'Dedication to craft' :
            tone === 'funny' ? 'Smile through life' :
            tone === 'inspirational' ? 'Reaching for stars' :
            tone === 'storytelling' ? 'Chapter of my journey' :
            tone === 'Witty & Sarcastic' ? 'Pretending to have it all together' :
            tone === 'Aesthetic & Artsy' ? 'Colors of my world' :
            tone === 'Deep & Thoughtful' ? 'In the depths of thought' :
            tone === 'Trend & Pop Culture-Based' ? 'Main character energy' :
            tone === 'Minimal & Classy' ? 'Simplicity speaks volumes' :
            tone === 'Cool & Attitude' ? 'Attitude is everything' : 'Perfect day',
      category: typeof tone === 'string' ? tone : 'casual',
      hashtags: includeHashtags ? ['adventure', 'journey', 'memories'] : [],
      emojis: includeEmojis ? ['🌟', '🙌'] : [],
      viral_score: 6
    },
    {
      text: tone === 'casual' ? 'Good vibes only' : 
            tone === 'professional' ? 'Committed to excellence' :
            tone === 'funny' ? 'Finding humor everywhere' :
            tone === 'inspirational' ? 'Dream big always' :
            tone === 'storytelling' ? 'Writing my own story' :
            tone === 'Witty & Sarcastic' ? 'Living my best life (or trying to)' :
            tone === 'Aesthetic & Artsy' ? 'Framing moments in time' :
            tone === 'Deep & Thoughtful' ? 'Reflections of the soul' :
            tone === 'Trend & Pop Culture-Based' ? 'Keeping it 100' :
            tone === 'Minimal & Classy' ? 'Elegance in simplicity' :
            tone === 'Cool & Attitude' ? 'Unapologetically me' : 'Enjoying life',
      category: typeof tone === 'string' ? tone : 'casual',
      hashtags: includeHashtags ? ['goodvibes', 'positivity', 'lifestyle'] : [],
      emojis: includeEmojis ? ['😊', '✌️'] : [],
      viral_score: 8
    }
  ];
  
  // Map to Caption interface
  return genericCaptions.map(caption => ({
    id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
    text: caption.text,
    category: caption.category,
    hashtags: caption.hashtags,
    emojis: caption.emojis,
    createdAt: new Date(),
    viral_score: caption.viral_score
  }));
}

export default openai; 