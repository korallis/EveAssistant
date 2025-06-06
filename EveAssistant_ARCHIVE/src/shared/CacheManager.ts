import Store from 'electron-store';
import { produce } from 'immer';

interface CacheEntry<T> {
  value: T;
  expiry: number | null;
}

export class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>>;
  private diskCache: Store;
  private isOnline: boolean;
  private maxSize: number;
  private hits: number;
  private misses: number;

  constructor(maxSize = 100) {
    this.memoryCache = new Map();
    this.diskCache = new Store();
    this.isOnline = true;
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }

  public get<T>(key: string): T | undefined {
    let entry = this.memoryCache.get(key);
    if (entry && this.isEntryValid(entry)) {
      this.hits++;
      this.memoryCache.delete(key);
      this.memoryCache.set(key, entry);
      return entry.value;
    }

    if (this.isOnline) {
      const diskEntry = this.diskCache.get(key) as CacheEntry<T> | undefined;
      if (diskEntry && this.isEntryValid(diskEntry)) {
        this.hits++;
        this.memoryCache.set(key, diskEntry);
        this.ensureSize();
        return diskEntry.value;
      }
    }

    this.misses++;
    return undefined;
  }

  public set<T>(key: string, value: T, ttl?: number): void {
    const expiry = ttl ? Date.now() + ttl * 1000 : null;
    const entry: CacheEntry<T> = { value, expiry };

    this.memoryCache.set(key, entry);
    this.ensureSize();

    if (this.isOnline) {
      this.diskCache.set(key, entry);
    }
  }

  public patch<T>(key: string, patcher: (value: T) => void): void {
    const entry = this.get<T>(key);
    if (entry) {
      const newValue = produce(entry, patcher);
      this.set(key, newValue);
    }
  }

  public warm(data: Record<string, any>): void {
    for (const key in data) {
      this.set(key, data[key]);
    }
  }

  public invalidate(key: string): void {
    this.memoryCache.delete(key);
    if (this.isOnline) {
      this.diskCache.delete(key);
    }
  }

  private ensureSize(): void {
    if (this.memoryCache.size > this.maxSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
  }

  private isEntryValid<T>(entry: CacheEntry<T>): boolean {
    if (entry.expiry === null) {
      return true;
    }
    return Date.now() < entry.expiry;
  }

  public getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.memoryCache.size,
    };
  }
} 