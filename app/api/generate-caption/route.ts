import { NextRequest, NextResponse } from 'next/server';
import { getCachedChatCompletion } from '@/app/lib/openai';
import { Caption } from '@/app/types';
import { ChatCompletionContentPart } from 'openai/resources/chat/completions';

interface JsonResponse {
  text: string;
  category: string;
  hashtags?: string[];
  emojis?: string[];
  viral_score?: number;
}

// Helper function to extract JSON from a string that might contain markdown formatting
const extractJsonFromString = (str: string): JsonResponse => {
  try {
    // Find the start and end of the JSON object
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}');
    
    if (start === -1 || end === -1 || start > end) {
      throw new Error('No valid JSON object found in the string');
    }
    
    // Extract and parse the JSON object
    const jsonStr = str.slice(start, end + 1);
    const parsedJson = JSON.parse(jsonStr);
    
    // If we have a captions array, return the first one
    if (parsedJson.captions && Array.isArray(parsedJson.captions) && parsedJson.captions.length > 0) {
      return parsedJson.captions[0];
    }
    
    // Otherwise return the parsed JSON as is
    return parsedJson;
  } catch (error) {
    console.error('Error extracting JSON:', error);
    return {
      text: str,
      category: 'General',
      viral_score: 5 // Default to 5 for consistency
    };
  }
};

// Helper function to normalize caption fields
const normalizeCaptions = (captions: JsonResponse[]): Caption[] => {
  return captions.map(caption => {
    // Ensure viral_score is a number between 1-10
    let viralScore = 5; // Default value
    
    if (caption.viral_score !== undefined) {
      // Convert to number if it's a string
      const scoreValue = typeof caption.viral_score === 'string' 
        ? parseFloat(caption.viral_score) 
        : caption.viral_score;
        
      // Validate it's a number and in range
      if (!isNaN(scoreValue) && scoreValue >= 1 && scoreValue <= 10) {
        viralScore = scoreValue;
      }
    }
    
    return {
      text: caption.text || '',
      category: caption.category || 'General',
      hashtags: caption.hashtags || [],
      emojis: caption.emojis || [],
      viral_score: viralScore // Use the processed viral score
    };
  });
};

