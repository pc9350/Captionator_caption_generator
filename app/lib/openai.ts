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
  // Create a cache key based on the request parameters
  const cacheKey = JSON.stringify({
    model: params.model,
    messages: params.messages,
    max_tokens: params.max_tokens,
  });
  
  // Check if we have a cached response that hasn't expired
  const cachedEntry = responseCache[cacheKey];
  if (cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_EXPIRY) {
    console.log('Using cached OpenAI response');
    return cachedEntry.response;
  }
  
  // If no cache hit, make the actual API call
  console.log('Making new OpenAI API call');
  const response = await openai.chat.completions.create(params);
  
  // Cache the response
  responseCache[cacheKey] = {
    timestamp: Date.now(),
    response,
  };
  
  return response;
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