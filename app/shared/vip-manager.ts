/**
 * VIP System - نظام الـ VIP الاحترافي
 * Knoux Clipboard AI - Premium Tier Management
 * Elegant + Exclusive + Powerful
 */

export type VIPTier = 'basic' | 'elite' | 'platinum';
export type VIPBenefit =
  | 'unlimited_history'
  | 'priority_ai'
  | 'custom_themes'
  | 'advanced_security'
  | 'zero_ads'
  | 'priority_support'
  | 'api_access'
  | 'backup_unlimited'
  | 'team_management'
  | 'advanced_analytics';

export interface VIPPlan {
  tier: VIPTier;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  color: string;
  icon: string;
  badge: string;
  benefits: VIPBenefit[];
  limits: {
    history_limit: number | null; // null = unlimited
    ai_requests_per_day: number | null;
    storage_gb: number;
    team_members: number;
    custom_themes: number;
    api_calls_per_month: number | null;
  };
}

export interface VIPUser {
  user_id: string;
  tier: VIPTier;
  status: 'active' | 'expired' | 'cancelled' | 'on_trial';
  subscription_start: number;
  subscription_end: number;
  trial_days_left: number | null;
  renewal_date: number | null;
  billing_email: string;
  payment_method: string;
  auto_renew: boolean;
}

export interface VIPFeature {
  feature_id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  icon: string;
  available_from: VIPTier;
  category: 'storage' | 'ai' | 'customization' | 'support' | 'integration';
}

// ==================== VIP PLANS ====================

export const VIP_PLANS: Record<VIPTier, VIPPlan> = {
  basic: {
    tier: 'basic',
    name_en: 'Free',
    name_ar: 'مجاني',
    description_en: 'Perfect for personal use with core features',
    description_ar: 'مثالي للاستخدام الشخصي مع الميزات الأساسية',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'USD',
    color: '#6366f1',
    icon: 'Zap',
    badge: 'FREE',
    benefits: ['unlimited_history', 'zero_ads'],
    limits: {
      history_limit: 500,
      ai_requests_per_day: 100,
      storage_gb: 1,
      team_members: 1,
      custom_themes: 3,
      api_calls_per_month: 0,
    },
  },

  elite: {
    tier: 'elite',
    name_en: 'Knoux Elite',
    name_ar: 'نوكس إليت',
    description_en: 'Advanced features for power users',
    description_ar: 'ميزات متقدمة لمستخدمي الطاقة',
    price_monthly: 9.99,
    price_yearly: 99.99,
    currency: 'USD',
    color: '#f59e0b',
    icon: 'Crown',
    badge: 'ELITE',
    benefits: [
      'unlimited_history',
      'priority_ai',
      'custom_themes',
      'advanced_security',
      'zero_ads',
      'priority_support',
    ],
    limits: {
      history_limit: null, // unlimited
      ai_requests_per_day: null,
      storage_gb: 50,
      team_members: 5,
      custom_themes: null,
      api_calls_per_month: 5000,
    },
  },

  platinum: {
    tier: 'platinum',
    name_en: 'Knoux Platinum',
    name_ar: 'نوكس بلاتينيوم',
    description_en: 'Everything unlimited. For enterprises.',
    description_ar: 'كل شيء غير محدود. للمؤسسات.',
    price_monthly: 29.99,
    price_yearly: 299.99,
    currency: 'USD',
    color: '#06b6d4',
    icon: 'Sparkles',
    badge: 'PLATINUM',
    benefits: [
      'unlimited_history',
      'priority_ai',
      'custom_themes',
      'advanced_security',
      'zero_ads',
      'priority_support',
      'api_access',
      'backup_unlimited',
      'team_management',
      'advanced_analytics',
    ],
    limits: {
      history_limit: null,
      ai_requests_per_day: null,
      storage_gb: 500,
      team_members: 50,
      custom_themes: null,
      api_calls_per_month: null,
    },
  },
};

// ==================== VIP FEATURES ====================

