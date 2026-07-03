/**
 * Clipboard Preview Component
 * Renders clipboard content with syntax highlighting and formatting
 * Location: renderer/components/ClipboardPreview.tsx
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
// import { logger } from '../../shared/logger'; // Uncomment if logger exists

import {
  Copy,
  Maximize2,
  Minimize2,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Star,
  StarOff,
  Trash2,
  Check,
  Globe,
  Hash,
  Clock,
  ExternalLink
} from 'lucide-react';

// --- Types & Interfaces ---
interface ClipboardItem {
  id: string;
  type: 'text' | 'image' | 'link' | 'color' | 'file';
  value: string;
  metadata?: {
    format?: string;
    width?: number;
    height?: number;
    size?: number;
    appSource?: string;
  };
  createdAt: number;
  isPinned?: boolean;
}

interface ClipboardPreviewProps {
  item: ClipboardItem | null;
  onPin?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCopy?: (content: string) => void;
  className?: string;
}

// --- Helper Functions ---

const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: 'numeric',
    month: 'short',
  }).format(new Date(timestamp));
};

// --- Main Component ---
const ClipboardPreview: React.FC<ClipboardPreviewProps> = ({
  item,
  onPin,
  onDelete,
  onCopy,
  className = ""
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHex, setShowHex] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
    setShowHex(false);
    setCopied(false);
  }, [item?.id]);

  const handleCopy = useCallback(() => {
    if (!item) return;
    if (onCopy) {
      onCopy(item.value);
    } else {
      navigator.clipboard.writeText(item.value);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [item, onCopy]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={24} className="text-purple-500" />;
      case 'link': return <LinkIcon size={24} className="text-blue-500" />;
      case 'color': return <Hash size={24} className="text-pink-500" />;
      case 'file': return <FileText size={24} className="text-yellow-500" />;
      default: return <Type size={24} className="text-gray-500" />;
    }
  };

  // --- Renderers ---

  const renderImage = () => (
    <div className="relative group flex flex-col items-center justify-center bg-gray-900/50 rounded-lg p-4 min-h-[200px] border border-gray-700/50">
      <img
        src={item?.value}
        alt="Clipboard content"
        className="max-h-[400px] max-w-full object-contain rounded shadow-lg transition-transform"
      />
      {item?.metadata?.width && (
        <div className="mt-2 text-xs bg-black/40 px-2 py-1 rounded text-gray-300">
          Dimensions: {item.metadata.width}x{item.metadata.height}
        </div>
      )}
    </div>
  );

  const renderLink = () => (
    <div className="flex flex-col gap-4 p-6 bg-blue-500/5 border border-blue-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
            <Globe size={18} className="text-blue-400" />
            <span className="text-xs uppercase font-bold text-blue-300">Web Link</span>
        </div>
        <a 
            href={item?.value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 hover:underline break-all text-lg font-medium flex items-start gap-2"
        >
            {item?.value} <ExternalLink size={14} className="mt-1" />
        </a>
    </div>
  );

  const renderColor = () => (
    <div className="flex flex-col items-center justify-center py-8 bg-gray-800/50 border border-gray-700 rounded-lg">
        <div 
            className="w-40 h-40 rounded-full shadow-xl border-4 border-gray-700 mb-6 transition-transform hover:scale-105" 
            style={{ backgroundColor: item?.value }}
        />
        <div className="bg-gray-900 px-6 py-3 rounded-lg border border-gray-700 flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">HEX Color</span>
            <p className="font-mono text-2xl font-bold tracking-wider">{item?.value}</p>
        </div>
    </div>
  );

  const renderText = () => {
    const content = item?.value || '';
    const isLong = content.length > 800;
    const displayContent = (!isExpanded && isLong) ? content.slice(0, 800) + '...' : content;

    return (
      <div className="relative group">
        <div className={`
            font-mono text-sm leading-relaxed p-4 rounded-lg
            ${theme === 'dark' ? 'bg-[#1e1e1e] text-gray-300' : 'bg-gray-50 text-gray-800'}
            border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
            overflow-x-auto whitespace-pre-wrap transition-all duration-300
        `}>
          {displayContent}
        </div>
        
        {isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-xs flex items-center justify-center gap-2 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded text-blue-400 transition-colors"
          >
            {isExpanded ? (
                <> <Minimize2 size={14} /> Collapse Content </>
            ) : (
                <> <Maximize2 size={14} /> Expand Full Text ({formatBytes(content.length, 0)}) </>
            )}
          </button>
        )}
      </div>
    );
  };

  // --- No Item State ---
  if (!item) {
    return (
      <div className={`h-full flex flex-col items-center justify-center p-8 text-center select-none ${className}`}>
        <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4 animate-pulse">
            <Copy size={40} className="text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-400">Ready to Preview</h3>
        <p className="text-sm text-gray-600 mt-2 max-w-xs">Select a clip from the history list to view its contents, format details, and actions.</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-background transition-colors animate-in fade-in duration-300 ${className}`}>
      
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border/10 bg-surface-header/5 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className={`p-2.5 rounded-xl shadow-inner ${
                item.type === 'image' ? 'bg-purple-500/20 text-purple-400' : 
                item.type === 'link' ? 'bg-blue-500/20 text-blue-400' : 
                item.type === 'color' ? 'bg-pink-500/20 text-pink-400' : 
                'bg-gray-500/20 text-gray-400'
            }`}>
                {getIconForType(item.type)}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm truncate uppercase tracking-wide opacity-90">
                    {item.type} Clip
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 opacity-60">
                    <Clock size={10} />
                    {formatDate(item.createdAt)}
                </span>
            </div>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-800/30 p-1 rounded-lg border border-gray-700/50">
            <button 
                onClick={() => onPin && onPin(item.id)}
                className={`p-2 rounded-md transition-all hover:bg-gray-700 ${
                    item.isPinned ? 'text-yellow-400 scale-110' : 'text-gray-500 hover:text-yellow-400'
                }`}
                title={item.isPinned ? "Unpin item" : "Pin item to top"}
            >
                {item.isPinned ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
            </button>
            
            <div className="w-px h-6 bg-gray-700/50 mx-1"></div>

            <button 
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-white hover:bg-green-600/20 hover:border-green-500/30 border border-transparent rounded-md transition-all duration-200 group"
                title="Copy to clipboard"
            >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="group-hover:text-green-400" />}
            </button>
            
            <button 
                onClick={() => onDelete && onDelete(item.id)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                title="Delete permanently"
            >
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-5xl mx-auto">
            
            {/* The Actual Content */}
            <div className="min-h-[150px] mb-8">
                {item.type === 'image' && renderImage()}
                {item.type === 'link' && renderLink()}
                {item.type === 'color' && renderColor()}
                {(item.type === 'text' || item.type === 'file') && renderText()}
            </div>

            {/* Metadata Footer Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-800/50">
                {item.type === 'text' && (
                   <>
                    <div className="bg-gray-800/30 p-3 rounded border border-gray-800">
                        <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Characters</span>
                        <span className="text-sm font-mono text-gray-300">{item.value.length.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-800/30 p-3 rounded border border-gray-800">
                        <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Words</span>
                        <span className="text-sm font-mono text-gray-300">{item.value.trim().split(/\s+/).filter(Boolean).length}</span>
                    </div>
                   </>
                )}
                {item.metadata?.size ? (
                     <div className="bg-gray-800/30 p-3 rounded border border-gray-800">
                        <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Size</span>
                        <span className="text-sm font-mono text-gray-300">{formatBytes(item.metadata.size)}</span>
                    </div>
                ) : (
                    <div className="bg-gray-800/30 p-3 rounded border border-gray-800">
                        <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Length</span>
                        <span className="text-sm font-mono text-gray-300">{formatBytes(item.value.length)}</span>
                    </div>
                )}
                <div className="bg-gray-800/30 p-3 rounded border border-gray-800">
                     <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">ID Hash</span>
                     <span className="text-[10px] font-mono text-gray-400 truncate block" title={item.id}>
                        {item.id.substring(0, 12)}...
                     </span>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ClipboardPreview;
