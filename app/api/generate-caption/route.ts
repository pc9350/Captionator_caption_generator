import { NextRequest, NextResponse } from 'next/server';
import openai, { getCachedChatCompletion } from '@/app/lib/openai';
import { CaptionCategory, CaptionTone } from '@/app/types';
import { ChatCompletionContentPart } from 'openai/resources/chat/completions';

// Helper function to extract JSON from a string that might contain markdown formatting
const extractJsonFromString = (str: string): any => {
  // Try to extract JSON from markdown code blocks
  const markdownJsonRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/;
  const markdownMatch = str.match(markdownJsonRegex);
  
  if (markdownMatch && markdownMatch[1]) {
    try {
      return JSON.parse(markdownMatch[1]);
    } catch (e) {
      console.error('Failed to parse JSON from markdown block:', e);
    }
  }
  
  // Try to extract any JSON object from the string
  const jsonRegex = /(\{[\s\S]*\})/;
  const jsonMatch = str.match(jsonRegex);
  
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error('Failed to parse JSON from string:', e);
    }
  }
  
  // Return default empty captions array if no valid JSON found
  return { captions: [] };
};

// Helper function to normalize caption fields
const normalizeCaptions = (captions: any[]): any[] => {
  return captions.map(caption => {
    // Ensure consistent field naming
    return {
      text: caption.caption || caption.text || 'No caption text provided',
      category: caption.category || 'General',
      hashtags: caption.hashtags || [],
      emojis: caption.emojis || []
    };
  });
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
    } catch (apiError: any) {
      console.error('OpenAI API error:', apiError);
      
      // Handle specific OpenAI API errors
      if (apiError.status === 400) {
        return NextResponse.json(
          { error: 'Invalid request to OpenAI API. The images may be too large or in an unsupported format.' },
          { status: 400 }
        );
      } else if (apiError.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: `OpenAI API error: ${apiError.message || 'Unknown error'}` },
          { status: apiError.status || 500 }
        );
      }
    }
  } catch (error: any) {
    console.error('Error generating captions:', error);
    return NextResponse.json(
      { error: `Failed to generate captions: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 