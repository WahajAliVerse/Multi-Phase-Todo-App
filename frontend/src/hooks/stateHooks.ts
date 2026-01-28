// Custom hooks for managing component state
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Custom hook for managing state with undo/redo functionality
export const useStateWithHistory = <T>(
  initialValue: T,
  maxLength: number = 10
) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<T[]>([initialValue]);

  const set = useCallback((value: T | ((prev: T) => T)) => {
    const resolvedValue = value instanceof Function ? value(history[index]) : value;
    const newHistory = [...history.slice(0, index + 1), resolvedValue];

    if (newHistory.length > maxLength) {
      newHistory.shift(); // Remove oldest entry
    }

    setHistory(newHistory);
    setIndex(newHistory.length - 1);
  }, [history, index, maxLength]);

  const undo = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1);
    }
  }, [index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      setIndex(index + 1);
    }
  }, [history.length, index]);

  return {
    state: history[index],
    set,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
};

// Custom hook for debouncing values
export const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for throttling function calls
export const useThrottle = <T extends (...args: any[]) => any>(func: T, delay: number) => {
  const lastCall = useRef<number>(0);
  const throttledFunc = useRef<T | null>(null);

  useEffect(() => {
    throttledFunc.current = func;
  }, [func]);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      throttledFunc.current?.(...args);
    }
  }, [delay]);
};

// Custom hook for managing async state with loading/error states
export const useAsyncState = <T>(initialValue: T) => {
  const [state, setState] = useState<T>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setState(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { state, loading, error, execute, setState };
};

// Custom hook for managing local storage state
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};

// Custom hook for managing session storage state
export const useSessionStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};