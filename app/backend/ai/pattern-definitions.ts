export const harmfulPatternDefinitions = {
  'copy-paste-loop': {
    name: 'حلقة النسخ واللصق',
    description: 'تكرار النسخ من نفس المصدر ولصقه في أماكن متعددة',
    detection: {
      metrics: ['copyFrequency', 'sourceReuseRate', 'timeBetweenCopies'],
      thresholds: {
        copyFrequency: { min: 10, period: 'hour' },
        sourceReuseRate: { min: 0.8 },
        timeBetweenCopies: { max: 30000 }
      }
    },
    impact: {
      productivity: -0.7,
      creativity: -0.5,
      efficiency: -0.6
    },
    mitigation: [
      'استخدام القوالب',
      'إنشاء مقتطفات مخصصة',
      'تفعيل الإكمال التلقائي'
    ]
  },
  
  'context-switching-frequent': {
    name: 'تغيير السياق المتكرر',
    description: 'الانتقال بين التطبيقات والمواضيع بكثرة',
    detection: {
      metrics: ['appSwitches', 'topicChanges', 'focusDuration'],
      thresholds: {
        appSwitches: { min: 20, period: 'hour' },
        topicChanges: { min: 15, period: 'hour' },
        focusDuration: { max: 300000 }
      }
    },
    impact: {
      productivity: -0.8,
      focus: -0.9,
      quality: -0.6
    },
    mitigation: [
      'جلسات العمل المركزة',
      'تجميع المهام المتشابهة',
      'إيقاف الإشعارات'
    ]
  },
  
  'information-hoarding': {
    name: 'اكتناز المعلومات',
    description: 'نسخ كميات كبيرة من المعلومات دون استخدامها',
    detection: {
      metrics: ['copiedToUsedRatio', 'storageGrowth', 'unusedContentAge'],
      thresholds: {
        copiedToUsedRatio: { max: 0.3 },
        storageGrowth: { min: 10, period: 'day' },
        unusedContentAge: { min: 7 }
      }
    },
    impact: {
      efficiency: -0.5,
      organization: -0.7,
      retrieval: -0.6
    },
    mitigation: [
      'التنظيم الدوري',
      'حذف المحتوى غير المستخدم',
      'استخدام نظام التصنيف'
    ]
  },
  
  'multitasking-excessive': {
    name: 'تعدد المهام المفرط',
    description: 'محاولة أداء عدة مهام في نفس الوقت',
    detection: {
      metrics: ['concurrentTasks', 'taskCompletionRate', 'errorRate'],
      thresholds: {
        concurrentTasks: { min: 4 },
        taskCompletionRate: { max: 0.5 },
        errorRate: { min: 0.3 }
      }
    },
    impact: {
      quality: -0.8,
      accuracy: -0.7,
      stress: 0.9
    },
    mitigation: [
      'التركيز على مهمة واحدة',
      'استخدام قائمة المهام',
      'تفويض المهام'
    ]
  },
  
  'perfectionism-delay': {
    name: 'الكمالية المؤجلة',
    description: 'التأخر في الإنجاز بسبب السعي للكمال',
    detection: {
      metrics: ['editCount', 'timeToCompletion', 'satisfactionScore'],
      thresholds: {
        editCount: { min: 10, perItem: true },
        timeToCompletion: { multiplier: 3 },
        satisfactionScore: { min: 0.9 }
      }
    },
    impact: {
      productivity: -0.6,
      deadlines: -0.8,
      satisfaction: 0.7
    },
    mitigation: [
      'تحديد معايير واقعية',
      'الانطلاق ثم التحسين',
      'التغذية الراجعة المبكرة'
    ]
  }
};

export const simplificationTemplates = {
  'automate-repetitive': {
    name: 'أتمتة المهام المتكررة',
    description: 'تحويل المهام المتكررة إلى عمليات تلقائية',
    detection: {
      metrics: ['repetitionFrequency', 'taskSimilarity', 'timeSpent'],
      thresholds: {
        repetitionFrequency: { min: 3, period: 'day' },
        taskSimilarity: { min: 0.8 },
        timeSpent: { min: 1800000 }
      }
    },
    solution: {
      type: 'automation',
      implementation: ['macros', 'scripts', 'workflow-automation'],
      estimatedTime: 120,
      difficulty: 'medium'
    },
    benefits: {
      timeSavings: 0.7,
      errorReduction: 0.9,
      consistency: 0.8
    }
  },
  
  'consolidate-tools': {
    name: 'دمج الأدوات',
    description: 'تقليل عدد الأدوات المستخدمة للمهام المتشابهة',
    detection: {
      metrics: ['toolCount', 'featureOverlap', 'switchingFrequency'],
      thresholds: {
        toolCount: { min: 3, forTask: true },
        featureOverlap: { min: 0.6 },
        switchingFrequency: { min: 10, period: 'hour' }
      }
    },
    solution: {
      type: 'consolidation',
      implementation: ['tool-evaluation', 'migration-plan', 'training'],
      estimatedTime: 240,
      difficulty: 'high'
    },
    benefits: {
      efficiency: 0.6,
      cost: 0.5,
      learningCurve: 0.7
    }
  },
  
  'streamline-workflow': {
    name: 'تبسيط سير العمل',
    description: 'إزالة الخطوات غير الضرورية في العمليات',
    detection: {
      metrics: ['stepCount', 'decisionPoints', 'waitingTime'],
      thresholds: {
        stepCount: { min: 8 },
        decisionPoints: { min: 5 },
        waitingTime: { min: 0.3 }
      }
    },
    solution: {
      type: 'streamlining',
      implementation: ['process-mapping', 'bottleneck-analysis', 're-engineering'],
      estimatedTime: 180,
      difficulty: 'medium'
    },
    benefits: {
      speed: 0.5,
      clarity: 0.8,
      satisfaction: 0.6
    }
  },
  
  'standardize-templates': {
    name: 'توحيد القوالب',
    description: 'إنشاء قوالب موحدة للمحتوى المتكرر',
    detection: {
      metrics: ['contentSimilarity', 'creationTime', 'variationCount'],
      thresholds: {
        contentSimilarity: { min: 0.7 },
        creationTime: { min: 600000 },
        variationCount: { min: 5 }
      }
    },
    solution: {
      type: 'standardization',
      implementation: ['template-library', 'style-guide', 'training'],
      estimatedTime: 150,
      difficulty: 'low'
    },
    benefits: {
      consistency: 0.9,
      timeSavings: 0.6,
      quality: 0.7
    }
  }
};