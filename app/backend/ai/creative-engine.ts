// Creative Engine - Poetry & Creative Writing System
export type CreativeType = 'poetry' | 'free-verse' | 'rap' | 'story' | 'caption';
export type PoetryStyle = 'classical' | 'modern' | 'nabati' | 'sufi' | 'romantic';
export type EmotionType = 'joy' | 'sadness' | 'love' | 'nostalgia' | 'hope' | 'anger' | 'peace';

export interface CreativeSettings {
  type: CreativeType;
  creativityLevel: number; // 0-100
  emotionIntensity: number; // 0-100
  languageStyle: 'formal' | 'casual' | 'poetic' | 'modern';
  rhythmFlow: number; // 0-100
  emotion: EmotionType;
  poetryStyle?: PoetryStyle;
}

export interface CreativeOutput {
  original: string;
  enhanced: string;
  metadata: {
    type: CreativeType;
    emotion: EmotionType;
    style: string;
    wordCount: number;
    readingTime: number;
    creativityScore: number;
    emotionScore: number;
    rhythmScore: number;
  };
  suggestions: string[];
  timestamp: number;
}

export interface CreativeProfile {
  id: string;
  name: string;
  settings: CreativeSettings;
  history: CreativeOutput[];
  stats: {
    totalCreations: number;
    favoriteType: CreativeType;
    averageCreativity: number;
    totalWords: number;
  };
}

export class CreativeEngine {
  private profiles: Map<string, CreativeProfile> = new Map();
  private currentProfile: string = 'default';

  // Poetry Templates
  private poetryPatterns = {
    classical: ['فَعُولُنْ فَعُولُنْ فَعُولُنْ فَعُولْ', 'مُفَاعَلَتُنْ مُفَاعَلَتُنْ'],
    modern: ['free-form', 'image-based', 'symbolic'],
    nabati: ['هلالي', 'مسحوب', 'صخري'],
    sufi: ['mystical', 'divine-love', 'spiritual'],
    romantic: ['love', 'longing', 'beauty']
  };

  // Emotion Enhancers
  private emotionWords = {
    joy: ['سعادة', 'فرح', 'بهجة', 'سرور', 'انشراح', 'joy', 'happiness', 'delight'],
    sadness: ['حزن', 'أسى', 'كآبة', 'شجن', 'لوعة', 'sorrow', 'grief', 'melancholy'],
    love: ['حب', 'عشق', 'غرام', 'هيام', 'وله', 'love', 'passion', 'devotion'],
    nostalgia: ['حنين', 'شوق', 'ذكرى', 'ماضي', 'nostalgia', 'longing', 'memory'],
    hope: ['أمل', 'رجاء', 'تفاؤل', 'hope', 'optimism', 'aspiration'],
    anger: ['غضب', 'سخط', 'anger', 'rage', 'fury'],
    peace: ['سلام', 'طمأنينة', 'سكينة', 'peace', 'serenity', 'tranquility']
  };

  // Metaphor Library
  private metaphors = {
    nature: ['القمر', 'النجوم', 'البحر', 'الجبال', 'الورد', 'moon', 'stars', 'ocean', 'mountains'],
    time: ['الزمان', 'الأيام', 'اللحظات', 'time', 'moments', 'eternity'],
    emotions: ['القلب', 'الروح', 'النفس', 'heart', 'soul', 'spirit']
  };

  constructor() {
    this.initializeDefaultProfile();
  }

  private initializeDefaultProfile(): void {
    const defaultProfile: CreativeProfile = {
      id: 'default',
      name: 'Default Creative Profile',
      settings: {
        type: 'poetry',
        creativityLevel: 70,
        emotionIntensity: 60,
        languageStyle: 'poetic',
        rhythmFlow: 50,
        emotion: 'joy',
        poetryStyle: 'modern'
      },
      history: [],
      stats: {
        totalCreations: 0,
        favoriteType: 'poetry',
        averageCreativity: 0,
        totalWords: 0
      }
    };
    this.profiles.set('default', defaultProfile);
  }

  async generateCreative(input: string, settings: CreativeSettings): Promise<CreativeOutput> {
    const enhanced = await this.enhanceContent(input, settings);
    const metadata = this.analyzeContent(enhanced, settings);
    const suggestions = this.generateSuggestions(input, settings);

    const output: CreativeOutput = {
      original: input,
      enhanced,
      metadata,
      suggestions,
      timestamp: Date.now()
    };

    // Update profile history
    const profile = this.profiles.get(this.currentProfile);
    if (profile) {
      profile.history.unshift(output);
      if (profile.history.length > 50) profile.history.pop();
      this.updateProfileStats(profile, output);
    }

    return output;
  }

