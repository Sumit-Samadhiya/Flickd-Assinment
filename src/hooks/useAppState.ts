/**
 * useAppState.ts
 *
 * Custom hook for convenient state management using useAppContext.
 * Provides action creators that wrap dispatcher calls.
 */

import { useCallback } from 'react';
import { useAppContext } from '@context/AppContext';
import type { ClipArtStyle, UploadedImage, GenerationResponse } from '@appTypes/index';
import type { AppContextState } from '@context/AppContext';

export function useAppState() {
  const { state, dispatch } = useAppContext();

  const setOriginalImage = useCallback((image: UploadedImage) => {
    dispatch({ type: 'SET_ORIGINAL_IMAGE', payload: image });
  }, [dispatch]);

  const clearOriginalImage = useCallback(() => {
    dispatch({ type: 'CLEAR_ORIGINAL_IMAGE' });
  }, [dispatch]);

  const setUploadLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_UPLOAD_LOADING', payload: loading });
  }, [dispatch]);

  const setUploadError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_UPLOAD_ERROR', payload: error });
  }, [dispatch]);

  const setSelectedStyles = useCallback((styles: ClipArtStyle[]) => {
    dispatch({ type: 'SET_SELECTED_STYLES', payload: styles });
  }, [dispatch]);

  const setGenerationLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_GENERATION_LOADING', payload: loading });
  }, [dispatch]);

  const setGenerationProgress = useCallback((progress: number) => {
    dispatch({ type: 'SET_GENERATION_PROGRESS', payload: progress });
  }, [dispatch]);

  const setGeneratedImage = useCallback(
    (style: ClipArtStyle, image: GenerationResponse) => {
      dispatch({
        type: 'SET_GENERATED_IMAGE',
        payload: { style, image },
      });
    },
    [dispatch],
  );

  const setAllGeneratedImages = useCallback(
    (images: GenerationResponse[]) => {
      dispatch({ type: 'SET_ALL_GENERATED_IMAGES', payload: images });
    },
    [dispatch],
  );

  const setGenerationError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_GENERATION_ERROR', payload: error });
  }, [dispatch]);

  const setCurrentStep = useCallback(
    (step: AppContextState['currentStep']) => {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    },
    [dispatch],
  );

  const setStyleIntensity = useCallback((intensity: number) => {
    dispatch({ type: 'SET_STYLE_INTENSITY', payload: intensity });
  }, [dispatch]);

  const setCachedImageHash = useCallback((hash: string | null) => {
    dispatch({ type: 'SET_CACHED_IMAGE_HASH', payload: hash });
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, [dispatch]);

  return {
    state,
    setOriginalImage,
    clearOriginalImage,
    setUploadLoading,
    setUploadError,
    setSelectedStyles,
    setGenerationLoading,
    setGenerationProgress,
    setGeneratedImage,
    setAllGeneratedImages,
    setGenerationError,
    setCurrentStep,
    setStyleIntensity,
    setCachedImageHash,
    resetState,
  };
}
