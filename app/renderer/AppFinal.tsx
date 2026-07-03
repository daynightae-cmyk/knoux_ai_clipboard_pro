/**
 * Final Integrated App - Knoux Clipboard AI
 * Complete integration of all components and services
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardCopy,
  Settings,
  Shield,
  Crown,
  Brain,
  Database
} from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import Sidebar from './components/SidebarClean';
import DigitalClock from './components/DigitalClock';
import Dashboard from './views/Dashboard';
import ClipboardHistory from './views/ClipboardHistory';
import AIInsights from './views/AIInsights';
import SecurityCenter from './views/SecurityCenter';
import VIP from './views/VIP';
import About from './views/AboutClean';
import SettingsPanel from './components/SettingsPanel';
import ToastContainer from './components/ToastContainer';
import { useLanguage } from './hooks/useLanguage';
import { useTheme } from './hooks/useTheme';
import { useSettings } from './hooks/useSettings';

// Main App Layout Component
function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const { translate, isRTL } = useLanguage();
  const { theme } = useTheme();
  const { settings } = useSettings();

  useEffect(() => {
    // Auto-hide splash after 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Don't show sidebar/layout for settings and about pages
  const isFullPage = location.pathname === '/settings' || location.pathname === '/about';

  if (isFullPage) {
    return (
      <Routes>
        <Route path="/settings" element={<SettingsPanel onClose={() => navigate('/')} />} />
        <Route path="/about" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="container mx-auto max-w-4xl">
              <button
                onClick={() => navigate('/')}
                className="mb-6 px-4 py-2 text-gray-400 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg transition-all"
              >
                {isRTL ? '← العودة' : '← Back'}
              </button>
              <About />
            </div>
          </div>
        } />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Digital Clock */}
        <header className="relative bg-black/40 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
                  <ClipboardCopy className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {translate('app.name') || 'Knoux Clipboard AI'}
                  </h1>
                  <p className="text-xs text-gray-400">{translate('dashboard.officialTime') || 'Official Time'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <DigitalClock />
                <button
                  onClick={() => navigate('/vip')}
                  className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-all"
                  title={translate('sidebar.vip') || 'VIP'}
                >
                  <Crown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/ai')}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all"
                  title={translate('sidebar.aiAssistant') || 'AI Assistant'}
                >
                  <Brain className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/security')}
                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                  title={translate('sidebar.securityCenter') || 'Security Center'}
                >
                  <Shield className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all"
                  title={translate('sidebar.about') || 'About'}
                >
                  <Database className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all"
                  title={translate('sidebar.settings') || 'Settings'}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clipboard" element={<ClipboardHistory />} />
            <Route path="/ai" element={<AIInsights />} />
            <Route path="/analytics" element={<Dashboard />} />
            <Route path="/security" element={<SecurityCenter />} />
            <Route path="/vip" element={<VIP />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Root App Component
function App() {
  return (
    <BrowserRouter>
      <AppLayout />
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