  private async enhanceContent(input: string, settings: CreativeSettings): Promise<string> {
    let enhanced = input;

    switch (settings.type) {
      case 'poetry':
        enhanced = this.enhancePoetry(input, settings);
        break;
      case 'free-verse':
        enhanced = this.enhanceFreeVerse(input, settings);
        break;
      case 'rap':
        enhanced = this.enhanceRap(input, settings);
        break;
      case 'story':
        enhanced = this.enhanceStory(input, settings);
        break;
      case 'caption':
        enhanced = this.enhanceCaption(input, settings);
        break;
    }

    // Apply emotion intensity
    enhanced = this.applyEmotionLayer(enhanced, settings);

    // Apply creativity transformations
    if (settings.creativityLevel > 50) {
      enhanced = this.applyCreativeTransforms(enhanced, settings);
    }

    return enhanced;
  }

  private enhancePoetry(text: string, settings: CreativeSettings): string {
    const lines = text.split('\n').filter(l => l.trim());
    const style = settings.poetryStyle || 'modern';
    
    // Add poetic structure
    const enhanced = lines.map(line => {
      let enhanced = line.trim();
      
      // Add metaphors based on creativity level
      if (settings.creativityLevel > 60) {
        enhanced = this.injectMetaphors(enhanced, settings);
      }
      
      // Add rhythm markers for classical poetry
      if (style === 'classical' && settings.rhythmFlow > 50) {
        enhanced = this.addRhythmMarkers(enhanced);
      }
      
      return enhanced;
    });

    return enhanced.join('\n');
  }

  private enhanceFreeVerse(text: string, settings: CreativeSettings): string {
    const lines = text.split('\n').filter(l => l.trim());
    
    return lines.map(line => {
      let enhanced = line.trim();
      
      // Add imagery
      if (settings.creativityLevel > 40) {
        enhanced = this.addImagery(enhanced);
      }
      
      // Break conventional structure
      if (settings.creativityLevel > 70) {
        enhanced = this.breakStructure(enhanced);
      }
      
      return enhanced;
    }).join('\n');
  }

  private enhanceRap(text: string, settings: CreativeSettings): string {
    const lines = text.split('\n').filter(l => l.trim());
    
    return lines.map(line => {
      let enhanced = line.trim();
      
      // Add rhythm and flow
      if (settings.rhythmFlow > 50) {
        enhanced = this.addRapFlow(enhanced, settings.rhythmFlow);
      }
      
      // Add wordplay
      if (settings.creativityLevel > 60) {
        enhanced = this.addWordplay(enhanced);
      }
      
      return enhanced;
    }).join('\n');
  }

  private enhanceStory(text: string, settings: CreativeSettings): string {
    let enhanced = text;
    
    // Add descriptive language
    if (settings.creativityLevel > 50) {
      enhanced = this.addDescriptiveLanguage(enhanced);
    }
    
    // Enhance emotional depth
    enhanced = this.enhanceEmotionalDepth(enhanced, settings);
    
    // Improve narrative flow
    if (settings.rhythmFlow > 40) {
      enhanced = this.improveNarrativeFlow(enhanced);
    }
    
    return enhanced;
  }

  private enhanceCaption(text: string, settings: CreativeSettings): string {
    let enhanced = text.trim();
    
    // Make it concise and impactful
    if (enhanced.length > 100) {
      enhanced = this.condenseText(enhanced);
    }
    
    // Add hook
    if (settings.creativityLevel > 50) {
      enhanced = this.addCaptionHook(enhanced);
    }
    
    // Add emotion
    enhanced = this.addEmotionalPunch(enhanced, settings.emotion);
    
    return enhanced;
  }

  private applyEmotionLayer(text: string, settings: CreativeSettings): string {
    const intensity = settings.emotionIntensity / 100;
    const emotionWords = this.emotionWords[settings.emotion] || [];
    
    if (intensity < 0.3) return text;
    
    // Inject emotion-specific vocabulary
    let enhanced = text;
    const words = text.split(' ');
    
    if (intensity > 0.7 && words.length > 5) {
      // High intensity: add emotional words
      const randomEmotion = emotionWords[Math.floor(Math.random() * emotionWords.length)];
      enhanced = `${enhanced}\n${randomEmotion}`;
    }
    
    return enhanced;
  }

  private applyCreativeTransforms(text: string, settings: CreativeSettings): string {
    let enhanced = text;
    const level = settings.creativityLevel / 100;
    
    if (level > 0.8) {
      // Very high creativity: add metaphors and symbolism
      enhanced = this.injectMetaphors(enhanced, settings);
    }
    
    if (level > 0.6) {
      // High creativity: enhance imagery
      enhanced = this.addImagery(enhanced);
    }
    
    return enhanced;
  }

