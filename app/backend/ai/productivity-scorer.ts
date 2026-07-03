/**
 * 🎯 Productivity Scorer System
 * Intelligent productivity measurement with multi-dimensional analysis
 */

export interface ProductivityScore {
  id: string;
  userId: string;
  timestamp: number;
  overallScore: number; // 0-100
  categoryScores: CategoryScores;
  trend: ScoreTrend;
  insights: ProductivityInsight[];
  recommendations: ProductivityRecommendation[];
  metadata: ScoreMetadata;
}

export interface CategoryScores {
  efficiency: number;
  quality: number;
  diversity: number;
  learning: number;
  focus: number;
  innovation: number;
}

export interface ProductivityInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: number;
  confidence: number;
  timestamp: number;
}

export interface ProductivityRecommendation {
  id: string;
  title: string;
  description: string;
  priority: number;
  category: string;
  estimatedImpact: number;
  difficulty: string;
}

export class ProductivityScorer {
  private static instance: ProductivityScorer;
  private userScores: Map<string, ProductivityScore[]> = new Map();
  private performanceData: Map<string, PerformanceData[]> = new Map();

  private constructor() {
    this.initializeSystem();
  }

  public static getInstance(): ProductivityScorer {
    if (!ProductivityScorer.instance) {
      ProductivityScorer.instance = new ProductivityScorer();
    }
    return ProductivityScorer.instance;
  }

  private initializeSystem(): void {
    console.log('🎯 Productivity Scorer initialized');
    this.startDataCollection();
  }

  // 🎯 Calculate productivity score
  public async calculateProductivityScore(
    userId: string,
    timeframe: string = '7d'
  ): Promise<ProductivityScore> {
    console.log(`🎯 Calculating productivity score for ${userId}...`);
    
    // Collect performance data
    const performanceData = this.getPerformanceData(userId, timeframe);
    
    // Calculate category scores
    const categoryScores = await this.calculateCategoryScores(performanceData);
    
    // Calculate overall score
    const overallScore = this.calculateOverallScore(categoryScores);
    
    // Analyze trend
    const trend = this.analyzeScoreTrend(userId, overallScore);
    
    // Generate insights
    const insights = this.generateInsights(performanceData, categoryScores);
    
    // Create recommendations
    const recommendations = this.generateRecommendations(categoryScores, insights);

    const score: ProductivityScore = {
      id: `score_${userId}_${Date.now()}`,
      userId,
      timestamp: Date.now(),
      overallScore,
      categoryScores,
      trend,
      insights,
      recommendations,
      metadata: {
        timeframe,
        dataPoints: performanceData.length,
        confidence: this.calculateConfidence(performanceData)
      }
    };

    // Save score
    this.saveScore(userId, score);
    
    console.log(`✅ Productivity score calculated: ${overallScore}%`);
    return score;
  }

  // 📈 Track productivity progress
  public async trackProductivityProgress(
    userId: string,
    startDate: number,
    endDate: number = Date.now()
  ): Promise<ProductivityProgress> {
    console.log(`📈 Tracking productivity progress for ${userId}...`);
    
    const historicalScores = this.getHistoricalScores(userId, startDate, endDate);
    const progressAnalysis = this.analyzeProgress(historicalScores);
    const improvementRates = this.calculateImprovementRates(historicalScores);
    const futureProjection = this.projectFutureProgress(historicalScores);

    return {
      userId,
      timeframe: { start: startDate, end: endDate },
      historicalScores,
      progressAnalysis,
      improvementRates,
      futureProjection,
      summary: this.generateProgressSummary(progressAnalysis, improvementRates)
    };
  }

