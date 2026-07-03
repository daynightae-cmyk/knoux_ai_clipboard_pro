/**
 * Context-Aware Snippets - Revolutionary Smart Snippets System
 * Snippets that adapt, learn, and transform based on context
 */

interface SmartSnippet {
  id: string;
  name: string;
  template: string;
  variables: SnippetVariable[];
  triggers: string[];
  contexts: ContextRule[];
  category: string;
  usage: number;
  lastUsed: number;
  aiEnhanced: boolean;
  dynamic: boolean;
}

interface SnippetVariable {
  name: string;
  type: 'text' | 'date' | 'time' | 'user' | 'app' | 'ai' | 'dynamic';
  defaultValue?: string;
  transformer?: string;
  aiGenerated?: boolean;
}

interface ContextRule {
  condition: string;
  value: any;
  transformation?: string;
  priority: number;
}

interface SnippetContext {
  app: string;
  language: string;
  timeOfDay: string;
  dayOfWeek: string;
  userMood: string;
  workMode: string;
  projectType: string;
  recentActivity: string[];
}

class ContextAwareSnippets {
  private snippets: Map<string, SmartSnippet> = new Map();
  private contextEngine: ContextEngine;
  private aiTransformer: AITransformer;
  private usageAnalytics: UsageAnalytics;

  constructor() {
    this.contextEngine = new ContextEngine();
    this.aiTransformer = new AITransformer();
    this.usageAnalytics = new UsageAnalytics();
    this.initializeDefaultSnippets();
  }

  // 🎯 Main Snippet Processing
  async processSnippet(snippetId: string, context?: SnippetContext): Promise<string> {
    const snippet = this.snippets.get(snippetId);
    if (!snippet) throw new Error('Snippet not found');

    // Get current context
    const currentContext = context || await this.contextEngine.getCurrentContext();
    
    // Apply context rules
    const processedTemplate = await this.applyContextRules(snippet, currentContext);
    
    // Process variables
    const result = await this.processVariables(processedTemplate, snippet.variables, currentContext);
    
    // AI enhancement if enabled
    const finalResult = snippet.aiEnhanced 
      ? await this.aiTransformer.enhance(result, currentContext)
      : result;
    
    // Update usage analytics
    this.usageAnalytics.recordUsage(snippetId, currentContext);
    
    return finalResult;
  }

  // 🧠 Smart Snippet Suggestions
  async getSuggestions(input: string, context?: SnippetContext): Promise<SmartSnippet[]> {
    const currentContext = context || await this.contextEngine.getCurrentContext();
    
    const suggestions: Array<{ snippet: SmartSnippet; score: number }> = [];
    
    for (const snippet of this.snippets.values()) {
      let score = 0;
      
      // Trigger matching
      const triggerMatch = snippet.triggers.some(trigger => 
        input.toLowerCase().includes(trigger.toLowerCase())
      );
      if (triggerMatch) score += 0.4;
      
      // Context matching
      const contextScore = this.calculateContextScore(snippet, currentContext);
      score += contextScore * 0.3;
      
      // Usage frequency
      const usageScore = Math.min(snippet.usage / 100, 1);
      score += usageScore * 0.2;
      
      // Recency bonus
      const recencyScore = this.calculateRecencyScore(snippet.lastUsed);
      score += recencyScore * 0.1;
      
      if (score > 0.3) {
        suggestions.push({ snippet, score });
      }
    }
    
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(s => s.snippet);
  }

  // 🔄 Dynamic Variable Processing
  private async processVariables(
    template: string, 
    variables: SnippetVariable[], 
    context: SnippetContext
  ): Promise<string> {
    let result = template;
    
    for (const variable of variables) {
      const placeholder = `{${variable.name}}`;
      if (!result.includes(placeholder)) continue;
      
      let value = await this.resolveVariable(variable, context);
      
      // Apply transformer if specified
      if (variable.transformer) {
        value = await this.applyTransformer(value, variable.transformer, context);
      }
      
      result = result.replace(new RegExp(`\\{${variable.name}\\}`, 'g'), value);
    }
    
    return result;
  }

