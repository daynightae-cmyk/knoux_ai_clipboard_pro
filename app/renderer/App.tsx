import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ClipboardCopy, Settings, Shield, Sparkles } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import { MainDashboard } from './components/MainDashboard';
import AboutKnoux from './components/AboutKnoux';
import SettingsPanel from './components/SettingsPanel';
import i18n from './utils/i18n';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { initializeApp } from './services/initialization';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.getCurrentLanguage());
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('🚀 Starting app initialization...');
        
        const success = await initializeApp();
        if (success) {
          setAppReady(true);
          console.log('✅ App services initialized');
        }

        try {
          if (window.electronAPI?.getSettings) {
            const settingsResult = await window.electronAPI.getSettings();
            if (settingsResult?.success) {
              const loadedSettings = settingsResult.data;
              setSettings(loadedSettings);
              
              if (loadedSettings.language && loadedSettings.language !== i18n.getCurrentLanguage()) {
                i18n.setLanguage(loadedSettings.language);
                setCurrentLanguage(loadedSettings.language);
                console.log('✅ Language applied:', loadedSettings.language);
              }
              
              if (loadedSettings.theme) {
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(loadedSettings.theme);
                console.log('✅ Theme applied:', loadedSettings.theme);
              }
              
              console.log('✅ Settings loaded and applied');
            }
          }
        } catch (error) {
          console.warn('Could not load settings from IPC:', error);
        }

        setTimeout(() => {
          setShowSplash(false);
          console.log('✅ App initialization complete');
        }, 2500);
      } catch (error) {
        console.error('❌ App initialization error:', error);
        setTimeout(() => setShowSplash(false), 1000);
      }
    };

    init();

    const unsubscribe = i18n.onLanguageChange((language) => {
      setCurrentLanguage(language);
      console.log('🌐 Language changed to:', language);
    });

    return unsubscribe;
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const isFullPage = location.pathname === '/settings' || location.pathname === '/about';
  const isRTL = i18n.isRTL();

  if (isFullPage) {
    return (
      <Routes>
        <Route 
          path="/settings" 
          element={
            <SettingsPanel 
              onClose={() => navigate('/')} 
              initialSettings={settings}
            />
          } 
        />
        <Route
          path="/about"
          element={
            <div className="min-h-screen bg-knoux-background p-8">
              <div className="container mx-auto max-w-4xl">
                <button
                  onClick={() => navigate('/')}
                  className={`mb-6 px-4 py-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all ${
                    isRTL ? 'mr-auto' : 'ml-0'
                  }`}
                >
                  {isRTL ? '← العودة' : '← Back'}
                </button>
                <AboutKnoux />
              </div>
            </div>
          }
        />
      </Routes>
    );
  }

  return (
    <div className={`min-h-screen bg-knoux-background text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <Routes>
        <Route path="/*" element={<MainDashboard />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider initialSettings={null}>
          <AppLayout />
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;