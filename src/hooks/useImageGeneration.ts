import { useRef, useCallback } from 'react';
import { AIServiceError, aiService } from '@services/aiService';
import { useAppState } from '@hooks/useAppState';
import { devLog } from '@utils/helpers';
import type { ClipArtStyle } from '@appTypes/index';

export function useImageGeneration() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    state,
    setGenerationLoading,
    setGenerationProgress,
    setAllGeneratedImages,
    setGenerationError,
  } = useAppState();

  const { originalImage, selectedStyles } = state;

  const generate = useCallback(
    async (overrideStyles?: ClipArtStyle[], intensity?: number) => {
      if (!originalImage?.base64) {
        setGenerationError('Please upload an image first.');
        return;
      }

      // Cancel any in-flight request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setGenerationLoading(true);
      setGenerationProgress(0);
      setGenerationError(null);

      try {
        const styles = overrideStyles ?? selectedStyles;
        devLog('Starting generation', { styles, intensity });

        const response = await aiService.generateAllStyles(
          {
            imageBase64: originalImage.base64,
            styles,
            intensity,
          },
          signal,
          (progress, partialResults) => {
            setGenerationProgress(progress);
            // Progressively commit partial results as they arrive
            if (partialResults.length > 0) {
              setAllGeneratedImages(partialResults);
            }
          },
        );

        // Commit any final results not yet set via onProgress
        setAllGeneratedImages(response.results);

        setGenerationProgress(100);
        devLog('Generation complete', {
          success: response.successCount,
          failures: response.failureCount,
          timeMs: response.totalGenerationTime,
        });
      } catch (err) {
        if (err instanceof AIServiceError && err.code === 'ERR_CANCELLED') {
          devLog('Generation cancelled by user');
        } else {
          setGenerationError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
        }
      } finally {
        setGenerationLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      originalImage,
      selectedStyles,
      setGenerationLoading,
      setGenerationProgress,
      setAllGeneratedImages,
      setGenerationError,
    ],
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    devLog('Generation cancelled by user');
  }, []);

  return { generate, cancel };
}
