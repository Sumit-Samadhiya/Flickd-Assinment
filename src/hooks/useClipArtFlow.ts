import { useAppState } from './useAppState';
import { useImageUpload } from './useImageUpload';
import { useImageGeneration } from './useImageGeneration';
import { useLocalStorage } from './useLocalStorage';

export function useClipArtFlow() {
  const appState = useAppState();
  const upload = useImageUpload();
  const generation = useImageGeneration();
  const storage = useLocalStorage();

  return {
    state: appState.state,

    uploadFromGallery: upload.uploadFromGallery,
    uploadFromCamera: upload.uploadFromCamera,
    clearImage: upload.clearImage,

    generateAllStyles: generation.generateAllStyles,
    generateStyle: generation.generateStyle,
    retryGeneration: generation.retryGeneration,

    saveGeneration: storage.saveCurrentGeneration,
    loadCached: storage.loadCachedGeneration,
    deleteCache: storage.deleteCachedGeneration,
    getCacheSize: storage.getCacheSize,
    clearCache: storage.clearAllCache,

    setSelectedStyles: appState.setSelectedStyles,
    setStyleIntensity: appState.setStyleIntensity,
    resetApp: appState.resetState,
  };
}
