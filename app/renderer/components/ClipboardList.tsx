import React, { useState, useMemo } from 'react';
import { ClipboardItem as ClipboardItemType } from '../../shared/types';
import ClipboardItem from './ClipboardItem';
import { 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  Calendar,
  Clock,
  Hash,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ClipboardListProps {
  items: ClipboardItemType[];
  loading?: boolean;
  error?: string;
  onItemSelect?: (item: ClipboardItemType) => void;
  onItemCopy?: (item: ClipboardItemType) => void;
  onItemDelete?: (item: ClipboardItemType) => void;
  onItemFavorite?: (item: ClipboardItemType) => void;
  onClearAll?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

type SortField = 'timestamp' | 'size' | 'format' | 'category';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

const ClipboardList: React.FC<ClipboardListProps> = ({
  items,
  loading = false,
  error,
  onItemSelect,
  onItemCopy,
  onItemDelete,
  onItemFavorite,
  onClearAll,
  onRefresh,
  onExport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Extract unique categories and formats
  const categories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(item => {
      if (item.metadata?.category) {
        cats.add(item.metadata.category);
      }
    });
    return ['all', ...Array.from(cats)];
  }, [items]);

  const formats = useMemo(() => {
    const fmt = new Set<string>();
    items.forEach(item => {
      fmt.add(item.format);
    });
    return ['all', ...Array.from(fmt)];
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (searchQuery && !item.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Category filter
      if (selectedCategory !== 'all' && item.metadata?.category !== selectedCategory) {
        return false;
      }
      
      // Format filter
      if (selectedFormat !== 'all' && item.format !== selectedFormat) {
        return false;
      }
      
      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedFormat]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'size':
          aValue = a.metadata?.size || 0;
          bValue = b.metadata?.size || 0;
          break;
        case 'format':
          aValue = a.format;
          bValue = b.format;
          break;
        case 'category':
          aValue = a.metadata?.category || '';
          bValue = b.metadata?.category || '';
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredItems, sortField, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: items.length,
      filtered: filteredItems.length,
      text: items.filter(item => item.format.includes('text')).length,
      images: items.filter(item => item.format.includes('image')).length,
      urls: items.filter(item => item.format.includes('uri')).length,
      sensitive: items.filter(item => item.metadata?.sensitive).length,
      aiEnhanced: items.filter(item => item.metadata?.aiEnhanced).length
    };
  }, [items, filteredItems]);

  const handleItemSelect = (item: ClipboardItemType) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(item.id)) {
        newSet.delete(item.id);
      } else {
        newSet.add(item.id);
      }
      return newSet;
    });
    onItemSelect?.(item);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedFormat('all');
  };

  const exportSelected = () => {
    const selected = items.filter(item => selectedItems.has(item.id));
    console.log('Exporting items:', selected);
    onExport?.();
  };

  const deleteSelected = () => {
    if (window.confirm(`هل تريد حذف ${selectedItems.size} عنصر؟`)) {
      selectedItems.forEach(id => {
        const item = items.find(i => i.id === id);
        if (item) onItemDelete?.(item);
      });
      setSelectedItems(new Set());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          سجل الحافظة
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إدارة وتنظيم محتويات الحافظة الخاصة بك
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">إجمالي</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.text}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">نصوص</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.images}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">صور</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.urls}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">روابط</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.sensitive}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">حساس</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.aiEnhanced}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">ذكاء اصطناعي</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في المحتوى أو الوسوم..."
                className="w-full pr-10 pl-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filters */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'جميع الفئات' : cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-gray-900 dark:text-white text-sm"
              >
                {formats.map(fmt => (
                  <option key={fmt} value={fmt}>
                    {fmt === 'all' ? 'جميع الصيغ' : fmt}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Buttons */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => toggleSort('timestamp')}
                className={`p-2 rounded ${sortField === 'timestamp' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}
                title="ترتيب حسب الوقت"
              >
                {sortField === 'timestamp' && sortOrder === 'asc' ? 
                  <ChevronUp className="w-4 h-4" /> : 
                  <ChevronDown className="w-4 h-4" />
                }
              </button>
              <button
                onClick={() => toggleSort('category')}
                className={`p-2 rounded ${sortField === 'category' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}
                title="ترتيب حسب الفئة"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>

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

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              {selectedItems.size > 0 && (
                <>
                  <button
                    onClick={exportSelected}
                    className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
                  >
                    <Download className="w-4 h-4 ml-1" />
                    تصدير ({selectedItems.size})
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center text-sm"
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </button>
                </>
              )}
              
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                مسح الفلاتر
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300">خطأ</h3>
              <p className="text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && sortedItems.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل المحتوى...</p>
          </div>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              لا توجد عناصر
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || selectedCategory !== 'all' || selectedFormat !== 'all' 
                ? 'لم يتم العثور على نتائج مطابقة للبحث'
                : 'انسخ شيئًا إلى الحافظة لرؤيته هنا'}
            </p>
            {(searchQuery || selectedCategory !== 'all' || selectedFormat !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Results Info */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              عرض {sortedItems.length} من {stats.total} عنصر
              {searchQuery && (
                <span className="mr-2"> لـ "{searchQuery}"</span>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedItems.size} عنصر محدد
            </div>
          </div>

          {/* Items Grid/List */}
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
              : 'space-y-4'
            }
          `}>
            {sortedItems.map(item => (
              <ClipboardItem
                key={item.id}
                item={item}
                isSelected={selectedItems.has(item.id)}
                onSelect={() => handleItemSelect(item)}
                onCopy={() => onItemCopy?.(item)}
                onDelete={() => onItemDelete?.(item)}
                onToggleFavorite={() => onItemFavorite?.(item)}
                onAnalyze={() => console.log('Analyze:', item)}
              />
            ))}
          </div>

          {/* Load More (if needed) */}
          {filteredItems.length < stats.total && (
            <div className="mt-8 text-center">
              <button
                onClick={onRefresh}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                تحميل المزيد...
              </button>
            </div>
          )}
        </>
      )}

      {/* Bulk Actions Footer */}
      {selectedItems.size > 0 && (
        <div className="fixed bottom-6 left-6 right-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg ml-3">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">إجراءات جماعية</h3>
                <p className="text-sm opacity-90">
                  {selectedItems.size} عنصر محدد
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportSelected}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center"
              >
                <Download className="w-4 h-4 ml-1" />
                تصدير
              </button>
              <button
                onClick={deleteSelected}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center"
              >
                <Trash2 className="w-4 h-4 ml-1" />
                حذف
              </button>
              <button
                onClick={() => setSelectedItems(new Set())}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClipboardList;
