import { useCallback, useState } from 'react';
import { imageService, ImageServiceError } from '@services/imageService';
import { useAppState } from '@hooks/useAppState';
import { devLog } from '@utils/helpers';
import type { UploadedImage } from '@appTypes/index';

export type UploadSource = 'gallery' | 'camera';

export function useImageUpload() {
  const [isLoading, setIsLoading] = useState(false);

  const { setOriginalImage, setUploadError, resetState } = useAppState();

  const pick = useCallback(
    async (source: UploadSource) => {
      setIsLoading(true);
      setUploadError(null);
      // Reset previous generation when a new image is picked
      resetState();

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

        // Cast legacy type to UploadedImage (structurally identical)
        const image: UploadedImage = rawImage;
        setOriginalImage(image);
        devLog('Image picked', { source, size: rawImage.fileSizeBytes });

        // Image is stored as originalImage; processing happens in generation hook
      } catch (err) {
        const message =
          err instanceof ImageServiceError
            ? err.message
            : 'Failed to load image. Please try again.';
        setUploadError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [setOriginalImage, setUploadError, resetState],
  );

  const pickFromGallery = useCallback(() => pick('gallery'), [pick]);
  const pickFromCamera = useCallback(() => pick('camera'), [pick]);

  return { pickFromGallery, pickFromCamera, isLoading };
}
