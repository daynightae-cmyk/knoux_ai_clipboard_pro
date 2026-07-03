import React, { useState } from 'react';
import { ClipboardItem as ClipboardItemType } from '../../shared/types';
import { 
  Clock, 
  Tag, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Star, 
  ExternalLink,
  AlertCircle,
  Lock,
  Unlock,
  Code,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';

interface ClipboardItemProps {
  item: ClipboardItemType;
  isSelected?: boolean;
  onSelect?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onToggleVisibility?: () => void;
  onAnalyze?: () => void;
}

const ClipboardItem: React.FC<ClipboardItemProps> = ({
  item,
  isSelected = false,
  onSelect,
  onCopy,
  onDelete,
  onToggleFavorite,
  onToggleVisibility,
  onAnalyze
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 60000) {
      return 'الآن';
    } else if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes} دقيقة`;
    } else if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000);
      return `${hours} ساعة`;
    } else if (diffMs < 604800000) {
      const days = Math.floor(diffMs / 86400000);
      return `${days} يوم`;
    } else {
      return date.toLocaleDateString('ar-EG');
    }
  };

  const getContentIcon = () => {
    switch (item.format) {
      case 'text/plain': return <FileText className="w-4 h-4" />;
      case 'text/html': return <Code className="w-4 h-4" />;
      case 'image/png':
      case 'image/jpeg':
      case 'image/gif': return <ImageIcon className="w-4 h-4" />;
      case 'text/uri-list': return <LinkIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getCategoryColor = (category?: string): string => {
    switch (category) {
      case 'text': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'code': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'url': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'image': return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
      case 'sensitive': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  const getCategoryBorder = (category?: string): string => {
    switch (category) {
      case 'text': return 'border-l-4 border-blue-500';
      case 'code': return 'border-l-4 border-purple-500';
      case 'url': return 'border-l-4 border-green-500';
      case 'image': return 'border-l-4 border-orange-500';
      case 'sensitive': return 'border-l-4 border-red-500';
      default: return 'border-l-4 border-gray-500';
    }
  };

  return (
    <div
      className={`
        relative p-4 rounded-xl transition-all duration-300
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}
        ${getCategoryBorder(item.metadata?.category)}
        border border-gray-200 dark:border-gray-700
        hover:shadow-lg hover:scale-[1.02]
        ${isHovered ? 'shadow-md' : 'shadow-sm'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getContentIcon()}
          <div className="flex items-center space-x-2">
            {item.metadata?.sensitive && (
              <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Lock className="w-3 h-3 text-red-600 dark:text-red-400" />
              </div>
            )}
            {item.metadata?.aiEnhanced && (
              <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Star className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Clock className="w-3 h-3 ml-1" />
            {formatTimestamp(item.timestamp)}
          </span>
          
          {isHovered && (
            <div className="flex items-center space-x-1">
              {onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                >
                  <Star className={`w-4 h-4 ${item.metadata?.favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                </button>
              )}
              
              {onCopy && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy();
                  }}
                  className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="mb-3">
        <div className="relative">
          <p className={`
            text-gray-800 dark:text-gray-200 text-sm
            ${isExpanded ? '' : 'line-clamp-3'}
            transition-all duration-300
          `}>
            {isExpanded ? item.content : truncateContent(item.content)}
          </p>
          
          {item.content.length > 150 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isExpanded ? 'إظهار أقل' : 'إظهار المزيد'}
            </button>
          )}
        </div>
      </div>

      {/* Tags Section */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {item.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full flex items-center"
            >
              <Tag className="w-3 h-3 ml-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Category & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {item.metadata?.category && (
            <span className={`
              px-2 py-1 text-xs font-medium rounded-full
              ${getCategoryColor(item.metadata.category)}
            `}>
              {item.metadata.category}
            </span>
          )}
          
          {item.metadata?.size && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.metadata.size > 1024 
                ? `${(item.metadata.size / 1024).toFixed(1)}KB` 
                : `${item.metadata.size}B`}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onToggleVisibility && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility();
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {item.metadata?.hidden ? 
                <EyeOff className="w-4 h-4 text-gray-500" /> : 
                <Eye className="w-4 h-4 text-gray-500" />
              }
            </button>
          )}
          
          {onAnalyze && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAnalyze();
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center"
            >
              <Star className="w-3 h-3 ml-1" />
              تحليل
            </button>
          )}
        </div>
      </div>

      {/* Analysis Preview */}
      {item.metadata?.analysis && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              التحليل:
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {item.metadata.analysis}
          </p>
        </div>
      )}

      {/* Source URL */}
      {item.metadata?.sourceUrl && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <a
            href={item.metadata.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="truncate">{item.metadata.sourceUrl}</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default ClipboardItem;

