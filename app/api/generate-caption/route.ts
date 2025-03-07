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

// Helper function to extract JSON from a string that might contain additional text
function extractJsonFromString(str: string): any {
  try {
    // First, try direct JSON parsing
    return JSON.parse(str);
  } catch (e) {
    // If direct parsing fails, try to extract JSON from the string
    try {
      // Look for JSON object pattern
      const jsonPattern = /{[\s\S]*}/;
      const match = str.match(jsonPattern);
      
      if (match && match[0]) {
        // Try to parse the extracted JSON
        const extractedJson = JSON.parse(match[0]);
        
        // Validate the extracted JSON structure
        if (extractedJson) {
          // If we have a captions array, return it directly
          if (Array.isArray(extractedJson.captions)) {
            return extractedJson;
          }
          
          // If we have a single caption object with text field, wrap it in a captions array
          if (extractedJson.text) {
            return {
              captions: [validateCaptionFields(extractedJson)]
            };
          }
          
          // If we have a captions field but it's not an array, validate and wrap it
          if (extractedJson.captions && !Array.isArray(extractedJson.captions)) {
            return {
              captions: [validateCaptionFields(extractedJson.captions)]
            };
          }
          
          // For any other structure, return the extracted JSON as is
          return extractedJson;
        }
      }
      
      // If no valid JSON object was found, try to extract multiple JSON objects
      const jsonObjects = str.match(/{[\s\S]*?}/g);
      if (jsonObjects && jsonObjects.length > 0) {
        // Try each extracted object until we find a valid one
        for (const jsonObj of jsonObjects) {
          try {
            const parsed = JSON.parse(jsonObj);
            if (parsed && (parsed.text || parsed.captions)) {
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
    } catch (extractError) {
      console.error('Error extracting JSON:', extractError);
    }
    
    // If all extraction attempts fail, return a fallback object
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

// Helper function to normalize caption fields (ensure consistent naming)
function normalizeCaptions(captions: any[]): any[] {
  return captions.map(caption => {
    // Create a normalized caption object with all required fields
    const normalizedCaption = {
      id: caption.id || `caption-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text: caption.text || caption.caption || caption.content || "No caption text provided",
      category: caption.category || caption.type || "General",
      hashtags: [],
      emojis: [],
      viral_score: typeof caption.viral_score === 'number' ? caption.viral_score : 
                  typeof caption.viralScore === 'number' ? caption.viralScore : 5,
      createdAt: caption.createdAt || new Date()
    };
    
    // Handle hashtags with different possible field names and formats
    if (Array.isArray(caption.hashtags)) {
      normalizedCaption.hashtags = caption.hashtags;
    } else if (Array.isArray(caption.tags)) {
      normalizedCaption.hashtags = caption.tags;
    } else if (typeof caption.hashtags === 'string') {
      // If hashtags is a string, split it and clean up
      normalizedCaption.hashtags = caption.hashtags
        .split(/\s+/)
        .filter((tag: string) => tag.trim() !== '')
        .map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`);
    }
    
    // Handle emojis with different possible field names
    if (Array.isArray(caption.emojis)) {
      normalizedCaption.emojis = caption.emojis;
    } else if (Array.isArray(caption.emoji)) {
      normalizedCaption.emojis = caption.emoji;
    } else if (typeof caption.emojis === 'string') {
      // If emojis is a string, convert to array
      normalizedCaption.emojis = Array.from(caption.emojis.trim());
    }
    
    return normalizedCaption;
  });
}

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
    
    // Make the format requirements more explicit
    systemMessage += `\n\nGenerate 5 different creative captions for this content. Each caption should have a unique style and approach.
    
    IMPORTANT WORD COUNT REQUIREMENTS:
    ${captionLength === 'single-word' ? '- All captions MUST be EXACTLY ONE WORD. No phrases, no sentences, just one powerful word per caption.' : 
      captionLength === 'micro' ? '- All captions MUST be EXACTLY 2-3 words. Not one word, not four or more words.' : 
      captionLength === 'short' ? '- All captions MUST be EXACTLY 10-15 words. Count the words carefully.' : 
      captionLength === 'medium' ? '- All captions MUST be EXACTLY 25-40 words. Count the words carefully.' : 
      '- All captions MUST be EXACTLY 50-75 words. Count the words carefully.'}
    
    ${includeHashtags ? 'Include relevant hashtags in the "hashtags" field of each caption.' : 'Do NOT include any hashtags. The "hashtags" field should be an empty array.'}
    ${includeEmojis ? 'Include appropriate emojis in the "emojis" field of each caption.' : 'Do NOT include any emojis. The "emojis" field should be an empty array.'}
    
    You MUST respond with a valid JSON object in this EXACT format:
    {
      "captions": [
        {
          "text": "First caption text",
          "category": "Category for first caption",
          "hashtags": ["hashtag1", "hashtag2"],
          "emojis": ["emoji1", "emoji2"],
          "viral_score": 7
        },
        ... and so on for all captions
      ]
    }

    Do not include any explanations, markdown formatting, or additional text outside of this JSON structure.`;

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

    // Create a promise that will reject after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OpenAI API request timed out')), 30000); // 30 second timeout
    });

    // Create the actual API call promise
    const apiCallPromise = getCachedChatCompletion({
      model: "gpt-4o",
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
      timestamp, // Pass timestamp to potentially bypass cache
    });

    // Race the API call against the timeout
    const response = await Promise.race([apiCallPromise, timeoutPromise])
      .catch(error => {
        console.error('Error during OpenAI request:', error);
        // Return a fallback response
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  captions: [
                    {
                      text: error.message === 'OpenAI API request timed out' 
                        ? "Request timed out. Please try again." 
                        : "Unable to generate caption. Please try again.",
                      category: "Error",
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
      });

    // Extract the response content
    const responseContent = response.choices[0].message.content;
    
    // Try to parse the response as JSON directly
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (error) {
      // If direct parsing fails, try to extract JSON from the string
      parsedResponse = extractJsonFromString(responseContent);
    }

    // Ensure we have a valid response structure
    if (!parsedResponse || !parsedResponse.captions) {
      // Create a fallback response
      parsedResponse = {
        captions: [
          {
            text: `Default ${isVideo ? 'video' : 'image'} caption. Please try again.`,
            category: "General",
            hashtags: includeHashtags ? ["instagram", "caption", "default"] : [],
            emojis: includeEmojis ? ["📷", "✨"] : [],
            viral_score: 5
          }
        ]
      };
    }

    // If we got a single caption object instead of an array, convert it
    if (parsedResponse.captions && !Array.isArray(parsedResponse.captions)) {
      parsedResponse.captions = [parsedResponse.captions];
    }

    // Normalize caption fields to ensure consistent naming
    parsedResponse.captions = normalizeCaptions(parsedResponse.captions);
    
    // Post-process captions to enforce length constraints and respect hashtags/emojis settings
    parsedResponse.captions = parsedResponse.captions.map((caption: Caption) => {
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
    parsedResponse.captions = parsedResponse.captions.filter((caption: Caption) => caption.text.trim() !== '');
    
    // Cost-saving measure: Limit the number of captions returned
    const MAX_CAPTIONS = 6;
    if (parsedResponse.captions.length > MAX_CAPTIONS) {
      parsedResponse.captions = parsedResponse.captions.slice(0, MAX_CAPTIONS);
    }

    return NextResponse.json(parsedResponse);
  } catch (error: unknown) {
    console.error('Error in caption generation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 