  private injectMetaphors(text: string, settings: CreativeSettings): string {
    const metaphorTypes = Object.keys(this.metaphors);
    const randomType = metaphorTypes[Math.floor(Math.random() * metaphorTypes.length)] as keyof typeof this.metaphors;
    const metaphorList = this.metaphors[randomType];
    const randomMetaphor = metaphorList[Math.floor(Math.random() * metaphorList.length)];
    
    // Simple injection (in production, use NLP for context-aware placement)
    return text.includes(randomMetaphor) ? text : `${text} ${randomMetaphor}`;
  }

  private addRhythmMarkers(text: string): string {
    // Add rhythm notation for classical poetry
    return text; // Simplified
  }

  private addImagery(text: string): string {
    // Add visual/sensory descriptions
    return text; // Simplified
  }

  private breakStructure(text: string): string {
    // Break conventional line structure for free verse
    return text; // Simplified
  }

  private addRapFlow(text: string, flow: number): string {
    // Add rhythm markers and flow indicators
    return text; // Simplified
  }

  private addWordplay(text: string): string {
    // Add puns, double meanings
    return text; // Simplified
  }

  private addDescriptiveLanguage(text: string): string {
    // Enhance with adjectives and sensory details
    return text; // Simplified
  }

  private enhanceEmotionalDepth(text: string, settings: CreativeSettings): string {
    // Add emotional nuance
    return text; // Simplified
  }

  private improveNarrativeFlow(text: string): string {
    // Improve transitions and pacing
    return text; // Simplified
  }

  private condenseText(text: string): string {
    // Shorten while keeping impact
    return text.substring(0, 100) + '...';
  }

  private addCaptionHook(text: string): string {
    // Add attention-grabbing opening
    return text; // Simplified
  }

  private addEmotionalPunch(text: string, emotion: EmotionType): string {
    // Add emotional impact
    return text; // Simplified
  }

  private analyzeContent(text: string, settings: CreativeSettings) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

    return {
      type: settings.type,
      emotion: settings.emotion,
      style: settings.languageStyle,
      wordCount,
      readingTime,
      creativityScore: this.calculateCreativityScore(text, settings),
      emotionScore: settings.emotionIntensity,
      rhythmScore: settings.rhythmFlow
    };
  }

  private calculateCreativityScore(text: string, settings: CreativeSettings): number {
    // Calculate based on metaphor density, unique words, structure
    const baseScore = settings.creativityLevel;
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    const totalWords = text.split(/\s+/).length;
    const uniqueness = totalWords > 0 ? (uniqueWords / totalWords) * 100 : 0;
    
    return Math.min(100, (baseScore + uniqueness) / 2);
  }

  private generateSuggestions(input: string, settings: CreativeSettings): string[] {
    const suggestions: string[] = [];
    
    if (settings.creativityLevel < 50) {
      suggestions.push('Try increasing creativity level for more unique expressions');
    }
    
    if (settings.emotionIntensity < 40) {
      suggestions.push('Add more emotional depth to connect with readers');
    }
    
    if (settings.type === 'poetry' && settings.rhythmFlow < 50) {
      suggestions.push('Increase rhythm flow for better poetic structure');
    }
    
    if (input.split(/\s+/).length < 10) {
      suggestions.push('Consider expanding your text for richer content');
    }
    
    return suggestions;
  }

  private updateProfileStats(profile: CreativeProfile, output: CreativeOutput): void {
    profile.stats.totalCreations++;
    profile.stats.totalWords += output.metadata.wordCount;
    profile.stats.averageCreativity = 
      (profile.stats.averageCreativity * (profile.stats.totalCreations - 1) + 
       output.metadata.creativityScore) / profile.stats.totalCreations;
  }

  // Profile Management
  createProfile(name: string, settings: CreativeSettings): string {
    const id = `profile_${Date.now()}`;
    const profile: CreativeProfile = {
      id,
      name,
      settings,
      history: [],
      stats: {
        totalCreations: 0,
        favoriteType: settings.type,
        averageCreativity: 0,
        totalWords: 0
      }
    };
    this.profiles.set(id, profile);
    return id;
  }

  switchProfile(profileId: string): boolean {
    if (this.profiles.has(profileId)) {
      this.currentProfile = profileId;
      return true;
    }
    return false;
  }

  getCurrentProfile(): CreativeProfile | undefined {
    return this.profiles.get(this.currentProfile);
  }

  getAllProfiles(): CreativeProfile[] {
    return Array.from(this.profiles.values());
  }

  updateProfileSettings(settings: Partial<CreativeSettings>): void {
    const profile = this.profiles.get(this.currentProfile);
    if (profile) {
      profile.settings = { ...profile.settings, ...settings };
    }
  }

  getHistory(limit: number = 10): CreativeOutput[] {
    const profile = this.profiles.get(this.currentProfile);
    return profile ? profile.history.slice(0, limit) : [];
  }

  getCreativeScore(): number {
    const profile = this.profiles.get(this.currentProfile);
    return profile ? profile.stats.averageCreativity : 0;
  }
}

export const creativeEngine = new CreativeEngine();
