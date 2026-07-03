/**
 * AI Database System - قاعدة بيانات الذكاء الاصطناعي
 * Knoux Clipboard AI - Smart Q&A, Intent Detection, Context Memory
 * Works Offline + Extensible + Free Model Friendly
 */

export type UserMood = 'curious' | 'confused' | 'seeking_help' | 'reporting_issue';
export type IntentType =
  | 'feature_explanation'
  | 'troubleshooting'
  | 'settings_help'
  | 'vip_inquiry'
  | 'general_question'
  | 'feature_request'
  | 'bug_report'
  | 'unknown';

// ==================== INTENTS DATABASE ====================

export interface AIIntent {
  intent_id: string;
  intent_type: IntentType;
  keywords_en: string[];
  keywords_ar: string[];
  priority: number; // 1-10
  response_template: string;
}

export const AI_INTENTS: AIIntent[] = [
  {
    intent_id: 'explain_dashboard',
    intent_type: 'feature_explanation',
    keywords_en: ['dashboard', 'main screen', 'home', 'what is', 'how does'],
    keywords_ar: ['لوحة التحكم', 'الشاشة الرئيسية', 'البداية', 'ما هو', 'كيف يعمل'],
    priority: 9,
    response_template: 'dashboard',
  },
  {
    intent_id: 'explain_clipboard',
    intent_type: 'feature_explanation',
    keywords_en: ['clipboard', 'history', 'clipboard history', 'stored items', 'saved text'],
    keywords_ar: ['الحافظة', 'السجل', 'سجل الحافظة', 'العناصر المحفوظة', 'النص المحفوظ'],
    priority: 9,
    response_template: 'clipboard',
  },
  {
    intent_id: 'explain_ai_features',
    intent_type: 'feature_explanation',
    keywords_en: ['ai', 'artificial intelligence', 'classification', 'smart', 'analysis'],
    keywords_ar: ['ذكاء اصطناعي', 'تصنيف', 'ذكي', 'تحليل', 'تحسين'],
    priority: 9,
    response_template: 'ai_features',
  },
  {
    intent_id: 'explain_security',
    intent_type: 'feature_explanation',
    keywords_en: ['security', 'encryption', 'privacy', 'sensitive', 'protect'],
    keywords_ar: ['الأمان', 'التشفير', 'الخصوصية', 'حساس', 'حماية'],
    priority: 10,
    response_template: 'security',
  },
  {
    intent_id: 'settings_help',
    intent_type: 'settings_help',
    keywords_en: ['settings', 'configure', 'preferences', 'options', 'how to set'],
    keywords_ar: ['الإعدادات', 'تكوين', 'تفضيلات', 'خيارات', 'كيفية ضبط'],
    priority: 8,
    response_template: 'settings',
  },
  {
    intent_id: 'vip_inquiry',
    intent_type: 'vip_inquiry',
    keywords_en: ['vip', 'premium', 'pro', 'upgrade', 'elite', 'special features'],
    keywords_ar: ['vip', 'متميز', 'احترافي', 'ترقية', 'ميزات خاصة'],
    priority: 7,
    response_template: 'vip',
  },
  {
    intent_id: 'troubleshoot_not_working',
    intent_type: 'troubleshooting',
    keywords_en: ['not working', 'broken', 'error', 'crash', 'fail', 'problem'],
    keywords_ar: ['لا يعمل', 'معطل', 'خطأ', 'توقف', 'فشل', 'مشكلة'],
    priority: 10,
    response_template: 'troubleshooting',
  },
  {
    intent_id: 'troubleshoot_slow',
    intent_type: 'troubleshooting',
    keywords_en: ['slow', 'lag', 'freeze', 'performance', 'speed'],
    keywords_ar: ['بطيء', 'تأخير', 'توقف', 'أداء', 'سرعة'],
    priority: 8,
    response_template: 'performance_help',
  },
  {
    intent_id: 'general_greeting',
    intent_type: 'general_question',
    keywords_en: ['hello', 'hi', 'hey', 'help', 'can you help'],
    keywords_ar: ['مرحبا', 'هاي', 'ساعدني', 'هل تستطيع المساعدة'],
    priority: 5,
    response_template: 'greeting',
  },
  {
    intent_id: 'feature_request',
    intent_type: 'feature_request',
    keywords_en: ['add', 'feature', 'request', 'would like', 'want', 'suggestion'],
    keywords_ar: ['أضف', 'ميزة', 'طلب', 'أود', 'أريد', 'اقتراح'],
    priority: 6,
    response_template: 'feature_request',
  },
];

