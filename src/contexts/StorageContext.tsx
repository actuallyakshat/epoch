import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { storageService } from '../services/storage';
import type { StorageSchema } from '../types/storage';

interface StorageContextType {
  data: StorageSchema | null;
  isLoading: boolean;
  error: Error | null;
  save: (data: StorageSchema) => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
  children: React.ReactNode;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({
  children,
}) => {
  const [data, setData] = useState<StorageSchema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const loadedData = await storageService.load();
        setData(loadedData);
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
  const save = async (newData: StorageSchema) => {
    setData(newData);

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
  };

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (data) {
        storageService.save(data).catch(err => {
          console.error('Failed to save on unmount:', err);
        });
      }
    };
  }, [data]);

  return (
    <StorageContext.Provider value={{ data, isLoading, error, save }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = (): StorageContextType => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context;
};
