/**
 * Dashboard Configuration - Knoux Clipboard AI
 * Centralized configuration for dashboard settings and constants
 */

export const dashboardConfig = {
  // Display settings
  maxRecentItems: 3,
  maxContentLength: 100,
  
  // Polling intervals (in milliseconds)
  clockUpdateInterval: 1000,
  systemStatusInterval: 15000,
  
  // Performance settings
  debounceDelay: 300,
  animationDuration: 300,
  
  // Status colors
  statusColors: {
    active: '#4ade80',
    idle: '#facc15',
    error: '#ef4444',
    loading: '#64748b'
  },
  
  // Status text mappings
  statusText: {
    active: 'Active',
    idle: 'Idle',
    error: 'Error',
    loading: 'Loading'
  },
  
  // Accessibility settings
  minTouchTarget: 44, // pixels
  
  // Theme breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1280
  },
  
  // Animation settings
  animations: {
    fadeIn: 'fadeIn 0.6s ease-out',
    slideUp: 'slideUp 0.3s ease-out',
    pulse: 'pulse 2s infinite'
  }
} as const;

export default dashboardConfig;
