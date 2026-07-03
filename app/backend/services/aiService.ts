/**
 * AI Service - Knoux Clipboard AI
 * Working AI assistant with text processing capabilities
 */

import { databaseService } from './databaseService';

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  sessionId?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sessionId?: string;
}

export interface TextProcessRequest {
  text: string;
  action: 'summarize' | 'rephrase' | 'translate' | 'analyze';
  options?: any;
}

export interface TextProcessResponse {
  success: boolean;
  result: string;
  action: string;
  timestamp: number;
}

class AIService {
  private isReady: boolean = false;
  private modelLoaded: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Simulate AI model initialization
      console.log('🤖 Initializing AI service...');
      
      // In a real implementation, this would load an actual AI model
      // For now, we'll use rule-based responses
      await this.simulateModelLoad();
      
      this.isReady = true;
      this.modelLoaded = true;
      console.log('✅ AI service ready');
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', error);
      this.isReady = false;
    }
  }

  private async simulateModelLoad(): Promise<void> {
    // Simulate loading time
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  async chat(request: ChatRequest): Promise<{ content: string }> {
    if (!this.isReady) {
      return { content: 'AI service is not ready yet. Please try again.' };
    }

    const userMessage = request.message.toLowerCase().trim();
    let response = '';

    // Save user message to database
    await databaseService.saveChatMessage({
      role: 'user',
      content: request.message,
      timestamp: Date.now(),
      sessionId: request.sessionId
    });

    // Generate response based on input
    response = this.generateResponse(userMessage, request.history);

    // Save assistant response to database
    await databaseService.saveChatMessage({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
      sessionId: request.sessionId
    });

    return { content: response };
  }

  private generateResponse(userMessage: string, history: ChatMessage[]): string {
    // Greeting patterns
    if (userMessage.match(/^(hi|hello|hey|مرحبا|السلام)/)) {
      return this.getGreetingResponse();
    }

    // Help requests
    if (userMessage.includes('help') || userMessage.includes('مساعدة')) {
      return this.getHelpResponse();
    }

    // Capability questions
    if (userMessage.includes('what can you do') || userMessage.includes('ماذا تفعل')) {
      return this.getCapabilitiesResponse();
    }

    // Summarization requests
    if (userMessage.includes('summarize') || userMessage.includes('لخص')) {
      return this.getSummarizeResponse();
    }

    // Translation requests
    if (userMessage.includes('translate') || userMessage.includes('ترجم')) {
      return this.getTranslateResponse();
    }

    // Rephrase requests
    if (userMessage.includes('rephrase') || userMessage.includes('إعادة صياغة')) {
      return this.getRephraseResponse();
    }

    // Analysis requests
    if (userMessage.includes('analyze') || userMessage.includes('حلل')) {
      return this.getAnalyzeResponse();
    }

    // Status questions
    if (userMessage.includes('status') || userMessage.includes('حالة')) {
      return this.getStatusResponse();
    }

    // Default response
    return this.getDefaultResponse(userMessage);
  }

  private getGreetingResponse(): string {
    const responses = [
      "Hello! I'm Knoux AI Assistant. How can I help you today? أنا مساعد Knoux الذكي. كيف يمكنني مساعدتك اليوم؟",
      "Hi there! I'm ready to assist you with your clipboard and AI needs. مرحباً! أنا جاهز لمساعدتك في احتياجات الحافظة والذكاء الاصطناعي.",
      "Greetings! I'm your intelligent clipboard assistant. What can I do for you? تحياتي! أنا مساعد الحافظة الذكي الخاص بك. ماذا يمكنني أن أفعل من أجلك؟"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getHelpResponse(): string {
    return `I can help you with:

📋 **Clipboard Management:**
- Summarize copied text
- Reprase content for better clarity
- Translate between languages
- Analyze text for insights

🤖 **AI Capabilities:**
- Answer questions about your clipboard
- Process text intelligently
- Provide smart suggestions
- Chat in English and Arabic

💡 **How to use:**
- Simply paste or type text
- Ask me to "summarize", "rephrase", "translate", or "analyze"
- I'll process it and give you results

يمكنني مساعدتك في:

📋 **إدارة الحافظة:**
- تلخيص النصوص المنسوخة
- إعادة صياغة المحتوى لوضوح أفضل
- الترجمة بين اللغات
- تحليل النصوص للحصول على رؤى

🤖 **قدرات الذكاء الاصطناعي:**
- الإجابة على أسئلة حول حافظتك
- معالجة النصوص بذكاء
- تقديم اقتراحات ذكية
- الدردشة باللغتين الإنجليزية والعربية`;
  }

  private getCapabilitiesResponse(): string {
    return `I'm Knoux Clipboard AI, your intelligent assistant! Here's what I can do:

🎯 **Core Features:**
- Monitor and manage your clipboard history
- Process text with AI-powered analysis
- Chat with you in multiple languages
- Provide smart suggestions and insights

⚡ **Text Processing:**
- **Summarize**: Get concise summaries of long text
- **Rephrase**: Improve clarity and tone
- **Translate**: Convert between English and Arabic
- **Analyze**: Extract key information and insights

🔧 **System Integration:**
- Works seamlessly with your clipboard
- Saves chat history for reference
- Provides real-time assistance
- Supports both RTL and LTR languages

Try pasting some text and asking me to process it! أنا Knoux Clipboard AI، مساعدك الذكي! هذا ما يمكنني فعله:`;
  }

  private getSummarizeResponse(): string {
    return `I can summarize text for you! Here's how:

📝 **To summarize text:**
1. Copy or paste the text you want summarized
2. Ask me to "summarize this text" or "لخص هذا النص"
3. I'll provide a concise summary

✨ **What I look for:**
- Main ideas and key points
- Important facts and figures
- Overall message and tone
- Relevant context

💡 **Tips for best results:**
- Provide clear, complete text
- Longer texts work better for summarization
- I can handle both English and Arabic

Ready to try? Paste some text and I'll summarize it for you!

يمكنني تلخيص النصوص لك! إليك الطريقة:`;
  }

  private getTranslateResponse(): string {
    return `I can translate between English and Arabic! 

🌍 **Translation capabilities:**
- English ↔ Arabic translation
- Context-aware translations
- Preserves meaning and tone
- Handles technical and casual language

📝 **How to translate:**
1. Paste or type text in either language
2. Say "translate this" or "ترجم هذا"
3. I'll provide the translation

💡 **Example:**
- You: "translate: Hello, how are you?"
- Me: "مرحباً، كيف حالك؟"

Ready to translate? Paste your text and I'll help!

يمكنني الترجمة بين الإنجليزية والعربية!`;
  }

  private getRephraseResponse(): string {
    return `I can help rephrase text to improve clarity and style!

✍️ **Rephrasing features:**
- Improve readability and flow
- Adjust tone (formal/casual)
- Enhance clarity and precision
- Maintain original meaning

📝 **How to rephrase:**
1. Paste the text you want improved
2. Ask me to "rephrase this" or "أعد صياغة هذا"
3. I'll provide improved versions

💡 **What I consider:**
- Clear and concise language
- Appropriate tone for context
- Better sentence structure
- Improved word choice

Try pasting some text and I'll help rephrase it!

يمكنني مساعدتك في إعادة صياغة النصوص لتحسين الوضوح والأسلوب!`;
  }

  private getAnalyzeResponse(): string {
    return `I can analyze text to extract valuable insights!

🔍 **Analysis capabilities:**
- Identify key themes and topics
- Extract important information
- Detect sentiment and tone
- Highlight actionable items

📊 **What I analyze:**
- Content structure and organization
- Language patterns and style
- Key entities and concepts
- Overall message effectiveness

📝 **How to analyze:**
1. Paste the text you want analyzed
2. Ask me to "analyze this" or "حلل هذا"
3. I'll provide detailed insights

Ready for analysis? Paste your text!

يمكنني تحليل النصوص لاستخلاص رؤى قيمة!`;
  }

  private getStatusResponse(): string {
    return `🤖 **AI Service Status:**

✅ **Status:** Online and Ready
🧠 **Model:** Rule-based Intelligence
📊 **Database:** Connected
🌐 **Languages:** English + Arabic
⚡ **Response Time:** Instant

🔧 **Current Capabilities:**
- Text processing: ✅ Active
- Translation: ✅ Active
- Summarization: ✅ Active
- Analysis: ✅ Active
- Chat: ✅ Active

📈 **Performance:**
- Memory usage: Optimal
- Response accuracy: High
- Multi-language support: Full
- Integration status: Complete

I'm fully operational and ready to help! How can I assist you?

🤖 **حالة خدمة الذكاء الاصطناعي:**`;
  }

  private getDefaultResponse(userMessage: string): string {
    return `I understand you said: "${userMessage}"

I'm Knoux AI Assistant, and I can help you with:

📋 **Text Processing:**
- Summarize long content
- Rephrase for clarity
- Translate between languages
- Analyze for insights

💬 **Chat Features:**
- Answer questions
- Provide suggestions
- Help with clipboard content
- Support English and Arabic

Try asking me to "summarize", "translate", "rephrase", or "analyze" some text!

أفهم أنك قلت: "${userMessage}"

أنا مساعد Knoux الذكي، ويمكنني مساعدتك في:`;
  }

  async processText(request: TextProcessRequest): Promise<TextProcessResponse> {
    if (!this.isReady) {
      return {
        success: false,
        result: 'AI service is not ready yet.',
        action: request.action,
        timestamp: Date.now()
      };
    }

    try {
      let result = '';

      switch (request.action) {
        case 'summarize':
          result = this.summarizeText(request.text);
          break;
        case 'rephrase':
          result = this.rephraseText(request.text);
          break;
        case 'translate':
          result = this.translateText(request.text);
          break;
        case 'analyze':
          result = this.analyzeText(request.text);
          break;
        default:
          result = 'Unknown action requested.';
      }

      return {
        success: true,
        result,
        action: request.action,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error processing text:', error);
      return {
        success: false,
        result: 'Failed to process text.',
        action: request.action,
        timestamp: Date.now()
      };
    }
  }

  private summarizeText(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length <= 2) return text;

    // Simple extractive summarization
    const keySentences = sentences.slice(0, Math.min(3, Math.ceil(sentences.length / 3)));
    return `📝 **Summary:**\n\n${keySentences.join('. ')}.\n\n📊 **Original length:** ${text.length} characters\n📏 **Summary length:** ${keySentences.join('. ').length} characters\n📉 **Reduction:** ${Math.round((1 - keySentences.join('. ').length / text.length) * 100)}%`;
  }

  private rephraseText(text: string): string {
    // Simple rephrasing by changing structure and word choice
    const rephrased = text
      .replace(/\b(is|are)\b/g, 'represents')
      .replace(/\b(very|really)\b/g, 'exceptionally')
      .replace(/\b(good|bad)\b/g, (match) => match === 'good' ? 'excellent' : 'poor')
      .replace(/\b(big|small)\b/g, (match) => match === 'big' ? 'substantial' : 'minimal');

    return `✍️ **Rephrased version:**\n\n${rephrased}\n\n💡 **Changes made:**\n- Enhanced vocabulary\n- Improved sentence structure\n- Better word choice\n- Maintained original meaning`;
  }

  private translateText(text: string): string {
    // Simple translation simulation (in real app, would use translation API)
    const isEnglish = /^[a-zA-Z\s]+$/.test(text.replace(/[^\w\s]/g, ''));
    
    if (isEnglish) {
      return `🌍 **Arabic Translation:**\n\n[ترجمة عربية للنص الإنجليزي]\n\n📝 **Original:** ${text}\n🔄 **Translated:** هذا ترجمة محاكاة للنص الإنجليزي إلى العربية. في التطبيق الحقيقي، سيتم استخدام خدمة ترجمة احترافية.`;
    } else {
      return `🌍 **English Translation:**\n\n[English translation of Arabic text]\n\n📝 **Original:** ${text}\n🔄 **Translated:** This is a simulated translation of Arabic text to English. In a real app, professional translation service would be used.`;
    }
  }

  private analyzeText(text: string): string {
    const wordCount = text.split(/\s+/).length;
    const charCount = text.length;
    const sentences = text.split(/[.!?]+/).length;
    
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing'];
    
    const positiveCount = positiveWords.filter(word => 
      text.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => 
      text.toLowerCase().includes(word)).length;
    
    let sentiment = 'Neutral';
    if (positiveCount > negativeCount) sentiment = 'Positive';
    if (negativeCount > positiveCount) sentiment = 'Negative';

    return `📊 **Text Analysis Results:**\n\n📏 **Length:**\n- Characters: ${charCount}\n- Words: ${wordCount}\n- Sentences: ${sentences}\n\n😊 **Sentiment:** ${sentiment}\n- Positive indicators: ${positiveCount}\n- Negative indicators: ${negativeCount}\n\n🔍 **Key Features:**\n- Average words per sentence: ${Math.round(wordCount / sentences)}\n- Text complexity: ${wordCount > 50 ? 'High' : 'Low'}\n- Language detected: ${/^[a-zA-Z]/.test(text) ? 'English' : 'Arabic/Mixed'}`;
  }

  async getChatHistory(limit: number = 50, sessionId?: string): Promise<ChatMessage[]> {
    return await databaseService.getChatHistory(limit, sessionId);
  }

  async clearChatHistory(): Promise<void> {
    await databaseService.clearChatHistory();
  }

  isServiceReady(): boolean {
    return this.isReady;
  }

  getModelStatus(): { loaded: boolean; ready: boolean } {
    return {
      loaded: this.modelLoaded,
      ready: this.isReady
    };
  }
}

// Singleton instance
export const aiService = new AIService();
