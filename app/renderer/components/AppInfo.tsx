import React, { useEffect, useState } from 'react';
import { ExternalLink, Github, Mail, Globe, Phone, MessageCircle } from 'lucide-react';

interface AppInfo {
  name: string;
  version: string;
  build: string;
  developer: string;
  email: string;
  whatsapp: string;
  website: string;
  github: string;
}

interface SystemStatus {
  electronVersion: string;
  nodeVersion: string;
  platform: string;
  architecture: string;
  memoryUsage: string;
  installPath: string;
  isInstalled: boolean;
  lastUpdated: string;
}

const AppInfoPanel: React.FC = () => {
  const [appInfo] = useState<AppInfo>({
    name: 'Knoux Clipboard AI',
    version: '1.0.0',
    build: 'Build: January 26, 2026',
    developer: 'Eng / Sadek Elgazar',
    email: 'knouxguard@gmail.com',
    whatsapp: '+971503281920',
    website: 'https://knoux.io',
    github: 'https://github.com/knoux-io',
  });

  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    electronVersion: process.versions.electron || 'Unknown',
    nodeVersion: process.versions.node || 'Unknown',
    platform: process.platform,
    architecture: process.arch,
    memoryUsage: '0 MB',
    installPath: '',
    isInstalled: true,
    lastUpdated: new Date().toLocaleDateString(),
  });

  useEffect(() => {
    // Get system information
    const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    setSystemStatus(prev => ({
      ...prev,
      memoryUsage: `${memUsage} MB`,
      installPath: __dirname || 'Unknown',
    }));
  }, []);

  const handleOpenLink = (url: string) => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const ContactButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
    action?: () => void;
  }> = ({ icon, label, value, href, action }) => (
    <button
      onClick={() => action?.() || (href && handleOpenLink(href))}
      className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 transition-all group"
    >
      <span className="text-purple-400 group-hover:text-purple-300">{icon}</span>
      <div className="text-left">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-purple-300 group-hover:text-purple-200">{value}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-500 ml-auto group-hover:text-purple-400" />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{appInfo.name}</h1>
            <p className="text-gray-400">Professional Clipboard Manager</p>
          </div>
        </div>

        {/* Version Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
            <p className="text-xs text-gray-500 mb-1">VERSION</p>
            <p className="text-lg font-bold text-purple-400">{appInfo.version}</p>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
            <p className="text-xs text-gray-500 mb-1">STATUS</p>
            <p className="text-lg font-bold text-green-400">✓ Active</p>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
            <p className="text-xs text-gray-500 mb-1">PLATFORM</p>
            <p className="text-lg font-bold text-blue-400 capitalize">{systemStatus.platform}</p>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20">
            <p className="text-xs text-gray-500 mb-1">ARCH</p>
            <p className="text-lg font-bold text-cyan-400">{systemStatus.architecture}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* About Developer */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>👤</span> About Developer
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <h3 className="font-bold text-white mb-2">{appInfo.developer}</h3>
              <p className="text-sm text-gray-400">
                Expert in AI-powered applications, clipboard management, and professional UX design.
              </p>
            </div>

            <div className="space-y-3">
              <ContactButton
                icon={<Mail className="w-5 h-5" />}
                label="Email"
                value={appInfo.email}
                href={`mailto:${appInfo.email}`}
              />
              <ContactButton
                icon={<MessageCircle className="w-5 h-5" />}
                label="WhatsApp"
                value={appInfo.whatsapp}
                href={`https://wa.me/${appInfo.whatsapp.replace(/[^0-9]/g, '')}`}
              />
              <ContactButton
                icon={<Globe className="w-5 h-5" />}
                label="Website"
                value="knoux.io"
                href={appInfo.website}
              />
              <ContactButton
                icon={<Github className="w-5 h-5" />}
                label="GitHub"
                value="knoux-io"
                href={appInfo.github}
              />
            </div>
          </div>
        </div>

        {/* System Information */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚙️</span> System Information
          </h2>

          <div className="space-y-3 p-4 rounded-xl bg-black/40 border border-purple-500/20">
            <div className="flex justify-between items-center pb-3 border-b border-purple-500/10">
              <span className="text-sm text-gray-400">Electron Version</span>
              <code className="text-sm font-mono text-cyan-400">{systemStatus.electronVersion}</code>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-purple-500/10">
              <span className="text-sm text-gray-400">Node Version</span>
              <code className="text-sm font-mono text-cyan-400">{systemStatus.nodeVersion}</code>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-purple-500/10">
              <span className="text-sm text-gray-400">Memory Usage</span>
              <code className="text-sm font-mono text-cyan-400">{systemStatus.memoryUsage}</code>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-purple-500/10">
              <span className="text-sm text-gray-400">Install Path</span>
              <code className="text-sm font-mono text-cyan-400 truncate">{systemStatus.installPath}</code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Last Updated</span>
              <code className="text-sm font-mono text-cyan-400">{systemStatus.lastUpdated}</code>
            </div>
          </div>

          {/* Build Info */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <p className="text-xs text-gray-400 mb-2">{appInfo.build}</p>
            <p className="text-sm text-gray-300">
              Made with ❤️ for professional clipboard management
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto mt-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>✨</span> Key Features
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: '🤖 AI-Powered', desc: 'Smart content analysis and enhancement' },
            { title: '🔒 Secure', desc: 'AES-256 encryption for sensitive data' },
            { title: '🌍 Multi-language', desc: 'Full Arabic & English support (RTL)' },
            { title: '⚡ Fast', desc: 'Real-time clipboard monitoring' },
            { title: '📊 Analytics', desc: 'Detailed clipboard statistics' },
            { title: '🎨 Beautiful UI', desc: 'Dark theme with smooth animations' },
          ].map((feature, i) => (
            <div key={i} className="p-4 rounded-lg bg-black/40 border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <h3 className="font-bold text-purple-300 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 text-center">
        <p className="text-sm text-gray-500">
          © 2026 Knoux Guard. All rights reserved.
        </p>
        <p className="text-xs text-gray-600 mt-2">
          For support, visit our website or contact us directly.
        </p>
      </div>
    </div>
  );
};

export default AppInfoPanel;
