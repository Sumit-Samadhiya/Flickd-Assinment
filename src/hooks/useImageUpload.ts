import { useCallback } from 'react';
import { imageService } from '@services/imageService';
import { useAppState } from '@hooks/useAppState';
import { getErrorMessage } from '@utils/validators';
import type { UploadedImage } from '@appTypes/index';

export type UploadSource = 'gallery' | 'camera';

export function useImageUpload() {
  const {
    state,
    setUploadLoading,
    setUploadError,
    setOriginalImage,
    clearOriginalImage,
    setCurrentStep,
  } = useAppState();

  const upload = useCallback(
    async (source: UploadSource): Promise<UploadedImage | null> => {
      try {
        setUploadLoading(true);
        setUploadError(null);

        const imageData =
          source === 'gallery'
            ? await imageService.pickFromGallery()
            : await imageService.pickFromCamera();

        if (!imageData) {
          return null;
        }

        setOriginalImage(imageData);
        setCurrentStep('select-styles');

        return imageData;
      } catch (error) {
        setUploadError(getErrorMessage(error));
        throw error;
      } finally {
        setUploadLoading(false);
      }
    },
    [setUploadLoading, setUploadError, setOriginalImage, setCurrentStep],
  );

  const uploadFromGallery = useCallback(() => upload('gallery'), [upload]);
  const uploadFromCamera = useCallback(() => upload('camera'), [upload]);

  const clearImage = useCallback(() => {
    clearOriginalImage();
    setUploadError(null);
    setCurrentStep('upload');
  }, [clearOriginalImage, setUploadError, setCurrentStep]);

  // Backward-compatible aliases for existing UI code.
  const pickFromGallery = uploadFromGallery;
  const pickFromCamera = uploadFromCamera;
  const isLoading = state.isUploadingImage;

  return {
    uploadFromGallery,
    uploadFromCamera,
    clearImage,
    pickFromGallery,
    pickFromCamera,
    isLoading,
  };
}
