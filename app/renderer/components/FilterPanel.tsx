/**
 * Filter Panel Component
 * Advanced filtering and sorting for clipboard items
 */

import React, { useState, useCallback } from 'react';
import {
  Filter,
  X,
  Calendar,
  Tag,
  Type,
  Hash,
  Clock,
  ArrowUpDown,
  Star,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Download,
  Upload,
  RefreshCw,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
  BarChart3,
  Grid,
  List,
  Settings,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import type { ClipboardFilter } from '../../shared/types';

interface FilterPanelProps {
  onFilterChange: (filter: ClipboardFilter) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  availableTags: string[];
  availableTypes: string[];
  currentFilter: ClipboardFilter;
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilterChange,
  onSortChange,
  availableTags,
  availableTypes,
  currentFilter,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(currentFilter.tags || []);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(currentFilter.format || []);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: currentFilter.startDate ? new Date(currentFilter.startDate) : null,
    end: currentFilter.endDate ? new Date(currentFilter.endDate) : null
  });
  const [minLength, setMinLength] = useState<number | ''>(currentFilter.minLength || '');
  const [maxLength, setMaxLength] = useState<number | ''>(currentFilter.maxLength || '');
  const [showSensitive, setShowSensitive] = useState(currentFilter.includeSensitive || false);
  const [sortBy, setSortBy] = useState(currentFilter.sortBy || 'timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(currentFilter.sortOrder || 'desc');

  const applyFilters = useCallback(() => {
    const filter: ClipboardFilter = {
      search: searchQuery || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      format: selectedTypes.length > 0 ? selectedTypes : undefined,
      startDate: dateRange.start?.toISOString(),
      endDate: dateRange.end?.toISOString(),
      minLength: minLength || undefined,
      maxLength: maxLength || undefined,
      includeSensitive: showSensitive,
      sortBy,
      sortOrder
    };
    
    onFilterChange(filter);
  }, [
    searchQuery,
    selectedTags,
    selectedTypes,
    dateRange,
    minLength,
    maxLength,
    showSensitive,
    sortBy,
    sortOrder,
    onFilterChange
  ]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedTypes([]);
    setDateRange({ start: null, end: null });
    setMinLength('');
    setMaxLength('');
    setShowSensitive(false);
    setSortBy('timestamp');
    setSortOrder('desc');
    
    onFilterChange({});
    onSortChange('timestamp', 'desc');
  }, [onFilterChange, onSortChange]);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  const handleSortChange = useCallback((newSortBy: string) => {
    const newOrder = sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(newSortBy);
    setSortOrder(newOrder);
    onSortChange(newSortBy, newOrder);
  }, [sortBy, sortOrder, onSortChange]);

  const presetFilters = [
    {
      name: 'Today',
      action: () => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        setDateRange({ start: startOfDay, end: today });
      }
    },
    {
      name: 'Last 7 Days',
      action: () => {
        const end = new Date();
        const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        setDateRange({ start, end });
      }
    },
    {
      name: 'Sensitive Only',
      action: () => {
        setShowSensitive(true);
        setSelectedTags([]);
        setSelectedTypes([]);
      }
    },
    {
      name: 'Code Snippets',
      action: () => {
        setSelectedTypes(['text', 'html']);
        setSearchQuery('code');
      }
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters & Sorting</h3>
            {(selectedTags.length > 0 || selectedTypes.length > 0 || searchQuery || dateRange.start || dateRange.end) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={clearFilters}
              className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clipboard content..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {presetFilters.map((preset, index) => (
              <button
                key={index}
                onClick={preset.action}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Tags */}
            {availableTags.length > 0 && (
              <div>
                <div className="flex items-center mb-2">
                  <Tag className="w-4 h-4 text-purple-500 mr-2" />
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Tags</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content Types */}
            <div>
              <div className="flex items-center mb-2">
                <Type className="w-4 h-4 text-blue-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Content Types</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedTypes.includes(type)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-green-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Date Range</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={dateRange.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : null }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : null }))}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Content Length */}
            <div>
              <div className="flex items-center mb-2">
                <Hash className="w-4 h-4 text-orange-500 mr-2" />
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Content Length</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min characters"
                  value={minLength}
                  onChange={(e) => setMinLength(e.target.value ? parseInt(e.target.value) : '')}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Max characters"
                  value={maxLength}
                  onChange={(e) => setMaxLength(e.target.value ? parseInt(e.target.value) : '')}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Sensitive Content */}
            <div>
              <div className="flex items-center mb-2">
                {showSensitive ? (
                  <Eye className="w-4 h-4 text-red-500 mr-2" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500 mr-2" />
                )}
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Sensitive Content</h4>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSensitive}
                  onChange={(e) => setShowSensitive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  {showSensitive ? 'Showing sensitive content' : 'Hiding sensitive content'}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Sorting */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500 mr-2" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Sort By</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'timestamp', label: 'Date', icon: <Clock className="w-3 h-3" /> },
              { id: 'content', label: 'Content', icon: <Type className="w-3 h-3" /> },
              { id: 'length', label: 'Length', icon: <Hash className="w-3 h-3" /> },
              { id: 'format', label: 'Type', icon: <Layers className="w-3 h-3" /> },
              { id: 'usage', label: 'Usage', icon: <BarChart3 className="w-3 h-3" /> }
            ].map(sortOption => (
              <button
                key={sortOption.id}
                onClick={() => handleSortChange(sortOption.id)}
                className={`px-3 py-1.5 text-sm rounded-lg flex items-center transition-colors ${
                  sortBy === sortOption.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="mr-1.5">{sortOption.icon}</span>
                {sortOption.label}
                {sortBy === sortOption.id && (
                  <span className="ml-1.5">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
        <div className="flex justify-between">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
