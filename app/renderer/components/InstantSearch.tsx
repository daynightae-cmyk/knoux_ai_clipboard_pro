import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Clock, Star, FileText, Image, Code, File, X } from 'lucide-react';

interface InstantSearchProps {
  userId: string;
}

export const InstantSearch: React.FC<InstantSearchProps> = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  useEffect(() => {
    loadSearchData();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch();
    } else {
      setResults([]);
      setSuggestions([]);
    }
  }, [searchQuery, activeFilters]);

  const loadSearchData = async () => {
    const history = await window.electron.invoke('search:getHistory', { userId, limit: 10 });
    setSearchHistory(history.searches || []);
    
    const saved = await window.electron.invoke('search:getSaved', { userId });
    setSavedSearches(saved || []);
  };

  const performSearch = useCallback(async () => {
    setIsSearching(true);
    
    const response = await window.electron.invoke('search:instant', {
      text: searchQuery,
      filters: activeFilters,
      options: { limit: 20 }
    });
    
    setResults(response.results || []);
    setSuggestions(response.suggestions || []);
    setSearchTime(response.timeTaken || 0);
    setIsSearching(false);
  }, [searchQuery, activeFilters]);

  const handleFilterToggle = (filterType: string, value: any) => {
    setActiveFilters((prev: any) => ({
      ...prev,
      [filterType]: prev[filterType] === value ? undefined : value
    }));
  };

  const handleSaveSearch = async () => {
    await window.electron.invoke('search:save', {
      query: { text: searchQuery, filters: activeFilters },
      results,
      options: { name: `Search: ${searchQuery}` }
    });
    loadSearchData();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      case 'file': return <File className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="instant-search-container p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">🔍 البحث الفوري</h2>
            <p className="text-sm text-gray-600">بحث لحظي في جميع محتويات الحافظة</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الحافظة..."
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
        
        {isSearching && (
          <div className="mt-2 text-sm text-blue-600">🔍 جاري البحث...</div>
        )}
        
        {searchTime > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            ⚡ {results.length} نتيجة في {searchTime}ms
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">الفلاتر</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['text', 'image', 'code', 'file'].map(type => (
            <button
              key={type}
              onClick={() => handleFilterToggle('contentType', type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilters.contentType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type === 'text' ? '📝 نص' : type === 'image' ? '🖼️ صورة' : type === 'code' ? '💻 كود' : '📁 ملف'}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-xl shadow">
          <h3 className="font-semibold text-gray-800 mb-3">💡 اقتراحات</h3>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(suggestion)}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">📋 النتائج ({results.length})</h3>
            <button
              onClick={handleSaveSearch}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <Star className="w-4 h-4" />
              حفظ البحث
            </button>
          </div>
          
          <div className="space-y-3">
            {results.map((result, idx) => (
              <div
                key={idx}
                className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    result.type === 'text' ? 'bg-blue-100 text-blue-600' :
                    result.type === 'image' ? 'bg-green-100 text-green-600' :
                    result.type === 'code' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {getTypeIcon(result.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">{result.type}</span>
                      <span className="text-xs text-gray-500">
                        {Math.round(result.relevance * 100)}% صلة
                      </span>
                    </div>
                    
                    <p className="text-gray-800 mb-2">{result.preview}</p>
                    
                    {result.matches && result.matches.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.matches.map((match: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            {match}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchQuery.length > 2 && !isSearching ? (
        <div className="p-8 bg-white rounded-xl shadow text-center">
          <p className="text-gray-600">لا توجد نتائج لـ "{searchQuery}"</p>
        </div>
      ) : null}

      {/* Search History */}
      {searchHistory.length > 0 && !searchQuery && (
        <div className="mb-6 p-4 bg-white rounded-xl shadow">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">📜 سجل البحث</h3>
          </div>
          
          <div className="space-y-2">
            {searchHistory.slice(0, 5).map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(item.query)}
                className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{item.query}</span>
                  <span className="text-xs text-gray-500">{item.results} نتائج</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && !searchQuery && (
        <div className="p-4 bg-white rounded-xl shadow">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-800">⭐ عمليات بحث محفوظة</h3>
          </div>
          
          <div className="space-y-2">
            {savedSearches.slice(0, 5).map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(item.query.text)}
                className="w-full text-left px-3 py-2 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstantSearch;
