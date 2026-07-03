import { DatabaseService } from '../services/databaseService';
import { AIService } from '../services/aiService';
import { Logger } from '../../shared/logger';

interface MemoryRecord {
  id: string;
  content: string;
  type: string;
  tags: string[];
  context: {
    app: string;
    time: number;
    dayOfWeek: string;
    hourOfDay: number;
  };
  importance: number;
  relationships: string[];
  createdAt: number;
  accessedCount: number;
}

interface ClipboardMetadata {
  application?: string;
  timestamp: number;
  windowTitle?: string;
  systemContext?: any;
}

interface Prediction {
  content: string;
  confidence: number;
  reasoning: string;
}

interface Suggestion {
  text: string;
  type: string;
  confidence: number;
}

export class AIMemoryBank {
  private static instance: AIMemoryBank;
  private db: DatabaseService;
  private aiService: AIService;
  private logger: Logger;

  private constructor() {
    this.db = DatabaseService.getInstance();
    this.aiService = AIService.getInstance();
    this.logger = new Logger('MemoryBank');
  }

  public static getInstance(): AIMemoryBank {
    if (!AIMemoryBank.instance) {
      AIMemoryBank.instance = new AIMemoryBank();
    }
    return AIMemoryBank.instance;
  }

  public async learnFromContent(content: string, metadata: ClipboardMetadata): Promise<void> {
    try {
      const analysis = await this.analyzeContent(content);
      
      const memory: MemoryRecord = {
        id: this.generateMemoryId(),
        content,
        type: analysis.type,
        tags: analysis.tags,
        context: {
          app: metadata.application || 'unknown',
          time: metadata.timestamp,
          dayOfWeek: this.getDayOfWeek(),
          hourOfDay: new Date().getHours()
        },
        importance: analysis.importance,
        relationships: [],
        createdAt: Date.now(),
        accessedCount: 0
      };

      await this.db.saveMemory(memory);
      await this.createNeuralConnections(memory);

      this.logger.info(`🧠 Learned: ${content.substring(0, 50)}...`);
    } catch (error) {
      this.logger.error('Failed to learn from content:', error);
    }
  }

  public async predictNextContent(): Promise<Prediction[]> {
    const predictions: Prediction[] = [];
    
    const recentMemories = await this.db.getRecentMemories(10);
    const currentHour = new Date().getHours();
    
    // Simple pattern-based predictions
    for (const memory of recentMemories) {
      if (memory.context.hourOfDay === currentHour) {
        predictions.push({
          content: memory.content,
          confidence: 0.7,
          reasoning: `Similar time pattern (${currentHour}:00)`
        });
      }
    }

    return predictions.slice(0, 5);
  }

  public async getSmartSuggestions(input: string): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    const similarContent = await this.findSimilarContent(input);
    
    for (const content of similarContent) {
      suggestions.push({
        text: content,
        type: 'similar',
        confidence: 0.8
      });
    }

    return suggestions.slice(0, 5);
  }

  private async analyzeContent(content: string): Promise<any> {
    return {
      type: this.detectContentType(content),
      tags: this.extractTags(content),
      importance: this.calculateImportance(content)
    };
  }

  private detectContentType(content: string): string {
    if (/^(function|class|const|let|var|import)/m.test(content)) return 'code';
    if (/https?:\/\//.test(content)) return 'url';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)) return 'email';
    return 'text';
  }

  private extractTags(content: string): string[] {
    const tags = [];
    if (content.length > 100) tags.push('long');
    if (/\d+/.test(content)) tags.push('numbers');
    if (/[A-Z]{2,}/.test(content)) tags.push('uppercase');
    return tags;
  }

  private calculateImportance(content: string): number {
    let score = 0.5;
    if (content.length > 50) score += 0.2;
    if (this.detectContentType(content) === 'code') score += 0.3;
    return Math.min(score, 1.0);
  }

  private async findSimilarContent(input: string): Promise<string[]> {
    const memories = await this.db.getAllMemories();
    const similar = memories
      .filter(m => this.calculateSimilarity(input, m.content) > 0.3)
      .map(m => m.content);
    
    return similar.slice(0, 3);
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private async createNeuralConnections(newMemory: MemoryRecord): Promise<void> {
    const recentMemories = await this.db.getRecentMemories(20);
    const connections: string[] = [];
    
    for (const memory of recentMemories) {
      if (memory.id === newMemory.id) continue;
      
      const similarity = this.calculateSimilarity(newMemory.content, memory.content);
      if (similarity > 0.3) {
        connections.push(memory.id);
      }
    }
    
    await this.db.updateMemory(newMemory.id, { relationships: connections });
  }

  private generateMemoryId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDayOfWeek(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }
}