/**
 * About Page - Knoux Clipboard AI (Clean Version)
 * Glassmorphic design with developer info
 */

import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { 
  Github, 
  Mail, 
  Twitter, 
  Globe, 
  Code, 
  Database, 
  Cpu, 
  Palette,
  Sparkles,
  Heart
} from 'lucide-react';
import './About.css';

const About: React.FC = () => {
  const { translate, language, isRTL } = useLanguage();
  const { theme } = useTheme();

  const openLink = (url: string) => {
    window.electron.shell.openExternal(url);
  };

  const techStack = [
    { icon: <Code className="w-6 h-6" />, name: 'React', description: 'Modern UI framework' },
    { icon: <Database className="w-6 h-6" />, name: 'SQLite', description: 'Local database storage' },
    { icon: <Cpu className="w-6 h-6" />, name: 'Electron', description: 'Desktop application framework' },
    { icon: <Palette className="w-6 h-6" />, name: 'CSS3', description: 'Glassmorphic styling' },
    { icon: <Sparkles className="w-6 h-6" />, name: 'TypeScript', description: 'Type-safe development' },
    { icon: <Globe className="w-6 h-6" />, name: 'Vite', description: 'Fast build tool' }
  ];

  const systemInfo = [
    { label: 'Electron Version', value: process.versions.electron },
    { label: 'Node Version', value: process.versions.node },
    { label: 'Chrome Version', value: process.versions.chrome },
    { label: 'Platform', value: process.platform }
  ];

  return (
    <div className={`about-view ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="about-container">
        
        {/* Main Title */}
        <div className="about-header">
          <div className="app-title">
            <h1>⚡ Knoux Clipboard AI</h1>
            <p className="tagline">🌟 Intelligent Clipboard Manager with AI Power</p>
          </div>
          
          <div className="version-badges">
            <div className="badge">
              📦 Version 1.0.0
            </div>
            <div className="badge">
              ⚙️ Electron + TypeScript
            </div>
            <div className="badge">
              🤖 AI Powered
            </div>
          </div>
        </div>

        {/* Developer Section */}
        <div className="glass-card developer-section">
          <div className="developer-avatar">
            👨‍💻
          </div>
          <h2>{translate('about.developer') || 'Developer'}</h2>
          <div className="developer-name">
            Knoux – Abu Retaj 🦾
          </div>
          
          <div className="social-links">
            <button 
              className="social-button"
              onClick={() => openLink('https://github.com/knoux')}
            >
              <Github className="w-5 h-5" />
              GitHub
            </button>
            
            <button 
              className="social-button"
              onClick={() => openLink('mailto:knoux@example.com')}
            >
              <Mail className="w-5 h-5" />
              Email
            </button>
            
            <button 
              className="social-button"
              onClick={() => openLink('https://twitter.com/knoux')}
            >
              <Twitter className="w-5 h-5" />
              Twitter
            </button>
          </div>
        </div>

        {/* Vision Section */}
        <div className="glass-card vision-section">
          <h2>🎯 Vision</h2>
          <p className="vision-text">
            To revolutionize clipboard management by combining AI intelligence with beautiful,
            intuitive design. Making everyday tasks smarter, faster, and more delightful for users
            in Al-Zuhour Residences and beyond.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="glass-card tech-section">
          <h2>🛠️ Built With</h2>
          <div className="tech-grid">
            {techStack.map((tech, index) => (
              <div key={index} className="tech-item">
                <div className="tech-icon">
                  {tech.icon}
                </div>
                <div className="tech-info">
                  <h3>{tech.name}</h3>
                  <p>{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="glass-card features-section">
          <h2>✨ Key Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">📋</div>
              <div className="feature-content">
                <h3>Smart Clipboard</h3>
                <p>Intelligent clipboard history with search and organization</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <div className="feature-content">
                <h3>AI Assistant</h3>
                <p>Powered by advanced AI for text processing and enhancement</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🎨</div>
              <div className="feature-content">
                <h3>Glassmorphic UI</h3>
                <p>Beautiful modern interface with blur effects and transparency</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🌍</div>
              <div className="feature-content">
                <h3>Bilingual Support</h3>
                <p>Full Arabic RTL and English language support</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div className="feature-content">
                <h3>Privacy First</h3>
                <p>Local storage with enhanced security and encryption</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-content">
                <h3>Lightning Fast</h3>
                <p>Optimized performance with minimal resource usage</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="glass-card system-section">
          <h2>📊 System Information</h2>
          <div className="system-grid">
            {systemInfo.map((info, index) => (
              <div key={index} className="system-item">
                <span className="system-label">{info.label}:</span>
                <span className="system-value">{info.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="about-footer">
          <div className="footer-content">
            <p>
              Made with <Heart className="w-4 h-4 inline" /> in Al-Zuhour Residences 🏡
            </p>
            <p className="copyright">
              © 2026 Knoux. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
