import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJsonParse } from '@utils/helpers';

export function useLocalStorage() {
  const getItem = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      return safeJsonParse<T>(raw);
    } catch {
      return null;
    }
  }, []);

  const setItem = useCallback(async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Non-fatal — app continues without storage
    }
  }, []);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Non-fatal
    }
  }, []);

  const clear = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch {
      // Non-fatal
    }
  }, []);

  return { getItem, setItem, removeItem, clear };
}
