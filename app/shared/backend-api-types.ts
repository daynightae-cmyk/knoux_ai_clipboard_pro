export interface BackendAPI {
  voice: {
    getProfiles: () => Promise<{ success: boolean; profiles: VoiceProfile[] }>;
    customize: (audioData: any, options: any) => Promise<{ success: boolean; result: VoiceConversionResult }>;
  };
  
  quantum: {
    secureClip: (clipData: any, securityLevel: string) => Promise<{ success: boolean; receipt: any; securityLevel: string; timestamp: number; shield: any; contract: any }>;
    audit: () => Promise<{ success: boolean; audit: { score: number; recommendations: string[]; timestamp: number } }>;
    getAnalytics: () => Promise<{ success: boolean; analytics: QuantumAnalytics }>;
    backup: (data: any) => Promise<{ success: boolean; backup: any }>;
    activateShield: () => Promise<{ success: boolean; shield: any }>;
  };
  
  security: {
    storeClip: (clipData: any) => Promise<{ success: boolean; clipId: string; blockHash: string; timestamp: number }>;
    retrieveClip: (clipId: string) => Promise<{ success: boolean; clip: any }>;
    getMetrics: () => Promise<{ success: boolean; metrics: SecurityMetrics }>;
    audit: () => Promise<{ success: boolean; audit: any }>;
    verify: (clipId: string) => Promise<{ success: boolean; verification: any }>;
  };
  
  arvr: {
    createVRClip: (clipData: any, options: any) => Promise<{ success: boolean; vrClip: any }>;
    getMetrics: () => Promise<{ success: boolean; metrics: ARVRMetrics }>;
    search: (query: string) => Promise<{ success: boolean; results: any[] }>;
  };
  
  ui: {
    getProfiles: () => Promise<{ success: boolean; profiles: UIProfile[] }>;
    morph: (morphType: string, options: any) => Promise<{ success: boolean; morphResult: any }>;
    switchStyle: (styleId: string) => Promise<{ success: boolean; style: any }>;
  };
}

export interface VoiceProfile {
  id: string;
  name: string;
  type: string;
}

export interface VoiceConversionResult {
  convertedAudio: any;
  conversionAccuracy: number;
  processingTime: number;
  improvements: string[];
}

export interface QuantumAnalytics {
  blockchain: { blocks: number; transactions: number };
  network: { nodes: number; latency: number; bandwidth: number; connections: number };
  security: { threats: number; encryptionStrength: number; quantumResistance: number };
  performance: { tps: number; confirmationTime: number; energyEfficiency: number };
}

export interface SecurityMetrics {
  totalClips: number;
  securedClips: number;
  verifiedTransactions: number;
  securityScore: number;
}

export interface ARVRMetrics {
  vrClips: number;
  arAnnotations: number;
  immersionScore: number;
  spatialAccuracy: number;
}

export interface UIProfile {
  id: string;
  name: string;
  theme: string;
}

declare global {
  interface Window {
    backendAPI: BackendAPI;
  }
}
