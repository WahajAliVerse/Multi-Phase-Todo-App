import { Task } from '../models/task';
import { Tag } from '../models/tag';
import { RecurrencePattern } from '../models/recurrence';
import { Reminder } from '../models/reminder';

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Simple in-memory cache implementation
 */
export class InMemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get an item from the cache
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set an item in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Delete an item from the cache
   * @param key The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns The number of items in the cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get all keys in the cache
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clean up expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Cache manager for application data
 */
export class CacheManager {
  private static instance: CacheManager;
  private cache: InMemoryCache;

  private constructor() {
    this.cache = new InMemoryCache();
    
    // Clean expired entries periodically
    setInterval(() => {
      this.cache.cleanExpired();
    }, 60000); // Every minute
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Cache tasks
   * @param userId The user ID
   * @param tasks The tasks to cache
   */
  cacheTasks(userId: string, tasks: Task[]): void {
    const key = `tasks:${userId}`;
    this.cache.set(key, tasks, 5 * 60 * 1000); // 5 minutes TTL
  }

  /**
   * Get cached tasks
   * @param userId The user ID
   * @returns Cached tasks or null
   */
  getCachedTasks(userId: string): Task[] | null {
    const key = `tasks:${userId}`;
    return this.cache.get<Task[]>(key);
  }

  /**
   * Cache tags
   * @param userId The user ID
   * @param tags The tags to cache
   */
  cacheTags(userId: string, tags: Tag[]): void {
    const key = `tags:${userId}`;
    this.cache.set(key, tags, 10 * 60 * 1000); // 10 minutes TTL
  }

  /**
   * Get cached tags
   * @param userId The user ID
   * @returns Cached tags or null
   */
  getCachedTags(userId: string): Tag[] | null {
    const key = `tags:${userId}`;
    return this.cache.get<Tag[]>(key);
  }

  /**
   * Cache recurrence patterns
   * @param userId The user ID
   * @param patterns The patterns to cache
   */
  cacheRecurrencePatterns(userId: string, patterns: RecurrencePattern[]): void {
    const key = `recurrencePatterns:${userId}`;
    this.cache.set(key, patterns, 10 * 60 * 1000); // 10 minutes TTL
  }

  /**
   * Get cached recurrence patterns
   * @param userId The user ID
   * @returns Cached patterns or null
   */
  getCachedRecurrencePatterns(userId: string): RecurrencePattern[] | null {
    const key = `recurrencePatterns:${userId}`;
    return this.cache.get<RecurrencePattern[]>(key);
  }

  /**
   * Cache reminders
   * @param userId The user ID
   * @param reminders The reminders to cache
   */
  cacheReminders(userId: string, reminders: Reminder[]): void {
    const key = `reminders:${userId}`;
    this.cache.set(key, reminders, 2 * 60 * 1000); // 2 minutes TTL (shorter for freshness)
  }

  /**
   * Get cached reminders
   * @param userId The user ID
   * @returns Cached reminders or null
   */
  getCachedReminders(userId: string): Reminder[] | null {
    const key = `reminders:${userId}`;
    return this.cache.get<Reminder[]>(key);
  }

  /**
   * Invalidate cached tasks for a user
   * @param userId The user ID
   */
  invalidateTasksCache(userId: string): void {
    const key = `tasks:${userId}`;
    this.cache.delete(key);
  }

  /**
   * Invalidate cached tags for a user
   * @param userId The user ID
   */
  invalidateTagsCache(userId: string): void {
    const key = `tags:${userId}`;
    this.cache.delete(key);
  }

  /**
   * Invalidate cached recurrence patterns for a user
   * @param userId The user ID
   */
  invalidateRecurrencePatternsCache(userId: string): void {
    const key = `recurrencePatterns:${userId}`;
    this.cache.delete(key);
  }

  /**
   * Invalidate cached reminders for a user
   * @param userId The user ID
   */
  invalidateRemindersCache(userId: string): void {
    const key = `reminders:${userId}`;
    this.cache.delete(key);
  }

  /**
   * Clear all caches for a user
   * @param userId The user ID
   */
  clearUserCache(userId: string): void {
    this.invalidateTasksCache(userId);
    this.invalidateTagsCache(userId);
    this.invalidateRecurrencePatternsCache(userId);
    this.invalidateRemindersCache(userId);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Memoization utility for expensive computations
 */
export class Memoizer {
  private cache: Map<string, any> = new Map();

  /**
   * Memoize a function
   * @param fn The function to memoize
   * @param resolver Function to create cache key from arguments
   * @returns Memoized function
   */
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    resolver?: (...args: Parameters<T>) => string
  ): T {
    return ((...args: Parameters<T>): any => {
      const key = resolver ? resolver(...args) : JSON.stringify(args);
      
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      
      const result = fn(...args);
      this.cache.set(key, result);
      
      return result;
    }) as T;
  }

  /**
   * Clear the memoization cache
   */
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Virtual scrolling utility for large lists
 */
export class VirtualScroller {
  /**
   * Calculate visible items for virtual scrolling
   * @param items The full list of items
   * @param scrollTop The scroll top position
   * @param containerHeight The container height
   * @param itemHeight The height of each item
   * @returns Object containing visible items and their positions
   */
  static getVisibleItems(
    items: any[],
    scrollTop: number,
    containerHeight: number,
    itemHeight: number
  ): { visibleItems: any[]; startIndex: number; endIndex: number; offset: number } {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length, startIndex + visibleCount + 5); // Add buffer
    const visibleItems = items.slice(startIndex, endIndex);
    const offset = startIndex * itemHeight;

    return {
      visibleItems,
      startIndex,
      endIndex,
      offset,
    };
  }
}