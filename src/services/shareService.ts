/**
 * shareService.ts
 *
 * Download and native share functionality.
 */

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { devLog } from '@utils/helpers';

export class ShareServiceError extends Error {
  public readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'ShareServiceError';
    this.code = code;
    Object.setPrototypeOf(this, ShareServiceError.prototype);
  }
}

/**
 * Downloads an image from a URL or saves a base64 string to the device's cache.
 * Returns the local file URI.
 */
export async function downloadImage(
  source: string,
  fileName: string,
): Promise<string> {
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new ShareServiceError('Cache directory unavailable.', 'ERR_STORAGE');
  }

  const localUri = `${cacheDir}${fileName}.jpg`;

  if (source.startsWith('http')) {
    // Download from URL
    const result = await FileSystem.downloadAsync(source, localUri);
    if (result.status !== 200) {
      throw new ShareServiceError(
        `Failed to download image (HTTP ${result.status}).`,
        'ERR_DOWNLOAD_FAILED',
      );
    }
    devLog('Image downloaded', { localUri });
    return localUri;
  }

  // Save base64 string directly
  await FileSystem.writeAsStringAsync(localUri, source, {
    encoding: FileSystem.EncodingType.Base64,
  });
  devLog('Image saved from base64', { localUri });
  return localUri;
}

/**
 * Saves an image (URL or base64) to the device media gallery.
 * Requests permission if not already granted.
 */
export async function saveToGallery(source: string, fileName: string): Promise<void> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new ShareServiceError(
      'Storage access was denied. Please enable it in Settings.',
      'ERR_PERMISSION_DENIED',
    );
  }

  const localUri = await downloadImage(source, fileName);
  await MediaLibrary.createAssetAsync(localUri);
  devLog('Image saved to gallery', { localUri });
}

/**
 * Shares an image using the native OS share sheet.
 */
export async function shareImage(source: string, fileName: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new ShareServiceError(
      'Sharing is not available on this device.',
      'ERR_SHARING_UNAVAILABLE',
    );
  }

  const localUri = await downloadImage(source, fileName);
  await Sharing.shareAsync(localUri, {
    mimeType: 'image/jpeg',
    dialogTitle: 'Share your ClipArt',
    UTI: 'public.jpeg',
  });
}

export const shareService = {
  downloadImage,
  saveToGallery,
  shareImage,
};
