import { Platform } from 'react-native';
import { APP_CONFIG } from './constants';
import type { ImageData } from '@appTypes/index';

/** Delays execution by `ms` milliseconds. */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Exponential backoff with ±25% jitter.
 * Capped at 30 seconds.
 */
export function getBackoffDelay(attempt: number, baseMs = 1_000): number {
  const exponential = Math.min(baseMs * Math.pow(2, attempt - 1), 30_000);
  // jitter: 75%–125% of exponential
  return exponential * (0.75 + Math.random() * 0.5);
}

/** Clamps `value` between `min` and `max`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Returns true if the mime type is in the supported formats list. */
export function isSupportedFormat(mimeType: string): boolean {
  return (APP_CONFIG.SUPPORTED_FORMATS as readonly string[]).includes(mimeType);
}

/** Converts bytes to a human-readable string. */
export function formatBytes(bytes: number): string {
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_024 * 1_024) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / (1_024 * 1_024)).toFixed(1)} MB`;
}

/** Returns true when running in Expo dev mode. */
export function isDev(): boolean {
  return __DEV__;
}

/**
 * Logs only in development. Never logs sensitive data or full base64 payloads.
 */
export function devLog(label: string, ...args: unknown[]): void {
  if (__DEV__) {
    // Mask base64 fields in logged objects to avoid massive console output
    const sanitized = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        const obj = arg as Record<string, unknown>;
        const masked: Record<string, unknown> = {};
        for (const key of Object.keys(obj)) {
          if (key.toLowerCase().includes('base64') || key.toLowerCase().includes('image')) {
            masked[key] = '[base64 data omitted]';
          } else {
            masked[key] = obj[key];
          }
        }
        return masked;
      }
      return arg;
    });
    console.warn(`[ClipArtAI] ${label}`, ...sanitized);
  }
}

/** Generates a simple unique ID (timestamp + random suffix). */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Deduplicates array values while preserving order. */
export function deduplicateArray<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/** True when running on Android. */
export const isAndroid = Platform.OS === 'android';

/** Truncates a string and appends ellipsis if it exceeds maxLength. */
export function truncate(str: string, maxLength: number): string {
  return str.length <= maxLength ? str : `${str.slice(0, maxLength)}…`;
}

/** Safely parses JSON without throwing. */
export function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function createImagePreviewUri(imageData: ImageData): string {
  return `data:${imageData.mimeType};base64,${imageData.base64}`;
}

export function getImageAspectRatio(imageData: ImageData): number {
  if (imageData.dimensions.height === 0) return 1;
  return imageData.dimensions.width / imageData.dimensions.height;
}

export function calculateCompressionRatio(
  originalSize: number,
  compressedSize: number,
): number {
  if (originalSize <= 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

export function generateImageFileName(style: string, extension = 'png'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `clipart_${style}_${timestamp}.${extension}`;
}
