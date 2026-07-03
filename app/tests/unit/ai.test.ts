/**
 * AI Engine Tests
 * Comprehensive tests for AI functionality
 */

import { AIEngine } from '@backend/ai/ai-engine';
import { Classifier } from '@backend/ai/classifier';
import { Enhancer } from '@backend/ai/enhancer';
import { Summarizer } from '@backend/ai/summarizer';
import { logger } from '@shared/logger';

describe('AI Engine', () => {
  let aiEngine: AIEngine;
  let classifier: Classifier;
  let enhancer: Enhancer;
  let summarizer: Summarizer;

  beforeEach(() => {
    aiEngine = new AIEngine();
    classifier = new Classifier();
    enhancer = new Enhancer();
    summarizer = new Summarizer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize AI engine successfully', async () => {
      const result = await aiEngine.initialize();
      expect(result.success).toBe(true);
      expect(aiEngine.isReady()).toBe(true);
    });

    it('should handle initialization failure', async () => {
      // Mock failure scenario
      jest.spyOn(aiEngine, 'loadModels').mockRejectedValue(new Error('Model load failed'));
      
      const result = await aiEngine.initialize();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Model load failed');
    });
  });

  describe('Content Classification', () => {
    const testCases = [
      {
        name: 'should classify text content',
        input: 'This is a regular text paragraph for testing.',
        expected: { type: 'text', confidence: expect.any(Number) }
      },
      {
        name: 'should classify code content',
        input: 'function hello() { return "world"; }',
        expected: { type: 'code', language: 'javascript', confidence: expect.any(Number) }
      },
      {
        name: 'should classify URL',
        input: 'https://github.com/knoux/clipboard-ai',
        expected: { type: 'link', confidence: expect.any(Number) }
      },
      {
        name: 'should classify sensitive data',
        input: 'Credit card: 4111-1111-1111-1111',
        expected: { type: 'sensitive', category: 'financial', confidence: expect.any(Number) }
      }
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(name, async () => {
        const result = await classifier.classify(input);
        expect(result).toMatchObject(expected);
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });
  });

  describe('Text Enhancement', () => {
    it('should enhance text grammar and style', async () => {
      const input = 'i is going to the store';
      const result = await enhancer.enhanceText(input);
      
      expect(result.success).toBe(true);
      expect(result.data?.content).toBeDefined();
      expect(result.data?.improvements).toContain('grammar');
      expect(result.metadata?.processingTime).toBeGreaterThan(0);
    });

    it('should maintain original meaning', async () => {
      const input = 'The quick brown fox jumps over the lazy dog';
      const result = await enhancer.enhanceText(input);
      
      expect(result.data?.content.toLowerCase()).toContain('quick brown fox');
      expect(result.data?.content.toLowerCase()).toContain('lazy dog');
    });

    it('should handle empty input', async () => {
      const result = await enhancer.enhanceText('');
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });
  });

  describe('Text Summarization', () => {
    const longText = `
      Artificial intelligence (AI) is intelligence demonstrated by machines, 
      as opposed to intelligence displayed by animals or humans. 
      Leading AI textbooks define the field as the study of "intelligent agents": 
      any system that perceives its environment and takes actions that maximize 
      its chance of achieving its goals. Some popular accounts use the term 
      "artificial intelligence" to describe machines that mimic "cognitive" 
      functions that humans associate with the human mind, such as "learning" 
      and "problem solving". However, this definition is rejected by major AI researchers.
      
      AI applications include advanced web search engines, recommendation systems, 
      understanding human speech, self-driving cars, automated decision-making, 
      and competing at the highest level in strategic game systems. 
      As machines become increasingly capable, tasks considered to require 
      "intelligence" are often removed from the definition of AI, a phenomenon 
      known as the AI effect. For instance, optical character recognition is 
      frequently excluded from things considered to be AI, having become a routine technology.
    `;

    it('should create concise summary', async () => {
      const result = await summarizer.summarize(longText, { maxLength: 100 });
      
      expect(result.success).toBe(true);
      expect(result.data?.summary.length).toBeLessThan(150);
      expect(result.data?.summary).toContain('AI');
      expect(result.data?.keyPoints.length).toBeGreaterThan(0);
    });

    it('should extract key points', async () => {
      const result = await summarizer.summarize(longText, { extractKeyPoints: true });
      
      expect(result.data?.keyPoints.length).toBeGreaterThan(0);
      expect(result.data?.keyPoints.length).toBeLessThanOrEqual(5);
      result.data?.keyPoints.forEach(point => {
        expect(point).toBeTruthy();
        expect(point.length).toBeLessThan(100);
      });
    });

    it('should respect max length parameter', async () => {
      const maxLength = 50;
      const result = await summarizer.summarize(longText, { maxLength });
      
      expect(result.data?.summary.length).toBeLessThanOrEqual(maxLength * 1.2); // Allow some buffer
    });
  });

  describe('Batch Processing', () => {
    it('should process multiple items efficiently', async () => {
      const items = [
        'First test item',
        'Second test item with more content',
        'Third item for batch processing'
      ];

      const startTime = Date.now();
      const results = await aiEngine.batchProcess(items, 'classify');
      const processingTime = Date.now() - startTime;

      expect(results.length).toBe(items.length);
      expect(results.every(r => r.success)).toBe(true);
      expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle batch processing errors gracefully', async () => {
      const items = ['valid', '', 'another valid'];
      
      const results = await aiEngine.batchProcess(items, 'enhance');
      
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false); // Empty string should fail
      expect(results[2].success).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should process within acceptable time limits', async () => {
      const testText = 'A'.repeat(1000); // 1000 character text
      
      const startTime = Date.now();
      const result = await enhancer.enhanceText(testText);
      const processingTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(2000); // Should process within 2 seconds
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        classifier.classify('Test content for concurrent processing')
      );

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      expect(results.length).toBe(5);
      expect(results.every(r => r.type === 'text')).toBe(true);
      expect(totalTime).toBeLessThan(3000); // 5 concurrent within 3 seconds
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      jest.spyOn(enhancer, 'callAIAPI').mockRejectedValue(new Error('Network error'));
      
      const result = await enhancer.enhanceText('test');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Network');
      expect(result.fallbackUsed).toBe(true); // Should use fallback
    });

    it('should handle invalid input', async () => {
      const invalidInputs = [null, undefined, 123, {}, []];
      
      for (const input of invalidInputs) {
        const result = await classifier.classify(input as any);
        expect(result.type).toBe('unknown');
        expect(result.confidence).toBe(0);
      }
    });

    it('should log errors appropriately', async () => {
      const errorSpy = jest.spyOn(logger, 'error');
      
      jest.spyOn(classifier, 'extractFeatures').mockImplementation(() => {
        throw new Error('Feature extraction failed');
      });

      await classifier.classify('test');
      
      expect(errorSpy).toHaveBeenCalledWith(
        'Classification failed',
        expect.any(Error)
      );
    });
  });

  describe('Configuration', () => {
    it('should respect confidence threshold', async () => {
      classifier.setConfidenceThreshold(0.9);
      
      const result = await classifier.classify('Borderline content');
      
      if (result.confidence < 0.9) {
        expect(result.type).toBe('unknown');
      }
    });

    it('should allow model switching', async () => {
      const originalModel = aiEngine.getCurrentModel();
      
      await aiEngine.switchModel('fast-model');
      expect(aiEngine.getCurrentModel()).toBe('fast-model');
      
      await aiEngine.switchModel(originalModel);
      expect(aiEngine.getCurrentModel()).toBe(originalModel);
    });
  });
});
