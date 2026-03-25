/**
 * AppContext.tsx
 *
 * Global state management using Zustand.
 * The AppProvider is a thin wrapper for future cross-cutting concerns
 * (theme, analytics, etc.). For state, use useAppStore() directly.
 */

import React, { type ReactNode } from 'react';
import { create } from 'zustand';
import { STYLE_CONFIG } from '@utils/constants';
import type {
  AppState,
  UploadedImage,
  ProcessedImage,
  ClipArtStyle,
  GenerationResponse,
  GenerationStatus,
} from '@appTypes/index';

// ─── Store Interface ──────────────────────────────────────────────────────────

interface AppStore extends AppState {
  // Image actions
  setOriginalImage: (image: UploadedImage | null) => void;
  setProcessedImage: (image: ProcessedImage | null) => void;

  // Generation actions
  setGeneratedImage: (style: ClipArtStyle, response: GenerationResponse) => void;
  setSelectedStyles: (styles: ClipArtStyle[]) => void;
  setGenerationStatus: (status: GenerationStatus, progress?: number) => void;
  setCurrentJobId: (jobId: string | null) => void;
  setGenerationProgress: (progress: number) => void;

  // Error
  setError: (error: string | null) => void;

  // Resets
  resetGeneration: () => void;
  resetAll: () => void;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  originalImage: null,
  processedImage: null,
  generatedImages: {},
  isGenerating: false,
  selectedStyles: [...STYLE_CONFIG.ALL_STYLES] as ClipArtStyle[],
  generationProgress: 0,
  generationStatus: 'idle',
  currentJobId: null,
  error: null,
};

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>(set => ({
  ...initialState,

  setOriginalImage: image =>
    set({ originalImage: image }),

  setProcessedImage: image =>
    set({ processedImage: image }),

  setGeneratedImage: (style, response) =>
    set(state => ({
      generatedImages: { ...state.generatedImages, [style]: response },
    })),

  setSelectedStyles: styles =>
    set({ selectedStyles: styles }),

  setGenerationStatus: (status, progress) =>
    set({
      generationStatus: status,
      isGenerating: status === 'queued' || status === 'processing',
      ...(progress !== undefined ? { generationProgress: progress } : {}),
    }),

  setCurrentJobId: jobId =>
    set({ currentJobId: jobId }),

  setGenerationProgress: progress =>
    set({ generationProgress: progress }),

  setError: error =>
    set({ error }),

  resetGeneration: () =>
    set({
      generatedImages: {},
      isGenerating: false,
      generationProgress: 0,
      generationStatus: 'idle',
      currentJobId: null,
      error: null,
    }),

  resetAll: () =>
    set(initialState),
}));

// ─── App Provider ─────────────────────────────────────────────────────────────
// Currently a passthrough. Wrap here if you need React context providers
// (e.g., ThemeContext, AnalyticsContext) without a full navigation solution.

export function AppProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
