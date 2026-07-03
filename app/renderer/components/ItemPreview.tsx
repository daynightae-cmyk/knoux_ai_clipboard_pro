/**
 * Item Preview Component - Knoux Clipboard AI
 * Reusable clipboard item preview with type and metadata
 */

import React from 'react';
import './ItemPreview.css';

export interface ItemPreviewProps {
  item: {
    id: number;
    content: string;
    type: 'text' | 'image' | 'file';
    timestamp: number;
    isFavorite: boolean;
    truncatedContent?: string;
    key?: string;
  };
  isRTL: boolean;
  getStatusColor: (status: string) => string;
}

const ItemPreview: React.FC<ItemPreviewProps> = ({
  item,
  isRTL,
  getStatusColor
}) => {
  const displayContent = item.truncatedContent || item.content;
  const timeString = new Date(item.timestamp).toLocaleTimeString();

  return (
    <article 
      className="glass-card item-preview"
      role="listitem"
      aria-label={`Clipboard item: ${item.type} - ${displayContent.substring(0, 50)}`}
    >
      <div className="item-content">
        <span className="item-type" aria-label={`Type: ${item.type}`}>
          {item.type}
        </span>
        <p className="item-text" title={item.content}>
          {displayContent}
        </p>
      </div>
      
      <div className="item-meta">
        <time 
          className="item-time" 
          dateTime={new Date(item.timestamp).toISOString()}
          aria-label={`Time: ${timeString}`}
        >
          {timeString}
        </time>
        {item.isFavorite && (
          <span 
            className="favorite-indicator" 
            aria-label="Favorite item"
            role="img"
            alt="Star"
          >
            ⭐
          </span>
        )}
      </div>
    </article>
  );
};

export default ItemPreview;
