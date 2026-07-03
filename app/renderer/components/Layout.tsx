import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;
