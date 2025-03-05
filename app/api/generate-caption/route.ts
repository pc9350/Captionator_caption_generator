import { NextRequest, NextResponse } from 'next/server';
import { getCachedChatCompletion } from '@/app/lib/openai';
import { Caption } from '@/app/types';
import { ChatCompletionContentPart } from 'openai/resources/chat/completions';

interface JsonResponse {
  text: string;
  category: string;
  hashtags?: string[];
  emojis?: string[];
}

// Helper function to extract JSON from a string that might contain markdown formatting
const extractJsonFromString = (str: string): JsonResponse => {
  try {
    // Find the first occurrence of '{' and the last occurrence of '}'
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object found in string');
    
    // Extract and parse the JSON object
    const jsonStr = str.slice(start, end + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error extracting JSON:', error);
    return {
      text: str,
      category: 'General',
    };
  }
};

// Helper function to normalize caption fields
const normalizeCaptions = (captions: JsonResponse[]): Caption[] => {
  return captions.map(caption => ({
    text: caption.text || '',
    category: caption.category || 'General',
    hashtags: caption.hashtags || [],
    emojis: caption.emojis || []
  }));
};

export async function POST(req: NextRequest) {
  try {
    const { imageData, tone, includeHashtags, includeEmojis, categories } = await req.json();

    if (!imageData || !Array.isArray(imageData) || imageData.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Cost-saving measure: Limit the number of images processed
    const MAX_IMAGES = 3;
    const processedImageData = imageData.slice(0, MAX_IMAGES);
    if (imageData.length > MAX_IMAGES) {
      console.log(`Limiting image processing from ${imageData.length} to ${MAX_IMAGES} images to save costs`);
    }

    // Validate base64 images
    for (const base64 of processedImageData) {
      if (!base64.startsWith('data:image/')) {
        return NextResponse.json(
          { error: 'Invalid image format. All images must be in base64 format.' },
          { status: 400 }
        );
      }
    }

    // Define tone-specific instructions
    let toneInstructions = '';
    if (tone === 'cool') {
      toneInstructions = `The tone should be Cool & Attitude: Create edgy, confident, and trendsetting captions that exude coolness and attitude. 
      Use modern slang, confident language, and phrases that show the user is ahead of trends. 
      The captions should feel bold, slightly rebellious, and convey a sense of effortless style.`;
    } else if (tone) {
      toneInstructions = `The tone should be: ${tone}`;
    }

    // Cost-saving measure: Reduce the number of categories if not specified
    const requestedCategories = categories && categories.length > 0 
      ? categories 
      : ['Funny', 'Aesthetic', 'Motivational']; // Reduced from 7 to 3 categories

    // Construct the prompt for OpenAI
    const systemPrompt = `You are an expert Instagram caption generator. 
    Analyze the image${processedImageData.length > 1 ? 's' : ''} and generate creative, engaging captions that would perform well on Instagram.
    ${processedImageData.length > 1 ? 'Consider all the provided images as a collection and generate captions that would work for the entire set.' : ''}
    
    ${toneInstructions}
    ${categories && categories.length > 0 
      ? `Focus on these categories: ${requestedCategories.join(', ')}` 
      : `Generate captions in these categories: ${requestedCategories.join(', ')}`}
    ${includeHashtags ? 'Include relevant hashtags for each caption.' : 'Do not include any hashtags.'}
    ${includeEmojis ? 'Include appropriate emojis in the captions.' : 'Do not include any emojis in the captions.'}
    
    For each caption, provide:
    1. The caption text (use field name "text")
    2. The category it belongs to (use field name "category")
    3. ${includeHashtags ? 'A list of hashtags (use field name "hashtags")' : 'An empty hashtags array'}
    4. ${includeEmojis ? 'A list of emojis used (use field name "emojis")' : 'An empty emojis array'}
    
    Format your response as a JSON object with a "captions" array. Do not include any markdown formatting or code blocks in your response - just return the raw JSON.
    
    Example format:
    {
      "captions": [
        {
          "text": "Your caption text here",
          "category": "Funny",
          "hashtags": ${includeHashtags ? '["#hashtag1", "#hashtag2"]' : '[]'},
          "emojis": ${includeEmojis ? '["😊", "🌟"]' : '[]'}
        }
      ]
    }`;

    // Prepare the content array with all images
    const content: ChatCompletionContentPart[] = [
      { type: "text", text: `Generate Instagram captions for ${processedImageData.length > 1 ? 'these images' : 'this image'}:` }
    ];

    // Add all images to the content array
    processedImageData.forEach(base64Image => {
      content.push({
        type: "image_url",
        image_url: {
          url: base64Image,
        },
      } as ChatCompletionContentPart);
    });

    // Cost-saving measure: Limit token usage
    const MAX_TOKENS = 1000; // Reduced from 1500

    try {
      // Call OpenAI API with the images using our caching mechanism
      const params = {
        model: "gpt-4o", // Using GPT-4o which has vision capabilities
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: content,
          },
        ],
        max_tokens: MAX_TOKENS,
        response_format: { type: "json_object" }, // Request JSON format explicitly
      };

      // Use cached completion if available
      const response = await getCachedChatCompletion(params);

      // Parse the response
      const responseContent = response.choices[0].message.content || '{"captions": []}';
      console.log('Raw OpenAI response:', responseContent);
      
      let parsedContent;
      
      try {
        // Try direct JSON parsing first
        parsedContent = JSON.parse(responseContent);
      } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        
        // If direct parsing fails, try to extract JSON using our helper function
        parsedContent = extractJsonFromString(responseContent);
      }

      // Ensure the response has the expected structure
      if (!parsedContent.captions || !Array.isArray(parsedContent.captions)) {
        parsedContent = { captions: [] };
      }

      // Normalize caption fields to ensure consistent naming
      parsedContent.captions = normalizeCaptions(parsedContent.captions);

      // Cost-saving measure: Limit the number of captions returned
      const MAX_CAPTIONS = 5;
      if (parsedContent.captions.length > MAX_CAPTIONS) {
        parsedContent.captions = parsedContent.captions.slice(0, MAX_CAPTIONS);
      }

      return NextResponse.json(parsedContent);
    } catch (apiError: unknown) {
      console.error('OpenAI API error:', apiError);
      
      // Handle specific OpenAI API errors
      if (apiError && typeof apiError === 'object' && 'status' in apiError) {
        const error = apiError as { status: number; message?: string };
        if (error.status === 400) {
          return NextResponse.json(
            { error: 'Invalid request to OpenAI API. The images may be too large or in an unsupported format.' },
            { status: 400 }
          );
        } else if (error.status === 429) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        } else {
          return NextResponse.json(
            { error: `OpenAI API error: ${error.message || 'Unknown error'}` },
            { status: error.status || 500 }
          );
        }
      }
      return NextResponse.json(
        { error: 'An unknown error occurred with the OpenAI API' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in caption generation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 