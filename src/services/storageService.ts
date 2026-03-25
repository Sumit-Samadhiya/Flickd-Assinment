/**
 * storageService.ts
 *
 * Local caching for generated results and user preferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, APP_CONFIG } from '@utils/constants';
import { devLog, safeJsonParse } from '@utils/helpers';
import type { ClipArtStyle, GenerationResponse } from '@appTypes/index';

interface CacheEntry {
  results: Partial<Record<ClipArtStyle, GenerationResponse>>;
  cachedAt: number;
}

// ─── Results Cache ────────────────────────────────────────────────────────────

export async function getCachedResults(
  imageHash: string,
): Promise<Partial<Record<ClipArtStyle, GenerationResponse>> | null> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEYS.CACHED_RESULTS}:${imageHash}`);
    if (!raw) return null;

    const entry = safeJsonParse<CacheEntry>(raw);
    if (!entry) return null;

    const isExpired = Date.now() - entry.cachedAt > APP_CONFIG.CACHE_EXPIRY;
    if (isExpired) {
      await AsyncStorage.removeItem(`${STORAGE_KEYS.CACHED_RESULTS}:${imageHash}`);
      return null;
    }

    devLog('Cache hit', { imageHash });
    return entry.results;
  } catch {
    return null;
  }
}

export async function setCachedResults(
  imageHash: string,
  results: Partial<Record<ClipArtStyle, GenerationResponse>>,
): Promise<void> {
  try {
    const entry: CacheEntry = { results, cachedAt: Date.now() };
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.CACHED_RESULTS}:${imageHash}`,
      JSON.stringify(entry),
    );
    devLog('Results cached', { imageHash });
  } catch {
    // Storage failure is non-fatal — app continues without caching
  }
}

// ─── User Preferences ─────────────────────────────────────────────────────────

export interface UserPreferences {
  defaultIntensity: number;
  defaultStyles: ClipArtStyle[];
  lastUsedStyles: ClipArtStyle[];
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultIntensity: 6,
  defaultStyles: ['cartoon', 'flat', 'anime', 'pixel', 'sketch'],
  lastUsedStyles: ['cartoon', 'flat', 'anime', 'pixel', 'sketch'],
};

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return safeJsonParse<UserPreferences>(raw) ?? DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function saveUserPreferences(prefs: Partial<UserPreferences>): Promise<void> {
  try {
    const current = await getUserPreferences();
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PREFERENCES,
      JSON.stringify({ ...current, ...prefs }),
    );
  } catch {
    // Non-fatal
  }
}

// ─── Cache Management ─────────────────────────────────────────────────────────

export async function clearResultsCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(STORAGE_KEYS.CACHED_RESULTS));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // Non-fatal
  }
}

export const storageService = {
  getCachedResults,
  setCachedResults,
  getUserPreferences,
  saveUserPreferences,
  clearResultsCache,
};