export const VIP_FEATURES: VIPFeature[] = [
  {
    feature_id: 'feat_unlimited_history',
    name_en: 'Unlimited History',
    name_ar: 'سجل غير محدود',
    description_en: 'Store unlimited clipboard items without limits',
    description_ar: 'خزن عناصر حافظة غير محدودة بدون قيود',
    icon: 'Database',
    available_from: 'elite',
    category: 'storage',
  },
  {
    feature_id: 'feat_priority_ai',
    name_en: 'Priority AI Processing',
    name_ar: 'معالجة الذكاء الاصطناعي ذات الأولوية',
    description_en: 'Faster AI analysis and suggestions',
    description_ar: 'تحليل وحي الذكاء الاصطناعي أسرع',
    icon: 'Zap',
    available_from: 'elite',
    category: 'ai',
  },
  {
    feature_id: 'feat_custom_themes',
    name_en: 'Custom Themes',
    name_ar: 'مواضيع مخصصة',
    description_en: 'Create and design your own themes',
    description_ar: 'أنشئ وصمّم مواضيعك الخاصة',
    icon: 'Palette',
    available_from: 'elite',
    category: 'customization',
  },
  {
    feature_id: 'feat_advanced_security',
    name_en: 'Advanced Security',
    name_ar: 'الأمان المتقدم',
    description_en: 'Military-grade encryption and security features',
    description_ar: 'تشفير وميزات أمان من الدرجة العسكرية',
    icon: 'Shield',
    available_from: 'elite',
    category: 'support',
  },
  {
    feature_id: 'feat_priority_support',
    name_en: 'Priority Support',
    name_ar: 'دعم الأولوية',
    description_en: '24/7 priority customer support',
    description_ar: 'دعم العملاء ذي الأولوية على مدار الساعة',
    icon: 'Headphones',
    available_from: 'elite',
    category: 'support',
  },
  {
    feature_id: 'feat_api_access',
    name_en: 'API Access',
    name_ar: 'وصول API',
    description_en: 'Developer API for integration and automation',
    description_ar: 'واجهة برمجية للمطورين للتكامل والأتمتة',
    icon: 'Code',
    available_from: 'platinum',
    category: 'integration',
  },
  {
    feature_id: 'feat_backup_unlimited',
    name_en: 'Unlimited Backups',
    name_ar: 'نسخ احتياطية غير محدودة',
    description_en: 'Unlimited automatic backups with versioning',
    description_ar: 'نسخ احتياطية تلقائية غير محدودة مع الإصدارات',
    icon: 'HardDrive',
    available_from: 'platinum',
    category: 'storage',
  },
  {
    feature_id: 'feat_team_management',
    name_en: 'Team Management',
    name_ar: 'إدارة الفريق',
    description_en: 'Manage teams and shared workspaces',
    description_ar: 'إدارة الفرق والمساحات المشتركة',
    icon: 'Users',
    available_from: 'platinum',
    category: 'integration',
  },
  {
    feature_id: 'feat_advanced_analytics',
    name_en: 'Advanced Analytics',
    name_ar: 'تحليلات متقدمة',
    description_en: 'Detailed usage analytics and insights',
    description_ar: 'تحليلات الاستخدام التفصيلية والرؤى',
    icon: 'BarChart3',
    available_from: 'platinum',
    category: 'ai',
  },
];

// ==================== COMPARISON TABLE ====================

export interface ComparisonItem {
  feature: string;
  basic: string | boolean;
  elite: string | boolean;
  platinum: string | boolean;
}

export const VIP_COMPARISON: ComparisonItem[] = [
  {
    feature: 'History Storage',
    basic: '500 items',
    elite: 'Unlimited',
    platinum: 'Unlimited',
  },
  {
    feature: 'AI Requests/Day',
    basic: '100',
    elite: 'Unlimited',
    platinum: 'Unlimited',
  },
  {
    feature: 'Storage Space',
    basic: '1 GB',
    elite: '50 GB',
    platinum: '500 GB',
  },
  {
    feature: 'Custom Themes',
    basic: '3',
    elite: 'Unlimited',
    platinum: 'Unlimited',
  },
  {
    feature: 'Team Members',
    basic: '1',
    elite: '5',
    platinum: '50+',
  },
  {
    feature: 'Priority AI',
    basic: false,
    elite: true,
    platinum: true,
  },
  {
    feature: 'Advanced Security',
    basic: false,
    elite: true,
    platinum: true,
  },
  {
    feature: 'API Access',
    basic: false,
    elite: false,
    platinum: true,
  },
  {
    feature: 'Priority Support',
    basic: false,
    elite: true,
    platinum: true,
  },
  {
    feature: 'Advanced Analytics',
    basic: false,
    elite: false,
    platinum: true,
  },
  {
    feature: 'Price',
    basic: 'Free',
    elite: '$9.99/mo',
    platinum: '$29.99/mo',
  },
];

// ==================== VIP MANAGER ====================

export class VIPManager {
  private static instance: VIPManager;
  private currentUser: VIPUser | null = null;
  private storageKey = 'knoux_vip_user';
  private listeners: ((user: VIPUser | null) => void)[] = [];

  private constructor() {
    this.loadUser();
  }

  static getInstance(): VIPManager {
    if (!VIPManager.instance) {
      VIPManager.instance = new VIPManager();
    }
    return VIPManager.instance;
  }

