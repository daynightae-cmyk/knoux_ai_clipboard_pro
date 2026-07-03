/**
 * Toast Container Component - Knoux Clipboard AI
 * Displays toast notifications for user feedback
 */

import React from 'react';
import { useToast } from '../hooks/useToast';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import './ToastContainer.css';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getToastClass = (type: string) => {
    return `toast toast-${type}`;
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" role="alert" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getToastClass(toast.type)}
          role="alert"
          aria-label={`${toast.type}: ${toast.message}`}
        >
          <div className="toast-icon">
            {getIcon(toast.type)}
          </div>
          
          <div className="toast-content">
            <p className="toast-message">{toast.message}</p>
          </div>
          
          <button
            className="toast-close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