  private async resolveVariable(variable: SnippetVariable, context: SnippetContext): Promise<string> {
    switch (variable.type) {
      case 'date':
        return this.formatDate(new Date(), variable.defaultValue);
      
      case 'time':
        return this.formatTime(new Date(), variable.defaultValue);
      
      case 'user':
        return await this.getUserInfo(variable.name);
      
      case 'app':
        return context.app || 'Unknown App';
      
      case 'ai':
        return await this.aiTransformer.generateVariable(variable.name, context);
      
      case 'dynamic':
        return await this.resolveDynamicVariable(variable.name, context);
      
      default:
        return variable.defaultValue || '';
    }
  }

  // 🎨 Context Rules Engine
  private async applyContextRules(snippet: SmartSnippet, context: SnippetContext): Promise<string> {
    let template = snippet.template;
    
    // Sort rules by priority
    const sortedRules = snippet.contexts.sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      if (await this.evaluateCondition(rule.condition, context)) {
        if (rule.transformation) {
          template = await this.applyTransformation(template, rule.transformation, context);
        }
      }
    }
    
    return template;
  }

  private async evaluateCondition(condition: string, context: SnippetContext): Promise<boolean> {
    // Simple condition evaluation
    try {
      // Replace context variables in condition
      let evaluableCondition = condition
        .replace(/\$app/g, `"${context.app}"`)
        .replace(/\$timeOfDay/g, `"${context.timeOfDay}"`)
        .replace(/\$dayOfWeek/g, `"${context.dayOfWeek}"`)
        .replace(/\$workMode/g, `"${context.workMode}"`)
        .replace(/\$language/g, `"${context.language}"`);
      
      // Safe evaluation (in real implementation, use a proper expression evaluator)
      return eval(evaluableCondition);
    } catch (error) {
      console.warn('Failed to evaluate condition:', condition, error);
      return false;
    }
  }

  // 🚀 AI-Powered Enhancements
  async createAISnippet(description: string, context?: SnippetContext): Promise<SmartSnippet> {
    const currentContext = context || await this.contextEngine.getCurrentContext();
    
    const aiGenerated = await this.aiTransformer.generateSnippet(description, currentContext);
    
    const snippet: SmartSnippet = {
      id: this.generateId(),
      name: aiGenerated.name,
      template: aiGenerated.template,
      variables: aiGenerated.variables,
      triggers: aiGenerated.triggers,
      contexts: aiGenerated.contexts,
      category: 'ai-generated',
      usage: 0,
      lastUsed: Date.now(),
      aiEnhanced: true,
      dynamic: true
    };
    
    this.snippets.set(snippet.id, snippet);
    return snippet;
  }

  // 📊 Smart Analytics & Learning
  async optimizeSnippets(): Promise<void> {
    const analytics = this.usageAnalytics.getAnalytics();
    
    // Remove unused snippets
    const unusedThreshold = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days
    for (const [id, snippet] of this.snippets) {
      if (snippet.usage === 0 && snippet.lastUsed < unusedThreshold) {
        this.snippets.delete(id);
      }
    }
    
    // Enhance popular snippets with AI
    const popularSnippets = Array.from(this.snippets.values())
      .filter(s => s.usage > 10 && !s.aiEnhanced)
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);
    
    for (const snippet of popularSnippets) {
      await this.enhanceSnippetWithAI(snippet);
    }
    
    console.log('🎯 Snippets optimized based on usage analytics');
  }

  private async enhanceSnippetWithAI(snippet: SmartSnippet): Promise<void> {
    const enhanced = await this.aiTransformer.enhanceSnippet(snippet);
    
    snippet.template = enhanced.template;
    snippet.variables = enhanced.variables;
    snippet.contexts = enhanced.contexts;
    snippet.aiEnhanced = true;
  }

  // 🎛️ Snippet Management
  createSnippet(data: Partial<SmartSnippet>): SmartSnippet {
    const snippet: SmartSnippet = {
      id: data.id || this.generateId(),
      name: data.name || 'Untitled Snippet',
      template: data.template || '',
      variables: data.variables || [],
      triggers: data.triggers || [],
      contexts: data.contexts || [],
      category: data.category || 'custom',
      usage: 0,
      lastUsed: Date.now(),
      aiEnhanced: data.aiEnhanced || false,
      dynamic: data.dynamic || false
    };
    
    this.snippets.set(snippet.id, snippet);
    return snippet;
  }

  updateSnippet(id: string, updates: Partial<SmartSnippet>): boolean {
    const snippet = this.snippets.get(id);
    if (!snippet) return false;
    
    Object.assign(snippet, updates);
    return true;
  }

  deleteSnippet(id: string): boolean {
    return this.snippets.delete(id);
  }

  getAllSnippets(): SmartSnippet[] {
    return Array.from(this.snippets.values());
  }

  getSnippetsByCategory(category: string): SmartSnippet[] {
    return Array.from(this.snippets.values())
      .filter(s => s.category === category);
  }

  // 🔧 Default Snippets Initialization
  private initializeDefaultSnippets(): void {
    const defaultSnippets: Partial<SmartSnippet>[] = [
      {
        name: 'React Component',
        template: `import React from 'react';

interface {componentName}Props {
  // Props interface
}

const {componentName}: React.FC<{componentName}Props> = () => {
  return (
    <div>
      <h1>{greeting}</h1>
    </div>
  );
};

export default {componentName};`,
        variables: [
          { name: 'componentName', type: 'text', defaultValue: 'MyComponent' },
          { name: 'greeting', type: 'ai', defaultValue: 'Hello World' }
        ],
        triggers: ['react', 'component', 'tsx'],
        contexts: [
          { condition: '$app.includes("code")', value: true, priority: 1 },
          { condition: '$language === "typescript"', value: true, priority: 2 }
        ],
        category: 'react',
        aiEnhanced: true
      },
      
      {
        name: 'Meeting Notes',
        template: `# Meeting Notes - {date}

**Attendees:** {attendees}
**Time:** {time}
**Duration:** {duration}

## Agenda
{agenda}

## Discussion Points
{discussion}

## Action Items
{actionItems}

## Next Steps
{nextSteps}`,
        variables: [
          { name: 'date', type: 'date', defaultValue: 'YYYY-MM-DD' },
          { name: 'time', type: 'time', defaultValue: 'HH:mm' },
          { name: 'attendees', type: 'ai', defaultValue: 'Team members' },
          { name: 'duration', type: 'text', defaultValue: '1 hour' },
          { name: 'agenda', type: 'ai' },
          { name: 'discussion', type: 'ai' },
          { name: 'actionItems', type: 'ai' },
          { name: 'nextSteps', type: 'ai' }
        ],
        triggers: ['meeting', 'notes', 'agenda'],
        contexts: [
          { condition: '$timeOfDay === "afternoon"', value: true, priority: 1 },
          { condition: '$workMode === "meeting"', value: true, priority: 2 }
        ],
        category: 'productivity'
      },
      
      {
        name: 'API Endpoint',
        template: `// {method} {endpoint}
app.{methodLower}('{endpoint}', async (req, res) => {
  try {
    {implementation}
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});`,
        variables: [
          { name: 'method', type: 'text', defaultValue: 'GET' },
          { name: 'methodLower', type: 'dynamic', transformer: 'lowercase' },
          { name: 'endpoint', type: 'text', defaultValue: '/api/endpoint' },
          { name: 'implementation', type: 'ai', defaultValue: '// Implementation logic here' }
        ],
        triggers: ['api', 'endpoint', 'route'],
        contexts: [
          { condition: '$app.includes("code")', value: true, priority: 1 },
          { condition: '$projectType === "backend"', value: true, priority: 2 }
        ],
        category: 'backend'
      },
      
      {
        name: 'CSS Grid Layout',
        template: `.{className} {
  display: grid;
  grid-template-columns: {columns};
  grid-template-rows: {rows};
  gap: {gap};
  {additionalStyles}
}`,
        variables: [
          { name: 'className', type: 'text', defaultValue: 'grid-container' },
          { name: 'columns', type: 'text', defaultValue: 'repeat(3, 1fr)' },
          { name: 'rows', type: 'text', defaultValue: 'auto' },
          { name: 'gap', type: 'text', defaultValue: '1rem' },
          { name: 'additionalStyles', type: 'ai' }
        ],
        triggers: ['css', 'grid', 'layout'],
        contexts: [
          { condition: '$app.includes("code") || $app.includes("design")', value: true, priority: 1 }
        ],
        category: 'css'
      }
    ];
    
    defaultSnippets.forEach(snippetData => {
      this.createSnippet(snippetData);
    });
    
    console.log('🎯 Context-Aware Snippets initialized with default templates');
  }

  // 🔄 Utility Functions
  private generateId(): string {
    return 'snippet_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private formatDate(date: Date, format?: string): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    switch (format) {
      case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
      default: return `${year}-${month}-${day}`;
    }
  }

  private formatTime(date: Date, format?: string): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  }

  private async getUserInfo(field: string): Promise<string> {
    // In real implementation, get from user profile
    const userInfo: Record<string, string> = {
      name: 'Abu Retaj',
      email: 'abu.retaj@knoux.com',
      company: 'Knoux',
      role: 'Developer'
    };
    
    return userInfo[field] || '';
  }

  private async resolveDynamicVariable(name: string, context: SnippetContext): Promise<string> {
    // Dynamic variable resolution based on context
    switch (name) {
      case 'projectName':
        return context.projectType || 'MyProject';
      case 'currentFile':
        return 'current-file.ts';
      case 'timestamp':
        return Date.now().toString();
      default:
        return '';
    }
  }

  private async applyTransformer(value: string, transformer: string, context: SnippetContext): Promise<string> {
    switch (transformer) {
      case 'uppercase':
        return value.toUpperCase();
      case 'lowercase':
        return value.toLowerCase();
      case 'capitalize':
        return value.charAt(0).toUpperCase() + value.slice(1);
      case 'camelCase':
        return value.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
      case 'kebabCase':
        return value.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
      default:
        return value;
    }
  }

  private async applyTransformation(template: string, transformation: string, context: SnippetContext): Promise<string> {
    // Apply context-based transformations
    return template;
  }

  private calculateContextScore(snippet: SmartSnippet, context: SnippetContext): number {
    let score = 0;
    
    for (const rule of snippet.contexts) {
      if (this.evaluateCondition(rule.condition, context)) {
        score += rule.priority * 0.1;
      }
    }
    
    return Math.min(score, 1);
  }

  private calculateRecencyScore(lastUsed: number): number {
    const daysSinceUsed = (Date.now() - lastUsed) / (24 * 60 * 60 * 1000);
    return Math.max(0, 1 - (daysSinceUsed / 30)); // Decay over 30 days
  }
}

