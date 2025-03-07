export interface Caption {
  id: string;
  text: string;
  category: string;
  hashtags: string[];
  emojis?: string[];
  createdAt: Date;
  viral_score: number;
}

export type CaptionCategory = 
  | 'Funny' 
  | 'Aesthetic' 
  | 'Motivational' 
  | 'Trendy' 
  | 'Witty' 
  | 'Deep' 
  | 'Minimal';

export type CaptionTone = 
  | 'Witty & Sarcastic'
  | 'Aesthetic & Artsy'
  | 'Deep & Thoughtful'
  | 'Trend & Pop Culture-Based'
  | 'Minimal & Classy'
  | 'Cool & Attitude'
  | 'casual'
  | 'professional'
  | 'funny'
  | 'inspirational'
  | 'storytelling';

export type CaptionLength = 'single-word' | 'micro' | 'short' | 'medium' | 'long';

export type SpicyLevel = 'none' | 'mild' | 'medium' | 'hot' | 'extra';

export type CaptionStyle = 'none' | 'pattern-interrupt' | 'mysterious' | 'controversial' | 'quote-style' | 'word-invention';

export interface CreativeLanguageOptions {
  wordInvention: boolean;
  alliteration: boolean;
  rhyming: boolean;
}

export interface CaptionGenerationOptions {
  tone: CaptionTone;
  includeHashtags: boolean;
  includeEmojis: boolean;
  captionLength: CaptionLength;
  spicyLevel: SpicyLevel;
  captionStyle: CaptionStyle;
  creativeLanguageOptions: CreativeLanguageOptions;
}

export interface ToneOption {
  id: string;
  label: string;
  description: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  { id: 'casual', label: 'Casual', description: 'Relaxed, everyday language' },
  { id: 'professional', label: 'Professional', description: 'Polished and formal' },
  { id: 'funny', label: 'Funny', description: 'Humorous and light-hearted' },
  { id: 'inspirational', label: 'Inspirational', description: 'Uplifting and motivational' },
  { id: 'storytelling', label: 'Storytelling', description: 'Narrative and engaging' },
  { id: 'Witty & Sarcastic', label: 'Witty', description: 'Clever and sarcastic' },
  { id: 'Aesthetic & Artsy', label: 'Aesthetic', description: 'Artistic and visually focused' },
  { id: 'Deep & Thoughtful', label: 'Deep', description: 'Philosophical and reflective' },
  { id: 'Trend & Pop Culture-Based', label: 'Trendy', description: 'Current trends and pop culture' },
  { id: 'Minimal & Classy', label: 'Minimal', description: 'Simple and elegant' },
  { id: 'Cool & Attitude', label: 'Cool', description: 'Confident and edgy' },
];

export const LENGTH_OPTIONS = [
  { id: 'single-word', label: 'Single Word', description: 'Just one word' },
  { id: 'micro', label: 'Micro', description: '2-3 words' },
  { id: 'short', label: 'Short', description: '10-15 words' },
  { id: 'medium', label: 'Medium', description: '25-40 words' },
  { id: 'long', label: 'Long', description: '50-75 words' },
];

export const SPICY_OPTIONS = [
  { id: 'none', label: 'None', description: 'Keep it clean and neutral' },
  { id: 'mild', label: 'Mild', description: 'Subtle playfulness' },
  { id: 'medium', label: 'Medium', description: 'Moderate flirtatiousness' },
  { id: 'hot', label: 'Hot', description: 'Bold and sensual' },
  { id: 'extra', label: 'Extra', description: 'Provocative and attention-grabbing' },
];

export const STYLE_OPTIONS = [
  { id: 'none', label: 'Standard', description: 'Regular caption style' },
  { id: 'pattern-interrupt', label: 'Pattern Interrupt', description: 'Starts with an unexpected phrase' },
  { id: 'mysterious', label: 'Mysterious', description: 'Creates intrigue and curiosity' },
  { id: 'controversial', label: 'Controversial', description: 'Takes a mild stance to spark comments' },
  { id: 'quote-style', label: 'Quote Style', description: 'Formatted like a profound quote' },
  { id: 'word-invention', label: 'Word Invention', description: 'Creates new, catchy words' },
]; 