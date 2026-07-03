import React, { useState, useEffect, useRef } from 'react';

interface VoiceProfile {
  id: string;
  name: string;
  type: string;
}

interface VoiceConversionResult {
  convertedAudio: AudioBuffer;
  conversionAccuracy: number;
  processingTime: number;
  improvements: string[];
}

interface VoiceCustomizerUIProps {
  onVoiceProcessed?: (result: VoiceConversionResult) => void;
}

export const VoiceCustomizerUI: React.FC<VoiceCustomizerUIProps> = ({ onVoiceProcessed }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<VoiceConversionResult | null>(null);
  const [selectedProfile, setSelectedProfile] = useState('presenter');
  const [selectedMood, setSelectedMood] = useState('confident');
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    loadProfiles();
    initializeAudioContext();
  }, []);

  const loadProfiles = async () => {
    const availableProfiles: VoiceProfile[] = [
      { id: 'presenter', name: 'Professional Presenter', type: 'professional' },
      { id: 'executive', name: 'Executive', type: 'professional' },
      { id: 'teacher', name: 'Teacher', type: 'professional' }
    ];
    setProfiles(availableProfiles);
  };

  const initializeAudioContext = () => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        setAudioBuffer(audioBuffer);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoice = async (type: 'professional' | 'mood' | 'tone' | 'enhance') => {
    if (!audioBuffer) return;
    
    setProcessing(true);
    try {
      // Mock processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result: VoiceConversionResult = {
        convertedAudio: audioBuffer,
        conversionAccuracy: 0.92,
        processingTime: 1500,
        improvements: ['Noise reduction', 'Tone adjustment', 'Clarity enhancement']
      };
      
      setResult(result);
      onVoiceProcessed?.(result);
    } catch (error) {
      console.error('Error processing voice:', error);
    } finally {
      setProcessing(false);
    }
  };

  const playAudio = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  return (
    <div className="voice-customizer-ui">
      <div className="voice-controls">
        <h3>🎤 Voice Customization</h3>
        
        {/* Recording Controls */}
        <div className="recording-section">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            disabled={processing}
          >
            {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
          </button>
          
          {audioBuffer && (
            <button
              onClick={() => playAudio(audioBuffer)}
              className="play-btn"
              disabled={processing}
            >
              ▶️ Play Original
            </button>
          )}
        </div>

        {/* Profile Selection */}
        <div className="profile-section">
          <label>Professional Profile:</label>
          <select
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            disabled={processing}
          >
            {profiles.filter(p => p.type === 'professional').map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mood Selection */}
        <div className="mood-section">
          <label>Target Mood:</label>
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            disabled={processing}
          >
            <option value="confident">Confident</option>
            <option value="happy">Happy</option>
            <option value="calm">Calm</option>
            <option value="energetic">Energetic</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        {/* Processing Buttons */}
        <div className="processing-section">
          <button
            onClick={() => processVoice('professional')}
            disabled={!audioBuffer || processing}
            className="process-btn professional"
          >
            {processing ? '⏳ Processing...' : '🧑‍💼 Make Professional'}
          </button>
          
          <button
            onClick={() => processVoice('mood')}
            disabled={!audioBuffer || processing}
            className="process-btn mood"
          >
            {processing ? '⏳ Processing...' : '😊 Adjust Mood'}
          </button>
          
          <button
            onClick={() => processVoice('enhance')}
            disabled={!audioBuffer || processing}
            className="process-btn enhance"
          >
            {processing ? '⏳ Processing...' : '🔊 Enhance Quality'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="results-section">
            <h4>✅ Processing Complete</h4>
            <div className="result-stats">
              <div className="stat">
                <span>Accuracy:</span>
                <span>{(result.conversionAccuracy * 100).toFixed(1)}%</span>
              </div>
              <div className="stat">
                <span>Processing Time:</span>
                <span>{result.processingTime}ms</span>
              </div>
            </div>
            
            <div className="improvements">
              <h5>Improvements Applied:</h5>
              <ul>
                {result.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>
            
            <button
              onClick={() => playAudio(result.convertedAudio)}
              className="play-result-btn"
            >
              ▶️ Play Enhanced Voice
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .voice-customizer-ui {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          max-width: 500px;
        }

        .voice-controls h3 {
          margin: 0 0 20px 0;
          text-align: center;
          font-size: 1.5em;
        }

        .recording-section,
        .profile-section,
        .mood-section,
        .processing-section {
          margin-bottom: 20px;
        }

        .record-btn {
          width: 100%;
          padding: 15px;
          font-size: 1.1em;
          border: none;
          border-radius: 8px;
          background: #ff4757;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .record-btn.recording {
          background: #ff3742;
          animation: pulse 1s infinite;
        }

        .record-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .play-btn {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          border: none;
          border-radius: 6px;
          background: #5352ed;
          color: white;
          cursor: pointer;
        }

        .profile-section label,
        .mood-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .profile-section select,
        .mood-section select {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
        }

        .processing-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .process-btn {
          padding: 12px;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .process-btn.professional {
          background: #3742fa;
        }

        .process-btn.mood {
          background: #ff6b6b;
        }

        .process-btn.enhance {
          background: #26de81;
        }

        .process-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .process-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .results-section {
          background: rgba(255, 255, 255, 0.1);
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .results-section h4 {
          margin: 0 0 15px 0;
          color: #26de81;
        }

        .result-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 15px;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .improvements h5 {
          margin: 0 0 10px 0;
        }

        .improvements ul {
          margin: 0;
          padding-left: 20px;
        }

        .improvements li {
          margin-bottom: 5px;
        }

        .play-result-btn {
          width: 100%;
          padding: 12px;
          margin-top: 15px;
          border: none;
          border-radius: 6px;
          background: #26de81;
          color: white;
          cursor: pointer;
          font-weight: 500;
        }

        .play-result-btn:hover {
          background: #20bf6b;
        }
      `}</style>
    </div>
  );
};

export default VoiceCustomizerUI;