import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { storageService } from '../services/storage';
import type { StorageSchema } from '../types/storage';

interface StorageContextType {
  data: StorageSchema | null;
  isLoading: boolean;
  error: Error | null;
  save: (data: StorageSchema) => Promise<void>;
  saveNow: () => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
  children: React.ReactNode;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const [data, setData] = useState<StorageSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  // Keep a ref to always have the latest data for sync saves
  const latestDataRef = useRef<StorageSchema | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const loadedData = await storageService.load();
        setData(loadedData);
        latestDataRef.current = loadedData;
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Debounced save
  const save = useCallback(async (newData: StorageSchema) => {
    setData(newData);
    latestDataRef.current = newData;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await storageService.save(newData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to save'));
      }
    }, 500);
  }, []);

  // Immediate save (for exit)
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (latestDataRef.current) {
      try {
        await storageService.save(latestDataRef.current);
      } catch (err) {
        console.error('Failed to save:', err);
      }
    }
  }, []);

  // Save on unmount using the ref (always has latest data)
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (latestDataRef.current) {
        // Use sync write for unmount to ensure data is saved
        storageService.save(latestDataRef.current).catch((err) => {
          console.error('Failed to save on unmount:', err);
        });
      }
    };
  }, []);

  const contextValue = React.useMemo(
    () => ({ data, isLoading, error, save, saveNow }),
    [data, isLoading, error, save, saveNow],
  );

  return <StorageContext.Provider value={contextValue}>{children}</StorageContext.Provider>;
};

export const useStorage = (): StorageContextType => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
};
