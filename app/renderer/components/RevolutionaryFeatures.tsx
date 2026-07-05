import React, { useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '../../shared/clipboard-utils';
import {
  Activity,
  Atom,
  Brain,
  Camera,
  Cpu,
  Eye,
  Gauge,
  Layers,
  Palette,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react';
import i18n from '../utils/i18n';

interface QuantumPrediction {
  id: string;
  content: string;
  type: 'quantum' | 'temporal' | 'multiverse' | 'neural';
  confidence: number;
  reasoning: string[];
  metadata: Record<string, unknown>;
}

interface VisualAnalysis {
  text: { primary: string; confidence: number; languages: Array<{ language: string; confidence: number }> };
  objects: Array<{ type: string; confidence: number }>;
  colors: { dominantColors: Array<{ hex: string; name: string }> };
  suggestions: Array<{ title: string; description: string; priority: string }>;
  arTransformations: Array<{ type: string; model: string }>;
  insights: Array<{ category: string; title: string; importance: number }>;
}

const fallbackPredictions: QuantumPrediction[] = [
  {
    id: 'q1',
    content: 'console.log("Hello Quantum World");',
    type: 'quantum',
    confidence: 0.92,
    reasoning: ['Quantum superposition analysis', 'Temporal pattern detected'],
    metadata: { universeCount: 1000, coherence: 0.95 },
  },
  {
    id: 'q2',
    content: 'import React from "react";',
    type: 'temporal',
    confidence: 0.87,
    reasoning: ['Temporal crystal projection', 'Code pattern recognition'],
    metadata: { timePattern: 'morning-coding', recurrence: 'daily' },
  },
  {
    id: 'q3',
    content: 'npm run build:renderer && npm run build:main',
    type: 'neural',
    confidence: 0.81,
    reasoning: ['Recent production-hardening activity', 'Build validation workflow detected'],
    metadata: { signal: 'developer-command-center', source: 'local-first-analysis' },
  },
];

const fallbackVisualAnalysis: VisualAnalysis = {
  text: {
    primary: 'Sample extracted text from image analysis',
    confidence: 0.89,
    languages: [{ language: 'en', confidence: 0.95 }],
  },
  objects: [
    { type: 'text', confidence: 0.9 },
    { type: 'button', confidence: 0.85 },
  ],
  colors: {
    dominantColors: [
      { hex: '#8226EE', name: 'Primary Purple' },
      { hex: '#500FC8', name: 'Deep Purple' },
      { hex: '#CFB4EA', name: 'Pale Lavender' },
    ],
  },
  suggestions: [
    { title: 'Enhance Contrast', description: 'Improve text readability for production demos.', priority: 'high' },
    { title: 'Color Harmony', description: 'Align visual output with the KNOUX purple system.', priority: 'medium' },
  ],
  arTransformations: [
    { type: '3d', model: 'text_hologram' },
    { type: 'interactive', model: 'color_picker' },
  ],
  insights: [
    { category: 'composition', title: 'Rule of Thirds', importance: 0.8 },
    { category: 'emotional', title: 'Premium AI SaaS mood', importance: 0.7 },
  ],
};

const predictionGradient = (type: QuantumPrediction['type']) => {
  if (type === 'quantum') return 'from-purple-500 to-pink-500';
  if (type === 'temporal') return 'from-blue-500 to-cyan-500';
  if (type === 'multiverse') return 'from-green-500 to-teal-500';
  return 'from-orange-500 to-red-500';
};

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export const RevolutionaryFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState('quantum');
  const [quantumPredictions, setQuantumPredictions] = useState<QuantumPrediction[]>([]);
  const [visualAnalysis, setVisualAnalysis] = useState<VisualAnalysis | null>(null);
  const [systemStatus, setSystemStatus] = useState<{ coherence?: number; workers?: string; vault?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRTL = i18n.isRTL();

  useEffect(() => {
    void loadSystemStatus();
    void startQuantumPredictions();
  }, []);

  const loadSystemStatus = async () => {
    try {
      const status = await window.electronAPI?.invoke?.('quantum:get-status');
      if (status?.success) {
        setSystemStatus(status.data);
        return;
      }
    } catch (error) {
      console.warn('Could not load system status', error);
    }

    setSystemStatus({ coherence: 0.88, workers: 'ready', vault: 'guarded' });
  };

  const startQuantumPredictions = async () => {
    try {
      const context = {
        time: Date.now(),
        activeApp: 'knoux-clipboard',
        userActivity: 'developer-validation',
        recentClips: [],
      };

      const predictions = await window.electronAPI?.invoke?.('quantum:predict', context);
      if (predictions?.success && Array.isArray(predictions.data)) {
        setQuantumPredictions(predictions.data);
        return;
      }
    } catch (error) {
      console.warn('Quantum predictions unavailable, using demo data', error);
    }

    setQuantumPredictions(fallbackPredictions);
  };

  const loadImageData = (file: File): Promise<ImageData | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          resolve(ctx?.getImageData(0, 0, canvas.width, canvas.height) ?? null);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      const imageData = await loadImageData(file);
      const analysis = await window.electronAPI?.invoke?.('vision:analyze', imageData);
      setVisualAnalysis(analysis?.success ? analysis.data : fallbackVisualAnalysis);
    } catch (error) {
      console.error('Vision analysis failed:', error);
      setVisualAnalysis(fallbackVisualAnalysis);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyPrediction = async (prediction: QuantumPrediction) => {
    try {
      await copyToClipboard(prediction.content);
      console.log(`🔮 Applied quantum prediction: ${prediction.content}`);
      await window.electronAPI?.invoke?.('quantum:update-accuracy', prediction.id, true);
    } catch (error) {
      console.error('Failed to apply prediction:', error);
    }
  };

  const activateAR = async () => {
    if (!visualAnalysis || visualAnalysis.arTransformations.length === 0) return;
    try {
      await window.electronAPI?.invoke?.('vision:start-ar', visualAnalysis.arTransformations);
      console.log('🕶️ AR session activated');
    } catch (error) {
      console.error('AR activation failed:', error);
    }
  };

  const tabs = [
    { id: 'quantum', label: 'Quantum Predictor', icon: Atom },
    { id: 'vision', label: 'Super Vision AI', icon: Eye },
    { id: 'memory', label: 'AI Memory Bank', icon: Brain },
    { id: 'status', label: 'System Status', icon: Activity },
  ];

  return (
    <div className={`min-h-screen bg-knoux-background p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto max-w-7xl">
        <div className={`flex items-center justify-between mb-8 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              🚀 Revolutionary Features
            </h1>
            <p className="text-gray-400 mt-2">Advanced AI-powered clipboard intelligence for KNOUX production workflows.</p>
          </div>

          {systemStatus && (
            <div className="glass-card px-4 py-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${(systemStatus.coherence ?? 0.85) > 0.8 ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <span className="text-sm text-white">Coherence: {formatPercent(systemStatus.coherence ?? 0.85)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-white/5 p-1 rounded-xl">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          {activeTab === 'quantum' && (
            <div className="glass-card space-y-6">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <Atom className="w-8 h-8 text-purple-400" />
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h2 className="text-2xl font-bold text-white">⚛️ Quantum Predictor</h2>
                  <p className="text-gray-400">Worker-safe prediction cards with explicit Apply actions.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quantumPredictions.map((prediction, index) => (
                  <div key={prediction.id} className="glass-card hover:bg-white/10 transition-all">
                    <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${predictionGradient(prediction.type)} flex items-center justify-center text-white font-bold text-sm`}>
                          {index + 1}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${predictionGradient(prediction.type)} text-white`}>
                          {prediction.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{formatPercent(prediction.confidence)}</div>
                        <div className="text-xs text-gray-400">confidence</div>
                      </div>
                    </div>

                    <div className="mb-4 bg-black/30 rounded-lg p-3 font-mono text-sm text-green-400 overflow-x-auto">
                      {prediction.content}
                    </div>

                    <div className="mb-4">
                      <div className="text-xs text-gray-400 mb-2">Reasoning:</div>
                      <ul className="space-y-1">
                        {prediction.reasoning.map((reason) => (
                          <li key={reason} className="text-xs text-gray-300 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => applyPrediction(prediction)}
                      className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white font-medium transition-all"
                    >
                      🔮 Apply Prediction
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vision' && (
            <div className="glass-card space-y-6">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <Eye className="w-8 h-8 text-blue-400" />
                <div className={isRTL ? 'text-right' : 'text-left'}>
                  <h2 className="text-2xl font-bold text-white">👁️ Super Vision AI</h2>
                  <p className="text-gray-400">Image analysis with guarded AR activation.</p>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(event) => event.target.files?.[0] && void handleImageUpload(event.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl text-white font-medium transition-all disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
                {isProcessing ? 'Processing...' : 'Analyze Image'}
              </button>

              {visualAnalysis && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-card">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Extracted Text
                    </h3>
                    <div className="bg-black/30 rounded-lg p-4 mb-4">
                      <div className="text-green-400 font-mono text-sm">{visualAnalysis.text.primary}</div>
                      <div className="text-xs text-gray-400 mt-2">Confidence: {formatPercent(visualAnalysis.text.confidence)}</div>
                    </div>
                    <div className="space-y-2">
                      {visualAnalysis.suggestions.map((suggestion) => (
                        <div key={suggestion.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-sm font-bold text-white">{suggestion.title}</div>
                          <div className="text-xs text-gray-400">{suggestion.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-400" />
                      Visual Intelligence
                    </h3>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {visualAnalysis.colors.dominantColors.map((color) => (
                        <div key={color.hex} className="rounded-xl p-3 border border-white/10 bg-white/5">
                          <div className="h-10 rounded-lg mb-2" style={{ backgroundColor: color.hex }} />
                          <div className="text-[11px] text-white font-bold">{color.name}</div>
                          <div className="text-[10px] text-gray-400">{color.hex}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => void activateAR()} className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold">
                      <Wand2 className="w-4 h-4 inline mr-2" /> Activate AR Layer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'memory' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Context Memory', icon: Brain, value: 'Local-first', note: 'No external sync by default.' },
                { title: 'Worker Runtime', icon: Cpu, value: 'Parallel', note: 'Heavy actions stay off the UI thread.' },
                { title: 'Pattern Layers', icon: Layers, value: 'Adaptive', note: 'Clipboard types feed smarter actions.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="glass-card">
                    <Icon className="w-8 h-8 text-purple-300 mb-4" />
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <div className="text-2xl font-black text-white my-2">{item.value}</div>
                    <p className="text-sm text-gray-400">{item.note}</p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'status' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Coherence', value: formatPercent(systemStatus?.coherence ?? 0.85), icon: Gauge },
                { label: 'Workers', value: systemStatus?.workers ?? 'ready', icon: Cpu },
                { label: 'Vault', value: systemStatus?.vault ?? 'guarded', icon: Activity },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="glass-card">
                    <Icon className="w-7 h-7 text-cyan-300 mb-3" />
                    <div className="text-xs uppercase tracking-widest text-gray-400">{item.label}</div>
                    <div className="text-3xl font-black text-white mt-1">{item.value}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
