import { create } from 'zustand';
import { Caption, CaptionCategory, CaptionTone } from '../types';

// Define the uploaded image type
interface UploadedImage {
  file: File;
  url: string;  // Blob URL for UI display
  base64: string; // Base64 string for API requests
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
  saveCaption: (caption: Caption) => void;
  removeCaption: (captionId: string) => void;
  reset: () => void;
}

export const useCaptionStore = create<CaptionState>((set) => ({
  // Initial state
  selectedImage: null,
  imageUrl: null,
  isUploading: false,
  uploadProgress: 0,
  uploadedImages: [],
  generatedCaptions: [],
  selectedCategory: 'All',
  selectedTone: 'Aesthetic & Artsy',
  isGenerating: false,
  includeHashtags: true,
  includeEmojis: true,
  savedCaptions: [],
  
  // Actions
  setSelectedImage: (image) => set({ selectedImage: image }),
  setImageUrl: (url) => set({ imageUrl: url }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  addUploadedImage: (image) => 
    set((state) => ({ 
      uploadedImages: [...state.uploadedImages, image] 
    })),
  clearUploadedImages: () => set({ uploadedImages: [] }),
  setGeneratedCaptions: (captions) => set({ 
    generatedCaptions: captions,
    // If we're setting captions from the saved captions page, update savedCaptions too
    savedCaptions: captions.some(c => c.id) ? captions : []
  }),
  addGeneratedCaption: (caption) => 
    set((state) => ({ 
      generatedCaptions: [...state.generatedCaptions, caption] 
    })),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedTone: (tone) => set({ selectedTone: tone }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setIncludeHashtags: (include) => set({ includeHashtags: include }),
  setIncludeEmojis: (include) => set({ includeEmojis: include }),
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
      savedCaptions: state.savedCaptions.filter((c) => c.id !== captionId) 
    })),
  reset: () => set({
    selectedImage: null,
    imageUrl: null,
    isUploading: false,
    uploadProgress: 0,
    uploadedImages: [],
    generatedCaptions: [],
    isGenerating: false,
  }),
})); 