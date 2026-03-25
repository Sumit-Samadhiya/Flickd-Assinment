import { useCallback, useState } from 'react';
import { imageService, ImageServiceError } from '@services/imageService';
import { useAppStore } from '@context/AppContext';
import { devLog } from '@utils/helpers';

export type UploadSource = 'gallery' | 'camera';

export function useImageUpload() {
  const [isLoading, setIsLoading] = useState(false);

  const setOriginalImage = useAppStore(s => s.setOriginalImage);
  const setProcessedImage = useAppStore(s => s.setProcessedImage);
  const setError = useAppStore(s => s.setError);
  const resetGeneration = useAppStore(s => s.resetGeneration);

  const pick = useCallback(
    async (source: UploadSource) => {
      setIsLoading(true);
      setError(null);
      // Reset previous generation when a new image is picked
      resetGeneration();

      try {
        const rawImage =
          source === 'gallery'
            ? await imageService.pickFromGallery()
            : await imageService.pickFromCamera();

        if (!rawImage) {
          // User cancelled — not an error
          setIsLoading(false);
          return;
        }

        setOriginalImage(rawImage);
        devLog('Image picked', { source, size: rawImage.fileSizeBytes });

        // Compress and resize for API transmission
        const processed = await imageService.processUploadedImage(rawImage);
        setProcessedImage(processed);
        devLog('Image processed', { size: processed.fileSizeBytes });
      } catch (err) {
        const message =
          err instanceof ImageServiceError
            ? err.message
            : 'Failed to load image. Please try again.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [setOriginalImage, setProcessedImage, setError, resetGeneration],
  );

  const pickFromGallery = useCallback(() => pick('gallery'), [pick]);
  const pickFromCamera = useCallback(() => pick('camera'), [pick]);

  return { pickFromGallery, pickFromCamera, isLoading };
}
