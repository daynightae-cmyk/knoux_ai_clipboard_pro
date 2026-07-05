/**
 * Knoux Clipboard AI - AI Prompt Library
 * Safe prompt templates for content enhancement and analysis.
 */

import { createLogger } from "../../shared/logger";
import { ProgrammingLanguage } from "../../shared/enums";
import type { EnhancementOptions } from "./enhancer";

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  template: string;
  variables: string[];
  version: string;
  author?: string;
  tags: string[];
  usageCount: number;
  lastUsed?: Date;
  successRate?: number;
}

export type PromptCategory =
  | "chat"
  | "code_enhancement"
  | "text_enhancement"
  | "prompt_enhancement"
  | "code_analysis"
  | "text_analysis"
  | "security_analysis"
  | "summarization"
  | "translation"
  | "explanation"
  | "optimization"
  | "documentation"
  | "extraction";

export interface PromptVariables {
  [key: string]: string | number | boolean;
}

export interface PromptExecutionResult {
  templateId: string;
  input: string;
  output: string;
  variablesUsed: PromptVariables;
  processingTimeMs: number;
  success: boolean;
  error?: string;
  metadata: PromptMetadata;
}

export interface PromptMetadata {
  tokenCount: number;
  variableCount: number;
  category: PromptCategory;
  templateVersion: string;
  executionTimestamp: Date;
}

const ACTION_TEMPLATES: Array<{
  id: string;
  name: string;
  category: PromptCategory;
  description: string;
  template: string;
  tags: string[];
}> = [
  {
    id: "chat",
    name: "Chat",
    category: "chat",
    description: "General KNOUX clipboard assistant response.",
    template: "Respond as KNOUX AI Clipboard Pro with concise, useful guidance:\n\n{text}",
    tags: ["chat", "assistant"],
  },
  {
    id: "summarize",
    name: "Summarize",
    category: "summarization",
    description: "Summarize clipboard content.",
    template: "Summarize this clipboard content into concise professional bullets:\n\n{text}",
    tags: ["summary", "clipboard"],
  },
  {
    id: "enhance",
    name: "Enhance",
    category: "text_enhancement",
    description: "Improve clarity, grammar, and tone.",
    template: "Improve clarity, grammar, structure, and professional tone without changing meaning:\n\n{text}",
    tags: ["enhance", "text"],
  },
  {
    id: "rewrite",
    name: "Rewrite",
    category: "text_enhancement",
    description: "Rewrite content in a polished professional style.",
    template: "Rewrite this in a premium corporate KNOUX style without changing meaning:\n\n{text}",
    tags: ["rewrite", "style"],
  },
  {
    id: "translate",
    name: "Translate",
    category: "translation",
    description: "Translate content while preserving meaning.",
    template: "Translate this text into {targetLanguage} while preserving formatting and meaning:\n\n{text}",
    tags: ["translate"],
  },
  {
    id: "analyze",
    name: "Analyze",
    category: "text_analysis",
    description: "Analyze content for intent, structure, and risks.",
    template: "Analyze this content. Extract intent, entities, risks, action items, structure, and recommendations:\n\n{text}",
    tags: ["analyze"],
  },
  {
    id: "classify",
    name: "Classify",
    category: "text_analysis",
    description: "Classify clipboard content into tags.",
    template: "Classify this clipboard content. Return 3-6 short tags and a one-line reason:\n\n{text}",
    tags: ["classify", "tags"],
  },
  {
    id: "extract",
    name: "Extract",
    category: "extraction",
    description: "Extract structured data from content.",
    template: "Extract key points, dates, names, links, tasks, IDs, and structured data from this content:\n\n{text}",
    tags: ["extract"],
  },
  {
    id: "reply",
    name: "Reply",
    category: "text_enhancement",
    description: "Draft a professional reply.",
    template: "Write a professional reply based on this clipboard content:\n\n{text}",
    tags: ["reply"],
  },
  {
    id: "format",
    name: "Format",
    category: "optimization",
    description: "Format content as polished Markdown.",
    template: "Format this clipboard content into polished Markdown with clean structure:\n\n{text}",
    tags: ["format", "markdown"],
  },
  {
    id: "explain-code",
    name: "Explain Code",
    category: "code_analysis",
    description: "Explain a code or technical snippet.",
    template: "Explain this code or technical snippet clearly, including purpose, risks, and improvements:\n\n{text}",
    tags: ["code", "explain"],
  },
  {
    id: "commit-message",
    name: "Commit Message",
    category: "documentation",
    description: "Create a conventional commit message.",
    template: "Create a conventional commit message with subject and body for these changes:\n\n{text}",
    tags: ["git", "commit"],
  },
  {
    id: "readme-block",
    name: "README Block",
    category: "documentation",
    description: "Create a README section.",
    template: "Create a production-ready README section for this feature or project note:\n\n{text}",
    tags: ["readme", "docs"],
  },
  {
    id: "api-docs",
    name: "API Docs",
    category: "documentation",
    description: "Create API documentation.",
    template: "Create concise API documentation with endpoint, method, params, examples, and errors:\n\n{text}",
    tags: ["api", "docs"],
  },
  {
    id: "action-items",
    name: "Action Items",
    category: "extraction",
    description: "Extract clear action items.",
    template: "Extract clear action items with owners if present, priority, and due dates if present:\n\n{text}",
    tags: ["tasks", "actions"],
  },
  {
    id: "checklist",
    name: "Checklist",
    category: "extraction",
    description: "Convert content into a checklist.",
    template: "Convert this content into a practical checklist grouped by phase or priority:\n\n{text}",
    tags: ["checklist", "tasks"],
  },
];