  // ==================== STATE ====================

  private loadUser(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load VIP user:', error);
    }
  }

  private saveUser(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
      }
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save VIP user:', error);
    }
  }

  // ==================== GETTERS ====================

  getCurrentUser(): VIPUser | null {
    return this.currentUser;
  }

  getCurrentTier(): VIPTier {
    return this.currentUser?.tier ?? 'basic';
  }

  getPlan(tier: VIPTier): VIPPlan {
    return VIP_PLANS[tier];
  }

  isVIPActive(): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.status === 'basic') return false;
    return (
      this.currentUser.status === 'active' ||
      (this.currentUser.status === 'on_trial' && this.currentUser.trial_days_left! > 0)
    );
  }

  hasFeature(feature: VIPBenefit): boolean {
    const tier = this.getCurrentTier();
    const plan = VIP_PLANS[tier];
    return plan.benefits.includes(feature);
  }

  canUseFeat(featureName: string): boolean {
    const tier = this.getCurrentTier();
    const feature = VIP_FEATURES.find(f => f.feature_id === featureName);
    if (!feature) return true; // feature doesn't exist, so allow

    // Check if tier is sufficient
    const tiers: VIPTier[] = ['basic', 'elite', 'platinum'];
    const tierIndex = tiers.indexOf(tier);
    const requiredIndex = tiers.indexOf(feature.available_from);

    return tierIndex >= requiredIndex;
  }

  getReminingTrialDays(): number {
    if (!this.currentUser || !this.currentUser.trial_days_left) return 0;
    return this.currentUser.trial_days_left;
  }

  getRenewalDate(): Date | null {
    if (!this.currentUser || !this.currentUser.renewal_date) return null;
    return new Date(this.currentUser.renewal_date);
  }

  // ==================== SUBSCRIPTION ====================

  activateSubscription(tier: VIPTier, durationDays: number): void {
    const plan = VIP_PLANS[tier];
    const now = Date.now();

    this.currentUser = {
      user_id: `vip_${Date.now()}`,
      tier,
      status: 'active',
      subscription_start: now,
      subscription_end: now + durationDays * 24 * 60 * 60 * 1000,
      trial_days_left: null,
      renewal_date: new Date(now).getTime() + durationDays * 24 * 60 * 60 * 1000,
      billing_email: '',
      payment_method: '',
      auto_renew: true,
    };

    this.saveUser();
  }

  startTrial(durationDays: number = 7): void {
    const now = Date.now();

    this.currentUser = {
      user_id: `trial_${Date.now()}`,
      tier: 'elite',
      status: 'on_trial',
      subscription_start: now,
      subscription_end: now + durationDays * 24 * 60 * 60 * 1000,
      trial_days_left: durationDays,
      renewal_date: null,
      billing_email: '',
      payment_method: '',
      auto_renew: false,
    };

    this.saveUser();
  }

  cancelSubscription(): void {
    if (this.currentUser) {
      this.currentUser.status = 'cancelled';
      this.currentUser.auto_renew = false;
      this.saveUser();
    }
  }

  // ==================== LIMITS ====================

  getLimit(limitKey: keyof VIPPlan['limits']): number | null {
    const plan = VIP_PLANS[this.getCurrentTier()];
    return plan.limits[limitKey];
  }

  checkLimit(limitKey: keyof VIPPlan['limits'], current: number): boolean {
    const limit = this.getLimit(limitKey);
    return limit === null || current < limit;
  }

  // ==================== COMPARISON ====================

  getComparison(): ComparisonItem[] {
    return VIP_COMPARISON;
  }

  comparePlans(tier1: VIPTier, tier2: VIPTier): { feature: string; tier1: string; tier2: string }[] {
    return VIP_COMPARISON.map(item => ({
      feature: item.feature,
      tier1: String(item[tier1] ?? '❌'),
      tier2: String(item[tier2] ?? '❌'),
    }));
  }

  // ==================== LISTENERS ====================

  onChange(callback: (user: VIPUser | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  // ==================== UTILITIES ====================

  getDisplayName(tier: VIPTier, language: 'en' | 'ar'): string {
    const plan = VIP_PLANS[tier];
    return language === 'en' ? plan.name_en : plan.name_ar;
  }

  getColor(tier: VIPTier): string {
    return VIP_PLANS[tier].color;
  }

  getIcon(tier: VIPTier): string {
    return VIP_PLANS[tier].icon;
  }

  getBadge(tier: VIPTier): string {
    return VIP_PLANS[tier].badge;
  }
}

export const vipManager = VIPManager.getInstance();
export default vipManager;
