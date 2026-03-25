/**
 * AppContext.tsx
 *
 * Global state management using Context API + useReducer.
 */

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import { STYLE_CONFIG } from '@utils/constants';
import type { ClipArtStyle, UploadedImage, GenerationResponse } from '@appTypes/index';

// ─── App Context State ────────────────────────────────────────────────────────

export interface AppContextState {
  originalImage: UploadedImage | null;
  isUploadingImage: boolean;
  uploadError: string | null;

  generatedImages: Record<ClipArtStyle, GenerationResponse | null>;
  isGenerating: boolean;
  generationProgress: number;
  selectedStyles: ClipArtStyle[];
  generationError: string | null;

  currentStep: 'upload' | 'select-styles' | 'generating' | 'results';
  styleIntensity: number;

  cachedImageHash: string | null;
}

// ─── Action Types ─────────────────────────────────────────────────────────────

export type AppAction =
  | { type: 'SET_ORIGINAL_IMAGE'; payload: UploadedImage }
  | { type: 'CLEAR_ORIGINAL_IMAGE' }
  | { type: 'SET_UPLOAD_LOADING'; payload: boolean }
  | { type: 'SET_UPLOAD_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_STYLES'; payload: ClipArtStyle[] }
  | { type: 'SET_GENERATION_LOADING'; payload: boolean }
  | { type: 'SET_GENERATION_PROGRESS'; payload: number }
  | { type: 'SET_GENERATED_IMAGE'; payload: { style: ClipArtStyle; image: GenerationResponse } }
  | {
      type: 'SET_ALL_GENERATED_IMAGES';
      payload:
        | GenerationResponse[]
        | Record<ClipArtStyle, GenerationResponse | null>;
    }
  | { type: 'SET_GENERATION_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_STEP'; payload: AppContextState['currentStep'] }
  | { type: 'SET_STYLE_INTENSITY'; payload: number }
  | { type: 'SET_CACHED_IMAGE_HASH'; payload: string | null }
  | { type: 'RESET_STATE' };

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppContextState = {
  originalImage: null,
  isUploadingImage: false,
  uploadError: null,
  generatedImages: {
    cartoon: null,
    flat: null,
    anime: null,
    pixel: null,
    sketch: null,
  },
  isGenerating: false,
  generationProgress: 0,
  selectedStyles: [...STYLE_CONFIG.ALL_STYLES] as ClipArtStyle[],
  generationError: null,
  currentStep: 'upload',
  styleIntensity: 5,
  cachedImageHash: null,
};

// ─── Reducer ───────────────────────────────────────────────────────────────────

function appReducer(state: AppContextState, action: AppAction): AppContextState {
  switch (action.type) {
    case 'SET_ORIGINAL_IMAGE':
      return { ...state, originalImage: action.payload };

    case 'CLEAR_ORIGINAL_IMAGE':
      return {
        ...state,
        originalImage: null,
        generatedImages: initialState.generatedImages,
        generationProgress: 0,
        generationError: null,
      };

    case 'SET_UPLOAD_LOADING':
      return { ...state, isUploadingImage: action.payload };

    case 'SET_UPLOAD_ERROR':
      return { ...state, uploadError: action.payload };

    case 'SET_SELECTED_STYLES':
      return { ...state, selectedStyles: action.payload };

    case 'SET_GENERATION_LOADING':
      return { ...state, isGenerating: action.payload };

    case 'SET_GENERATION_PROGRESS':
      return { ...state, generationProgress: action.payload };

    case 'SET_GENERATED_IMAGE':
      return {
        ...state,
        generatedImages: {
          ...state.generatedImages,
          [action.payload.style]: action.payload.image,
        },
      };

    case 'SET_ALL_GENERATED_IMAGES': {
      if (Array.isArray(action.payload)) {
        const imageRecord = action.payload.reduce(
          (acc, response) => {
            acc[response.styleType] = response;
            return acc;
          },
          { ...initialState.generatedImages },
        );
        return {
          ...state,
          generatedImages: imageRecord,
        };
      }

      return {
        ...state,
        generatedImages: {
          ...initialState.generatedImages,
          ...action.payload,
        },
      };
    }

    case 'SET_GENERATION_ERROR':
      return { ...state, generationError: action.payload };

    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };

    case 'SET_STYLE_INTENSITY':
      return { ...state, styleIntensity: action.payload };

    case 'SET_CACHED_IMAGE_HASH':
      return { ...state, cachedImageHash: action.payload };

    case 'RESET_STATE':
      return { ...initialState };

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<{
  state: AppContextState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