// 🧠 Context Engine
class ContextEngine {
  async getCurrentContext(): Promise<SnippetContext> {
    return {
      app: 'VS Code',
      language: 'typescript',
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: new Date().toLocaleDateString('en', { weekday: 'long' }),
      userMood: 'productive',
      workMode: 'development',
      projectType: 'frontend',
      recentActivity: ['coding', 'debugging']
    };
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
}

// 🤖 AI Transformer
class AITransformer {
  async enhance(content: string, context: SnippetContext): Promise<string> {
    // AI enhancement logic
    return content;
  }

  async generateVariable(name: string, context: SnippetContext): Promise<string> {
    // AI variable generation
    return `AI-generated ${name}`;
  }

  async generateSnippet(description: string, context: SnippetContext): Promise<any> {
    // AI snippet generation
    return {
      name: 'AI Generated Snippet',
      template: '// AI generated template',
      variables: [],
      triggers: ['ai'],
      contexts: []
    };
  }

  async enhanceSnippet(snippet: SmartSnippet): Promise<any> {
    // AI snippet enhancement
    return snippet;
  }
}

// 📊 Usage Analytics
class UsageAnalytics {
  private usage: Map<string, any> = new Map();

  recordUsage(snippetId: string, context: SnippetContext): void {
    const record = this.usage.get(snippetId) || { count: 0, contexts: [] };
    record.count++;
    record.contexts.push({ ...context, timestamp: Date.now() });
    
    // Keep only recent 100 usage records
    if (record.contexts.length > 100) {
      record.contexts = record.contexts.slice(-50);
    }
    
    this.usage.set(snippetId, record);
  }

  getAnalytics(): any {
    return {
      totalUsage: Array.from(this.usage.values()).reduce((sum, record) => sum + record.count, 0),
      mostUsedSnippets: this.getMostUsedSnippets(),
      usageByContext: this.getUsageByContext(),
      usageByTime: this.getUsageByTime()
    };
  }

  private getMostUsedSnippets(): string[] {
    return Array.from(this.usage.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(entry => entry[0]);
  }

  private getUsageByContext(): any {
    return {};
  }

  private getUsageByTime(): any {
    return {};
  }
}

export const contextAwareSnippets = new ContextAwareSnippets();