// ==================== KNOWLEDGE BASE ====================

export interface KnowledgeEntry {
  kb_id: string;
  category:
    | 'clipboard'
    | 'settings'
    | 'ai'
    | 'security'
    | 'vip'
    | 'troubleshooting'
    | 'general';
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  related_intent: string;
  keywords: string[];
  helpful_count: number;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ========== CLIPBOARD ENTRIES ==========
  {
    kb_id: 'kb_clipboard_001',
    category: 'clipboard',
    question_en: 'How do I access my clipboard history?',
    question_ar: 'كيف أصل إلى سجل الحافظة الخاص بي؟',
    answer_en:
      'Your clipboard history is displayed in the main window. Every time you copy something, it automatically appears in the history list. You can search, filter, and organize items using the sidebar controls.',
    answer_ar:
      'يتم عرض سجل الحافظة في النافذة الرئيسية. في كل مرة تنسخ شيئاً ما، يظهر تلقائياً في قائمة السجل. يمكنك البحث والتصفية وتنظيم العناصر باستخدام عناصر التحكم في الشريط الجانبي.',
    related_intent: 'explain_clipboard',
    keywords: ['clipboard', 'history', 'access', 'search'],
    helpful_count: 0,
  },
  {
    kb_id: 'kb_clipboard_002',
    category: 'clipboard',
    question_en: 'Can I restore deleted clipboard items?',
    question_ar: 'هل يمكنني استعادة عناصر الحافظة المحذوفة؟',
    answer_en:
      'Once you delete an item from history, it cannot be recovered unless you have enabled backup. We recommend enabling automatic backups in Settings > Privacy to ensure you can always recover important items.',
    answer_ar:
      'بمجرد حذف عنصر من السجل، لا يمكن استعادته ما لم تكن قد قمت بتفعيل النسخ الاحتياطية. نوصي بتفعيل النسخ الاحتياطية التلقائية في الإعدادات > الخصوصية للتأكد من أنه يمكنك دائماً استعادة العناصر المهمة.',
    related_intent: 'troubleshoot_not_working',
    keywords: ['delete', 'restore', 'recovery', 'backup'],
    helpful_count: 0,
  },
  {
    kb_id: 'kb_clipboard_003',
    category: 'clipboard',
    question_en: 'How do I export my clipboard history?',
    question_ar: 'كيف أصدر سجل الحافظة الخاص بي؟',
    answer_en:
      'Go to Settings > Clipboard and select "Export History". Choose your preferred format (JSON, CSV, or TXT) and save the file to your computer. This is useful for backup or data migration.',
    answer_ar:
      'اذهب إلى الإعدادات > الحافظة وحدد "تصدير السجل". اختر الصيغة المفضلة لديك (JSON أو CSV أو TXT) واحفظ الملف على جهاز الكمبيوتر الخاص بك. هذا مفيد للنسخ الاحتياطية أو نقل البيانات.',
    related_intent: 'settings_help',
    keywords: ['export', 'backup', 'save', 'data'],
    helpful_count: 0,
  },