export class PromptLibrary {
  private logger = createLogger({ module: "prompt-library" });
  private templates: Map<string, PromptTemplate> = new Map();
  private executionHistory: PromptExecutionResult[] = [];
  private isInitialized = false;
  private readonly maxHistorySize = 1000;

  constructor() {
    this.initializeDefaultTemplates();
    this.isInitialized = true;
  }

  private initializeDefaultTemplates(): void {
    this.templates.clear();
    const defaults: PromptTemplate[] = [
      ...ACTION_TEMPLATES.map((item) => this.toTemplate(item, ["text", "targetLanguage"])),
      this.toTemplate({
        id: "code_enhance_js_001",
        name: "JavaScript Code Enhancer",
        category: "code_enhancement",
        description: "Enhance JavaScript or TypeScript code safely.",
        template: "Improve this JavaScript or TypeScript code for correctness, readability, maintainability, and performance. Return only improved code:\n\n```javascript\n{code}\n```\n{tone_instruction}\n{complexity_instruction}",
        tags: ["javascript", "typescript", "code"],
      }, ["code", "tone_instruction", "complexity_instruction"]),
      this.toTemplate({
        id: "code_enhance_py_001",
        name: "Python Code Enhancer",
        category: "code_enhancement",
        description: "Enhance Python code safely.",
        template: "Improve this Python code for correctness, readability, maintainability, and PEP 8 style. Return only improved code:\n\n```python\n{code}\n```\n{tone_instruction}\n{complexity_instruction}",
        tags: ["python", "code"],
      }, ["code", "tone_instruction", "complexity_instruction"]),
      this.toTemplate({
        id: "code_enhance_ps_001",
        name: "PowerShell Code Enhancer",
        category: "code_enhancement",
        description: "Enhance PowerShell code safely.",
        template: "Improve this PowerShell script for safety, readability, and maintainability. Return only improved code:\n\n```powershell\n{code}\n```\n{tone_instruction}\n{complexity_instruction}\n{security_instruction}",
        tags: ["powershell", "code", "security"],
      }, ["code", "tone_instruction", "complexity_instruction", "security_instruction"]),
      this.toTemplate({
        id: "text_enhance_general_001",
        name: "General Text Enhancer",
        category: "text_enhancement",
        description: "Enhance general text.",
        template: "Improve the following text for clarity, structure, grammar, and {tone} tone without changing meaning:\n\n{text}\n{include_examples_instruction}\n{max_length_instruction}",
        tags: ["text", "enhance"],
      }, ["text", "tone", "include_examples_instruction", "max_length_instruction"]),
      this.toTemplate({
        id: "text_enhance_email_001",
        name: "Email Enhancer",
        category: "text_enhancement",
        description: "Enhance email copy.",
        template: "Improve this email for clarity, professionalism, and actionability.\n{tone_instruction}\n\n{text}",
        tags: ["email", "enhance"],
      }, ["text", "tone_instruction"]),
      this.toTemplate({
        id: "prompt_enhance_general_001",
        name: "Prompt Enhancer",
        category: "prompt_enhancement",
        description: "Make prompts clearer and safer.",
        template: "Improve this prompt so it is clear, specific, bounded, and easy to execute. Use a {tone} tone:\n\n{prompt}",
        tags: ["prompt"],
      }, ["prompt", "tone"]),
      this.toTemplate({
        id: "prompt_enhance_codegen_001",
        name: "Code Generation Prompt Enhancer",
        category: "prompt_enhancement",
        description: "Improve code generation prompts.",
        template: "Improve this prompt for {language} code generation. Make requirements explicit and avoid unsafe assumptions.\n{complexity_instruction}\n\n{prompt}",
        tags: ["prompt", "code"],
      }, ["prompt", "language", "complexity_instruction"]),
    ];

    defaults.forEach((template) => this.addTemplate(template));
    this.logger.info("Prompt library initialized", { count: this.templates.size });
  }

