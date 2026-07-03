import React from 'react';
import { ClipboardItem } from '../../shared/types';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HistoryTimelineProps {
  items: ClipboardItem[];
  onSelect: (item: ClipboardItem) => void;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ items, onSelect }) => {
  return (
    <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
      {items.map((item) => (
        <div key={item.id} className="relative group cursor-pointer" onClick={() => onSelect(item)}>
          {/* Timeline Dot */}
          <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-500 transition-colors"></div>
          
          <div className="mb-1 text-xs text-gray-500 flex items-center">
            <Clock size={12} className="mr-1" />
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
             <div className="font-mono text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                {item.content.substring(0, 150)}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};
