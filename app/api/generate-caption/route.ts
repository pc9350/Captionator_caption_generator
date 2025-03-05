import { NextRequest, NextResponse } from 'next/server';
import openai from '@/app/lib/openai';
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

    // Validate base64 images
    for (const base64 of imageData) {
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

    // Construct the prompt for OpenAI
    const systemPrompt = `You are an expert Instagram caption generator. 
    Analyze the image${imageData.length > 1 ? 's' : ''} and generate creative, engaging captions that would perform well on Instagram.
    ${imageData.length > 1 ? 'Consider all the provided images as a collection and generate captions that would work for the entire set.' : ''}
    
    ${toneInstructions}
    ${categories && categories.length > 0 
      ? `Focus on these categories: ${categories.join(', ')}` 
      : 'Generate captions in these categories: Funny, Aesthetic, Motivational, Trendy, Witty, Deep, Minimal'}
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
      { type: "text", text: `Generate Instagram captions for ${imageData.length > 1 ? 'these images' : 'this image'}:` }
    ];

    // Add all images to the content array
    imageData.forEach(base64Image => {
      content.push({
        type: "image_url",
        image_url: {
          url: base64Image,
        },
      } as ChatCompletionContentPart);
    });

    try {
      // Call OpenAI API with the images
      const response = await openai.chat.completions.create({
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
        max_tokens: 1500, // Increased token limit for multiple images
        response_format: { type: "json_object" }, // Request JSON format explicitly
      });

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