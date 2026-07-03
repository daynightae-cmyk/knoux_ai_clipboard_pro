import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Clipboard,
  Brain,
  LayoutDashboard,
  Settings,
  Zap,
  Crown
} from 'lucide-react';
import i18n from '../utils/i18n';

const BottomNav: React.FC = () => {
  const navItems = [
    { 
      to: '/dashboard', 
      label: i18n.t('sidebar.dashboard'), 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      to: '/clipboard', 
      label: i18n.t('sidebar.clipboardHistory'), 
      icon: <Clipboard size={20} /> 
    },
    { 
      to: '/ai', 
      label: i18n.t('sidebar.aiAssistant'), 
      icon: <Brain size={20} /> 
    },
    { 
      to: '/smart-actions', 
      label: i18n.t('sidebar.smartActions'), 
      icon: <Zap size={20} /> 
    },
    {
      to: '/settings',
      label: i18n.t('sidebar.settings'),
      icon: <Settings size={20} />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-knoux-background-surface/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center h-16 z-50 md:hidden px-2 pb-safe">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-full h-full py-1 space-y-1
            ${isActive 
              ? 'text-knoux-primary' 
              : 'text-gray-400 hover:text-white'
            }
          `}
        >
          <span className={`transition-transform duration-200 ${item.to === '/ai' ? 'scale-110' : ''}`}>
            {item.icon}
          </span>
          <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
