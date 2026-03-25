import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { APP_CONFIG } from '@utils/constants';
import { formatBytes, devLog } from '@utils/helpers';
import { getErrorMessage, isValidImageDimensions, isValidImageMimeType, isValidImageSize } from '@utils/validators';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  originalSize: number;
  compressedSize?: number;
  dimensions?: ImageDimensions;
}

export interface ImageData {
  base64: string;
  mimeType: string;
  size: number;
  dimensions: ImageDimensions;
  originalFileName: string;
  uploadedAt: string;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetSize?: number;
}

export interface UploadedImageLegacy {
  uri: string;
  base64: string;
  width: number;
  height: number;
  mimeType: string;
  fileSizeBytes: number;
  fileName?: string;
}

export interface ProcessedImageLegacy {
  uri: string;
  base64: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}

export class ImageServiceError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'ImageServiceError';
    this.code = code;
    Object.setPrototypeOf(this, ImageServiceError.prototype);
  }
}

function estimateBase64Size(base64String: string): number {
  const normalized = base64String.trim();
  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
}

function mimeToExtension(mimeType: string): string {
  if (mimeType.includes('png')) return 'png';
  return 'jpg';
}

function mimeToSaveFormat(mimeType: string): ImageManipulator.SaveFormat {
  if (mimeType.includes('png')) return ImageManipulator.SaveFormat.PNG;
  return ImageManipulator.SaveFormat.JPEG;
}

async function withTempImageFromBase64<T>(
  base64String: string,
  mimeType: string,
  task: (uri: string) => Promise<T>,
): Promise<T> {
  if (!FileSystem.cacheDirectory) {
    throw new Error('Cache directory is not available on this device.');
  }

  const extension = mimeToExtension(mimeType);
  const tempUri = `${FileSystem.cacheDirectory}clipart-temp-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  await FileSystem.writeAsStringAsync(tempUri, base64String, {
    encoding: FileSystem.EncodingType.Base64,
  });

  try {
    return await task(tempUri);
  } finally {
    await FileSystem.deleteAsync(tempUri, { idempotent: true }).catch(() => undefined);
  }
}

export async function getImageDimensions(
  base64String: string,
  mimeType: string,
): Promise<ImageDimensions> {
  return withTempImageFromBase64(base64String, mimeType, async tempUri => {
    const result = await ImageManipulator.manipulateAsync(
      tempUri,
      [],
      {
        compress: 1,
        format: mimeToSaveFormat(mimeType),
      },
    );

    if (!result.width || !result.height) {
      throw new Error('Failed to read image dimensions');
    }

    if (result.uri && result.uri !== tempUri) {
      await FileSystem.deleteAsync(result.uri, { idempotent: true }).catch(() => undefined);
    }

    return { width: result.width, height: result.height };
  });
}

export async function validateImage(
  base64String: string,
  mimeType: string,
  fileName: string,
): Promise<ImageValidationResult> {
  try {
    if (!isValidImageMimeType(mimeType)) {
      return {
        isValid: false,
        error: `Unsupported format. Allowed: JPG, PNG. Got: ${mimeType}`,
        originalSize: 0,
      };
    }

    const fileSize = estimateBase64Size(base64String);

    if (!isValidImageSize(fileSize)) {
      return {
        isValid: false,
        error: `File too large. Max: 10MB, Got: ${(fileSize / 1024 / 1024).toFixed(2)}MB`,
        originalSize: fileSize,
      };
    }

    const dimensions = await getImageDimensions(base64String, mimeType);

    if (!isValidImageDimensions(dimensions.width, dimensions.height)) {
      return {
        isValid: false,
        error: `Image too large. Max: 2048x2048px, Got: ${dimensions.width}x${dimensions.height}px`,
        originalSize: fileSize,
        dimensions,
      };
    }

    devLog('Image validation passed', { fileName, mimeType, fileSize, dimensions });

    return {
      isValid: true,
      originalSize: fileSize,
      dimensions,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Validation failed: ${getErrorMessage(error)}`,
      originalSize: 0,
    };
  }
}

export async function compressImage(
  base64String: string,
  mimeType: string,
  options: CompressionOptions = {},
): Promise<string> {
  const {
    maxWidth = APP_CONFIG.COMPRESS_MAX_WIDTH,
    maxHeight = APP_CONFIG.COMPRESS_MAX_HEIGHT,
    quality = Math.round(APP_CONFIG.COMPRESS_QUALITY * 100),
    targetSize = 5 * 1024 * 1024,
  } = options;

  const saveFormat = mimeToSaveFormat(mimeType);

  try {
    const dimensions = await getImageDimensions(base64String, mimeType);
    const resizeRatio = Math.min(1, Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height));
    const resizeWidth = Math.max(1, Math.floor(dimensions.width * resizeRatio));
    const resizeHeight = Math.max(1, Math.floor(dimensions.height * resizeRatio));

    return await withTempImageFromBase64(base64String, mimeType, async tempUri => {
      let currentQuality = Math.min(100, Math.max(30, Math.round(quality)));

      while (true) {
        const result = await ImageManipulator.manipulateAsync(
          tempUri,
          [{ resize: { width: resizeWidth, height: resizeHeight } }],
          {
            compress: currentQuality / 100,
            format: saveFormat,
            base64: true,
          },
        );

        const compressedBase64 = result.base64;
        if (!compressedBase64) {
          throw new Error('Failed to load image for compression');
        }

        const compressedSize = estimateBase64Size(compressedBase64);
        devLog('Compression iteration', {
          currentQuality,
          compressedSize: formatBytes(compressedSize),
          targetSize: formatBytes(targetSize),
        });

        if (result.uri && result.uri !== tempUri) {
          await FileSystem.deleteAsync(result.uri, { idempotent: true }).catch(() => undefined);
        }

        if (compressedSize <= targetSize || currentQuality <= 30) {
          return compressedBase64;
        }

        currentQuality = Math.max(30, currentQuality - 10);
      }
    });
  } catch (error) {
    throw new Error(`Compression failed: ${getErrorMessage(error)}`);
  }
}

