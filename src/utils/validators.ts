import { APP_CONFIG, STYLE_CONFIG } from './constants';
import type { ClipArtStyle } from '@appTypes/index';

const VALID_STYLES = new Set<ClipArtStyle>(STYLE_CONFIG.ALL_STYLES);

export function isValidStyle(value: unknown): value is ClipArtStyle {
  return VALID_STYLES.has(value as ClipArtStyle);
}

/**
 * Validates base64 image payload.
 * Intentionally loose — deep validation happens server-side.
 */
export function isValidBase64Image(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.trim().length < 100) return false;
  // Base64 chars: A-Z a-z 0-9 + / =
  return /^[A-Za-z0-9+/=]+$/.test(value.trim());
}

export function isImageSizeValid(bytes: number): boolean {
  return bytes > 0 && bytes <= APP_CONFIG.MAX_IMAGE_SIZE;
}

export function isValidImageMimeType(mimeType: string): boolean {
  return APP_CONFIG.SUPPORTED_FORMATS.includes(mimeType as (typeof APP_CONFIG.SUPPORTED_FORMATS)[number]);
}

export function isValidImageSize(sizeInBytes: number): boolean {
  return sizeInBytes <= APP_CONFIG.MAX_IMAGE_SIZE;
}

export function isValidImageDimensions(width: number, height: number): boolean {
  return (
    width <= APP_CONFIG.MAX_IMAGE_DIMENSIONS.width &&
    height <= APP_CONFIG.MAX_IMAGE_DIMENSIONS.height
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export function isImageDimensionValid(width: number, height: number): boolean {
  return (
    width > 0 &&
    height > 0 &&
    width <= APP_CONFIG.MAX_IMAGE_DIMENSIONS.width &&
    height <= APP_CONFIG.MAX_IMAGE_DIMENSIONS.height
  );
}

export function isValidMimeType(mimeType: unknown): boolean {
  if (typeof mimeType !== 'string') return false;
  return isValidImageMimeType(mimeType);
}

export function isValidCustomPrompt(prompt: unknown): boolean {
  if (typeof prompt !== 'string') return false;
  return prompt.trim().length <= APP_CONFIG.MAX_CUSTOM_PROMPT_LENGTH;
}

export function isValidIntensity(intensity: unknown): boolean {
  if (typeof intensity !== 'number' || !isFinite(intensity)) return false;
  return (
    intensity >= STYLE_CONFIG.MIN_INTENSITY && intensity <= STYLE_CONFIG.MAX_INTENSITY
  );
}

/** Filters and deduplicates a raw style array into valid ClipArtStyle values. */
export function validateStyles(styles: unknown[]): ClipArtStyle[] {
  return [...new Set(styles.filter(isValidStyle))];
}
