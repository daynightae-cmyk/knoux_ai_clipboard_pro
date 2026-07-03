/**
 * Knoux Clipboard AI - Fixed AI Operations React Hook
 * Clean, working AI hook with proper error handling and IPC integration
 * Fixes all critical issues from the original useAI hook
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Temporary constants to replace missing imports
const AI_CONSTANTS = {
    ANALYSIS_TIMEOUT_MS: 30000,
    CACHE_DURATION_MINUTES: 60,
    MAX_CONCURRENT_REQUESTS: 3,
    RETRY_ATTEMPTS: 3
};

// Logger replacement
const logger = {
    debug: (message: string, ...args: any[]) => console.debug(`[useAI] ${message}`, ...args),
    info: (message: string, ...args: any[]) => console.info(`[useAI] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[useAI] ${message}`, ...args),
    error: (message: string, ...args: any[]) => console.error(`[useAI] ${message}`, ...args)
};

// Type definitions to replace missing imports
export interface AIAnalysis {
    content: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    keywords: string[];
    entities: Array<{ name: string; type: string; confidence: number }>;
    summary: string;
    confidence: number;
    processingTimeMs: number;
}

export interface ContentClassification {
    type: 'text' | 'code' | 'url' | 'email' | 'number' | 'other';
    language: string;
    complexity: 'low' | 'medium' | 'high';
    wordCount: number;
    confidence: number;
}

export interface AISuggestion {
    type: 'grammar' | 'style' | 'structure' | 'content';
    message: string;
    severity: 'low' | 'medium' | 'high';
    position?: { start: number; end: number };
    replacement?: string;
}

export interface EnhancementOptions {
    tone: 'casual' | 'professional' | 'formal';
    complexityLevel: 'basic' | 'intermediate' | 'advanced';
    securityCheck: boolean;
    includeExamples: boolean;
}

export interface EnhancedContent {
    original: string;
    enhanced: string;
    improvements: string[];
    confidence: number;
    processingTimeMs: number;
    suggestions: AISuggestion[];
}

export interface AIHookConfig {
    autoAnalyze: boolean;
    cacheResults: boolean;
    maxConcurrentRequests: number;
    timeoutMs: number;
    retryAttempts: number;
    defaultEnhancementOptions: Partial<EnhancementOptions>;
}

export interface AIAnalysisState {
    isAnalyzing: boolean;
    isEnhancing: boolean;
    isClassifying: boolean;
    currentOperation?: string;
    progress: number;
    lastAnalysis?: AIAnalysis;
    lastClassification?: ContentClassification;
    error?: string;
    suggestions: AISuggestion[];
    cacheHits: number;
    cacheMisses: number;
}

// Default configuration
const DEFAULT_CONFIG: AIHookConfig = {
    autoAnalyze: true,
    cacheResults: true,
    maxConcurrentRequests: AI_CONSTANTS.MAX_CONCURRENT_REQUESTS,
    timeoutMs: AI_CONSTANTS.ANALYSIS_TIMEOUT_MS,
    retryAttempts: AI_CONSTANTS.RETRY_ATTEMPTS,
    defaultEnhancementOptions: {
        tone: 'professional',
        complexityLevel: 'intermediate',
        securityCheck: true,
        includeExamples: true,
    },
};

// Generic cache service
class AICache<T> {
    private cache = new Map<string, { data: T; timestamp: Date }>();
    private maxAge: number;

    constructor(maxAgeMinutes: number = AI_CONSTANTS.CACHE_DURATION_MINUTES) {
        this.maxAge = maxAgeMinutes * 60 * 1000;
    }

    get(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp.getTime() > this.maxAge) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    set(key: string, data: T): void {
        this.cache.set(key, { data, timestamp: new Date() });
    }

    clear(): void {
        this.cache.clear();
    }

    cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp.getTime() > this.maxAge) {
                this.cache.delete(key);
            }
        }
    }
}

// Error handling
class AIError extends Error {
    constructor(
        message: string,
        public code?: string,
        public originalError?: Error
    ) {
        super(message);
        this.name = 'AIError';
    }
}

// Request deduplication
class RequestDeduplicator {
    private pending = new Map<string, Promise<any>>();

    async execute<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
        if (this.pending.has(key)) {
            return this.pending.get(key) as Promise<T>;
        }

        const promise = requestFn();
        this.pending.set(key, promise);

        try {
            return await promise;
        } finally {
            this.pending.delete(key);
        }
    }

    clear(): void {
        this.pending.clear();
    }
}

export const useAI = (config: Partial<AIHookConfig> = {}) => {
    // Merge config with defaults
    const hookConfig: AIHookConfig = {
        ...DEFAULT_CONFIG,
        ...config,
    };

    // State
    const [state, setState] = useState<AIAnalysisState>({
        isAnalyzing: false,
        isEnhancing: false,
        isClassifying: false,
        progress: 0,
        suggestions: [],
        cacheHits: 0,
        cacheMisses: 0,
    });

    // Refs and utilities
    const activeRequests = useRef<Set<string>>(new Set());
    const abortController = useRef<AbortController | null>(null);
    const analysisCache = useRef(new AICache<AIAnalysis>());
    const classificationCache = useRef(new AICache<ContentClassification>());
    const enhancementCache = useRef(new AICache<EnhancedContent>());
    const deduplicator = useRef(new RequestDeduplicator());

    // Generate request ID
    const generateRequestId = useCallback((content: string, operation: string): string => {
        const hash = btoa(content.substring(0, 50)).replace(/[^a-zA-Z0-9]/g, '');
        return `${operation}_${hash}_${Date.now()}`;
    }, []);

    // Update progress
    const updateProgress = useCallback((progress: number, operation?: string) => {
        setState((prev: AIAnalysisState) => ({
            ...prev,
            progress: Math.min(100, Math.max(0, progress)),
            ...(operation && { currentOperation: operation }),
        }));
    }, []);

    // Handle errors
    const handleError = useCallback((error: unknown, context?: string): AIError => {
        const aiError = new AIError(
            error instanceof Error ? error.message : 'Unknown AI error',
            'AI_ERROR',
            error instanceof Error ? error : undefined
        );

        logger.error(`AI Error in ${context}:`, aiError);

        setState((prev: AIAnalysisState) => ({
            ...prev,
            error: aiError.message,
            isAnalyzing: false,
            isEnhancing: false,
            isClassifying: false,
            progress: 0,
        }));

        return aiError;
    }, []);

    // IPC wrapper with proper error handling
    const invokeIPC = useCallback(async <T>(
        channel: string,
        ...args: any[]
    ): Promise<T> => {
        try {
            // Check if window.electron exists
            if (!window.electron?.ipcRenderer?.invoke) {
                throw new Error('Electron IPC not available');
            }

            const result = await window.electron.ipcRenderer.invoke(channel, ...args);
            
            if (result && result.error) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            throw new AIError(
                `IPC call failed for ${channel}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'IPC_ERROR',
                error instanceof Error ? error : undefined
            );
        }
    }, []);

    // Analyze content
    const analyzeContent = useCallback(async (
        content: string,
        context?: any
    ): Promise<AIAnalysis> => {
        if (!content.trim()) {
            throw new AIError('Content cannot be empty', 'EMPTY_CONTENT');
        }

        const requestId = generateRequestId(content, 'analyze');
        const cacheKey = `analyze_${content.substring(0, 100)}`;

        // Check cache first
        if (hookConfig.cacheResults) {
            const cached = analysisCache.current.get(cacheKey);
            if (cached) {
                setState((prev: AIAnalysisState) => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
                return cached;
            }
            setState((prev: AIAnalysisState) => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
        }

        return deduplicator.current.execute(cacheKey, async () => {
            if (activeRequests.current.size >= hookConfig.maxConcurrentRequests) {
                throw new AIError('Too many concurrent requests', 'CONCURRENCY_LIMIT');
            }

            activeRequests.current.add(requestId);
            setState((prev: AIAnalysisState) => ({
                ...prev,
                isAnalyzing: true,
                currentOperation: 'Analyzing content...',
                progress: 10,
            }));

            try {
                updateProgress(30, 'Processing content...');
                
                // Use IPC instead of window.knoux
                const result = await invokeIPC<any>('ai:analyze-content', {
                    content,
                    context,
                    timeout: hookConfig.timeoutMs,
                });

                updateProgress(80, 'Finalizing analysis...');

                const analysis: AIAnalysis = {
                    content,
                    sentiment: result.sentiment || 'neutral',
                    keywords: result.keywords || [],
                    entities: result.entities || [],
                    summary: result.summary || '',
                    confidence: result.confidence || 0.5,
                    processingTimeMs: result.processingTimeMs || 0,
                };

                // Cache result
                if (hookConfig.cacheResults) {
                    analysisCache.current.set(cacheKey, analysis);
                }

                setState((prev: AIAnalysisState) => ({
                    ...prev,
                    lastAnalysis: analysis,
                    isAnalyzing: false,
                    progress: 100,
                }));

                updateProgress(100);
                return analysis;

            } catch (error) {
                throw handleError(error, 'analyzeContent');
            } finally {
                activeRequests.current.delete(requestId);
                if (state.isAnalyzing) {
                    setState((prev: AIAnalysisState) => ({
                        ...prev,
                        isAnalyzing: false,
                        progress: 0,
                    }));
                }
            }
        });
    }, [generateRequestId, hookConfig, invokeIPC, handleError, updateProgress, state.isAnalyzing]);

    // Classify content
    const classifyContent = useCallback(async (
        content: string
    ): Promise<ContentClassification> => {
        if (!content.trim()) {
            throw new AIError('Content cannot be empty', 'EMPTY_CONTENT');
        }

        const requestId = generateRequestId(content, 'classify');
        const cacheKey = `classify_${content.substring(0, 100)}`;

        // Check cache first
        if (hookConfig.cacheResults) {
            const cached = classificationCache.current.get(cacheKey);
            if (cached) {
                setState((prev: AIAnalysisState) => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
                return cached;
            }
            setState((prev: AIAnalysisState) => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
        }

        return deduplicator.current.execute(cacheKey, async () => {
            if (activeRequests.current.size >= hookConfig.maxConcurrentRequests) {
                throw new AIError('Too many concurrent requests', 'CONCURRENCY_LIMIT');
            }

            activeRequests.current.add(requestId);
            setState((prev: AIAnalysisState) => ({
                ...prev,
                isClassifying: true,
                currentOperation: 'Classifying content...',
                progress: 10,
            }));

            try {
                updateProgress(50, 'Analyzing content type...');

                // Use IPC instead of window.knoux
                const result = await invokeIPC<any>('ai:classify-content', {
                    content,
                    timeout: hookConfig.timeoutMs,
                });

                const classification: ContentClassification = {
                    type: result.type || 'text',
                    language: result.language || 'unknown',
                    complexity: result.complexity || 'medium',
                    wordCount: result.wordCount || content.split(/\s+/).length,
                    confidence: result.confidence || 0.5,
                };

                // Cache result
                if (hookConfig.cacheResults) {
                    classificationCache.current.set(cacheKey, classification);
                }

                setState((prev: AIAnalysisState) => ({
                    ...prev,
                    lastClassification: classification,
                    isClassifying: false,
                    progress: 100,
                }));

                return classification;

            } catch (error) {
                throw handleError(error, 'classifyContent');
            } finally {
                activeRequests.current.delete(requestId);
                if (state.isClassifying) {
                    setState((prev: AIAnalysisState) => ({
                        ...prev,
                        isClassifying: false,
                        progress: 0,
                    }));
                }
            }
        });
    }, [generateRequestId, hookConfig, invokeIPC, handleError, updateProgress, state.isClassifying]);

    // Enhance content
    const enhanceContent = useCallback(async (
        content: string,
        options?: Partial<EnhancementOptions>
    ): Promise<EnhancedContent> => {
        if (!content.trim()) {
            throw new AIError('Content cannot be empty', 'EMPTY_CONTENT');
        }

        const requestId = generateRequestId(content, 'enhance');
        const cacheKey = `enhance_${content.substring(0, 100)}_${JSON.stringify(options)}`;

        // Check cache first
        if (hookConfig.cacheResults) {
            const cached = enhancementCache.current.get(cacheKey);
            if (cached) {
                setState((prev: AIAnalysisState) => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
                return cached;
            }
            setState((prev: AIAnalysisState) => ({ ...prev, cacheMisses: prev.cacheMisses + 1 }));
        }

        return deduplicator.current.execute(cacheKey, async () => {
            if (activeRequests.current.size >= hookConfig.maxConcurrentRequests) {
                throw new AIError('Too many concurrent requests', 'CONCURRENCY_LIMIT');
            }

            activeRequests.current.add(requestId);
            setState((prev: AIAnalysisState) => ({
                ...prev,
                isEnhancing: true,
                currentOperation: 'Enhancing content...',
                progress: 10,
            }));

            try {
                const enhancementOptions = {
                    ...hookConfig.defaultEnhancementOptions,
                    ...options,
                };

                updateProgress(30, 'Analyzing content...');

                // Optional classification
                let classification: ContentClassification | undefined;
                try {
                    classification = await classifyContent(content);
                } catch (error) {
                    logger.warn('Classification failed during enhancement:', error);
                }

                updateProgress(60, 'Enhancing content...');

                // Use IPC instead of window.knoux
                const result = await invokeIPC<any>('ai:enhance-content', {
                    content,
                    options: enhancementOptions,
                    classification,
                    timeout: hookConfig.timeoutMs,
                });

                updateProgress(90, 'Finalizing enhancement...');

                const enhanced: EnhancedContent = {
                    original: content,
                    enhanced: result.enhanced || content,
                    improvements: result.improvements || [],
                    confidence: result.confidence || 0.5,
                    processingTimeMs: result.processingTimeMs || 0,
                    suggestions: result.suggestions || [],
                };

                // Cache result
                if (hookConfig.cacheResults) {
                    enhancementCache.current.set(cacheKey, enhanced);
                }

                setState((prev: AIAnalysisState) => ({
                    ...prev,
                    suggestions: enhanced.suggestions,
                    isEnhancing: false,
                    progress: 100,
                }));

                return enhanced;

            } catch (error) {
                throw handleError(error, 'enhanceContent');
            } finally {
                activeRequests.current.delete(requestId);
                if (state.isEnhancing) {
                    setState((prev: AIAnalysisState) => ({
                        ...prev,
                        isEnhancing: false,
                        progress: 0,
                    }));
                }
            }
        });
    }, [generateRequestId, hookConfig, invokeIPC, handleError, updateProgress, classifyContent, state.isEnhancing]);

    // Clear error
    const clearError = useCallback(() => {
        setState((prev: AIAnalysisState) => ({ ...prev, error: undefined }));
    }, []);

    // Clear all caches
    const clearCaches = useCallback(() => {
        analysisCache.current.clear();
        classificationCache.current.clear();
        enhancementCache.current.clear();
        deduplicator.current.clear();
        logger.info('All AI caches cleared');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortController.current?.abort();
            activeRequests.current.clear();
            clearCaches();
            logger.debug('AI hook cleanup completed');
        };
    }, [clearCaches]);

    // Periodic cache cleanup
    useEffect(() => {
        const interval = setInterval(() => {
            analysisCache.current.cleanup();
            classificationCache.current.cleanup();
            enhancementCache.current.cleanup();
        }, 5 * 60 * 1000); // Every 5 minutes

        return () => clearInterval(interval);
    }, []);

    return {
        // State
        ...state,

        // Actions
        analyzeContent,
        classifyContent,
        enhanceContent,
        clearError,
        clearCaches,

        // Utilities
        isReady: true,
        config: hookConfig,
    };
};
