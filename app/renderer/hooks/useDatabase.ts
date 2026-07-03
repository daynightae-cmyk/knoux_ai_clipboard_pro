/**
 * Database Hook - Knoux Clipboard AI
 * Manages clipboard database operations
 */

import { useState, useEffect, useCallback } from 'react';
import type { ElectronAPI } from '../types/electron';

export interface ClipboardItem {
  id: number;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: number;
  isFavorite: boolean;
  category?: string;
  source?: string;
  metadata?: string;
}

export interface DatabaseStats {
  total: number;
  favorites: number;
  byType: {
    text: number;
    image: number;
    file: number;
  };
}

interface UseDatabaseReturn {
  // Data
  items: ClipboardItem[];
  favorites: ClipboardItem[];
  stats: DatabaseStats;
  isLoading: boolean;
  
  // Actions
  addItem: (item: Omit<ClipboardItem, 'id'>) => Promise<number | null>;
  deleteItem: (id: number) => Promise<boolean>;
  toggleFavorite: (id: number) => Promise<boolean>;
  searchItems: (query: string) => Promise<ClipboardItem[]>;
  clearAll: () => Promise<boolean>;
  
  // Refresh
  refreshItems: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useDatabase = (): UseDatabaseReturn => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [favorites, setFavorites] = useState<ClipboardItem[]>([]);
  const [stats, setStats] = useState<DatabaseStats>({
    total: 0,
    favorites: 0,
    byType: { text: 0, image: 0, file: 0 }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      refreshItems(),
      refreshFavorites(),
      refreshStats()
    ]);
  }, []);

  const refreshItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await window.electron.ipcRenderer.invoke('clipboard:get-recent', 100);
      
      if (response.success) {
        setItems(response.data || []);
      } else {
        console.error('Failed to load items:', response.error);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshFavorites = useCallback(async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('clipboard:get-favorites');
      
      if (response.success) {
        setFavorites(response.data || []);
      } else {
        console.error('Failed to load favorites:', response.error);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const response = await window.electron.ipcRenderer.invoke('clipboard:get-stats');
      
      if (response.success) {
        setStats(response.data);
      } else {
        console.error('Failed to load stats:', response.error);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const addItem = useCallback(async (item: Omit<ClipboardItem, 'id'>): Promise<number | null> => {
    try {
      const response = await window.electron.ipcRenderer.invoke('clipboard:add', item);
      
      if (response.success) {
        // Refresh data to show new item
        await refreshItems();
        await refreshStats();
        return response.data;
      } else {
        console.error('Failed to add item:', response.error);
        return null;
      }
    } catch (err) {
      console.error('Failed to add item:', err);
      return null;
    }
  }, [refreshItems, refreshStats]);

  const deleteItem = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await window.electron.ipcRenderer.invoke('clipboard:delete', id);
      
      if (response.success) {
        // Remove from local state immediately
        setItems(prev => prev.filter(item => item.id !== id));
        setFavorites(prev => prev.filter(item => item.id !== id));
        
        // Refresh stats
        await refreshStats();
        return true;
      } else {
        console.error('Failed to delete item:', response.error);
        return false;
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      return false;
    }
  }, [refreshStats]);

  const toggleFavorite = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await window.electron.ipcRenderer.invoke('clipboard:toggle-favorite', id);
      
      if (response.success) {
        // Update local state immediately
        const isFavorite = response.data;
        
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, isFavorite } : item
        ));
        
        // Refresh favorites list
        await refreshFavorites();
        return true;
      } else {
        console.error('Failed to toggle favorite:', response.error);
        return false;
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      return false;
    }
  }, [refreshFavorites]);

  const searchItems = useCallback(async (query: string): Promise<ClipboardItem[]> => {
    try {
      if (!query.trim()) {
        return items; // Return all items if query is empty
      }

      const response = await window.electron.ipcRenderer.invoke('clipboard:search', query, 50);
      
      if (response.success) {
        return response.data || [];
      } else {
        console.error('Failed to search items:', response.error);
        return [];
      }
    } catch (err) {
      console.error('Failed to search items:', err);
      return [];
    }
  }, [items]);

  const clearAll = useCallback(async (): Promise<boolean> => {
    try {
      const response = await window.electron.ipcRenderer.invoke('clipboard:clear-all');
      
      if (response.success) {
        // Clear local state immediately
        setItems([]);
        setFavorites([]);
        setStats({
          total: 0,
          favorites: 0,
          byType: { text: 0, image: 0, file: 0 }
        });
        return true;
      } else {
        console.error('Failed to clear all items:', response.error);
        return false;
      }
    } catch (err) {
      console.error('Failed to clear all items:', err);
      return false;
    }
  }, []);

  return {
    // Data
    items,
    favorites,
    stats,
    isLoading,
    
    // Actions
    addItem,
    deleteItem,
    toggleFavorite,
    searchItems,
    clearAll,
    
    // Refresh
    refreshItems,
    refreshStats,
  };
};

export default useDatabase;
