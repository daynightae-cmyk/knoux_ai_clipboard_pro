import React, { useState, useEffect, useRef } from 'react';
import { VoiceProfile, VoiceConversionResult } from '../../../shared/voice-contracts';

interface VoiceStudioProps {
  onVoiceChange?: (profile: VoiceProfile) => void;
}

export const VoiceStudio: React.FC<VoiceStudioProps> = ({ onVoiceChange }) => {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<VoiceProfile | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [synthesisText, setSynthesisText] = useState('');
  const [realtimeControls, setRealtimeControls] = useState({
    pitch: 1.0,
    tempo: 1.0,
    tone: 0.5,
    clarity: 0.8,
    energy: 0.6
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadProfiles();
    connectWebSocket();
    return () => wsRef.current?.close();
  }, []);

  const loadProfiles = async () => {
    const response = await fetch('/api/voice/profiles');
    const data = await response.json();
    setProfiles(data);
    if (data.length > 0) setSelectedProfile(data[0]);
  };

  const connectWebSocket = () => {
    wsRef.current = new WebSocket('ws://localhost:8080');
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chunk-processed') {
        updateQualityMetrics(data.data);
      }
    };
  };

  const updateQualityMetrics = (data: any) => {
    // Update UI with quality metrics
    console.log('Quality:', data.qualityScore, 'Latency:', data.latencyMs);
  };

  const handleControlChange = (control: string, value: number) => {
    setRealtimeControls(prev => ({ ...prev, [control]: value }));
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'control-change',
        control,
        value,
        profileId: selectedProfile?.id
      }));
    }
  };

  const synthesizeText = async () => {
    if (!selectedProfile || !synthesisText) return;

    const response = await fetch('/api/voice/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: synthesisText,
        profileId: selectedProfile.id,
        options: {
          speed: realtimeControls.tempo,
          pitch: realtimeControls.pitch,
          emotion: 'neutral',
          format: 'wav',
          quality: 'high'
        }
      })
    });

    const result = await response.json();
    if (result.audioUrl && audioRef.current) {
      audioRef.current.src = result.audioUrl;
      audioRef.current.play();
    }
  };

  return (
    <div className="voice-studio p-6 bg-gray-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Voice Studio</h2>
      
      {/* Profile Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Voice Profile</label>
        <select 
          className="w-full p-2 border rounded"
          value={selectedProfile?.id || ''}
          onChange={(e) => {
            const profile = profiles.find(p => p.id === e.target.value);
            setSelectedProfile(profile || null);
            onVoiceChange?.(profile!);
          }}
        >
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>
              {profile.name} ({profile.type})
            </option>
          ))}
        </select>
      </div>

      {/* Real-time Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(realtimeControls).map(([control, value]) => (
          <div key={control}>
            <label className="block text-sm font-medium mb-1 capitalize">{control}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={value}
              onChange={(e) => handleControlChange(control, parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{value.toFixed(1)}</span>
          </div>
        ))}
      </div>

      {/* Text Synthesis */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Text to Synthesize</label>
        <textarea
          className="w-full p-3 border rounded h-24"
          value={synthesisText}
          onChange={(e) => setSynthesisText(e.target.value)}
          placeholder="Enter text to convert to speech..."
        />
        <button
          onClick={synthesizeText}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={!synthesisText || !selectedProfile}
        >
          Synthesize Speech
        </button>
      </div>

      {/* Audio Player */}
      <audio ref={audioRef} controls className="w-full mb-4" />

      {/* Profile Info */}
      {selectedProfile && (
        <div className="bg-white p-4 rounded border">
          <h3 className="font-medium mb-2">Profile Details</h3>
          <div className="text-sm text-gray-600">
            <p>Type: {selectedProfile.type}</p>
            <p>Style: {selectedProfile.speakingStyle}</p>
            <p>Base Pitch: {selectedProfile.customizations.pitch.base}Hz</p>
            <p>Tempo: {selectedProfile.customizations.tempo.wpm} WPM</p>
          </div>
        </div>
      )}
    </div>
  );
};