  // 💡 Get habit improvements
  public async getCopyHabitImprovements(userId: string): Promise<HabitImprovementPlan> {
    console.log(`💡 Generating habit improvements for ${userId}...`);
    
    const currentHabits = this.analyzeCurrentHabits(userId);
    const harmfulHabits = this.identifyHarmfulHabits(currentHabits);
    const opportunities = this.findImprovementOpportunities(currentHabits);
    const plan = this.createImprovementPlan(harmfulHabits, opportunities);

    return {
      userId,
      analysisDate: Date.now(),
      currentHabits,
      harmfulHabits,
      improvementOpportunities: opportunities,
      improvementPlan: plan,
      expectedBenefits: this.calculateExpectedBenefits(plan),
      implementationGuide: this.createImplementationGuide(plan)
    };
  }

  // 🏆 Create daily challenge
  public async createDailyProductivityChallenge(
    userId: string,
    difficulty: string = 'medium'
  ): Promise<DailyChallenge> {
    console.log(`🏆 Creating daily challenge for ${userId}...`);
    
    const userAnalysis = this.analyzeUserStrengthsWeaknesses(userId);
    const challengeDesign = this.designChallenge(userAnalysis, difficulty);
    const pointsSystem = this.createPointsSystem(challengeDesign);
    const rewards = this.designRewards(challengeDesign, difficulty);

    const challenge: DailyChallenge = {
      id: `challenge_${userId}_${Date.now()}`,
      userId,
      date: new Date().toISOString().split('T')[0],
      difficulty,
      design: challengeDesign,
      pointsSystem,
      rewards,
      progress: {
        completed: 0,
        total: challengeDesign.tasks.length,
        currentStreak: this.getCurrentStreak(userId),
        bestStreak: this.getBestStreak(userId)
      },
      metadata: {
        created: Date.now(),
        estimatedTime: challengeDesign.estimatedTime,
        energyRequired: challengeDesign.energyLevel
      }
    };

    console.log(`✅ Daily challenge created: ${challenge.design.tasks.length} tasks`);
    return challenge;
  }

  // 📊 Compare with peers
  public async compareWithPeers(
    userId: string,
    peerGroup: string = 'similar-role'
  ): Promise<PeerComparison> {
    console.log(`📊 Comparing ${userId} with peers...`);
    
    const peers = this.identifyPeerGroup(userId, peerGroup);
    const comparisonData = this.collectComparisonData(userId, peers);
    const differences = this.analyzeDifferences(comparisonData);
    const ranking = this.calculateRanking(userId, peers);
    const bestPractices = this.extractBestPractices(peers);

    return {
      userId,
      peerGroup,
      peers: peers.length,
      comparisonData,
      differences,
      ranking,
      bestPractices,
      insights: this.generatePeerInsights(differences, ranking)
    };
  }

  // 🎯 Set smart goals
  public async setSmartProductivityGoals(
    userId: string,
    goalType: string = 'balanced'
  ): Promise<SmartGoals> {
    console.log(`🎯 Setting smart goals for ${userId}...`);
    
    const currentAssessment = this.assessCurrentState(userId);
    const untappedPotential = this.identifyUntappedPotential(currentAssessment);
    const smartGoals = this.createSMARTGoals(currentAssessment, untappedPotential, goalType);
    const breakdown = this.breakdownGoals(smartGoals);
    const trackingSystem = this.setupGoalTracking(smartGoals);

    return {
      userId,
      settingDate: Date.now(),
      currentAssessment,
      untappedPotential,
      smartGoals,
      breakdown,
      trackingSystem,
      motivationSystem: this.createMotivationSystem(smartGoals)
    };
  }

  // Helper methods
  private calculateCategoryScores(data: PerformanceData[]): CategoryScores {
    return {
      efficiency: this.calculateEfficiencyScore(data),
      quality: this.calculateQualityScore(data),
      diversity: this.calculateDiversityScore(data),
      learning: this.calculateLearningScore(data),
      focus: this.calculateFocusScore(data),
      innovation: this.calculateInnovationScore(data)
    };
  }