  // ========== SETTINGS ENTRIES ==========
  {
    kb_id: 'kb_settings_001',
    category: 'settings',
    question_en: 'Where are the application settings?',
    question_ar: 'أين توجد إعدادات التطبيق؟',
    answer_en:
      'Click the Settings icon (⚙️) in the top right corner of the window. This opens the Settings panel where you can customize appearance, language, privacy, AI features, and performance options.',
    answer_ar:
      'انقر على أيقونة الإعدادات (⚙️) في الزاوية العلوية اليمنى من النافذة. يؤدي هذا إلى فتح لوحة الإعدادات حيث يمكنك تخصيص المظهر والعرض والخصوصية وميزات الذكاء الاصطناعي وخيارات الأداء.',
    related_intent: 'settings_help',
    keywords: ['settings', 'configuration', 'preferences', 'customize'],
    helpful_count: 0,
  },
  {
    kb_id: 'kb_settings_002',
    category: 'settings',
    question_en: 'How do I enable dark mode?',
    question_ar: 'كيف أفعل الوضع الداكن؟',
    answer_en:
      'Go to Settings > Appearance and select "Dark" in the Theme option. You can also choose "Auto" to match your system settings. The theme will change immediately with a smooth transition.',
    answer_ar:
      'اذهب إلى الإعدادات > المظهر وحدد "داكن" في خيار المظهر. يمكنك أيضاً اختيار "تلقائي" للتطابق مع إعدادات النظام الخاصة بك. سيتغير المظهر على الفور مع انتقال سلس.',
    related_intent: 'settings_help',
    keywords: ['dark mode', 'theme', 'appearance', 'light'],
    helpful_count: 0,
  },
  {
    kb_id: 'kb_settings_003',
    category: 'settings',
    question_en: 'How do I change the language to Arabic?',
    question_ar: 'كيف أغير اللغة إلى العربية؟',
    answer_en:
      'Open Settings > Language & Region and select "العربية" from the Language dropdown. The entire interface will immediately switch to Arabic with proper right-to-left layout support.',
    answer_ar:
      'افتح الإعدادات > اللغة والمنطقة وحدد "العربية" من القائمة المنسدلة للغة. سيتحول العرض كاملاً على الفور إلى اللغة العربية مع دعم التخطيط من اليمين إلى اليسار.',
    related_intent: 'settings_help',
    keywords: ['language', 'arabic', 'english', 'localization'],
    helpful_count: 0,
  },

  // ========== AI ENTRIES ==========
  {
    kb_id: 'kb_ai_001',
    category: 'ai',
    question_en: 'What does the AI do?',
    question_ar: 'ماذا يفعل الذكاء الاصطناعي؟',
    answer_en:
      'The AI features include: automatic classification of clipboard content, smart suggestions, content summarization, and context awareness. It learns from your usage patterns to provide personalized recommendations.',
    answer_ar:
      'تتضمن ميزات الذكاء الاصطناعي: التصنيف التلقائي لمحتوى الحافظة والاقتراحات الذكية وملخص المحتوى والوعي بالسياق. يتعلم من أنماط استخدامك لتقديم توصيات شخصية.',
    related_intent: 'explain_ai_features',
    keywords: ['ai', 'artificial intelligence', 'features', 'smart'],
    helpful_count: 0,
  },
  {
    kb_id: 'kb_ai_002',
    category: 'ai',
    question_en: 'How do I disable AI features?',
    question_ar: 'كيف أعطل ميزات الذكاء الاصطناعي؟',
    answer_en:
      'Go to Settings > AI & Intelligence and toggle "Enable AI" to off. You can also fine-tune individual features like auto-classification or auto-summarization to your preference.',
    answer_ar:
      'اذهب إلى الإعدادات > الذكاء الاصطناعي وأوقف تشغيل "تفعيل الذكاء الاصطناعي". يمكنك أيضاً ضبط الميزات الفردية مثل التصنيف التلقائي أو الملخص التلقائي حسب تفضيلك.',
    related_intent: 'settings_help',
    keywords: ['disable', 'ai', 'turn off', 'features'],
    helpful_count: 0,
  },

