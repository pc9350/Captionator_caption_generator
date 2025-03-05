import OpenAI from 'openai';

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

export default openai; 