import { NextRequest, NextResponse } from 'next/server';
import openai from '@/app/lib/openai';
import { CaptionCategory, CaptionTone } from '@/app/types';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, tone, includeHashtags, includeEmojis, categories } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Construct the prompt for OpenAI
    const systemPrompt = `You are an expert Instagram caption generator. 
    Analyze the image and generate creative, engaging captions that would perform well on Instagram.
    
    ${tone ? `The tone should be: ${tone}` : ''}
    ${categories && categories.length > 0 
      ? `Focus on these categories: ${categories.join(', ')}` 
      : 'Generate captions in these categories: Funny, Aesthetic, Motivational, Trendy, Witty, Deep, Minimal'}
    ${includeHashtags ? 'Include relevant hashtags for each caption.' : ''}
    ${includeEmojis ? 'Include appropriate emojis in the captions.' : ''}
    
    For each caption, provide:
    1. The caption text
    2. The category it belongs to
    3. A list of hashtags (if requested)
    4. A list of emojis used (if requested)
    
    Format your response as a JSON object with a "captions" array.`;

    // Call OpenAI API with the image
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Generate Instagram captions for this image:" },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    // Parse the response
    const content = response.choices[0].message.content;
    let parsedContent;
    
    try {
      // Try to parse the JSON response
      parsedContent = JSON.parse(content || '{"captions": []}');
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      
      // If parsing fails, try to extract JSON using regex
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Error parsing extracted JSON:', e);
          parsedContent = { captions: [] };
        }
      } else {
        parsedContent = { captions: [] };
      }
    }

    // Ensure the response has the expected structure
    if (!parsedContent.captions || !Array.isArray(parsedContent.captions)) {
      parsedContent = { captions: [] };
    }

    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error('Error generating captions:', error);
    return NextResponse.json(
      { error: 'Failed to generate captions' },
      { status: 500 }
    );
  }
} 