  // ========== SECURITY ENTRIES ==========
  {
    kb_id: 'kb_security_001',
    category: 'security',
    question_en: 'Is my clipboard data encrypted?',
    question_ar: 'هل يتم تشفير بيانات الحافظة الخاصة بي؟',
    answer_en:
      'Yes! By default, sensitive data is encrypted using AES-256 encryption. You can adjust the encryption level in Settings > Privacy & Security. We never send your data to external servers.',
    answer_ar:
      'نعم! بشكل افتراضي، يتم تشفير البيانات الحساسة باستخدام تشفير AES-256. يمكنك ضبط مستوى التشفير في الإعدادات > الخصوصية والأمان. لا نرسل بيانات إلى خوادم خارجية أبداً.',
    related_intent: 'explain_security',
    keywords: ['encryption', 'security', 'data', 'privacy', 'safe'],
    helpful_count: 0,
  },
  {
    kb_id: 'kb_security_002',
    category: 'security',
    question_en: 'What is sensitive data detection?',
    question_ar: 'ما هو كشف البيانات الحساسة؟',
    answer_en:
      'Sensitive data detection automatically identifies passwords, credit card numbers, email addresses, and other private information in your clipboard. These items are marked and can be automatically encrypted or deleted.',
    answer_ar:
      'يحدد كشف البيانات الحساسة تلقائياً كلمات المرور وأرقام بطاقات الائتمان والعناوين البريدية والمعلومات الخاصة الأخرى في الحافظة. يتم وضع علامات على هذه العناصر ويمكن تشفيرها أو حذفها تلقائياً.',
    related_intent: 'explain_security',
    keywords: ['sensitive', 'detection', 'password', 'private'],
    helpful_count: 0,
  },

  // ========== VIP ENTRIES ==========
  {
    kb_id: 'kb_vip_001',
    category: 'vip',
    question_en: 'What is Knoux Elite (VIP)?',
    question_ar: 'ما هو Knoux Elite (VIP)؟',
    answer_en:
      'Knoux Elite is our premium tier offering advanced features like unlimited history storage, priority AI processing, custom themes, and exclusive tools. Visit the VIP section to learn more.',
    answer_ar:
      'Knoux Elite هو مستوى متميز لدينا يقدم ميزات متقدمة مثل تخزين السجل غير المحدود ومعالجة الذكاء الاصطناعي ذات الأولوية والمظاهر المخصصة والأدوات الحصرية. قم بزيارة قسم VIP لمعرفة المزيد.',
    related_intent: 'vip_inquiry',
    keywords: ['vip', 'premium', 'elite', 'upgrade', 'features'],
    helpful_count: 0,
  },

  // ========== TROUBLESHOOTING ENTRIES ==========
  {
    kb_id: 'kb_troubleshoot_001',
    category: 'troubleshooting',
    question_en: 'The app is running slowly. What should I do?',
    question_ar: 'التطبيق بطيء جداً. ماذا يجب أن أفعل؟',
    answer_en:
      'Try these steps: 1) Go to Settings > Performance and enable "Lazy Loading". 2) Reduce the clipboard history limit. 3) Clear old entries. 4) Restart the application. If the issue persists, please report it.',
    answer_ar:
      'جرّب هذه الخطوات: 1) اذهب إلى الإعدادات > الأداء وفعّل "التحميل الكسول". 2) قلل حد السجل. 3) امسح الإدخالات القديمة. 4) أعد تشغيل التطبيق. إذا استمرت المشكلة، فالرجاء الإبلاغ عنها.',
    related_intent: 'troubleshoot_slow',
    keywords: ['slow', 'performance', 'lag', 'speed'],
    helpful_count: 0,
  },

  // ========== GENERAL ENTRIES ==========
  {
    kb_id: 'kb_general_001',
    category: 'general',
    question_en: 'How do I get help?',
    question_ar: 'كيف أحصل على المساعدة؟',
    answer_en:
      'You can ask me anything about Knoux by clicking the AI Assistant button (💬) or asking questions in the chat. For more detailed help, check out our documentation or report issues.',
    answer_ar:
      'يمكنك أن تسأل عن أي شيء يتعلق بـ Knoux بالنقر على زر مساعد الذكاء الاصطناعي (💬) أو طرح الأسئلة في الدردشة. للحصول على مساعدة أكثر تفصيلاً، تحقق من التوثيق أو أبلّغ عن المشاكل.',
    related_intent: 'general_greeting',
    keywords: ['help', 'support', 'question', 'assistance'],
    helpful_count: 0,
  },
];

