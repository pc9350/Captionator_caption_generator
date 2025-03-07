import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Caption, 
  CaptionTone, 
  CaptionLength, 
  SpicyLevel, 
  CaptionStyle, 
  CreativeLanguageOptions 
} from '../types/caption';

// Define the uploaded image type
interface UploadedMedia {
  uri: string;  // Local URI for display
  base64: string; // Base64 string for API requests
  isVideo?: boolean; // Flag to indicate if this is a video
}

interface CaptionState {
  // Media state
  uploadedMedia: UploadedMedia[];
  activeMediaIndex: number;
  
  // Caption generation state
  generatedCaptions: Caption[];
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
  setUploadedMedia: (media: UploadedMedia[]) => void;
  addUploadedMedia: (media: UploadedMedia) => void;
  removeUploadedMedia: (index: number) => void;
  clearUploadedMedia: () => void;
  setActiveMediaIndex: (index: number) => void;
  setGeneratedCaptions: (captions: Caption[]) => void;
  addGeneratedCaption: (caption: Caption) => void;
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
  reset: () => void;
}

export const useCaptionStore = create<CaptionState>()(
  persist(
    (set) => ({
      // Initial state
      uploadedMedia: [],
      activeMediaIndex: 0,
      
      generatedCaptions: [],
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
      setUploadedMedia: (media) => set({ uploadedMedia: media }),
      addUploadedMedia: (media) => set((state) => ({ 
        uploadedMedia: [...state.uploadedMedia, media] 
      })),
      removeUploadedMedia: (index) => set((state) => ({
        uploadedMedia: state.uploadedMedia.filter((_, i) => i !== index),
        activeMediaIndex: state.activeMediaIndex >= state.uploadedMedia.length - 1 
          ? Math.max(0, state.uploadedMedia.length - 2) 
          : state.activeMediaIndex
      })),
      clearUploadedMedia: () => set({ uploadedMedia: [], activeMediaIndex: 0 }),
      setActiveMediaIndex: (index) => set({ activeMediaIndex: index }),
      setGeneratedCaptions: (captions) => set({ generatedCaptions: captions }),
      addGeneratedCaption: (caption) => 
        set((state) => ({ 
          generatedCaptions: [...state.generatedCaptions, caption] 
        })),
      setSelectedTone: (tone) => set({ selectedTone: tone }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setIncludeHashtags: (include) => set({ includeHashtags: include }),
      setIncludeEmojis: (include) => set({ includeEmojis: include }),
      setCaptionLength: (length) => set({ captionLength: length }),
      setSpicyLevel: (level) => set({ spicyLevel: level }),
      setCaptionStyle: (style) => set({ captionStyle: style }),
      setCreativeLanguageOptions: (options) => set({ creativeLanguageOptions: options }),
      setSavedCaptions: (captions) => set({ savedCaptions: captions }),
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
        generatedCaptions: [],
        isGenerating: false
      })
    }),
    {
      name: 'caption-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        uploadedMedia: state.uploadedMedia,
        activeMediaIndex: state.activeMediaIndex,
        generatedCaptions: state.generatedCaptions,
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