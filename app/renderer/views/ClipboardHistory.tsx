/**
 * Clipboard History View - Comprehensive History Management
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useClipboard } from '../hooks/useClipboard';
import { useTheme } from '../contexts/ThemeContext';
import { logger } from '../../shared/logger';
import {
  Clipboard,
  Clock,
  Calendar,
  Search,
  Filter,
  Trash2,
  Copy,
  Star,
  Tag,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Type,
  Image as ImageIcon,
  Code,
  Link,
  FileText,
  Hash,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Maximize2,
  Minimize2,
  Pin,
  Unpin,
  Lock,
  Unlock,
  Shield,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';
import type { ClipboardItem, ClipboardFilter } from '../../shared/types';

interface GroupedItems {
  [key: string]: ClipboardItem[];
}

const ClipboardHistory: React.FC = () => {
  const { theme } = useTheme();
  const clipboard = useClipboard({
    autoPoll: true,
    pollInterval: 2000,
    limit: 50
  });
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [groupBy, setGroupBy] = useState<'none' | 'date' | 'type' | 'tags'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showSensitive, setShowSensitive] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkActions, setBulkActions] = useState(false);

  // Apply search when query changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim()) {
        clipboard.search(searchQuery, {
          tags: selectedTags,
          format: selectedTypes
        });
      } else {
        clipboard.refresh();
      }
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedTags, selectedTypes]);

  // Extract tags and types from items
  const { allTags, allTypes } = useMemo(() => {
    const tags = new Set<string>();
    const types = new Set<string>();
    
    clipboard.items.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag));
      types.add(item.format);
    });
    
    return {
      allTags: Array.from(tags),
      allTypes: Array.from(types)
    };
  }, [clipboard.items]);

  // Group items
  const groupedItems = useMemo<GroupedItems>(() => {
    if (groupBy === 'none') {
      return { 'All Items': clipboard.items };
    }
    
    const groups: GroupedItems = {};
    
    clipboard.items.forEach(item => {
      let key = '';
      
      switch (groupBy) {
        case 'date':
          const date = new Date(item.timestamp);
          key = date.toLocaleDateString();
          break;
          
        case 'type':
          key = item.format.toUpperCase();
          break;
          
        case 'tags':
          key = item.tags?.[0] || 'Untagged';
          break;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    
    return groups;
  }, [clipboard.items, groupBy]);

  // Sort items within groups
  const sortedGroups = useMemo(() => {
    const sorted: GroupedItems = {};
    
    Object.entries(groupedItems).forEach(([key, items]) => {
      sorted[key] = [...items].sort((a, b) => {
        let compareA: any, compareB: any;
        
        switch (sortBy) {
          case 'date':
            compareA = new Date(a.timestamp).getTime();
            compareB = new Date(b.timestamp).getTime();
            break;
            
          case 'size':
            compareA = a.content.length;
            compareB = b.content.length;
            break;
            
          case 'type':
            compareA = a.format;
            compareB = b.format;
            break;
        }
        
        if (sortOrder === 'asc') {
          return compareA > compareB ? 1 : -1;
        } else {
          return compareA < compareB ? 1 : -1;
        }
      });
    });
    
    return sorted;
  }, [groupedItems, sortBy, sortOrder]);

  // Handle item selection
  const toggleItemSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setBulkActions(newSet.size > 0);
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = new Set(clipboard.items.map(item => item.id));
    setSelectedItems(allIds);
    setBulkActions(true);
  }, [clipboard.items]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setBulkActions(false);
  }, []);

  // Handle bulk actions
  const deleteSelected = useCallback(async () => {
    if (selectedItems.size === 0) return;
    
    const confirmed = await window.knoux.showDialog({
      type: 'warning',
      title: 'Confirm Deletion',
      message: `Delete ${selectedItems.size} selected item(s)?`,
      buttons: ['Cancel', 'Delete']
    });
    
    if (confirmed.response === 1) {
      for (const id of selectedItems) {
        await clipboard.deleteItem(id);
      }
      clearSelection();
    }
  }, [selectedItems, clipboard.deleteItem]);

  const exportSelected = useCallback(async () => {
    if (selectedItems.size === 0) return;
    
    const itemsToExport = clipboard.items.filter(item => 
      selectedItems.has(item.id)
    );
    
    const data = JSON.stringify(itemsToExport, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clipboard-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    logger.info('Items exported', { count: selectedItems.size });
  }, [selectedItems, clipboard.items]);

  // Render item preview
  const renderItemPreview = (item: ClipboardItem) => {
    const content = item.content;
    const maxLength = 200;
    
    if (item.format === 'image') {
      return (
        <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Image</span>
        </div>
      );
    }
    
    if (content.length > maxLength) {
      return (
        <div className="text-gray-700 dark:text-gray-300">
          {content.substring(0, maxLength)}...
          <span className="text-gray-500 text-sm ml-2">
            ({content.length} characters)
          </span>
        </div>
      );
    }
    
    return (
      <div className="text-gray-700 dark:text-gray-300">
        {content}
      </div>
    );
  };

  // Render item icon based on type
  const getItemIcon = (format: string) => {
    switch (format) {
      case 'text': return <Type className="w-5 h-5 text-blue-500" />;
      case 'html': return <Code className="w-5 h-5 text-purple-500" />;
      case 'image': return <ImageIcon className="w-5 h-5 text-green-500" />;
      case 'rtf': return <FileText className="w-5 h-5 text-orange-500" />;
      case 'url': return <Link className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  // Render item card/list item
  const renderItem = (item: ClipboardItem, isSelected: boolean) => {
    const date = new Date(item.timestamp);
    const timeString = date.toLocaleTimeString();
    const dateString = date.toLocaleDateString();
    
    return (
      <div 
        className={`relative rounded-xl border transition-all duration-300 ${
          isSelected
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
        }`}
      >
        {/* Selection checkbox */}
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleItemSelection(item.id)}
            className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Item content */}
        <div className="p-4 pl-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {getItemIcon(item.format)}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {item.format.toUpperCase()} Content
                </h4>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {timeString}
                  <span className="mx-2">•</span>
                  <Calendar className="w-3 h-3 mr-1" />
                  {dateString}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {item.metadata?.sensitive && (
                <Shield className="w-4 h-4 text-red-500" title="Sensitive content" />
              )}
              {item.metadata?.aiEnhanced && (
                <Brain className="w-4 h-4 text-purple-500" title="AI Enhanced" />
              )}
              <button
                onClick={() => clipboard.copyToClipboard(item.content, item.format)}
                className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => clipboard.selectItem(item)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="View details"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {item.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Preview */}
          {showPreview && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              {renderItemPreview(item)}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Hash className="w-3 h-3 mr-1" />
                {item.content.length} chars
              </span>
              {item.metadata?.language && (
                <span className="flex items-center">
                  <Type className="w-3 h-3 mr-1" />
                  {item.metadata.language}
                </span>
              )}
            </div>
            <button
              onClick={() => clipboard.deleteItem(item.id)}
              className="p-1 text-gray-400 hover:text-red-500"
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clipboard.items.map(item => (
        <div key={item.id}>
          {renderItem(item, selectedItems.has(item.id))}
        </div>
      ))}
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div className="space-y-3">
      {Object.entries(sortedGroups).map(([groupName, items]) => (
        <div key={groupName} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 px-2">
            {groupName}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({items.length} items)
            </span>
          </h3>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id}>
                {renderItem(item, selectedItems.has(item.id))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Clipboard className="w-8 h-8 text-blue-500 mr-3" />
              Clipboard History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {clipboard.totalCount} items • {clipboard.items.length} loaded
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button
              onClick={clipboard.refresh}
              disabled={clipboard.isLoading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${clipboard.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={clipboard.clearAll}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {bulkActions && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg mr-3">
                  <Clipboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Bulk Actions</h3>
                  <p className="text-sm opacity-90">
                    {selectedItems.size} item(s) selected
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={exportSelected}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
                <button
                  onClick={clearSelection}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {clipboard.error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
                <p className="text-red-700 dark:text-red-400 mt-1">{clipboard.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clipboard history..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* View Mode */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Group By */}
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="none">No Grouping</option>
                <option value="date">Group by Date</option>
                <option value="type">Group by Type</option>
                <option value="tags">Group by Tags</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="date">Sort by Date</option>
                <option value="size">Sort by Size</option>
                <option value="type">Sort by Type</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                {sortOrder === 'asc' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Toggles */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-lg ${showPreview ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700'}`}
                title="Toggle preview"
              >
                {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filter by:</span>
            
            {/* Type Filters */}
            {allTypes.map(type => (
              <button
                key={type}
                onClick={() => {
                  setSelectedTypes(prev =>
                    prev.includes(type)
                      ? prev.filter(t => t !== type)
                      : [...prev, type]
                  );
                }}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTypes.includes(type)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
            
            {/* Tag Filters */}
            {allTags.slice(0, 5).map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Tag className="w-3 h-3 inline mr-1" />
                {tag}
              </button>
            ))}
            
            {allTags.length > 5 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                +{allTags.length - 5} more tags
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {clipboard.isLoading && clipboard.items.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                  <Clipboard className="w-8 h-8 text-white animate-pulse" />
                </div>
                <p className="text-gray-600 dark:text-gray-400">Loading clipboard history...</p>
              </div>
            </div>
          ) : clipboard.items.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Clipboard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Clipboard History Empty
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Copy something to your clipboard to see it here
                </p>
                <button
                  onClick={clipboard.refresh}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  Check Clipboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {clipboard.totalCount}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(clipboard.items.map(i => i.format)).size}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Formats</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {clipboard.items.reduce((sum, item) => sum + item.content.length, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Characters</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allTags.length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unique Tags</p>
                </div>
              </div>

              {/* Items */}
              {viewMode === 'grid' ? renderGridView() : renderListView()}

              {/* Load More */}
              {clipboard.hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={clipboard.loadMore}
                    disabled={clipboard.isLoading}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center mx-auto"
                  >
                    {clipboard.isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Load More ({clipboard.totalCount - clipboard.items.length} remaining)
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Selected Item Details */}
        {clipboard.selectedItem && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Item Details
              </h3>
              <button
                onClick={clipboard.clearSelection}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Format
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    {clipboard.selectedItem.format}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Timestamp
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    {new Date(clipboard.selectedItem.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm whitespace-pre-wrap">
                  {clipboard.selectedItem.content}
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => clipboard.copyToClipboard(clipboard.selectedItem!.content)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Again
                </button>
                <button
                  onClick={() => clipboard.deleteItem(clipboard.selectedItem!.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components
const ChevronUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

export default ClipboardHistory;
