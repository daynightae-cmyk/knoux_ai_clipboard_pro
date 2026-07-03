/**
 * Status Card Component - Knoux Clipboard AI
 * Reusable status card with icon, title, and stats
 */

import React from 'react';
import './StatusCard.css';

export interface StatusCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  status: 'active' | 'idle' | 'error';
  stats: Array<{
    label: string;
    value: string;
  }>;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  isLoading?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({
  id,
  icon,
  title,
  status,
  stats,
  getStatusColor,
  getStatusIcon,
  isLoading = false
}) => {
  return (
    <article 
      className={`glass-card status-card ${isLoading ? 'loading' : ''}`}
      role="status"
      aria-labelledby={`status-title-${id}`}
      aria-busy={isLoading}
    >
      <div className="status-header">
        <div className="status-icon" aria-hidden="true">
          {icon}
        </div>
        <div className="status-info">
          <h3 id={`status-title-${id}`}>{title}</h3>
          <div className={`status-indicator ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            <span className="status-text">{status}</span>
          </div>
        </div>
      </div>
      
      <div className="status-stats">
        {stats.map((stat, index) => (
          <div key={`${id}-stat-${index}`} className="stat">
            <span className="stat-value" aria-label={`${stat.label}: ${stat.value}`}>
              {stat.value}
            </span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
};

export default StatusCard;
