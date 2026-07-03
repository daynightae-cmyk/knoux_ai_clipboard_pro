// Voice System Data Contracts
export interface VoiceProfile {
  id: string;
  name: string;
  type: 'professional' | 'casual' | 'emotional' | 'synthetic';
  baseVoice: {
    model: string;
    sampleRate: number;
    language: string;
  };
  customizations: {
    pitch: { base: number; range: [number, number] };
    tempo: { wpm: number; variation: number };
    tone: { warmth: number; authority: number };
    clarity: number;
    energy: number;
  };
  emotionalRange: {
    min: string;
    max: string;
    current: string;
  };
  speakingStyle: string;
  metadata: {
    created: number;
    lastUsed: number;
    usage: number;
  };
}

export interface VoiceConversionResult {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  inputProfile: string;
  targetProfile: string;
  audioUrl?: string;
  quality: {
    score: number;
    latency: number;
    clarity: number;
    naturalness: number;
  };
  metadata: {
    duration: number;
    fileSize: number;
    timestamp: number;
  };
}

export interface RealtimeVoiceEvent {
  type: 'chunk-processed' | 'quality-update' | 'profile-changed';
  sessionId: string;
  timestamp: number;
  data: {
    chunkId?: string;
    latencyMs?: number;
    qualityScore?: number;
    profileId?: string;
  };
}

export interface VoiceSynthesisRequest {
  text: string;
  profileId: string;
  options: {
    speed: number;
    pitch: number;
    emotion: string;
    format: 'wav' | 'mp3' | 'ogg';
    quality: 'low' | 'medium' | 'high';
  };
}