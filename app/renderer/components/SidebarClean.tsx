/**
 * Sidebar Component - Knoux Clipboard AI (Clean Version)
 * Complete navigation with all pages properly linked
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Clipboard,
  Brain,
  LayoutDashboard,
  Settings,
  Shield,
  History,
  BarChart3,
  Crown,
  Info
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { translate, isRTL } = useLanguage();
  const { theme } = useTheme();

  const navItems = [
    { 
      to: '/dashboard', 
      label: translate('sidebar.dashboard') || 'Dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      to: '/clipboard', 
      label: translate('sidebar.clipboardHistory') || 'Clipboard History', 
      icon: <Clipboard size={20} /> 
    },
    { 
      to: '/ai', 
      label: translate('sidebar.aiAssistant') || 'AI Assistant', 
      icon: <Brain size={20} /> 
    },
    { 
      to: '/analytics', 
      label: translate('sidebar.analytics') || 'Analytics', 
      icon: <BarChart3 size={20} /> 
    },
    { 
      to: '/security', 
      label: translate('sidebar.securityCenter') || 'Security Center', 
      icon: <Shield size={20} /> 
    },
    { 
      to: '/vip', 
      label: translate('sidebar.vip') || 'VIP', 
      icon: <Crown size={20} /> 
    },
  ];

  return (
    <aside className={`sidebar ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <Clipboard className="w-5 h-5" />
          </div>
          <h1 className="logo-text">Knoux</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              nav-item ${isActive ? 'active' : ''}
            `}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="sidebar-footer">
        <button
          onClick={() => navigate('/about')}
          className="footer-button"
        >
          <Info className="w-4 h-4" />
          <span>{translate('sidebar.about') || 'About'}</span>
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="footer-button"
        >
          <Settings className="w-4 h-4" />
          <span>{translate('sidebar.settings') || 'Settings'}</span>
        </button>
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span className="status-text">
            {translate('system.ready') || 'System Ready'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
