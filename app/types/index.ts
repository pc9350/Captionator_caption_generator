export interface Caption {
  id?: string;
  text: string;
  category: string;
  hashtags?: string[];
  emojis?: string[];
  userId?: string;
  createdAt?: Date;
}

export type CaptionCategory = 
  | 'Funny' 
  | 'Aesthetic' 
  | 'Motivational' 
  | 'Trendy' 
  | 'Witty' 
  | 'Deep' 
  | 'Minimal';

export interface CaptionRequest {
  imageUrl: string;
  tone?: CaptionTone;
  categories?: CaptionCategory[];
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}

export type CaptionTone = 
  | 'Witty & Sarcastic'
  | 'Aesthetic & Artsy'
  | 'Deep & Thoughtful'
  | 'Trend & Pop Culture-Based'
  | 'Minimal & Classy'
  | 'Cool & Attitude';

export interface User {
  id: string;
  email: string;
  name?: string;
  savedCaptions?: Caption[];
  captionHistory?: CaptionHistory[];
}

export interface CaptionHistory {
  id: string;
  userId: string;
  imageUrl: string;
  captions: Caption[];
  createdAt: Date;
}

export interface ImageAnalysisResult {
  objects: string[];
  scenes: string[];
  emotions: string[];
  themes: string[];
}

export interface ToneOption {
  value: string;
  label: string;
  description: string;
} 