  private calculateOverallScore(categoryScores: CategoryScores): number {
    const weights = {
      efficiency: 0.25,
      quality: 0.20,
      diversity: 0.15,
      learning: 0.15,
      focus: 0.15,
      innovation: 0.10
    };

    const weightedSum = 
      categoryScores.efficiency * weights.efficiency +
      categoryScores.quality * weights.quality +
      categoryScores.diversity * weights.diversity +
      categoryScores.learning * weights.learning +
      categoryScores.focus * weights.focus +
      categoryScores.innovation * weights.innovation;

    return Math.min(100, Math.max(0, Math.round(weightedSum * 100)));
  }

  private calculateEfficiencyScore(data: PerformanceData[]): number {
    if (data.length === 0) return 0.5;
    
    const avgTime = data.reduce((sum, d) => sum + d.timePerAction, 0) / data.length;
    const benchmark = 2000; // 2 seconds benchmark
    
    return Math.max(0, Math.min(1, benchmark / avgTime));
  }

  private calculateQualityScore(data: PerformanceData[]): number {
    if (data.length === 0) return 0.5;
    
    const qualityMetrics = data.map(d => d.qualityScore || 0.7);
    return qualityMetrics.reduce((sum, q) => sum + q, 0) / qualityMetrics.length;
  }

  private calculateDiversityScore(data: PerformanceData[]): number {
    if (data.length === 0) return 0.5;
    
    const categories = new Set(data.map(d => d.category));
    const apps = new Set(data.map(d => d.app));
    
    const categoryDiversity = Math.min(1, categories.size / 5); // Max 5 categories
    const appDiversity = Math.min(1, apps.size / 8); // Max 8 apps
    
    return (categoryDiversity + appDiversity) / 2;
  }

  private calculateLearningScore(data: PerformanceData[]): number {
    if (data.length < 5) return 0.5;
    
    // Calculate improvement over time
    const recent = data.slice(-Math.floor(data.length / 2));
    const older = data.slice(0, Math.floor(data.length / 2));
    
    const recentAvg = recent.reduce((sum, d) => sum + d.efficiency, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.efficiency, 0) / older.length;
    
    const improvement = (recentAvg - olderAvg) / olderAvg;
    return Math.max(0, Math.min(1, 0.5 + improvement));
  }

  private calculateFocusScore(data: PerformanceData[]): number {
    if (data.length === 0) return 0.5;
    
    const sessionLengths = this.calculateSessionLengths(data);
    const avgSessionLength = sessionLengths.reduce((sum, l) => sum + l, 0) / sessionLengths.length;
    
    // Normalize session length (optimal around 25-45 minutes)
    const optimalLength = 35 * 60 * 1000; // 35 minutes in ms
    const focusScore = 1 - Math.abs(avgSessionLength - optimalLength) / optimalLength;
    
    return Math.max(0, Math.min(1, focusScore));
  }

  private calculateInnovationScore(data: PerformanceData[]): number {
    if (data.length === 0) return 0.5;
    
    // Measure novelty and creativity in content
    const uniquePatterns = new Set(data.map(d => d.contentPattern));
    const creativityScore = Math.min(1, uniquePatterns.size / data.length);
    
    return creativityScore;
  }

  private analyzeScoreTrend(userId: string, currentScore: number): ScoreTrend {
    const history = this.getUserScoreHistory(userId);
    
    if (history.length < 2) {
      return { direction: 'stable', change: 0, confidence: 0.5 };
    }
    
    const previousScore = history[history.length - 1].overallScore;
    const change = currentScore - previousScore;
    
    return {
      direction: change > 2 ? 'increasing' : change < -2 ? 'decreasing' : 'stable',
      change: Math.abs(change),
      confidence: Math.min(1, history.length / 10)
    };
  }

  private generateInsights(data: PerformanceData[], scores: CategoryScores): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    
    // Efficiency insights
    if (scores.efficiency < 0.6) {
      insights.push({
        id: `insight_efficiency_${Date.now()}`,
        type: 'efficiency-gap',
        title: 'Efficiency Gap Detected',
        description: 'Your copying speed is below optimal levels',
        impact: 0.7,
        confidence: 0.8,
        timestamp: Date.now()
      });
    }
    