export async function POST(req: NextRequest) {
  try {
    const { imageData, tone, includeHashtags, includeEmojis, categories, captionLength, spicyLevel, wordInvention, alliteration, rhyming, captionStyle } = await req.json();

    if (!imageData || !Array.isArray(imageData) || imageData.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Cost-saving measure: Limit the number of images processed
    const MAX_IMAGES = 5;
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
    } else if (tone === 'casual') {
      toneInstructions = `The tone should be Casual: Create relaxed, friendly, and conversational captions that feel authentic and relatable.
      Use everyday language, casual expressions, and a warm, approachable tone.
      The captions should feel like something a friend would say in a natural conversation.`;
    } else if (tone === 'professional') {
      toneInstructions = `The tone should be Professional: Create polished, formal, and business-like captions that convey expertise and professionalism.
      Use clear, concise language with proper grammar and a sophisticated vocabulary.
      The captions should be appropriate for a business context while still being engaging.`;
    } else if (tone === 'funny') {
      toneInstructions = `The tone should be Funny: Create humorous, witty, and entertaining captions that make people laugh.
      Use clever wordplay, jokes, puns, and a lighthearted tone that doesn't take itself too seriously.
      The captions should be genuinely funny without being forced or cringe-worthy.`;
    } else if (tone === 'inspirational') {
      toneInstructions = `The tone should be Inspirational: Create uplifting, motivational, and positive captions that inspire and encourage.
      Use empowering language, thoughtful insights, and phrases that motivate action or reflection.
      The captions should make people feel inspired and capable of achieving their goals.`;
    } else if (tone === 'storytelling') {
      toneInstructions = `The tone should be Storytelling: Create narrative, engaging, and descriptive captions that tell a compelling story.
      Use vivid language, sensory details, and a narrative structure with a beginning, middle, and end.
      The captions should transport the reader into a moment or experience related to the image.`;
    } else if (tone) {
      toneInstructions = `The tone should be: ${tone}`;
    }

    // Define caption length instructions
    let lengthInstructions = '';
    if (captionLength === 'short') {
      lengthInstructions = 'Keep captions very concise - no more than 1-2 sentences or 15-25 words. Make every word count.';
    } else if (captionLength === 'medium') {
      lengthInstructions = 'Create moderately sized captions of 2-3 sentences or 25-50 words. Balance brevity with detail.';
    } else if (captionLength === 'long') {
      lengthInstructions = 'Develop more detailed captions of 3-5 sentences or 50-100 words. Include more context and storytelling.';
    } else if (captionLength === 'micro') {
      lengthInstructions = 'Create ultra-short captions of just 1-5 words. These should be punchy, impactful phrases or even single words that make a statement.';
    } else {
      // Default to micro length if not specified
      lengthInstructions = 'Create ultra-short captions of just 1-5 words. These should be punchy, impactful phrases or even single words that make a statement.';
    }

    // Define spicy content instructions
    let spicyInstructions = '';
    if (spicyLevel === 'mild') {
      spicyInstructions = 'Add a subtle hint of flirtatiousness or playfulness that is tasteful and appropriate for general audiences.';
    } else if (spicyLevel === 'medium') {
      spicyInstructions = 'Include moderate flirtatiousness, subtle innuendo, or cheeky humor that is suggestive but still appropriate for most audiences.';
    } else if (spicyLevel === 'hot') {
      spicyInstructions = 'Create captions with confident sensuality, bold flirtatiousness, or edgy humor that pushes boundaries while still being tasteful.';
    } else if (spicyLevel === 'extra') {
      spicyInstructions = 'Develop captions with strong sensuality, provocative language, and bold statements that are attention-grabbing and memorable.';
    }
    
    let creativeLanguageInstructions = '';
    if (wordInvention || alliteration || rhyming) {
      creativeLanguageInstructions = `
      CREATIVE LANGUAGE TECHNIQUES:
      ${wordInvention ? `
      - Create 1-2 unique, memorable coined words or portmanteaus that feel natural and catchy
      - Examples: "Wanderlicious" (wanderlust + delicious), "Sunfetti" (sun + confetti), "Dreamscape" (dream + landscape)
      ` : ''}
      ${alliteration ? `
      - Use alliteration (words starting with the same sound) for a rhythmic, memorable effect
      - Example: "Perfectly peaceful paradise" or "Sunset serenity speaks volumes"
      ` : ''}
      ${rhyming ? `
      - Incorporate subtle rhymes or wordplay that makes the caption more memorable
      - Example: "Views so fine, they blow the mind" or "Sky so bright, pure delight"
      ` : ''}
      `;
    }

    let styleInstructions = '';
    if (captionStyle === 'pattern-interrupt') {
      styleInstructions = `
      Create a pattern-interrupt caption that starts with an unexpected phrase or question that stops users from scrolling.
      Examples: 
      - "I wasn't going to post this but..." 
      - "They told me not to share this..."
      - "The secret they don't want you to know about this place..."`;
    } else if (captionStyle === 'mysterious') {
      styleInstructions = `
      Create an intriguing, mysterious caption that leaves viewers curious and wanting more.
      Use cliffhangers, hints at untold stories, or provocative questions.
      Examples: 
      - "There's a story behind this smile that I'm not ready to tell yet..."
      - "What happened next was completely unexpected..."`;
    } else if (captionStyle === 'controversial') {
      styleInstructions = `
      Create a slightly controversial or debate-starting caption (while remaining appropriate).
      Take a mild stance on something related to the image that might spark comments.
      Examples: 
      - "Unpopular opinion: This is actually better than [popular alternative]..."
      - "I might get hate for this, but I think..."`;
    } else if (captionStyle === 'quote-style') {
      styleInstructions = `
      Format the caption like a profound quote, as if it's a line from a book or movie.
      Examples: 
      - "The ocean whispered, 'come back home,' and I listened."
      - "She realized that freedom wasn't a place, but a feeling."`;
    } else if (captionStyle === 'word-invention') {
      styleInstructions = `
      Create 1-2 completely new, memorable words that feel natural and catchy.
      The invented words should sound like they could be real and relate to the image.
      Examples: 
      - "Feeling absolutely suntastic today ☀️"
      - "Pure blissification in this moment ✨"
      - "Experiencing major wanderbliss on this journey 🌎"`;
    }


    // Cost-saving measure: Reduce the number of categories if not specified
    const requestedCategories = categories && categories.length > 0 
      ? categories 
      : ['Viral-Worthy', 'Aesthetic', 'Motivational', 'Trendy', 'Unique']; 

    // Construct the prompt for OpenAI
    const systemPrompt = `You are an elite Instagram caption generator with a talent for creating captions that go viral. 
    Analyze the image${processedImageData.length > 1 ? 's' : ''} and generate creative, engaging captions that would perform exceptionally well on Instagram.
    ${processedImageData.length > 1 ? 'Consider all the provided images as a collection and generate captions that would work for the entire set.' : ''}

    
    
    ${toneInstructions}
    ${lengthInstructions}
    ${spicyInstructions}
    ${creativeLanguageInstructions}
    ${styleInstructions}
    
    ${categories && categories.length > 0 
      ? `Focus on these categories: ${requestedCategories.join(', ')}` 
      : `Generate captions in these categories: ${requestedCategories.join(', ')}`}
    ${includeHashtags ? 'Include relevant hashtags for each caption.' : 'Do not include any hashtags.'}
    ${includeEmojis ? 'Include appropriate emojis in the captions.' : 'Do not include any emojis in the captions.'}
    
    IMPORTANT GUIDELINES FOR AMAZING CAPTIONS:
    1. Be original and avoid clichés - create captions that feel fresh and unique
    2. Use conversational language that sounds natural when read aloud
    3. Incorporate current trends and contemporary language when appropriate
    4. Create captions with strong emotional impact that resonate with viewers
    5. Avoid being overly formal or bookish - write how people actually speak
    6. Make the captions shareable and memorable
    7. Ensure the caption has a clear connection to the visual content
    8. Generate at least 8 diverse captions across the requested categories, ensuring each has a distinct style and approach
    9. Focus on creating captions that would genuinely surprise and delight users
    
    For each caption, provide:
    1. The caption text (use field name "text")
    2. The category it belongs to (use field name "category")
    3. ${includeHashtags ? 'A list of hashtags (use field name "hashtags")' : 'An empty hashtags array'}
    4. ${includeEmojis ? 'A list of emojis used (use field name "emojis")' : 'An empty emojis array'}
    5. A "viral_score" from 1-10 indicating how likely this caption is to generate engagement (MUST be a numeric value, not a string)
    
    Format your response as a JSON object with a "captions" array. Do not include any markdown formatting or code blocks in your response - just return the raw JSON.
    
    Example format:
    {
      "captions": [
        {
          "text": "Your caption text here",
          "category": "Funny",
          "hashtags": ${includeHashtags ? '["#hashtag1", "#hashtag2"]' : '[]'},
          "emojis": ${includeEmojis ? '["😊", "🌟"]' : '[]'},
          "viral_score": 8
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
      const MAX_CAPTIONS = 6;
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