// ==================== FALLBACK RESPONSES ====================

export interface FallbackResponse {
  type: 'unknown' | 'error' | 'vague';
  response_en: string;
  response_ar: string;
}

export const FALLBACK_RESPONSES: FallbackResponse[] = [
  {
    type: 'unknown',
    response_en:
      "I'm not sure I understood that correctly. Could you rephrase your question? Try asking about features, settings, security, or VIP.",
    response_ar:
      'لست متأكداً أنني فهمت بشكل صحيح. هل يمكنك إعادة صياغة سؤالك؟ حاول السؤال عن الميزات أو الإعدادات أو الأمان أو VIP.',
  },
  {
    type: 'error',
    response_en:
      'Oops! I encountered an error processing your request. Please try again or contact support if the issue persists.',
    response_ar:
      'عذراً! واجهت خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى أو الاتصال بالدعم إذا استمرت المشكلة.',
  },
  {
    type: 'vague',
    response_en:
      'That sounds important! Could you give me more details? For example, are you asking about a specific feature or having a problem?',
    response_ar:
      'يبدو أن هذا مهم! هل يمكنك إعطائي المزيد من التفاصيل؟ على سبيل المثال، هل تسأل عن ميزة معينة أو تواجه مشكلة؟',
  },
];

// ==================== CONTEXT MEMORY ====================

export interface SessionContext {
  session_id: string;
  user_id?: string;
  last_screen: string;
  last_action: string;
  mood: UserMood;
  previous_questions: string[];
  conversation_history: Array<{ role: 'user' | 'ai'; message: string; timestamp: number }>;
}

// ==================== AI HELPER ====================

export class AIHelper {
  private static instance: AIHelper;

  private constructor() {}

  static getInstance(): AIHelper {
    if (!AIHelper.instance) {
      AIHelper.instance = new AIHelper();
    }
    return AIHelper.instance;
  }

  // Detect intent from user input
  detectIntent(userInput: string, language: 'en' | 'ar'): AIIntent | null {
    const input = userInput.toLowerCase().trim();
    const keywords = language === 'en' ? 'keywords_en' : 'keywords_ar';

    for (const intent of AI_INTENTS) {
      const intentKeywords = intent[keywords];
      if (intentKeywords.some(keyword => input.includes(keyword.toLowerCase()))) {
        return intent;
      }
    }

    return null;
  }

  // Find relevant knowledge entries
  findAnswers(
    userInput: string,
    language: 'en' | 'ar',
    limit: number = 3
  ): KnowledgeEntry[] {
    const input = userInput.toLowerCase();
    const answerField = language === 'en' ? 'answer_en' : 'answer_ar';

    return KNOWLEDGE_BASE.filter(entry =>
      entry.keywords.some(keyword => input.includes(keyword.toLowerCase()))
    )
      .sort((a, b) => b.helpful_count - a.helpful_count)
      .slice(0, limit);
  }

  // Get fallback response
  getFallbackResponse(type: 'unknown' | 'error' | 'vague', language: 'en' | 'ar'): string {
    const fallback = FALLBACK_RESPONSES.find(f => f.type === type);
    if (!fallback) return 'How can I help you?';

    return language === 'en' ? fallback.response_en : fallback.response_ar;
  }

  // Get welcome message
  getWelcomeMessage(language: 'en' | 'ar'): string {
    return language === 'en'
      ? "Hi there! 👋 I'm your AI Assistant. Ask me anything about Knoux Clipboard AI - features, settings, security, VIP, or troubleshooting. How can I help?"
      : 'مرحباً! 👋 أنا مساعدك الذكاء الاصطناعي. اسأل عن Knoux - الميزات والإعدادات والأمان وVIP والمشاكل. كيف يمكنني مساعدتك؟';
  }

  // Check if input is valid
  isValidInput(input: string): boolean {
    return input && input.trim().length > 0 && input.trim().length < 500;
  }
}

export const aiHelper = AIHelper.getInstance();
export default aiHelper;
