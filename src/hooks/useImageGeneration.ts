import { useRef, useCallback } from 'react';
import { AIServiceError, aiService } from '@services/aiService';
import { useAppState } from '@hooks/useAppState';
import { devLog } from '@utils/helpers';
import { getErrorMessage } from '@utils/validators';
import type { ClipArtStyle } from '@appTypes/index';

export function useImageGeneration() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    state,
    setGenerationLoading,
    setGenerationProgress,
    setGeneratedImage,
    setAllGeneratedImages,
    setGenerationError,
    setCurrentStep,
  } = useAppState();

  const { originalImage, selectedStyles, styleIntensity, isGenerating, generationProgress, generationError } = state;

  const generateStyle = useCallback(
    async (style: ClipArtStyle) => {
      try {
        if (!originalImage) {
          throw new Error('No image uploaded');
        }

        setGenerationError(null);
        setGenerationProgress(0);

        const result = await aiService.generateClipArt({
          imageBase64: originalImage.base64,
          style,
          intensity: styleIntensity,
        });

        setGeneratedImage(style, result);
        setGenerationProgress(100);

        return result;
      } catch (error) {
        setGenerationError(`Failed to generate ${style}: ${getErrorMessage(error)}`);
        throw error;
      }
    },
    [
      originalImage,
      styleIntensity,
      setGenerationError,
      setGenerationProgress,
      setGeneratedImage,
    ],
  );

  const generateAllStyles = useCallback(
    async (overrideStyles?: ClipArtStyle[], intensity?: number) => {
      let progressInterval: ReturnType<typeof setInterval> | null = null;

      try {
        if (!originalImage) {
          throw new Error('No image uploaded');
        }

        const styles = overrideStyles ?? selectedStyles;
        if (styles.length === 0) {
          throw new Error('No styles selected');
        }

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setGenerationLoading(true);
        setGenerationError(null);
        setGenerationProgress(0);
        setCurrentStep('generating');

        // Keep UI active while backend job is running.
        let progressValue = 0;
        progressInterval = setInterval(() => {
          progressValue = Math.min(90, progressValue + Math.random() * 15);
          setGenerationProgress(progressValue);
        }, 500);

        const batchResult = await aiService.generateAllStyles(
          {
            imageBase64: originalImage.base64,
            styles,
            intensity: intensity ?? styleIntensity,
          },
          signal,
        );

        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }

        setAllGeneratedImages(batchResult.results);
        setGenerationProgress(100);
        setCurrentStep('results');

        devLog('Generation complete', {
          success: batchResult.successCount,
          failures: batchResult.failureCount,
          timeMs: batchResult.totalGenerationTime,
        });

        return batchResult;
      } catch (error) {
        if (error instanceof AIServiceError && error.code === 'ERR_CANCELLED') {
          devLog('Generation cancelled by user');
        } else {
          setGenerationError(`Generation failed: ${getErrorMessage(error)}`);
        }
        setGenerationProgress(0);
        throw error;
      } finally {
        if (progressInterval) {
          clearInterval(progressInterval);
        }
        setGenerationLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      originalImage,
      selectedStyles,
      styleIntensity,
      setGenerationLoading,
      setGenerationError,
      setGenerationProgress,
      setAllGeneratedImages,
      setCurrentStep,
    ],
  );

  const retryGeneration = useCallback(async () => generateAllStyles(), [generateAllStyles]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    devLog('Generation cancelled by user');
  }, []);

  // Backward-compatible alias for existing Generation screen.
  const generate = generateAllStyles;

  return {
    generateStyle,
    generateAllStyles,
    retryGeneration,
    isGenerating,
    generationProgress,
    generationError,
    generate,
    cancel,
  };
}