  private toTemplate(
    item: Omit<PromptTemplate, "variables" | "version" | "author" | "usageCount" | "lastUsed" | "successRate">,
    variables: string[]
  ): PromptTemplate {
    return {
      ...item,
      variables,
      version: "1.0.0",
      author: "Knoux AI",
      usageCount: 0,
    };
  }

  private async loadCustomTemplates(): Promise<void> {
    this.logger.debug("No custom prompt template storage is configured.");
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.initializeDefaultTemplates();
    await this.loadCustomTemplates();
    this.isInitialized = true;
  }

  public addTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, { ...template, usageCount: template.usageCount || 0 });
  }

  public removeTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  public getTemplate(templateId: string): PromptTemplate | undefined {
    const template = this.templates.get(templateId);
    if (template) {
      template.usageCount += 1;
      template.lastUsed = new Date();
    }
    return template;
  }

  public getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  public getTemplatesByCategory(category: PromptCategory): PromptTemplate[] {
    return this.getAllTemplates().filter((template) => template.category === category);
  }

  public getTemplatesByTag(tag: string): PromptTemplate[] {
    const normalized = tag.toLowerCase();
    return this.getAllTemplates().filter((template) => template.tags.some((item) => item.toLowerCase() === normalized));
  }

  public getTemplateCategories(): PromptCategory[] {
    return Array.from(new Set(this.getAllTemplates().map((template) => template.category)));
  }

  public getActionPrompt(action: string, variables: PromptVariables = {}): string {
    const template = this.getTemplate(action);
    if (!template) throw new Error(`Template not found: ${action}`);
    return this.renderTemplate(template.template, { targetLanguage: "Arabic", ...variables });
  }

  public getCodeEnhancementPrompt(language: ProgrammingLanguage, options: EnhancementOptions): string {
    const templateId = language === ProgrammingLanguage.PYTHON
      ? "code_enhance_py_001"
      : language === ProgrammingLanguage.POWERSHELL
        ? "code_enhance_ps_001"
        : "code_enhance_js_001";
    const template = this.getTemplate(templateId);
    if (!template) throw new Error(`Template not found: ${templateId}`);
    return this.renderTemplate(template.template, {
      code: "{code}",
      tone_instruction: this.getToneInstruction(options.tone),
      complexity_instruction: this.getComplexityInstruction(options.complexityLevel),
      security_instruction: options.securityCheck ? "Apply security best practices." : "",
    });
  }

  public getTextEnhancementPrompt(textType: "email" | "document" | "general", options: EnhancementOptions): string {
    const templateId = textType === "email" ? "text_enhance_email_001" : "text_enhance_general_001";
    const template = this.getTemplate(templateId);
    if (!template) throw new Error(`Template not found: ${templateId}`);
    return this.renderTemplate(template.template, {
      text: "{text}",
      tone: options.tone || "professional",
      tone_instruction: `Use a ${options.tone || "professional"} tone.`,
      include_examples_instruction: options.includeExamples ? "Include relevant examples only when helpful." : "",
      max_length_instruction: options.maxLength ? `Keep within ${options.maxLength} characters.` : "",
    });
  }

  public getPromptEnhancementPrompt(options: EnhancementOptions): string {
    const templateId = options.targetLanguage ? "prompt_enhance_codegen_001" : "prompt_enhance_general_001";
    const template = this.getTemplate(templateId);
    if (!template) throw new Error(`Template not found: ${templateId}`);
    return this.renderTemplate(template.template, {
      prompt: "{prompt}",
      tone: options.tone || "clear and direct",
      language: options.targetLanguage || ProgrammingLanguage.JAVASCRIPT,
      complexity_instruction: this.getComplexityInstruction(options.complexityLevel),
    });
  }

  private getToneInstruction(tone?: string): string {
    if (!tone) return "";
    const toneInstructions: Record<string, string> = {
      formal: "Use formal, professional language.",
      casual: "Use casual, conversational language.",
      technical: "Use technical, precise language.",
      creative: "Use creative, expressive language.",
    };
    return toneInstructions[tone] || `Use a ${tone} tone.`;
  }

  private getComplexityInstruction(complexityLevel?: string): string {
    if (!complexityLevel) return "";
    const complexityInstructions: Record<string, string> = {
      beginner: "Make the result suitable for beginners with clear comments.",
      intermediate: "Make the result suitable for intermediate users.",
      advanced: "Use advanced patterns where they improve quality.",
      expert: "Use expert-level patterns and explain tradeoffs only if requested.",
    };
    return complexityInstructions[complexityLevel] || "";
  }

  public renderTemplate(template: string, variables: PromptVariables): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
    }
    return rendered.replace(/\{[^{}]+\}/g, "").trim();
  }

  public executeTemplate(templateId: string, content: string, additionalVariables: PromptVariables = {}): string {
    const template = this.getTemplate(templateId);
    if (!template) throw new Error(`Template not found: ${templateId}`);
    const variables: PromptVariables = { ...additionalVariables };
    if (template.variables.includes("code")) variables.code = content;
    if (template.variables.includes("text")) variables.text = content;
    if (template.variables.includes("prompt")) variables.prompt = content;
    if (template.variables.includes("error")) variables.error = content;
    return this.renderTemplate(template.template, variables);
  }

  public searchTemplates(keyword: string): PromptTemplate[] {
    const searchTerm = keyword.toLowerCase();
    return this.getAllTemplates().filter((template) =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
      template.category.toLowerCase().includes(searchTerm)
    );
  }

  public recordExecution(result: PromptExecutionResult): void {
    this.executionHistory.unshift(result);
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(0, this.maxHistorySize);
    }

    const template = this.templates.get(result.templateId);
    if (template) {
      const previousUsage = Math.max(template.usageCount - 1, 0);
      const previousSuccessRate = template.successRate || 0;
      template.successRate = (previousSuccessRate * previousUsage + (result.success ? 1 : 0)) / Math.max(template.usageCount, 1);
    }
  }

  public getExecutionHistory(limit?: number): PromptExecutionResult[] {
    return limit ? this.executionHistory.slice(0, limit) : [...this.executionHistory];
  }

  public clearExecutionHistory(): void {
    this.executionHistory = [];
  }

  public exportTemplates(): string {
    return JSON.stringify({
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      templateCount: this.templates.size,
      templates: this.getAllTemplates(),
    }, null, 2);
  }

  public importTemplates(json: string): number {
    const importData = JSON.parse(json);
    if (!Array.isArray(importData.templates)) throw new Error("Invalid template format");
    let importedCount = 0;
    importData.templates.forEach((template: PromptTemplate) => {
      if (template.id && template.template) {
        this.addTemplate(template);
        importedCount += 1;
      }
    });
    return importedCount;
  }

  public getStatistics(): {
    totalTemplates: number;
    totalExecutions: number;
    categories: Record<string, number>;
    mostUsedTemplates: Array<{ id: string; name: string; usageCount: number }>;
  } {
    const categories: Record<string, number> = {};
    this.templates.forEach((template) => {
      categories[template.category] = (categories[template.category] || 0) + 1;
    });
    const mostUsedTemplates = this.getAllTemplates()
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
      .map((template) => ({ id: template.id, name: template.name, usageCount: template.usageCount }));
    return {
      totalTemplates: this.templates.size,
      totalExecutions: this.executionHistory.length,
      categories,
      mostUsedTemplates,
    };
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public reset(): void {
    this.executionHistory = [];
    this.initializeDefaultTemplates();
    this.isInitialized = true;
  }
}

export const promptLibrary = new PromptLibrary();
export default PromptLibrary;
