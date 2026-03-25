import { useCallback } from 'react';
import { useAppState } from './useAppState';
import { storageService, type CachedGeneration } from '@services/storageService';
import { getErrorMessage } from '@utils/validators';

export function useLocalStorage() {
  const {
    state,
    setOriginalImage,
    setAllGeneratedImages,
    setCachedImageHash,
  } = useAppState();

  const saveCurrentGeneration = useCallback(async () => {
    try {
      if (!state.originalImage) {
        throw new Error('No image to save');
      }

      const validImages = Object.values(state.generatedImages).filter(
        (image): image is NonNullable<typeof image> => image !== null,
      );

      const imageHash = await storageService.saveGeneration(
        state.originalImage,
        validImages,
      );

      setCachedImageHash(imageHash);
      return imageHash;
    } catch (error) {
      console.error('Failed to save generation:', getErrorMessage(error));
      throw error;
    }
  }, [state.originalImage, state.generatedImages, setCachedImageHash]);

  const loadCachedGeneration = useCallback(
    async (imageHash: string): Promise<CachedGeneration | null> => {
      try {
        const cached = await storageService.getCachedGeneration(imageHash);
        if (!cached) {
          return null;
        }

        setOriginalImage(cached.originalImage);
        setAllGeneratedImages(cached.generatedImages);
        setCachedImageHash(imageHash);

        return cached;
      } catch (error) {
        console.error('Failed to load cached generation:', getErrorMessage(error));
        return null;
      }
    },
    [setOriginalImage, setAllGeneratedImages, setCachedImageHash],
  );

  const deleteCachedGeneration = useCallback(async (imageHash: string) => {
    try {
      await storageService.deleteGeneration(imageHash);
      if (state.cachedImageHash === imageHash) {
        setCachedImageHash(null);
      }
    } catch (error) {
      console.error('Failed to delete cached generation:', getErrorMessage(error));
      throw error;
    }
  }, [state.cachedImageHash, setCachedImageHash]);

  const getCacheSize = useCallback(async () => {
    try {
      return await storageService.getCacheSize();
    } catch (error) {
      console.error('Failed to get cache size:', getErrorMessage(error));
      return 0;
    }
  }, []);

  const clearAllCache = useCallback(async () => {
    try {
      await storageService.clearAllCache();
      setCachedImageHash(null);
    } catch (error) {
      console.error('Failed to clear all cache:', getErrorMessage(error));
      throw error;
    }
  }, [setCachedImageHash]);

  return {
    saveCurrentGeneration,
    loadCachedGeneration,
    deleteCachedGeneration,
    getCacheSize,
    clearAllCache,
  };
}