export async function processImage(
  base64String: string,
  mimeType: string,
  fileName: string,
  compressionOptions?: CompressionOptions,
): Promise<ImageData> {
  const validation = await validateImage(base64String, mimeType, fileName);
  if (!validation.isValid) {
    throw new ImageServiceError(validation.error ?? 'Image validation failed', 'ERR_INVALID_IMAGE');
  }

  const compressedBase64 = await compressImage(base64String, mimeType, compressionOptions);

  const compressedValidation = await validateImage(compressedBase64, mimeType, fileName);
  if (!compressedValidation.isValid) {
    throw new ImageServiceError(
      compressedValidation.error ?? 'Compressed image validation failed',
      'ERR_COMPRESSED_INVALID',
    );
  }

  return {
    base64: compressedBase64,
    mimeType,
    size: compressedValidation.originalSize || 0,
    dimensions: compressedValidation.dimensions ?? { width: 0, height: 0 },
    originalFileName: fileName,
    uploadedAt: new Date().toISOString(),
  };
}

export async function pickImageFromGallery(): Promise<ImageData> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new ImageServiceError('Gallery access was denied. Please enable it in Settings.', 'ERR_PERMISSION_DENIED');
  }

  const response = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,
    quality: 1,
    allowsEditing: false,
    selectionLimit: 1,
  });

  if (response.canceled) {
    throw new ImageServiceError('Image selection cancelled', 'ERR_SELECTION_CANCELLED');
  }

  const asset = response.assets?.[0];
  if (!asset?.base64) {
    throw new ImageServiceError('No image selected', 'ERR_NO_IMAGE');
  }

  return processImage(
    asset.base64,
    asset.mimeType ?? 'image/jpeg',
    asset.fileName ?? 'image.jpg',
  );
}

export async function pickImageFromCamera(): Promise<ImageData> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new ImageServiceError('Camera access was denied. Please enable it in Settings.', 'ERR_PERMISSION_DENIED');
  }

  const response = await ImagePicker.launchCameraAsync({
    base64: true,
    quality: 1,
    allowsEditing: false,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  if (response.canceled) {
    throw new ImageServiceError('Camera cancelled', 'ERR_CAMERA_CANCELLED');
  }

  const asset = response.assets?.[0];
  if (!asset?.base64) {
    throw new ImageServiceError('Failed to capture image', 'ERR_CAPTURE_FAILED');
  }

  return processImage(
    asset.base64,
    asset.mimeType ?? 'image/jpeg',
    asset.fileName ?? `photo_${Date.now()}.jpg`,
  );
}

function toLegacyUploadedImage(imageData: ImageData): UploadedImageLegacy {
  return {
    uri: `data:${imageData.mimeType};base64,${imageData.base64}`,
    base64: imageData.base64,
    width: imageData.dimensions.width,
    height: imageData.dimensions.height,
    mimeType: imageData.mimeType,
    fileSizeBytes: imageData.size,
    fileName: imageData.originalFileName,
  };
}

function toLegacyProcessedImage(imageData: ImageData): ProcessedImageLegacy {
  return {
    uri: `data:${imageData.mimeType};base64,${imageData.base64}`,
    base64: imageData.base64,
    width: imageData.dimensions.width,
    height: imageData.dimensions.height,
    fileSizeBytes: imageData.size,
  };
}

export async function pickFromGallery(): Promise<UploadedImageLegacy | null> {
  try {
    const imageData = await pickImageFromGallery();
    return toLegacyUploadedImage(imageData);
  } catch (error) {
    const message = getErrorMessage(error).toLowerCase();
    if (message.includes('cancelled') || message.includes('canceled')) {
      return null;
    }
    throw error;
  }
}

export async function pickFromCamera(): Promise<UploadedImageLegacy | null> {
  try {
    const imageData = await pickImageFromCamera();
    return toLegacyUploadedImage(imageData);
  } catch (error) {
    const message = getErrorMessage(error).toLowerCase();
    if (message.includes('cancelled') || message.includes('canceled')) {
      return null;
    }
    throw error;
  }
}

export async function processUploadedImage(image: UploadedImageLegacy): Promise<ProcessedImageLegacy> {
  const processed = await processImage(
    image.base64,
    image.mimeType,
    image.fileName ?? 'image.jpg',
  );
  return toLegacyProcessedImage(processed);
}

export const imageService = {
  validateImage,
  compressImage,
  processImage,
  pickImageFromGallery,
  pickImageFromCamera,
  getImageDimensions,
  pickFromGallery,
  pickFromCamera,
  processUploadedImage,
};
