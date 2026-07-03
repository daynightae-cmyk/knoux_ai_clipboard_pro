/**
 * Advanced Search Hook
 * Provides powerful search capabilities with filtering, sorting, and indexing
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '../../shared/logger';
import type { SearchOptions, SearchResult, ClipboardFilter } from '../../shared/types';

interface UseSearchOptions {
  debounceMs?: number;
  maxResults?: number;
  enableFuzzy?: boolean;
  enableRegex?: boolean;
}

interface UseSearchReturn {
  // State
  query: string;
  results: SearchResult[];
  filters: ClipboardFilter;
  isLoading: boolean;
  error: string | null;
  totalResults: number;
  searchTime: number;
  
  // Actions
  setQuery: (query: string) => void;
  search: (query?: string) => Promise<void>;
  clearSearch: () => void;
  addFilter: (key: keyof ClipboardFilter, value: any) => void;
  removeFilter: (key: keyof ClipboardFilter) => void;
  clearFilters: () => void;
  sortResults: (by: 'relevance' | 'date' | 'length', order: 'asc' | 'desc') => void;
  
  // Advanced
  saveSearch: (name: string) => Promise<boolean>;
  loadSavedSearch: (name: string) => Promise<void>;
  getSearchSuggestions: (prefix: string) => Promise<string[]>;
}

export const useSearch = (options: UseSearchOptions = {}): UseSearchReturn => {
  const {
    debounceMs = 300,
    maxResults = 100,
    enableFuzzy = true,
    enableRegex = false
  } = options;

  const logger = logger.child({ module: 'useSearch' });
  
  // State
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<ClipboardFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  
  // Refs
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const searchIndexRef = useRef<Map<string, string[]>>(new Map());
  const savedSearchesRef = useRef<Map<string, { query: string; filters: ClipboardFilter }>>(new Map());

  // Build search index on mount
  useEffect(() => {
    buildSearchIndex();
    
    // Load saved searches from localStorage
    const saved = localStorage.getItem('knoux_saved_searches');
    if (saved) {
      try {
        savedSearchesRef.current = new Map(JSON.parse(saved));
      } catch (error) {
        logger.warn('Failed to load saved searches:', error);
      }
    }
  }, []);

  // Build in-memory search index
  const buildSearchIndex = useCallback(async () => {
    try {
      // Fetch recent items to build index
      const response = await window.knoux.getClipboardHistory({ limit: 500 });
      
      if (response.success && response.data) {
        const index = new Map<string, string[]>();
        
        response.data.forEach(item => {
          // Index by words
          const words = item.content.toLowerCase().split(/\W+/).filter(w => w.length > 2);
          words.forEach(word => {
            if (!index.has(word)) {
              index.set(word, []);
            }
            index.get(word)!.push(item.id);
          });
          
          // Index by tags
          item.tags?.forEach(tag => {
            const key = `tag:${tag.toLowerCase()}`;
            if (!index.has(key)) {
              index.set(key, []);
            }
            index.get(key)!.push(item.id);
          });
          
          // Index by format
          const formatKey = `format:${item.format.toLowerCase()}`;
          if (!index.has(formatKey)) {
            index.set(formatKey, []);
          }
          index.get(formatKey)!.push(item.id);
        });
        
        searchIndexRef.current = index;
        logger.info('Search index built', { entries: index.size });
      }
    } catch (error) {
      logger.warn('Failed to build search index:', error);
    }
  }, []);

  // Debounced search
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    if (newQuery.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        search(newQuery);
      }, debounceMs);
    } else {
      clearSearch();
    }
  }, [debounceMs]);

  // Perform search
  const search = useCallback(async (searchQuery?: string) => {
    const actualQuery = searchQuery || query;
    if (!actualQuery.trim() && Object.keys(filters).length === 0) {
      clearSearch();
      return;
    }
    
    const startTime = Date.now();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await window.knoux.searchClipboard(actualQuery, {
        limit: maxResults,
        filter: filters
      });
      
      const endTime = Date.now();
      setSearchTime(endTime - startTime);
      
      if (!response.success) {
        throw new Error(response.error || 'Search failed');
      }
      
      // Calculate relevance scores
      const scoredResults = (response.data || []).map(item => {
        let score = 0;
        
        // Basic text matching
        const content = item.content.toLowerCase();
        const query = actualQuery.toLowerCase();
        
        if (content.includes(query)) {
          score += 100;
        }
        
        // Position bonus
        const index = content.indexOf(query);
        if (index >= 0 && index < 50) {
          score += 50;
        }
        
        // Length bonus for exact matches
        if (content === query) {
          score += 200;
        }
        
        // Recency bonus
        const age = Date.now() - new Date(item.timestamp).getTime();
        const daysOld = age / (1000 * 60 * 60 * 24);
        if (daysOld < 1) score += 100;
        else if (daysOld < 7) score += 50;
        
        // Tag matches
        if (item.tags?.some(tag => 
          tag.toLowerCase().includes(query) || 
          filters.tags?.includes(tag)
        )) {
          score += 75;
        }
        
        return {
          ...item,
          relevance: score,
          matches: highlightMatches(item.content, actualQuery)
        };
      });
      
      // Sort by relevance
      scoredResults.sort((a, b) => b.relevance - a.relevance);
      
      setResults(scoredResults);
      setTotalResults(response.total || 0);
      
      logger.info('Search completed', {
        query: actualQuery,
        results: scoredResults.length,
        time: endTime - startTime
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search error';
      logger.error('Search failed:', error);
      setError(message);
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [query, filters, maxResults]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQueryState('');
    setResults([]);
    setTotalResults(0);
    setSearchTime(0);
    setError(null);
  }, []);

  // Filter management
  const addFilter = useCallback((key: keyof ClipboardFilter, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (Array.isArray(value)) {
        newFilters[key] = value;
      } else if (key === 'dateRange') {
        newFilters[key] = value;
      } else {
        newFilters[key] = newFilters[key] 
          ? [...(newFilters[key] as any[]), value]
          : [value];
      }
      
      return newFilters;
    });
  }, []);

  const removeFilter = useCallback((key: keyof ClipboardFilter) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Sort results
  const sortResults = useCallback((by: 'relevance' | 'date' | 'length', order: 'asc' | 'desc') => {
    setResults(prev => {
      const sorted = [...prev];
      
      switch (by) {
        case 'date':
          sorted.sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return order === 'asc' ? dateA - dateB : dateB - dateA;
          });
          break;
          
        case 'length':
          sorted.sort((a, b) => {
            const lenA = a.content.length;
            const lenB = b.content.length;
            return order === 'asc' ? lenA - lenB : lenB - lenA;
          });
          break;
          
        case 'relevance':
        default:
          sorted.sort((a, b) => {
            return order === 'asc' 
              ? (a.relevance || 0) - (b.relevance || 0)
              : (b.relevance || 0) - (a.relevance || 0);
          });
      }
      
      return sorted;
    });
  }, []);

  // Save search
  const saveSearch = useCallback(async (name: string): Promise<boolean> => {
    try {
      savedSearchesRef.current.set(name, { query, filters });
      
      // Save to localStorage
      const serialized = JSON.stringify(Array.from(savedSearchesRef.current.entries()));
      localStorage.setItem('knoux_saved_searches', serialized);
      
      logger.info('Search saved', { name, query });
      return true;
    } catch (error) {
      logger.error('Failed to save search:', error);
      return false;
    }
  }, [query, filters]);

  // Load saved search
  const loadSavedSearch = useCallback(async (name: string) => {
    const saved = savedSearchesRef.current.get(name);
    if (!saved) {
      throw new Error(`Saved search "${name}" not found`);
    }
    
    setQueryState(saved.query);
    setFilters(saved.filters);
    
    await search(saved.query);
    
    logger.info('Saved search loaded', { name, query: saved.query });
  }, [search]);

  // Get search suggestions
  const getSearchSuggestions = useCallback(async (prefix: string): Promise<string[]> => {
    if (prefix.length < 2) return [];
    
    const prefixLower = prefix.toLowerCase();
    const suggestions: string[] = [];
    
    // Get suggestions from index
    for (const [key] of searchIndexRef.current) {
      if (key.startsWith(prefixLower)) {
        if (key.startsWith('tag:')) {
          suggestions.push(`tag:${key.substring(4)}`);
        } else if (key.startsWith('format:')) {
          suggestions.push(`format:${key.substring(7)}`);
        } else {
          suggestions.push(key);
        }
      }
      
      if (suggestions.length >= 10) break;
    }
    
    // Add saved searches
    for (const [name, saved] of savedSearchesRef.current) {
      if (name.toLowerCase().includes(prefixLower) || 
          saved.query.toLowerCase().includes(prefixLower)) {
        suggestions.push(`saved:${name}`);
      }
    }
    
    return [...new Set(suggestions)].slice(0, 10);
  }, []);

  // Helper: Highlight matches in text
  const highlightMatches = (text: string, query: string): Array<{ text: string; match: boolean }> => {
    if (!query.trim()) return [{ text, match: false }];
    
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map(part => ({
      text: part,
      match: regex.test(part) && part.toLowerCase() === query.toLowerCase()
    }));
  };

  const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  return {
    // State
    query,
    results,
    filters,
    isLoading,
    error,
    totalResults,
    searchTime,
    
    // Actions
    setQuery,
    search,
    clearSearch,
    addFilter,
    removeFilter,
    clearFilters,
    sortResults,
    
    // Advanced
    saveSearch,
    loadSavedSearch,
    getSearchSuggestions,
  };
};

export default useSearch;
