/**
 * Action Button Component - Knoux Clipboard AI
 * Reusable action button with icon and loading states
 */

import React from 'react';
import './ActionButton.css';

export interface ActionButtonProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  id,
  icon,
  label,
  onClick,
  disabled = false,
  className = '',
  ariaLabel
}) => {
  return (
    <button
      id={`action-${id}`}
      className={`glass-button action-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || label}
      aria-disabled={disabled}
      type="button"
    >
      <span className="button-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="button-text">{label}</span>
    </button>
  );
};

export default ActionButton;
