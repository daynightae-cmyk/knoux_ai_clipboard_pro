/**
 * Simple in-memory LRU Cache for performance optimization
 * With TTL support for cache expiration management
 */

import { AI } from '../../shared/constants';

/**
 * Cache entry with timestamp for TTL validation
 */
export interface CacheEntry<T> {
  value: T;
  cachedAt: number; // Timestamp in milliseconds
}

export class CacheManager<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly limit: number;
  private readonly ttlMinutes: number;

  constructor(limit: number = 100, ttlMinutes: number = AI.CACHE_DURATION_MINUTES || 30) {
    this.cache = new Map();
    this.limit = limit;
    this.ttlMinutes = ttlMinutes;
  }

  public get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if entry has expired
    if (!this.isCacheValid(key)) {
      this.cache.delete(key);
      return undefined;
    }

    if (entry) {
      // Refresh item (LRU logic)
      this.cache.delete(key);
      this.cache.set(key, entry);
    }
    return entry.value;
  }

  public set(key: string, value: T): void {
    if (this.cache.size >= this.limit) {
      // Remove oldest (first inserted in Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      value,
      cachedAt: Date.now(),
    });
  }

  public has(key: string): boolean {
    if (!this.cache.has(key)) {
      return false;
    }

    // Check if entry has expired
    if (!this.isCacheValid(key)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Check if cache entry is still valid based on TTL
   */
  public isCacheValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    const ageInMinutes = (Date.now() - entry.cachedAt) / (1000 * 60);
    return ageInMinutes < this.ttlMinutes;
  }

  public clear(): void {
    this.cache.clear();
  }
}

// Singleton for Image Thumbnails if needed
export const ImageCache = new CacheManager<string>(50);
