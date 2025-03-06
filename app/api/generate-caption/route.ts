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
    
    // If we have a text field, assume it's a caption object
    if (parsedJson.text) {
      // Ensure all required fields are present
      return {
        text: parsedJson.text,
        category: parsedJson.category || 'General',
        hashtags: Array.isArray(parsedJson.hashtags) ? parsedJson.hashtags : [],
        emojis: Array.isArray(parsedJson.emojis) ? parsedJson.emojis : [],
        viral_score: typeof parsedJson.viral_score === 'number' ? parsedJson.viral_score : 5
      };
    }
    
    // Otherwise return the parsed JSON as is
    return parsedJson;
  } catch (error) {
    console.error('Error extracting JSON:', error);
    // Try to extract any text that looks like a caption
    const textMatch = str.match(/["']text["']\s*:\s*["']([^"']+)["']/i);
    if (textMatch && textMatch[1]) {
      return {
        text: textMatch[1],
        category: 'General',
        viral_score: 5 // Default to 5 for consistency
      };
    }
    
    return {
      text: str.length > 100 ? str.substring(0, 100) + '...' : str,
      category: 'General',
      viral_score: 5 // Default to 5 for consistency
    };
  }
};

// Helper function to normalize caption fields
const normalizeCaptions = (captions: JsonResponse[]): Caption[] => {
  // Filter out any null or undefined captions
  return captions.filter(caption => caption && typeof caption === 'object').map(caption => {
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
    
    // Ensure hashtags is an array
    let hashtags: string[] = [];
    if (caption.hashtags) {
      if (Array.isArray(caption.hashtags)) {
        hashtags = caption.hashtags as string[];
      } else if (typeof caption.hashtags === 'string') {
        // If hashtags is a string, try to split it
        hashtags = (caption.hashtags as string).split(/\s+/).filter((tag: string) => tag.startsWith('#'));
      }
    }
    
    // Ensure emojis is an array
    let emojis: string[] = [];
    if (caption.emojis) {
      if (Array.isArray(caption.emojis)) {
        emojis = caption.emojis as string[];
      } else if (typeof caption.emojis === 'string') {
        // If emojis is a string, convert to array of characters
        emojis = Array.from(caption.emojis as string);
      }
    }
    
    // Generate a unique ID for the caption
    const id = `caption-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    return {
      id,
      text: caption.text || '',
      category: caption.category || 'General',
      hashtags: hashtags,
      emojis: emojis,
      viral_score: viralScore, // Use the processed viral score
      createdAt: new Date()
    };
  });
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { 
      image, 
      tone = 'casual', 
      includeHashtags = true, 
      includeEmojis = true,
      captionLength = 'micro',
      spicyLevel = 'none',
      captionStyle = 'none',
      creativeLanguageOptions = {
        wordInvention: false,
        alliteration: false,
        rhyming: false
      },
      isVideo = false, // New parameter to indicate if the content is a video
      timestamp // Add timestamp parameter
    } = data;
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Prepare the system message based on user preferences
    let systemMessage = `You are an expert Instagram caption writer. Analyze the ${isVideo ? 'video thumbnail' : 'image'} and create `;
    
    // Define caption length more precisely with EXACT word count requirements
    if (captionLength === 'single-word') {
      systemMessage += 'a SINGLE WORD caption only. The caption must be exactly one word that perfectly captures the essence of the image. No phrases, no sentences, just one powerful, evocative word.';
    } else if (captionLength === 'micro') {
      systemMessage += 'a very brief caption of EXACTLY 2-3 words. Not one word, not four words, but precisely 2-3 words that capture the essence of the image in a concise way.';
    } else if (captionLength === 'short') {
      systemMessage += 'a short caption of EXACTLY 10-15 words. Not fewer than 10 words and not more than 15 words. This should be a complete sentence or two that describes the image effectively.';
    } else if (captionLength === 'medium') {
      systemMessage += 'a medium-length caption of EXACTLY 25-40 words. Not fewer than 25 words and not more than 40 words. This should be 2-3 sentences that provide good context and detail.';
    } else {
      systemMessage += 'a detailed caption of EXACTLY 50-75 words. Not fewer than 50 words and not more than 75 words. This should be a comprehensive description with multiple sentences and storytelling elements.';
    }
    
    systemMessage += ` Use a ${tone} tone.`;
    
    // Add instructions for hashtags and emojis
    if (includeHashtags) {
      systemMessage += ' Include relevant hashtags.';
    } else {
      systemMessage += ' Do NOT include any hashtags.';
    }
    
    if (includeEmojis) {
      systemMessage += ' Include appropriate emojis.';
    } else {
      systemMessage += ' Do NOT include any emojis.';
    }
    
    // Add instructions for spicy level
    if (spicyLevel !== 'none') {
      systemMessage += ` Make the caption ${spicyLevel === 'mild' ? 'slightly provocative' : spicyLevel === 'medium' ? 'moderately provocative' : spicyLevel === 'spicy' ? 'provocative' : 'very provocative'}.`;
    }
    
    // Add instructions for caption style
    if (captionStyle !== 'none') {
      switch (captionStyle) {
        case 'pattern-interrupt':
          systemMessage += ' Use a pattern interrupt style that grabs attention with an unexpected opening.';
          break;
        case 'mysterious':
          systemMessage += ' Use a mysterious style that creates curiosity and intrigue.';
          break;
        case 'controversial':
          systemMessage += ' Use a slightly controversial style that sparks debate without being offensive.';
          break;
        case 'quote-style':
          systemMessage += ' Format the caption as an inspirational quote.';
          break;
        case 'word-invention':
          systemMessage += ' Create unique, made-up words that fit the context.';
          break;
      }
    }
    
    // Add instructions for creative language options
    if (creativeLanguageOptions.wordInvention) {
      systemMessage += ' Include some creative made-up words that fit the context.';
    }
    
    if (creativeLanguageOptions.alliteration) {
      systemMessage += ' Use alliteration in the caption.';
    }
    
    if (creativeLanguageOptions.rhyming) {
      systemMessage += ' Include some rhyming elements in the caption.';
    }

    // Add specific instructions for video content
    if (isVideo) {
      systemMessage += ' Note that this is a thumbnail from a video, so focus on creating a caption that would work well for video content, possibly referencing motion, action, or the dynamic nature of videos.';
    }
    
    // Add instructions for the response format
    systemMessage += `\n\nGenerate 5 different creative captions for this content. Each caption should have a unique style and approach.
    
    IMPORTANT WORD COUNT REQUIREMENTS:
    ${captionLength === 'single-word' ? '- All captions MUST be EXACTLY ONE WORD. No phrases, no sentences, just one powerful word per caption.' : 
      captionLength === 'micro' ? '- All captions MUST be EXACTLY 2-3 words. Not one word, not four or more words.' : 
      captionLength === 'short' ? '- All captions MUST be EXACTLY 10-15 words. Count the words carefully.' : 
      captionLength === 'medium' ? '- All captions MUST be EXACTLY 25-40 words. Count the words carefully.' : 
      '- All captions MUST be EXACTLY 50-75 words. Count the words carefully.'}
    
    ${includeHashtags ? 'Include relevant hashtags in the "hashtags" field of each caption.' : 'Do NOT include any hashtags. The "hashtags" field should be an empty array.'}
    ${includeEmojis ? 'Include appropriate emojis in the "emojis" field of each caption.' : 'Do NOT include any emojis. The "emojis" field should be an empty array.'}
    
    Respond with a JSON object in this format:
    {
      "captions": [
        {
          "text": "First caption text",
          "category": "Category for first caption",
          "hashtags": ["hashtags", "for", "first", "caption"],
          "emojis": ["emojis", "for", "first", "caption"],
          "viral_score": Score from 1-10 for first caption
        },
        {
          "text": "Second caption text",
          "category": "Category for second caption",
          "hashtags": ["hashtags", "for", "second", "caption"],
          "emojis": ["emojis", "for", "second", "caption"],
          "viral_score": Score from 1-10 for second caption
        },
        ... and so on for all 5 captions
      ]
    }`;

    // Cost-saving measure: Limit the number of images processed
    const MAX_IMAGES = 5;
    const processedImageData = [image];
    if (image.length > MAX_IMAGES) {
      console.log(`Limiting image processing from ${image.length} to ${MAX_IMAGES} images to save costs`);
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

    // Construct the prompt for OpenAI
    const systemPrompt = systemMessage;

    // Prepare the content array with all images
    const content: ChatCompletionContentPart[] = [
      { type: "text", text: systemPrompt }
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
        timestamp // Pass timestamp to bypass cache if needed
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
        const extractedJson = extractJsonFromString(responseContent);
        
        // Convert single caption to captions array format
        parsedContent = { 
          captions: [extractedJson] 
        };
      }

      // Ensure the response has the expected structure
      if (!parsedContent.captions || !Array.isArray(parsedContent.captions)) {
        // If we have a single caption object but not in an array, convert it
        if (parsedContent.text && parsedContent.category) {
          parsedContent = { 
            captions: [parsedContent] 
          };
        } else {
          parsedContent = { captions: [] };
        }
      }

      // Normalize caption fields to ensure consistent naming
      parsedContent.captions = normalizeCaptions(parsedContent.captions);
      
      // Post-process captions to enforce length constraints and respect hashtags/emojis settings
      parsedContent.captions = parsedContent.captions.map((caption: Caption) => {
        // Process caption text based on length setting
        const words = caption.text.trim().split(/\s+/);
        
        if (captionLength === 'single-word') {
          caption.text = words[0] || caption.text;
        } else if (captionLength === 'micro') {
          // For micro, ensure it's 2-3 words (not 1, not 4+)
          if (words.length < 2) {
            // If only one word, duplicate it to make two words
            caption.text = `${words[0]} ${words[0] || 'amazing'}`;
          } else if (words.length > 3) {
            // If more than 3 words, truncate to exactly 3
            caption.text = words.slice(0, 3).join(' ');
          }
        } else if (captionLength === 'short') {
          // For short, ensure it's 10-15 words
          if (words.length < 10) {
            // If fewer than 10 words, pad with generic text
            const padding = ['This', 'image', 'shows', 'a', 'beautiful', 'scene', 'worth', 'sharing', 'with', 'everyone'];
            caption.text = words.concat(padding.slice(0, 10 - words.length)).join(' ');
          } else if (words.length > 15) {
            // If more than 15 words, truncate to exactly 15
            caption.text = words.slice(0, 15).join(' ');
          }
        } else if (captionLength === 'medium') {
          // For medium, ensure it's 25-40 words
          if (words.length < 25) {
            // If fewer than 25 words, pad with generic text
            const padding = [
              'This', 'wonderful', 'image', 'captures', 'a', 'moment', 'that', 'speaks', 'volumes', 'about',
              'the', 'beauty', 'of', 'life', 'and', 'all', 'its', 'precious', 'moments', 'that',
              'we', 'should', 'cherish', 'and', 'remember'
            ];
            caption.text = words.concat(padding.slice(0, 25 - words.length)).join(' ');
          } else if (words.length > 40) {
            // If more than 40 words, truncate to exactly 40
            caption.text = words.slice(0, 40).join(' ');
          }
        } else if (captionLength === 'long') {
          // For long, ensure it's 50-75 words
          if (words.length < 50) {
            // If fewer than 50 words, pad with generic text
            const padding = Array(50).fill('').map((_, i) => 
              ['moment', 'beautiful', 'capture', 'memory', 'experience', 'feeling', 'emotion', 'journey', 'adventure', 'story'][i % 10]
            );
            caption.text = words.concat(padding.slice(0, 50 - words.length)).join(' ');
          } else if (words.length > 75) {
            // If more than 75 words, truncate to exactly 75
            caption.text = words.slice(0, 75).join(' ');
          }
        }
        
        // Enforce hashtags setting
        if (!includeHashtags) {
          caption.hashtags = [];
        }
        
        // Enforce emojis setting
        if (!includeEmojis) {
          caption.emojis = [];
          
          // Also remove emojis from the caption text
          caption.text = caption.text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
        }
        
        return caption;
      });
      
      // Remove any empty captions after processing
      parsedContent.captions = parsedContent.captions.filter((caption: Caption) => caption.text.trim() !== '');
      
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