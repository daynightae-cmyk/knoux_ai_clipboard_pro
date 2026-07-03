/**
 * Comprehensive Service Hooks - Knoux Clipboard AI
 * Unified React hooks for all backend services
 */

import { useState, useEffect, useCallback } from 'react';

// Comprehensive service hook
export const useKnouxServices = () => {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshServices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (window.knoux?.services?.list) {
        const response = await window.knoux.services.list();
        if (response.ok) {
          setServices(response.data || []);
        } else {
          setError(response.error || 'Failed to load services');
        }
      } else {
        setError('Services API not available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshServices();
  }, [refreshServices]);

  return { services, isLoading, error, refreshServices };
};

// Enhanced AI hook with comprehensive features
export const useKnouxAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const chat = useCallback(async (message: string, sessionId?: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      if (window.knoux?.ai?.chat) {
        const response = await window.knoux.ai.chat({
          message,
          history: chatHistory,
          sessionId
        });
        
        if (response.ok) {
          const newMessage = {
            role: 'assistant',
            content: response.data.content,
            timestamp: Date.now()
          };
          setChatHistory(prev => [...prev, 
            { role: 'user', content: message, timestamp: Date.now() },
            newMessage
          ]);
          return response.data.content;
        } else {
          setError(response.error || 'Chat failed');
          return null;
        }
      } else {
        setError('AI chat not available');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat error');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [chatHistory]);

  const processText = useCallback(async (text: string, action: string, options?: any) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      if (window.knoux?.ai?.process) {
        const response = await window.knoux.ai.process({
          text,
          action,
          options
        });
        
        if (response.ok) {
          return response.data;
        } else {
          setError(response.error || 'Processing failed');
          return null;
        }
      } else {
        setError('AI processing not available');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing error');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  return {
    isProcessing,
    error,
    chatHistory,
    chat,
    processText,
    clearHistory
  };
};

// Creative engine hook
export const useCreativeEngine = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (request: any) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      if (window.knoux?.creative?.generate) {
        const response = await window.knoux.creative.generate(request);
        
        if (response.ok) {
          return response.data;
        } else {
          setError(response.error || 'Generation failed');
          return null;
        }
      } else {
        setError('Creative engine not available');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation error');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { isGenerating, error, generate };
};

// Universal translator hook
export const useTranslator = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(async (text: string, fromLang: string, toLang: string) => {
    try {
      setIsTranslating(true);
      setError(null);
      
      if (window.knoux?.translator?.translate) {
        const response = await window.knoux.translator.translate({
          text,
          fromLanguage: fromLang,
          toLanguage: toLang
        });
        
        if (response.ok) {
          return response.data;
        } else {
          setError(response.error || 'Translation failed');
          return null;
        }
      } else {
        setError('Translator not available');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation error');
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, []);

  return { isTranslating, error, translate };
};

// Pattern recognition hook
export const usePatternRecognition = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePatterns = useCallback(async (data: any) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      if (window.knoux?.patterns?.analyze) {
        const response = await window.knoux.patterns.analyze(data);
        
        if (response.ok) {
          return response.data;
        } else {
          setError(response.error || 'Pattern analysis failed');
          return null;
        }
      } else {
        setError('Pattern recognition not available');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis error');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { isAnalyzing, error, analyzePatterns };
};

// Security hook
export const useSecurity = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const encrypt = useCallback(async (data: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      if (window.knoux?.security?.encrypt) {
        const response = await window.knoux.security.encrypt(data);
        
        if (response.ok) {
          return response.data;
        } else {
          setError(response.error || 'Encryption failed');
          return null;
        }
      } else {
        setError('Security service not available');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption error');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const decrypt = useCallback(async (encryptedData: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      if (window.knoux?.security?.decrypt) {
        const response = await window.knoux.security.decrypt(encryptedData);
        
        if (response.ok) {
          return response.data;
        } else {
          setError(response.error || 'Decryption failed');
          return null;
        }
      } else {
        setError('Security service not available');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption error');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { isProcessing, error, encrypt, decrypt };
};

// System information hook
export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSystemInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (window.knoux?.system?.info) {
        const response = await window.knoux.system.info();
        
        if (response.ok) {
          setSystemInfo(response.data);
        } else {
          setError(response.error || 'Failed to load system info');
        }
      } else {
        setError('System info not available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'System info error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSystemInfo();
  }, [refreshSystemInfo]);

  return { systemInfo, isLoading, error, refreshSystemInfo };
};

// Global type declarations
declare global {
  interface Window {
    knoux?: {
      services: {
        list: () => Promise<{ ok: boolean; data?: any[]; error?: string }>;
        status: () => Promise<{ ok: boolean; data?: any; error?: string }>;
        get: (name: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
      };
      ai: {
        chat: (request: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
        process: (request: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
      };
      creative: {
        generate: (request: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
      };
      translator: {
        translate: (request: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
      };
      patterns: {
        analyze: (data: any) => Promise<{ ok: boolean; data?: any; error?: string }>;
      };
      security: {
        encrypt: (data: string) => Promise<{ ok: boolean; data?: string; error?: string }>;
        decrypt: (data: string) => Promise<{ ok: boolean; data?: string; error?: string }>;
      };
      system: {
        info: () => Promise<{ ok: boolean; data?: any; error?: string }>;
      };
      clipboard: {
        read: () => Promise<{ ok: boolean; data?: any[]; error?: string }>;
        write: (item: any) => Promise<{ ok: boolean; error?: string }>;
        history: () => Promise<{ ok: boolean; data?: any[]; error?: string }>;
        normalize: (content: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
        format: (content: string, format: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
      };
      storage: {
        get: (key: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
        set: (key: string, value: any) => Promise<{ ok: boolean; error?: string }>;
        export: () => Promise<{ ok: boolean; data?: any; error?: string }>;
      };
    };
  }
}