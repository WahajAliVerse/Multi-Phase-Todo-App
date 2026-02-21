"""
Response Cache for AI Task Assistant

Provides caching for repeated queries to improve performance and reduce LLM API calls.
Uses in-memory caching with TTL (Time-To-Live) support.
"""

import asyncio
import hashlib
import time
from typing import Any, Dict, Optional, Callable, TypeVar
from functools import wraps
from dataclasses import dataclass, field

from .logger import agent_logger


@dataclass
class CacheEntry:
    """Represents a cached response."""
    value: Any
    created_at: float
    ttl: float
    hit_count: int = 0
    
    def is_expired(self) -> bool:
        """Check if the cache entry has expired."""
        return time.time() > (self.created_at + self.ttl)
    
    def access(self) -> Any:
        """Access the cached value and increment hit count."""
        self.hit_count += 1
        return self.value


class ResponseCache:
    """
    In-memory response cache with TTL support.
    
    Features:
    - Automatic expiration based on TTL
    - Hit/miss statistics
    - Thread-safe operations
    - Configurable max size
    """
    
    def __init__(
        self,
        max_size: int = 1000,
        default_ttl: float = 300.0,  # 5 minutes
        cleanup_interval: float = 60.0  # 1 minute
    ):
        self._cache: Dict[str, CacheEntry] = {}
        self._max_size = max_size
        self._default_ttl = default_ttl
        self._cleanup_interval = cleanup_interval
        self._hits = 0
        self._misses = 0
        self._lock = asyncio.Lock()
        
        # Start background cleanup task
        self._cleanup_task: Optional[asyncio.Task] = None
    
    async def start(self) -> None:
        """Start the background cleanup task."""
        if self._cleanup_task is None:
            self._cleanup_task = asyncio.create_task(self._cleanup_loop())
            agent_logger.info(f"ResponseCache started with max_size={self._max_size}, default_ttl={self._default_ttl}s")
    
    async def stop(self) -> None:
        """Stop the background cleanup task."""
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass
            self._cleanup_task = None
            agent_logger.info("ResponseCache stopped")
    
    async def _cleanup_loop(self) -> None:
        """Background task to periodically clean up expired entries."""
        while True:
            try:
                await asyncio.sleep(self._cleanup_interval)
                await self._cleanup_expired()
            except asyncio.CancelledError:
                break
            except Exception as e:
                agent_logger.error(f"Cache cleanup error: {e}")
    
    async def _cleanup_expired(self) -> int:
        """Remove expired entries from cache."""
        async with self._lock:
            expired_keys = [
                key for key, entry in self._cache.items()
                if entry.is_expired()
            ]
            for key in expired_keys:
                del self._cache[key]
            
            if expired_keys:
                agent_logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
            
            return len(expired_keys)
    
    def _generate_key(self, func_name: str, args: tuple, kwargs: dict) -> str:
        """Generate a unique cache key from function arguments."""
        key_data = f"{func_name}:{args}:{sorted(kwargs.items())}"
        return hashlib.sha256(key_data.encode()).hexdigest()
    
    async def get(self, key: str) -> Optional[Any]:
        """
        Get a value from the cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found/expired
        """
        async with self._lock:
            entry = self._cache.get(key)
            
            if entry is None:
                self._misses += 1
                return None
            
            if entry.is_expired():
                del self._cache[key]
                self._misses += 1
                return None
            
            self._hits += 1
            return entry.access()
    
    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[float] = None
    ) -> None:
        """
        Set a value in the cache.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds (uses default if not specified)
        """
        async with self._lock:
            # Evict oldest entries if at max capacity
            if len(self._cache) >= self._max_size:
                # Remove oldest entries (by creation time)
                oldest_keys = sorted(
                    self._cache.keys(),
                    key=lambda k: self._cache[k].created_at
                )[:max(1, self._max_size // 10)]
                
                for k in oldest_keys:
                    del self._cache[k]
                
                agent_logger.debug(f"Evicted {len(oldest_keys)} entries to make room")
            
            self._cache[key] = CacheEntry(
                value=value,
                created_at=time.time(),
                ttl=ttl or self._default_ttl
            )
    
    async def delete(self, key: str) -> bool:
        """
        Delete a value from the cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if deleted, False if not found
        """
        async with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False
    
    async def clear(self) -> None:
        """Clear all entries from the cache."""
        async with self._lock:
            self._cache.clear()
            agent_logger.info("Cache cleared")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total = self._hits + self._misses
        hit_rate = (self._hits / total * 100) if total > 0 else 0.0
        
        return {
            "size": len(self._cache),
            "max_size": self._max_size,
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": f"{hit_rate:.2f}%",
            "default_ttl": self._default_ttl,
        }
    
    async def invalidate_pattern(self, pattern: str) -> int:
        """
        Invalidate cache entries matching a pattern.
        
        Args:
            pattern: Prefix pattern to match keys
            
        Returns:
            Number of entries invalidated
        """
        async with self._lock:
            keys_to_delete = [
                key for key in self._cache.keys()
                if key.startswith(pattern)
            ]
            
            for key in keys_to_delete:
                del self._cache[key]
            
            agent_logger.info(f"Invalidated {len(keys_to_delete)} cache entries matching '{pattern}'")
            return len(keys_to_delete)


# ============================================================================
# Global Cache Instance
# ============================================================================

# Singleton cache instance
_response_cache: Optional[ResponseCache] = None


def get_cache() -> ResponseCache:
    """Get the global cache instance."""
    global _response_cache
    if _response_cache is None:
        _response_cache = ResponseCache()
    return _response_cache


async def init_cache(
    max_size: int = 1000,
    default_ttl: float = 300.0,
    cleanup_interval: float = 60.0
) -> ResponseCache:
    """Initialize the global cache."""
    global _response_cache
    _response_cache = ResponseCache(
        max_size=max_size,
        default_ttl=default_ttl,
        cleanup_interval=cleanup_interval
    )
    await _response_cache.start()
    return _response_cache


async def shutdown_cache() -> None:
    """Shutdown the global cache."""
    global _response_cache
    if _response_cache:
        await _response_cache.stop()
        _response_cache = None


# ============================================================================
# Cache Decorator
# ============================================================================

T = TypeVar('T')


def cached(
    ttl: Optional[float] = None,
    key_prefix: str = "",
    cache_instance: Optional[ResponseCache] = None
):
    """
    Decorator to cache async function results.
    
    Args:
        ttl: Time-to-live in seconds
        key_prefix: Prefix for cache keys
        cache_instance: Cache instance to use (uses global if not specified)
    
    Example:
        @cached(ttl=60.0, key_prefix="task_query")
        async def get_tasks(query: str):
            ...
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            cache = cache_instance or get_cache()
            
            # Generate cache key
            key = f"{key_prefix}{func.__name__}:{args}:{sorted(kwargs.items())}"
            key_hash = hashlib.sha256(key.encode()).hexdigest()
            
            # Try to get from cache
            cached_value = await cache.get(key_hash)
            if cached_value is not None:
                agent_logger.debug(f"Cache hit for {func.__name__}")
                return cached_value
            
            # Call function and cache result
            result = await func(*args, **kwargs)
            await cache.set(key_hash, result, ttl=ttl)
            agent_logger.debug(f"Cache miss for {func.__name__}, cached result")
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # For sync functions, just call directly (no caching)
            # Use async wrapper for async functions
            return func(*args, **kwargs)
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


# ============================================================================
# Cache Invalidation Helpers
# ============================================================================

async def invalidate_task_cache(task_id: Optional[str] = None) -> None:
    """Invalidate cache entries related to tasks."""
    cache = get_cache()
    pattern = "task_" if task_id is None else f"task_{task_id}"
    await cache.invalidate_pattern(pattern)


async def invalidate_tag_cache(tag_id: Optional[str] = None) -> None:
    """Invalidate cache entries related to tags."""
    cache = get_cache()
    pattern = "tag_" if tag_id is None else f"tag_{tag_id}"
    await cache.invalidate_pattern(pattern)


async def invalidate_query_cache() -> None:
    """Invalidate all query result caches."""
    cache = get_cache()
    await cache.invalidate_pattern("query_")


async def invalidate_all_caches() -> None:
    """Invalidate all caches."""
    cache = get_cache()
    await cache.clear()
