import { create } from 'zustand';
import { Caption, CaptionCategory, CaptionTone } from '../types';
import { persist } from 'zustand/middleware';

// Define the uploaded image type
interface UploadedImage {
  file: File;
  url: string;  // Blob URL for UI display
  base64: string; // Base64 string for API requests
  isVideo?: boolean; // Flag to indicate if this is a video
}

// Define caption length type
export type CaptionLength = 'single-word' | 'micro' | 'short' | 'medium' | 'long';

// Define spicy level type
export type SpicyLevel = 'none' | 'mild' | 'medium' | 'spicy' | 'extra-spicy';

// Define caption style type
export type CaptionStyle = 'none' | 'pattern-interrupt' | 'mysterious' | 'controversial' | 'quote-style' | 'word-invention';

// Define creative language options
export interface CreativeLanguageOptions {
  wordInvention: boolean;
  alliteration: boolean;
  rhyming: boolean;
}

interface CaptionState {
  // Image state
  selectedImage: File | null;
  imageUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadedImages: UploadedImage[];
  
  // Caption generation state
  generatedCaptions: Caption[];
  selectedCategory: CaptionCategory | 'All';
  selectedTone: CaptionTone;
  isGenerating: boolean;
  includeHashtags: boolean;
  includeEmojis: boolean;
  captionLength: CaptionLength;
  spicyLevel: SpicyLevel;
  captionStyle: CaptionStyle;
  creativeLanguageOptions: CreativeLanguageOptions;
  
  // User preferences
  savedCaptions: Caption[];
  
  // Actions
  setSelectedImage: (image: File | null) => void;
  setImageUrl: (url: string | null) => void;
  setIsUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  addUploadedImage: (image: UploadedImage) => void;
  clearUploadedImages: () => void;
  setGeneratedCaptions: (captions: Caption[]) => void;
  addGeneratedCaption: (caption: Caption) => void;
  setSelectedCategory: (category: CaptionCategory | 'All') => void;
  setSelectedTone: (tone: CaptionTone) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIncludeHashtags: (include: boolean) => void;
  setIncludeEmojis: (include: boolean) => void;
  setCaptionLength: (length: CaptionLength) => void;
  setSpicyLevel: (level: SpicyLevel) => void;
  setCaptionStyle: (style: CaptionStyle) => void;
  setCreativeLanguageOptions: (options: CreativeLanguageOptions) => void;
  saveCaption: (caption: Caption) => void;
  removeCaption: (captionId: string) => void;
  setSavedCaptions: (captions: Caption[]) => void;
  resetCaptionLength: () => void;
  reset: () => void;
}

export const useCaptionStore = create<CaptionState>()(
  persist(
    (set) => ({
      // Initial state
      selectedImage: null,
      imageUrl: null,
      isUploading: false,
      uploadProgress: 0,
      uploadedImages: [],
      
      generatedCaptions: [],
      selectedCategory: 'All',
      selectedTone: 'casual',
      isGenerating: false,
      includeHashtags: true,
      includeEmojis: true,
      captionLength: 'micro',
      spicyLevel: 'none',
      captionStyle: 'none',
      creativeLanguageOptions: {
        wordInvention: false,
        alliteration: false,
        rhyming: false
      },
      
      savedCaptions: [],
      
      // Actions
      setSelectedImage: (image) => set({ selectedImage: image }),
      setImageUrl: (url) => set({ imageUrl: url }),
      setIsUploading: (isUploading) => set({ isUploading }),
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      addUploadedImage: (image) => set((state) => ({ 
        uploadedImages: [...state.uploadedImages, image] 
      })),
      clearUploadedImages: () => set({ uploadedImages: [] }),
      setGeneratedCaptions: (captions) => set({ generatedCaptions: captions }),
      addGeneratedCaption: (caption) => 
        set((state) => ({ 
          generatedCaptions: [...state.generatedCaptions, caption] 
        })),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSelectedTone: (tone) => set({ selectedTone: tone }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setIncludeHashtags: (include) => set({ includeHashtags: include }),
      setIncludeEmojis: (include) => set({ includeEmojis: include }),
      setCaptionLength: (length) => set({ captionLength: length }),
      setSpicyLevel: (level) => set({ spicyLevel: level }),
      setCaptionStyle: (style) => set({ captionStyle: style }),
      setCreativeLanguageOptions: (options) => set({ creativeLanguageOptions: options }),
      setSavedCaptions: (captions) => set({ savedCaptions: captions }),
      resetCaptionLength: () => set({ captionLength: 'micro' }),
      saveCaption: (caption) => 
        set((state) => {
          // Check if the caption is already in savedCaptions
          const isCaptionAlreadySaved = state.savedCaptions.some(
            (c) => c.id === caption.id || (c.text === caption.text && c.category === caption.category)
          );
          
          if (isCaptionAlreadySaved) {
            return state; // Don't add duplicates
          }
          
          return { 
            savedCaptions: [...state.savedCaptions, caption] 
          };
        }),
      removeCaption: (captionId) => 
        set((state) => ({
          savedCaptions: state.savedCaptions.filter((caption) => caption.id !== captionId)
        })),
      reset: () => set({
        selectedImage: null,
        imageUrl: null,
        isUploading: false,
        uploadProgress: 0,
        uploadedImages: [],
        generatedCaptions: [],
        selectedCategory: 'All',
        isGenerating: false
      })
    }),
    {
      name: 'caption-storage', // name of the item in the storage (must be unique)
      version: 1, // Increment this when you want to reset the persisted state
      partialize: (state) => ({
        savedCaptions: state.savedCaptions,
        selectedTone: state.selectedTone,
        includeHashtags: state.includeHashtags,
        includeEmojis: state.includeEmojis,
        captionLength: state.captionLength,
        spicyLevel: state.spicyLevel,
        captionStyle: state.captionStyle,
        creativeLanguageOptions: state.creativeLanguageOptions
      }),
    }
  )
); 