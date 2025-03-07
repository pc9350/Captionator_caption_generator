import OpenAI from 'openai';
import { Caption } from '../types';

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
  apiKey: process.env.OPENAI_API_KEY,
});

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
                  emojis: [],
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
            emojis: [],
            viral_score: 5
          }
        ]
      });
    }
    
    return fallbackResponse;
  }
};

export const generateCaption = async (
  prompt: string,
  tone: string,
  retryCount = 0
): Promise<Caption | null> => {
  try {
    const systemPrompt = `You are a creative caption generator for Instagram. 
    Generate a caption that matches the following tone: ${tone}.
    The caption should be engaging, relevant to the image described, and include appropriate hashtags.
    Format your response as a JSON object with the following structure:
    {
      "caption": "The main caption text",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
    }`;

    const response = await getCachedChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    const content = response.choices[0].message.content;
    
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(content);
      return {
        id: Date.now().toString(),
        text: parsedResponse.caption,
        category: tone,
        hashtags: parsedResponse.hashtags || [],
        createdAt: new Date(),
        viral_score: parsedResponse.viral_score || 0,
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      
      // If we can't parse the JSON, try to extract the caption directly
      const captionMatch = content.match(/caption["\s:]+([^"]+)/i);
      const caption = captionMatch ? captionMatch[1].trim() : content.trim();
      
      return {
        id: Date.now().toString(),
        text: caption,
        category: tone,
        hashtags: [],
        createdAt: new Date(),
        viral_score: caption.viral_score || 0,
      };
    }
  } catch (error: unknown) {
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
      return generateCaption(prompt, tone, retryCount + 1);
    }
    
    throw new Error(openAIError.message || 'Failed to generate caption');
  }
};

export default openai; 