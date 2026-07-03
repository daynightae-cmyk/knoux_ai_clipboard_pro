import React, { useState, useEffect } from 'react';
import { 
  creativeEngine, 
  CreativeType, 
  CreativeSettings, 
  CreativeOutput,
  EmotionType,
  PoetryStyle 
} from '../../backend/ai/creative-engine';

interface IPC {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

declare global {
  interface Window {
    electron?: {
      ipcRenderer: IPC;
    };
  }
}

export const CreativeStudio: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<CreativeOutput | null>(null);
  const [settings, setSettings] = useState<CreativeSettings>({
    type: 'poetry',
    creativityLevel: 70,
    emotionIntensity: 60,
    languageStyle: 'poetic',
    rhythmFlow: 50,
    emotion: 'joy',
    poetryStyle: 'modern'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<CreativeOutput[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const h = creativeEngine.getHistory(10);
    setHistory(h);
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    try {
      // Use IPC if available, fallback to direct call
      const result = window.electron?.ipcRenderer
        ? await window.electron.ipcRenderer.invoke('creative:generate', inputText, settings)
        : await creativeEngine.generateCreative(inputText, settings);
      
      setOutput(result);
      loadHistory();
    } catch (error) {
      console.error('Creative generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToClipboard = () => {
    if (output?.enhanced) {
      navigator.clipboard.writeText(output.enhanced);
      if (window.electron?.ipcRenderer) {
        window.electron.ipcRenderer.invoke('copy-to-clipboard', output.enhanced);
      }
    }
  };

  const handleSaveProfile = () => {
    const profileName = prompt('Enter profile name:');
    if (profileName) {
      creativeEngine.createProfile(profileName, settings);
      alert('Profile saved!');
    }
  };

  const updateSetting = <K extends keyof CreativeSettings>(
    key: K, 
    value: CreativeSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    creativeEngine.updateProfileSettings({ [key]: value });
  };

  const creativeScore = creativeEngine.getCreativeScore();

  return (
    <div className="creative-studio">
      {/* Header */}
      <div className="studio-header">
        <h2>🎭 Creative Studio</h2>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={enabled} 
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span className="slider">Creative Mode</span>
        </label>
      </div>

      {enabled && (
        <div className="studio-content">
          {/* Controls Panel */}
          <div className="controls-panel">
            <h3>Creative Controls</h3>

            {/* Type Selector */}
            <div className="control-group">
              <label>Creative Type</label>
              <div className="type-buttons">
                {(['poetry', 'free-verse', 'rap', 'story', 'caption'] as CreativeType[]).map(type => (
                  <button
                    key={type}
                    className={`type-btn ${settings.type === type ? 'active' : ''}`}
                    onClick={() => updateSetting('type', type)}
                  >
                    {type === 'poetry' && '📜 Poetry'}
                    {type === 'free-verse' && '🎨 Free Verse'}
                    {type === 'rap' && '🎤 Rap'}
                    {type === 'story' && '📖 Story'}
                    {type === 'caption' && '💬 Caption'}
                  </button>
                ))}
              </div>
            </div>

            {/* Poetry Style (if poetry selected) */}
            {settings.type === 'poetry' && (
              <div className="control-group">
                <label>Poetry Style</label>
                <select 
                  value={settings.poetryStyle} 
                  onChange={(e) => updateSetting('poetryStyle', e.target.value as PoetryStyle)}
                >
                  <option value="classical">Classical / كلاسيكي</option>
                  <option value="modern">Modern / حديث</option>
                  <option value="nabati">Nabati / نبطي</option>
                  <option value="sufi">Sufi / صوفي</option>
                  <option value="romantic">Romantic / رومانسي</option>
                </select>
              </div>
            )}

            {/* Emotion Selector */}
            <div className="control-group">
              <label>Emotion</label>
              <select 
                value={settings.emotion} 
                onChange={(e) => updateSetting('emotion', e.target.value as EmotionType)}
              >
                <option value="joy">😊 Joy / فرح</option>
                <option value="sadness">😢 Sadness / حزن</option>
                <option value="love">❤️ Love / حب</option>
                <option value="nostalgia">🌅 Nostalgia / حنين</option>
                <option value="hope">🌟 Hope / أمل</option>
                <option value="anger">😠 Anger / غضب</option>
                <option value="peace">☮️ Peace / سلام</option>
              </select>
            </div>

            {/* Sliders */}
            <div className="control-group">
              <label>Creativity Level: {settings.creativityLevel}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.creativityLevel}
                onChange={(e) => updateSetting('creativityLevel', parseInt(e.target.value))}
                className="slider-input"
              />
              <div className="slider-labels">
                <span>Conservative</span>
                <span>Experimental</span>
              </div>
            </div>

            <div className="control-group">
              <label>Emotion Intensity: {settings.emotionIntensity}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.emotionIntensity}
                onChange={(e) => updateSetting('emotionIntensity', parseInt(e.target.value))}
                className="slider-input"
              />
              <div className="slider-labels">
                <span>Subtle</span>
                <span>Intense</span>
              </div>
            </div>

            <div className="control-group">
              <label>Rhythm / Flow: {settings.rhythmFlow}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.rhythmFlow}
                onChange={(e) => updateSetting('rhythmFlow', parseInt(e.target.value))}
                className="slider-input"
              />
              <div className="slider-labels">
                <span>Free</span>
                <span>Structured</span>
              </div>
            </div>

            {/* Language Style */}
            <div className="control-group">
              <label>Language Style</label>
              <select 
                value={settings.languageStyle} 
                onChange={(e) => updateSetting('languageStyle', e.target.value as any)}
              >
                <option value="formal">Formal / رسمي</option>
                <option value="casual">Casual / عامي</option>
                <option value="poetic">Poetic / شعري</option>
                <option value="modern">Modern / عصري</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="btn-save" onClick={handleSaveProfile}>
                💾 Save Profile
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="preview-panel">
            <h3>Creative Workspace</h3>

            {/* Input Area */}
            <div className="input-section">
              <label>Input Text</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here... / أدخل النص هنا..."
                rows={6}
                className="input-textarea"
              />
            </div>

            {/* Generate Button */}
            <button 
              className="btn-generate" 
              onClick={handleGenerate}
              disabled={isProcessing || !inputText.trim()}
            >
              {isProcessing ? '⏳ Processing...' : '✨ Generate Creative'}
            </button>

            {/* Output Area */}
            {output && (
              <div className="output-section">
                <div className="output-header">
                  <label>Enhanced Output</label>
                  <button className="btn-apply" onClick={handleApplyToClipboard}>
                    📋 Copy to Clipboard
                  </button>
                </div>
                <div className="output-textarea">
                  {output.enhanced}
                </div>

                {/* Metadata Indicators */}
                <div className="metadata-indicators">
                  <div className="indicator">
                    <span className="label">Creativity</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill creativity"
                        style={{ width: `${output.metadata.creativityScore}%` }}
                      />
                    </div>
                    <span className="value">{output.metadata.creativityScore.toFixed(0)}%</span>
                  </div>

                  <div className="indicator">
                    <span className="label">Emotion</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill emotion"
                        style={{ width: `${output.metadata.emotionScore}%` }}
                      />
                    </div>
                    <span className="value">{output.metadata.emotionScore}%</span>
                  </div>

                  <div className="indicator">
                    <span className="label">Rhythm</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill rhythm"
                        style={{ width: `${output.metadata.rhythmScore}%` }}
                      />
                    </div>
                    <span className="value">{output.metadata.rhythmScore}%</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="output-stats">
                  <span>📝 {output.metadata.wordCount} words</span>
                  <span>⏱️ {output.metadata.readingTime} min read</span>
                  <span>🎭 {output.metadata.type}</span>
                  <span>💭 {output.metadata.emotion}</span>
                </div>

                {/* Suggestions */}
                {output.suggestions.length > 0 && (
                  <div className="suggestions">
                    <h4>💡 Suggestions</h4>
                    <ul>
                      {output.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="history-sidebar">
            <div className="history-header">
              <h3>📚 History</h3>
              <button onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? '▼' : '▶'}
              </button>
            </div>

            {showHistory && (
              <div className="history-list">
                {history.length === 0 ? (
                  <p className="empty-state">No creative history yet</p>
                ) : (
                  history.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="history-item"
                      onClick={() => {
                        setInputText(item.original);
                        setOutput(item);
                      }}
                    >
                      <div className="history-type">{item.metadata.type}</div>
                      <div className="history-preview">
                        {item.enhanced.substring(0, 50)}...
                      </div>
                      <div className="history-score">
                        ⭐ {item.metadata.creativityScore.toFixed(0)}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Creative Score */}
            <div className="creative-score-card">
              <h4>Your Creative Score</h4>
              <div className="score-circle">
                <span className="score-value">{creativeScore.toFixed(0)}</span>
                <span className="score-label">/ 100</span>
              </div>
              <p className="score-desc">
                {creativeScore > 80 ? '🌟 Master Creator' :
                 creativeScore > 60 ? '🎨 Creative Artist' :
                 creativeScore > 40 ? '✍️ Aspiring Writer' :
                 '🌱 Beginner'}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .creative-studio {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }

        .studio-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .studio-header h2 {
          margin: 0;
          font-size: 24px;
        }

        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .toggle-switch input {
          width: 50px;
          height: 24px;
        }

        .studio-content {
          display: grid;
          grid-template-columns: 300px 1fr 250px;
          gap: 20px;
        }

        .controls-panel, .preview-panel, .history-sidebar {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 20px;
        }

        .controls-panel h3, .preview-panel h3, .history-sidebar h3 {
          margin-top: 0;
          font-size: 18px;
        }

        .control-group {
          margin-bottom: 20px;
        }

        .control-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .type-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .type-btn {
          padding: 8px 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .type-btn.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: white;
        }

        .type-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        select {
          width: 100%;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
        }

        select option {
          background: #667eea;
          color: white;
        }

        .slider-input {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.2);
          outline: none;
          -webkit-appearance: none;
        }

        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-top: 4px;
          opacity: 0.7;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
        }

        .btn-save {
          flex: 1;
          padding: 10px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-save:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .input-section, .output-section {
          margin-bottom: 20px;
        }

        .input-textarea {
          width: 100%;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          resize: vertical;
        }

        .input-textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .btn-generate {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .btn-generate:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-generate:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .output-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .btn-apply {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .output-textarea {
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          min-height: 150px;
          white-space: pre-wrap;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .metadata-indicators {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 15px;
        }

        .indicator {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .indicator .label {
          width: 80px;
          font-size: 12px;
          font-weight: 500;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s;
        }

        .progress-fill.creativity {
          background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
        }

        .progress-fill.emotion {
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        }

        .progress-fill.rhythm {
          background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
        }

        .indicator .value {
          width: 40px;
          text-align: right;
          font-size: 12px;
          font-weight: 600;
        }

        .output-stats {
          display: flex;
          gap: 15px;
          font-size: 12px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          margin-bottom: 15px;
        }

        .suggestions {
          background: rgba(255, 255, 255, 0.1);
          padding: 12px;
          border-radius: 6px;
        }

        .suggestions h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
        }

        .suggestions ul {
          margin: 0;
          padding-left: 20px;
          font-size: 13px;
        }

        .suggestions li {
          margin-bottom: 5px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .history-header button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
        }

        .history-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .history-item {
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .history-item:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(4px);
        }

        .history-type {
          font-size: 11px;
          text-transform: uppercase;
          opacity: 0.7;
          margin-bottom: 4px;
        }

        .history-preview {
          font-size: 13px;
          margin-bottom: 4px;
        }

        .history-score {
          font-size: 12px;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          opacity: 0.5;
          font-size: 13px;
        }

        .creative-score-card {
          margin-top: 20px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          text-align: center;
        }

        .creative-score-card h4 {
          margin: 0 0 15px 0;
          font-size: 14px;
        }

        .score-circle {
          width: 100px;
          height: 100px;
          margin: 0 auto 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .score-value {
          font-size: 32px;
          font-weight: 700;
        }

        .score-label {
          font-size: 14px;
          opacity: 0.8;
        }

        .score-desc {
          margin: 10px 0 0 0;
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