    // Quality insights
    if (scores.quality < 0.7) {
      insights.push({
        id: `insight_quality_${Date.now()}`,
        type: 'quality-opportunity',
        title: 'Quality Improvement Opportunity',
        description: 'Content quality could be enhanced',
        impact: 0.6,
        confidence: 0.75,
        timestamp: Date.now()
      });
    }
    
    // Learning insights
    if (scores.learning > 0.8) {
      insights.push({
        id: `insight_learning_${Date.now()}`,
        type: 'learning-breakthrough',
        title: 'Learning Breakthrough',
        description: 'Rapid skill improvement detected',
        impact: 0.9,
        confidence: 0.85,
        timestamp: Date.now()
      });
    }
    
    return insights.sort((a, b) => b.impact - a.impact).slice(0, 5);
  }

  private generateRecommendations(scores: CategoryScores, insights: ProductivityInsight[]): ProductivityRecommendation[] {
    const recommendations: ProductivityRecommendation[] = [];
    
    // Efficiency recommendations
    if (scores.efficiency < 0.7) {
      recommendations.push({
        id: `rec_efficiency_${Date.now()}`,
        title: 'Use Keyboard Shortcuts',
        description: 'Learn and use keyboard shortcuts to speed up copying',
        priority: 0.8,
        category: 'efficiency',
        estimatedImpact: 0.3,
        difficulty: 'easy'
      });
    }
    
    // Quality recommendations
    if (scores.quality < 0.7) {
      recommendations.push({
        id: `rec_quality_${Date.now()}`,
        title: 'Review Before Copying',
        description: 'Take a moment to review content before copying',
        priority: 0.7,
        category: 'quality',
        estimatedImpact: 0.25,
        difficulty: 'easy'
      });
    }
    
    // Diversity recommendations
    if (scores.diversity < 0.5) {
      recommendations.push({
        id: `rec_diversity_${Date.now()}`,
        title: 'Explore New Content Types',
        description: 'Try working with different types of content',
        priority: 0.6,
        category: 'diversity',
        estimatedImpact: 0.2,
        difficulty: 'medium'
      });
    }
    
    return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }

  private startDataCollection(): void {
    // Simulate data collection
    setInterval(() => {
      this.collectPerformanceData();
    }, 10000);
  }

  private collectPerformanceData(): void {
    // Simulate performance data collection
    const users = ['user1', 'user2', 'user3'];
    
    users.forEach(userId => {
      const dataPoint: PerformanceData = {
        timestamp: Date.now(),
        userId,
        timePerAction: 1000 + Math.random() * 2000,
        qualityScore: 0.6 + Math.random() * 0.4,
        category: this.getRandomCategory(),
        app: this.getRandomApp(),
        efficiency: Math.random(),
        contentPattern: Math.random().toString(36).substr(2, 5)
      };
      
      if (!this.performanceData.has(userId)) {
        this.performanceData.set(userId, []);
      }
      
      const userData = this.performanceData.get(userId)!;
      userData.push(dataPoint);
      
      // Keep only last 1000 data points
      if (userData.length > 1000) {
        userData.splice(0, userData.length - 1000);
      }
    });
  }

  private getPerformanceData(userId: string, timeframe: string): PerformanceData[] {
    const userData = this.performanceData.get(userId) || [];
    const now = Date.now();
    let startTime = now;

    switch (timeframe) {
      case '1d': startTime = now - 86400000; break;
      case '7d': startTime = now - 604800000; break;
      case '30d': startTime = now - 2592000000; break;
      default: startTime = now - 604800000;
    }

    return userData.filter(d => d.timestamp >= startTime);
  }

  private saveScore(userId: string, score: ProductivityScore): void {
    if (!this.userScores.has(userId)) {
      this.userScores.set(userId, []);
    }
    
    const userScores = this.userScores.get(userId)!;
    userScores.push(score);
    
    // Keep only last 100 scores
    if (userScores.length > 100) {
      userScores.splice(0, userScores.length - 100);
    }
  }

  private getUserScoreHistory(userId: string): ProductivityScore[] {
    return this.userScores.get(userId) || [];
  }

  private getHistoricalScores(userId: string, startDate: number, endDate: number): ProductivityScore[] {
    const history = this.getUserScoreHistory(userId);
    return history.filter(s => s.timestamp >= startDate && s.timestamp <= endDate);
  }

  private calculateConfidence(data: PerformanceData[]): number {
    return Math.min(1, data.length / 50); // Full confidence at 50+ data points
  }

  private calculateSessionLengths(data: PerformanceData[]): number[] {
    // Simplified session calculation
    const sessions: number[] = [];
    let sessionStart = data[0]?.timestamp || Date.now();
    let sessionEnd = sessionStart;
    
    for (let i = 1; i < data.length; i++) {
      const gap = data[i].timestamp - data[i-1].timestamp;
      
      if (gap > 300000) { // 5 minute gap = new session
        sessions.push(sessionEnd - sessionStart);
        sessionStart = data[i].timestamp;
      }
      sessionEnd = data[i].timestamp;
    }
    
    if (sessionEnd > sessionStart) {
      sessions.push(sessionEnd - sessionStart);
    }
    
    return sessions;
  }

  private getRandomCategory(): string {
    const categories = ['code', 'text', 'url', 'image', 'data'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private getRandomApp(): string {
    const apps = ['VS Code', 'Browser', 'Terminal', 'Slack', 'Notion', 'Excel'];
    return apps[Math.floor(Math.random() * apps.length)];
  }

  // Simplified implementations for other methods
  private analyzeProgress(scores: ProductivityScore[]): any {
    return { trend: 'improving', rate: 0.05 };
  }

  private calculateImprovementRates(scores: ProductivityScore[]): any {
    return { overall: 15, efficiency: 20, quality: 10 };
  }

  private projectFutureProgress(scores: ProductivityScore[]): any {
    return { projectedScore: 85, confidence: 0.7, timeToTarget: '2 weeks' };
  }

  private generateProgressSummary(analysis: any, rates: any): string {
    return `Overall improvement of ${rates.overall}% with ${analysis.trend} trend`;
  }

  private analyzeCurrentHabits(userId: string): any[] {
    return [
      { habit: 'frequent-copying', impact: 'positive', strength: 0.8 },
      { habit: 'long-sessions', impact: 'negative', strength: 0.6 }
    ];
  }

  private identifyHarmfulHabits(habits: any[]): any[] {
    return habits.filter(h => h.impact === 'negative');
  }

  private findImprovementOpportunities(habits: any[]): any[] {
    return [
      { area: 'efficiency', potential: 0.3, difficulty: 'easy' },
      { area: 'quality', potential: 0.2, difficulty: 'medium' }
    ];
  }

  private createImprovementPlan(harmful: any[], opportunities: any[]): any {
    return {
      steps: [
        { action: 'Use keyboard shortcuts', timeline: '1 week', impact: 0.3 },
        { action: 'Take regular breaks', timeline: '2 weeks', impact: 0.2 }
      ],
      duration: '4 weeks',
      difficulty: 'medium'
    };
  }

  private calculateExpectedBenefits(plan: any): any {
    return { overallImprovement: 25, timeToSee: '2 weeks' };
  }

  private createImplementationGuide(plan: any): any {
    return { estimatedTime: '30 minutes daily', steps: plan.steps };
  }

  private analyzeUserStrengthsWeaknesses(userId: string): any {
    return { strengths: ['efficiency'], weaknesses: ['diversity'] };
  }

  private designChallenge(analysis: any, difficulty: string): any {
    return {
      tasks: [
        { name: 'Copy 10 different content types', points: 100 },
        { name: 'Use 3 keyboard shortcuts', points: 50 }
      ],
      estimatedTime: '30 minutes',
      energyLevel: 'medium'
    };
  }

  private createPointsSystem(design: any): any {
    return { basePoints: 100, bonusMultiplier: 1.5 };
  }

  private designRewards(design: any, difficulty: string): any {
    return { badge: 'Efficiency Master', points: 200 };
  }

  private getCurrentStreak(userId: string): number {
    return 5; // Simplified
  }

  private getBestStreak(userId: string): number {
    return 12; // Simplified
  }

  // Public API methods
  public async getProductivityScore(userId: string): Promise<ScoreSummary> {
    const score = await this.calculateProductivityScore(userId, '7d');
    
    return {
      overall: score.overallScore,
      categories: score.categoryScores,
      trend: score.trend.direction,
      topInsight: score.insights[0],
      topRecommendation: score.recommendations[0],
      timestamp: score.timestamp,
      improvementNeeded: score.overallScore < 70
    };
  }

  public async getDailyChallenge(userId: string): Promise<DailyChallenge> {
    return await this.createDailyProductivityChallenge(userId, 'medium');
  }

  public async getImprovementPlan(userId: string): Promise<ImprovementPlanSummary> {
    const plan = await this.getCopyHabitImprovements(userId);
    
    return {
      totalSteps: plan.improvementPlan.steps.length,
      estimatedTime: plan.implementationGuide.estimatedTime,
      expectedImprovement: plan.expectedBenefits.overallImprovement,
      firstStep: plan.improvementPlan.steps[0],
      motivation: 'Start with small, consistent improvements'
    };
  }

  public getAvailableUsers(): string[] {
    return Array.from(this.userScores.keys());
  }
}

// Supporting interfaces
interface PerformanceData {
  timestamp: number;
  userId: string;
  timePerAction: number;
  qualityScore: number;
  category: string;
  app: string;
  efficiency: number;
  contentPattern: string;
}

interface ScoreTrend {
  direction: 'increasing' | 'decreasing' | 'stable';
  change: number;
  confidence: number;
}

interface ScoreMetadata {
  timeframe: string;
  dataPoints: number;
  confidence: number;
}

interface ProductivityProgress {
  userId: string;
  timeframe: { start: number; end: number };
  historicalScores: ProductivityScore[];
  progressAnalysis: any;
  improvementRates: any;
  futureProjection: any;
  summary: string;
}

interface HabitImprovementPlan {
  userId: string;
  analysisDate: number;
  currentHabits: any[];
  harmfulHabits: any[];
  improvementOpportunities: any[];
  improvementPlan: any;
  expectedBenefits: any;
  implementationGuide: any;
}

interface DailyChallenge {
  id: string;
  userId: string;
  date: string;
  difficulty: string;
  design: any;
  pointsSystem: any;
  rewards: any;
  progress: {
    completed: number;
    total: number;
    currentStreak: number;
    bestStreak: number;
  };
  metadata: {
    created: number;
    estimatedTime: string;
    energyRequired: string;
  };
}

interface PeerComparison {
  userId: string;
  peerGroup: string;
  peers: number;
  comparisonData: any;
  differences: any;
  ranking: any;
  bestPractices: any[];
  insights: any[];
}

interface SmartGoals {
  userId: string;
  settingDate: number;
  currentAssessment: any;
  untappedPotential: any;
  smartGoals: any;
  breakdown: any;
  trackingSystem: any;
  motivationSystem: any;
}

interface ScoreSummary {
  overall: number;
  categories: CategoryScores;
  trend: string;
  topInsight: ProductivityInsight;
  topRecommendation: ProductivityRecommendation;
  timestamp: number;
  improvementNeeded: boolean;
}

interface ImprovementPlanSummary {
  totalSteps: number;
  estimatedTime: string;
  expectedImprovement: number;
  firstStep: any;
  motivation: string;
}

export const productivityScorer = ProductivityScorer.getInstance();