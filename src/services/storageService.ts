/**
 * storageService.ts
 *
 * Local file-based caching for generated images and metadata.
 * Uses expo-file-system for device storage management.
 */

import * as FileSystem from 'expo-file-system';
import { APP_CONFIG } from '@utils/constants';
import { devLog } from '@utils/helpers';
import type { ClipArtStyle, UploadedImage, GenerationResponse } from '@appTypes/index';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CachedGeneration {
  originalImage: UploadedImage;
  generatedImages: Record<ClipArtStyle, GenerationResponse | null>;
  generatedAt: string;
  expiresAt: string;
}

export interface CacheMetadata {
  imageHash: string;
  cachedAt: string;
  expiresAt: string;
  size: number;
}

export interface StorageConfig {
  cacheDir: string;
  maxCacheSize: number;
  cacheExpiry: number;
}

// ─── Storage Service Class ────────────────────────────────────────────────────

class StorageService {
  private cacheDir: string;
  private maxCacheSize: number;
  private cacheExpiry: number;
  private metadata: Map<string, CacheMetadata> = new Map();
  private isInitialized = false;

  constructor(config: StorageConfig) {
    this.cacheDir = config.cacheDir;
    this.maxCacheSize = config.maxCacheSize;
    this.cacheExpiry = config.cacheExpiry;
  }

  // Initialize storage on app start
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const dirInfo = await FileSystem.getInfoAsync(this.cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }

      await this.loadMetadata();
      await this.cleanExpiredCache();
      this.isInitialized = true;
      devLog('Storage service initialized');
    } catch (error) {
      devLog('Storage initialization error', { error: String(error) });
    }
  }

  // ─── Hashing ──────────────────────────────────────────────────────────────

  private hashImage(imageBase64: string): string {
    // Simple hash for cache keys
    let hash = 0;
    const slice = imageBase64.slice(0, 1000);
    for (let i = 0; i < slice.length; i++) {
      const char = slice.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // ─── Save Generation ──────────────────────────────────────────────────────

  async saveGeneration(
    originalImage: UploadedImage,
    generatedImages: GenerationResponse[],
    ttl: number = this.cacheExpiry,
  ): Promise<string> {
    try {
      const imageHash = this.hashImage(originalImage.base64);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttl);

      const generatedImageRecord: Record<ClipArtStyle, GenerationResponse | null> = {
        cartoon: null,
        flat: null,
        anime: null,
        pixel: null,
        sketch: null,
      };

      for (const result of generatedImages) {
        generatedImageRecord[result.styleType] = result;
      }

      const cacheEntry: CachedGeneration = {
        originalImage,
        generatedImages: generatedImageRecord,
        generatedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      const filePath = `${this.cacheDir}/generation_${imageHash}.json`;
      const content = JSON.stringify(cacheEntry);

      await FileSystem.writeAsStringAsync(filePath, content);

      this.metadata.set(imageHash, {
        imageHash,
        cachedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        size: content.length,
      });

      await this.saveMetadata();
      devLog('Generation cached', { imageHash });

      return imageHash;
    } catch (error) {
      devLog('Failed to save generation', { error: String(error) });
      throw error;
    }
  }

  // ─── Retrieve Cached Generation ───────────────────────────────────────────

  async getCachedGeneration(imageHash: string): Promise<CachedGeneration | null> {
    try {
      const filePath = `${this.cacheDir}/generation_${imageHash}.json`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (!fileInfo.exists) {
        return null;
      }

      const content = await FileSystem.readAsStringAsync(filePath);
      const cacheEntry: CachedGeneration = JSON.parse(content);

      // Check if expired
      const expiresAt = new Date(cacheEntry.expiresAt);
      if (expiresAt < new Date()) {
        await this.deleteGeneration(imageHash);
        return null;
      }

      devLog('Cache hit', { imageHash });
      return cacheEntry;
    } catch (error) {
      devLog('Failed to retrieve cached generation', { error: String(error) });
      return null;
    }
  }

  // ─── Delete Cached Generation ─────────────────────────────────────────────

  async deleteGeneration(imageHash: string): Promise<void> {
    try {
      const filePath = `${this.cacheDir}/generation_${imageHash}.json`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);

      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
      }

      this.metadata.delete(imageHash);
      await this.saveMetadata();
    } catch (error) {
      devLog('Failed to delete generation', { error: String(error) });
    }
  }

  // ─── Clean Expired Cache ──────────────────────────────────────────────────

  async cleanExpiredCache(): Promise<void> {
    try {
      const now = new Date();
      const expiredHashes: string[] = [];

      for (const [hash, metadata] of this.metadata) {
        const expiresAt = new Date(metadata.expiresAt);
        if (expiresAt < now) {
          expiredHashes.push(hash);
        }
      }

      for (const hash of expiredHashes) {
        await this.deleteGeneration(hash);
      }

      if (expiredHashes.length > 0) {
        devLog('Cleaned expired cache', { count: expiredHashes.length });
      }
    } catch (error) {
      devLog('Failed to clean expired cache', { error: String(error) });
    }
  }

  // ─── Metadata Management ──────────────────────────────────────────────────

  private async saveMetadata(): Promise<void> {
    try {
      const metadataPath = `${this.cacheDir}/.metadata.json`;
      const metadataObj = Object.fromEntries(this.metadata);
      await FileSystem.writeAsStringAsync(metadataPath, JSON.stringify(metadataObj));
    } catch (error) {
      devLog('Failed to save metadata', { error: String(error) });
    }
  }

  private async loadMetadata(): Promise<void> {
    try {
      const metadataPath = `${this.cacheDir}/.metadata.json`;
      const fileInfo = await FileSystem.getInfoAsync(metadataPath);

      if (!fileInfo.exists) {
        return;
      }

      const content = await FileSystem.readAsStringAsync(metadataPath);
      const metadataObj = JSON.parse(content);

      this.metadata = new Map(Object.entries(metadataObj) as [string, CacheMetadata][]);
    } catch (error) {
      devLog('Failed to load metadata', { error: String(error) });
    }
  }

  // ─── Cache Size Management ───────────────────────────────────────────────

  async getCacheSize(): Promise<number> {
    try {
      let totalSize = 0;
      for (const metadata of this.metadata.values()) {
        totalSize += metadata.size;
      }
      return totalSize;
    } catch (error) {
      devLog('Failed to get cache size', { error: String(error) });
      return 0;
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      const hashes = Array.from(this.metadata.keys());
      for (const hash of hashes) {
        await this.deleteGeneration(hash);
      }
      devLog('All cache cleared');
    } catch (error) {
      devLog('Failed to clear all cache', { error: String(error) });
    }
  }
}

// ─── Singleton Instance ───────────────────────────────────────────────────────

const STORAGE_CONFIG: StorageConfig = {
  cacheDir: `${FileSystem.documentDirectory}clipart_cache`,
  maxCacheSize: 100 * 1024 * 1024,
  cacheExpiry: APP_CONFIG.CACHE_EXPIRY,
};

export const storageService = new StorageService(STORAGE_CONFIG);
