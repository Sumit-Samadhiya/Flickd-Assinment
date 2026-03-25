import { useRef, useCallback } from 'react';
import { AIServiceError, aiService } from '@services/aiService';
import { useAppStore } from '@context/AppContext';
import { devLog } from '@utils/helpers';
import type { ClipArtStyle } from '@appTypes/index';

export function useImageGeneration() {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Granular selectors to avoid unnecessary re-renders
  const processedImage = useAppStore(s => s.processedImage);
  const selectedStyles = useAppStore(s => s.selectedStyles);
  const setGenerationStatus = useAppStore(s => s.setGenerationStatus);
  const setGenerationProgress = useAppStore(s => s.setGenerationProgress);
  const setGeneratedImage = useAppStore(s => s.setGeneratedImage);
  const setError = useAppStore(s => s.setError);
  const resetGeneration = useAppStore(s => s.resetGeneration);

  const generate = useCallback(
    async (overrideStyles?: ClipArtStyle[], intensity?: number) => {
      if (!processedImage?.base64) {
        setError('Please upload and process an image first.');
        return;
      }

      // Cancel any in-flight request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      resetGeneration();
      setGenerationStatus('queued', 0);

      try {
        const styles = overrideStyles ?? selectedStyles;
        devLog('Starting generation', { styles, intensity });

        const response = await aiService.generateAllStyles(
          {
            imageBase64: processedImage.base64,
            styles,
            intensity,
          },
          signal,
          (progress, partialResults) => {
            setGenerationProgress(progress);
            // Progressively commit partial results as they arrive
            partialResults.forEach(result => {
              setGeneratedImage(result.styleType, result);
            });
          },
        );

        // Commit any final results not yet set via onProgress
        response.results.forEach(result => {
          setGeneratedImage(result.styleType, result);
        });

        setGenerationStatus('completed', 100);
        devLog('Generation complete', {
          success: response.successCount,
          failures: response.failureCount,
          timeMs: response.totalGenerationTime,
        });
      } catch (err) {
        if (err instanceof AIServiceError && err.code === 'ERR_CANCELLED') {
          setGenerationStatus('cancelled', 0);
        } else {
          setGenerationStatus('failed', 0);
          setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      processedImage,
      selectedStyles,
      resetGeneration,
      setGenerationStatus,
      setGenerationProgress,
      setGeneratedImage,
      setError,
    ],
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    devLog('Generation cancelled by user');
  }, []);

  return { generate, cancel };
}
