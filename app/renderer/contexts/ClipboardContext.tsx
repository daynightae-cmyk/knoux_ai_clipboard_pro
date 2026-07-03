import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClipboardItem } from '../../shared/types';
import { logger } from '../../shared/logger';

interface ClipboardContextType {
  items: ClipboardItem[];
  selectedItem: ClipboardItem | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectItem: (item: ClipboardItem) => void;
  clearSelection: () => void;
  deleteItem: (id: string) => Promise<void>;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export const useClipboard = () => {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within ClipboardProvider');
  }
  return context;
};

interface ClipboardProviderProps {
  children: ReactNode;
}

export const ClipboardProvider: React.FC<ClipboardProviderProps> = ({ children }) => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ClipboardItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await window.knoux.getClipboardHistory();
      if (response.success && response.data) {
        setItems(response.data);
      } else {
        throw new Error(response.error || 'Failed to load clipboard history');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      logger.error('Failed to refresh clipboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectItem = (item: ClipboardItem) => {
    setSelectedItem(item);
  };

  const clearSelection = () => {
    setSelectedItem(null);
  };

  const deleteItem = async (id: string) => {
    try {
      // Filter out locally first for immediate UI update
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      
      // Note: Actual deletion would be handled by IPC
      logger.info('Item deleted', { id });
    } catch (err) {
      logger.error('Failed to delete item:', err);
    }
  };

  // Initial load
  useEffect(() => {
    refresh();
  }, []);

  return (
    <ClipboardContext.Provider value={{
      items,
      selectedItem,
      isLoading,
      error,
      refresh,
      selectItem,
      clearSelection,
      deleteItem,
    }}>
      {children}
    </ClipboardContext.Provider>
  );
};
