import type { ClipArtStyle } from '@appTypes/index';

// ─── App Config ───────────────────────────────────────────────────────────────

export const APP_CONFIG = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_IMAGE_DIMENSIONS: {
    width: 2048,
    height: 2048,
  },
  SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/jpg'] as const,
  SUPPORTED_EXTENSIONS: ['jpg', 'jpeg', 'png'] as const,
  GENERATION_TIMEOUT: 120_000, // 2 min
  CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hr
  MAX_CUSTOM_PROMPT_LENGTH: 300,
  COMPRESS_QUALITY: 0.8,
  COMPRESS_MAX_WIDTH: 1024,
  COMPRESS_MAX_HEIGHT: 1024,
} as const;

// ─── API Config ───────────────────────────────────────────────────────────────

export const API_CONFIG = {
  REQUEST_TIMEOUT: 60_000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1_000,
  POLL_INTERVAL_MS: 2_500,
  MAX_POLL_DURATION_MS: 180_000,
  // HTTP status codes that are NOT safe to retry
  NON_RETRYABLE_STATUS_CODES: new Set([400, 401, 403, 404, 422]),
} as const;

// ─── UI Config ────────────────────────────────────────────────────────────────

export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  SKELETON_COUNT: 5,
  PROGRESS_UPDATE_INTERVAL_MS: 250,
  TOAST_DURATION_MS: 3_000,
  MIN_LOADING_DISPLAY_MS: 500,
} as const;

// ─── Style Config ─────────────────────────────────────────────────────────────

export const STYLE_CONFIG = {
  DEFAULT_INTENSITY: 6,
  MIN_INTENSITY: 1,
  MAX_INTENSITY: 10,
  ALL_STYLES: ['cartoon', 'flat', 'anime', 'pixel', 'sketch'] as ClipArtStyle[],
} as const;

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  GENERATION_HISTORY: '@clipartai/generation_history',
  USER_PREFERENCES: '@clipartai/user_preferences',
  CACHED_RESULTS: '@clipartai/cached_results',
} as const;

// ─── Error Codes ─────────────────────────────────────────────────────────────

export const ERROR_CODES = {
  INVALID_IMAGE: 'ERR_INVALID_IMAGE',
  IMAGE_TOO_LARGE: 'ERR_IMAGE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'ERR_UNSUPPORTED_FORMAT',
  NETWORK_ERROR: 'ERR_NETWORK',
  TIMEOUT: 'ERR_TIMEOUT',
  RATE_LIMITED: 'ERR_RATE_LIMITED',
  BACKEND_ERROR: 'ERR_BACKEND',
  GENERATION_FAILED: 'ERR_GENERATION_FAILED',
  CANCELLED: 'ERR_CANCELLED',
  UNKNOWN: 'ERR_UNKNOWN',
} as const;
