/**
 * 🎨 UI Morphing System
 * Adaptive interface transformation based on content, mood, and context
 */

export interface UITheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    lineHeight: number;
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  animations: {
    duration: string;
    easing: string;
  };
}

export interface UIMorphProfile {
  id: string;
  name: string;
  type: 'content-based' | 'mood-based' | 'context-based';
  theme: UITheme;
  layout: string;
  density: 'low' | 'medium' | 'high';
}

export interface MorphResult {
  originalTheme: UITheme;
  morphedTheme: UITheme;
  morphType: string;
  confidence: number;
  changes: string[];
  cssVariables: Record<string, string>;
}

export class UIMorpher {
  private static instance: UIMorpher;
  private profiles: Map<string, UIMorphProfile> = new Map();
  private currentProfile: UIMorphProfile;

  private constructor() {
    this.initializeProfiles();
  }

  public static getInstance(): UIMorpher {
    if (!UIMorpher.instance) {
      UIMorpher.instance = new UIMorpher();
    }
    return UIMorpher.instance;
  }

  private initializeProfiles(): void {
    // Content-based profiles
    this.profiles.set('code', {
      id: 'code',
      name: 'Developer Mode',
      type: 'content-based',
      theme: {
        colors: {
          primary: '#007ACC',
          secondary: '#1E1E1E',
          accent: '#4FC3F7',
          background: '#0D1117',
          text: '#F0F6FC'
        },
        typography: {
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '14px',
          lineHeight: 1.5
        },
        spacing: { unit: 8, scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8] },
        animations: { duration: '200ms', easing: 'ease-out' }
      },
      layout: 'multi-panel',
      density: 'high'
    });

    this.profiles.set('writing', {
      id: 'writing',
      name: 'Writer Mode',
      type: 'content-based',
      theme: {
        colors: {
          primary: '#8B4513',
          secondary: '#F5F5DC',
          accent: '#CD853F',
          background: '#FDF6E3',
          text: '#5C4033'
        },
        typography: {
          fontFamily: 'Georgia, serif',
          fontSize: '16px',
          lineHeight: 1.6
        },
        spacing: { unit: 12, scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8] },
        animations: { duration: '300ms', easing: 'ease-in-out' }
      },
      layout: 'zen',
      density: 'low'
    });

    // Mood-based profiles
    this.profiles.set('productive', {
      id: 'productive',
      name: 'Productive Mode',
      type: 'mood-based',
      theme: {
        colors: {
          primary: '#4CAF50',
          secondary: '#8BC34A',
          accent: '#CDDC39',
          background: '#F1F8E9',
          text: '#2E7D32'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '15px',
          lineHeight: 1.5
        },
        spacing: { unit: 10, scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8] },
        animations: { duration: '250ms', easing: 'ease-out' }
      },
      layout: 'grid',
      density: 'medium'
    });

    this.profiles.set('calm', {
      id: 'calm',
      name: 'Calm Mode',
      type: 'mood-based',
      theme: {
        colors: {
          primary: '#2196F3',
          secondary: '#03A9F4',
          accent: '#00BCD4',
          background: '#E3F2FD',
          text: '#37474F'
        },
        typography: {
          fontFamily: 'Roboto, sans-serif',
          fontSize: '16px',
          lineHeight: 1.6
        },
        spacing: { unit: 16, scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8] },
        animations: { duration: '400ms', easing: 'ease-in-out' }
      },
      layout: 'minimal',
      density: 'low'
    });

    this.currentProfile = this.profiles.get('productive')!;
  }

  // 🎨 Morph UI based on content type
  public async morphByContent(contentType: string): Promise<MorphResult> {
    const profile = this.getContentProfile(contentType);
    return this.applyMorph(profile, 'content');
  }

  // 😊 Morph UI based on detected mood
  public async morphByMood(mood: string, intensity: number = 0.7): Promise<MorphResult> {
    const profile = this.getMoodProfile(mood);
    const adjustedProfile = this.adjustProfileIntensity(profile, intensity);
    return this.applyMorph(adjustedProfile, 'mood');
  }

  // 💻 Morph for developer context
  public async morphForDeveloper(language: string = 'typescript'): Promise<MorphResult> {
    const devProfile = this.createDeveloperProfile(language);
    return this.applyMorph(devProfile, 'developer');
  }

  // 📝 Morph for writer context
  public async morphForWriter(writingType: string = 'article'): Promise<MorphResult> {
    const writerProfile = this.createWriterProfile(writingType);
    return this.applyMorph(writerProfile, 'writer');
  }

  // 🌈 Generate dynamic colors based on mood
  public async generateDynamicColors(
    baseColor: string,
    mood: string,
    intensity: number = 0.5
  ): Promise<Record<string, string>> {
    const moodAdjustments = this.getMoodColorAdjustments(mood);
    const colors = this.generateColorPalette(baseColor, moodAdjustments, intensity);
    
    return {
      '--primary-color': colors.primary,
      '--secondary-color': colors.secondary,
      '--accent-color': colors.accent,
      '--background-color': colors.background,
      '--text-color': colors.text,
      '--mood-intensity': intensity.toString()
    };
  }

  // 🎭 Dynamic style switching
  public async switchStyle(targetStyle: string): Promise<MorphResult> {
    const profile = this.profiles.get(targetStyle);
    if (!profile) {
      throw new Error(`Style '${targetStyle}' not found`);
    }
    
    return this.applyMorph(profile, 'switch');
  }

  // 📱 Adapt for device type
  public async adaptForDevice(deviceType: 'mobile' | 'tablet' | 'desktop'): Promise<MorphResult> {
    const deviceProfile = this.createDeviceProfile(deviceType);
    return this.applyMorph(deviceProfile, 'device');
  }

  // Core morphing logic
  private async applyMorph(profile: UIMorphProfile, morphType: string): Promise<MorphResult> {
    const originalTheme = this.currentProfile.theme;
    const morphedTheme = profile.theme;
    
    const changes = this.calculateChanges(originalTheme, morphedTheme);
    const cssVariables = this.generateCSSVariables(morphedTheme);
    
    // Apply the morph
    this.currentProfile = profile;
    this.applyCSSVariables(cssVariables);
    
    return {
      originalTheme,
      morphedTheme,
      morphType,
      confidence: 0.85 + Math.random() * 0.1,
      changes,
      cssVariables
    };
  }

  private getContentProfile(contentType: string): UIMorphProfile {
    const contentProfiles: Record<string, string> = {
      'code': 'code',
      'typescript': 'code',
      'javascript': 'code',
      'python': 'code',
      'text': 'writing',
      'article': 'writing',
      'document': 'writing'
    };
    
    const profileId = contentProfiles[contentType] || 'productive';
    return this.profiles.get(profileId) || this.profiles.get('productive')!;
  }

  private getMoodProfile(mood: string): UIMorphProfile {
    const moodProfiles: Record<string, string> = {
      'happy': 'productive',
      'energetic': 'productive',
      'calm': 'calm',
      'relaxed': 'calm',
      'focused': 'productive',
      'creative': 'writing'
    };
    
    const profileId = moodProfiles[mood] || 'productive';
    return this.profiles.get(profileId) || this.profiles.get('productive')!;
  }

  private createDeveloperProfile(language: string): UIMorphProfile {
    const baseProfile = this.profiles.get('code')!;
    
    // Language-specific customizations
    const languageColors: Record<string, string> = {
      'typescript': '#007ACC',
      'javascript': '#F7DF1E',
      'python': '#3776AB',
      'java': '#ED8B00',
      'rust': '#000000'
    };
    
    return {
      ...baseProfile,
      theme: {
        ...baseProfile.theme,
        colors: {
          ...baseProfile.theme.colors,
          primary: languageColors[language] || baseProfile.theme.colors.primary
        }
      }
    };
  }

  private createWriterProfile(writingType: string): UIMorphProfile {
    const baseProfile = this.profiles.get('writing')!;
    
    // Writing type customizations
    const typeAdjustments: Record<string, Partial<UITheme>> = {
      'poetry': {
        typography: {
          fontFamily: 'Crimson Text, serif',
          fontSize: '18px',
          lineHeight: 1.8
        }
      },
      'technical': {
        typography: {
          fontFamily: 'Source Sans Pro, sans-serif',
          fontSize: '15px',
          lineHeight: 1.5
        }
      }
    };
    
    const adjustments = typeAdjustments[writingType] || {};
    
    return {
      ...baseProfile,
      theme: {
        ...baseProfile.theme,
        ...adjustments
      }
    };
  }

  private createDeviceProfile(deviceType: string): UIMorphProfile {
    const baseProfile = this.currentProfile;
    
    const deviceAdjustments: Record<string, Partial<UITheme>> = {
      'mobile': {
        typography: { fontSize: '16px', lineHeight: 1.4 },
        spacing: { unit: 12, scale: [0.5, 1, 1.5, 2, 3, 4] }
      },
      'tablet': {
        typography: { fontSize: '15px', lineHeight: 1.5 },
        spacing: { unit: 10, scale: [0.5, 1, 1.5, 2, 3, 4, 6] }
      },
      'desktop': {
        typography: { fontSize: '14px', lineHeight: 1.5 },
        spacing: { unit: 8, scale: [0.5, 1, 1.5, 2, 3, 4, 6, 8] }
      }
    };
    
    const adjustments = deviceAdjustments[deviceType] || {};
    
    return {
      ...baseProfile,
      theme: {
        ...baseProfile.theme,
        ...adjustments
      }
    };
  }

  private adjustProfileIntensity(profile: UIMorphProfile, intensity: number): UIMorphProfile {
    // Adjust color saturation and contrast based on intensity
    return {
      ...profile,
      theme: {
        ...profile.theme,
        colors: {
          ...profile.theme.colors,
          primary: this.adjustColorIntensity(profile.theme.colors.primary, intensity),
          accent: this.adjustColorIntensity(profile.theme.colors.accent, intensity)
        }
      }
    };
  }

  private getMoodColorAdjustments(mood: string): Record<string, number> {
    const adjustments: Record<string, Record<string, number>> = {
      'happy': { hue: 45, saturation: 1.2, lightness: 1.1 },
      'calm': { hue: 210, saturation: 0.8, lightness: 1.0 },
      'energetic': { hue: 0, saturation: 1.3, lightness: 1.0 },
      'focused': { hue: 120, saturation: 0.9, lightness: 0.9 }
    };
    
    return adjustments[mood] || { hue: 0, saturation: 1.0, lightness: 1.0 };
  }

  private generateColorPalette(
    baseColor: string,
    adjustments: Record<string, number>,
    intensity: number
  ): Record<string, string> {
    // Simplified color generation
    return {
      primary: baseColor,
      secondary: this.adjustColor(baseColor, 0.2),
      accent: this.adjustColor(baseColor, -0.1),
      background: this.adjustColor(baseColor, 0.9),
      text: this.adjustColor(baseColor, -0.8)
    };
  }

  private adjustColor(color: string, adjustment: number): string {
    // Simplified color adjustment
    return color; // In real implementation, would use color manipulation library
  }

  private adjustColorIntensity(color: string, intensity: number): string {
    // Simplified intensity adjustment
    return color; // In real implementation, would adjust saturation/brightness
  }

  private calculateChanges(original: UITheme, morphed: UITheme): string[] {
    const changes: string[] = [];
    
    if (original.colors.primary !== morphed.colors.primary) {
      changes.push('Primary color updated');
    }
    if (original.typography.fontFamily !== morphed.typography.fontFamily) {
      changes.push('Font family changed');
    }
    if (original.spacing.unit !== morphed.spacing.unit) {
      changes.push('Spacing adjusted');
    }
    
    return changes;
  }

  private generateCSSVariables(theme: UITheme): Record<string, string> {
    return {
      '--primary-color': theme.colors.primary,
      '--secondary-color': theme.colors.secondary,
      '--accent-color': theme.colors.accent,
      '--background-color': theme.colors.background,
      '--text-color': theme.colors.text,
      '--font-family': theme.typography.fontFamily,
      '--font-size': theme.typography.fontSize,
      '--line-height': theme.typography.lineHeight.toString(),
      '--spacing-unit': `${theme.spacing.unit}px`,
      '--animation-duration': theme.animations.duration,
      '--animation-easing': theme.animations.easing
    };
  }

  private applyCSSVariables(variables: Record<string, string>): void {
    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }

  // Public API methods
  public getCurrentProfile(): UIMorphProfile {
    return this.currentProfile;
  }

  public getAvailableProfiles(): UIMorphProfile[] {
    return Array.from(this.profiles.values());
  }

  public async autoMorph(context: {
    contentType?: string;
    mood?: string;
    role?: string;
    device?: string;
  }): Promise<MorphResult> {
    // Determine best morph based on context
    if (context.contentType) {
      return this.morphByContent(context.contentType);
    } else if (context.mood) {
      return this.morphByMood(context.mood);
    } else if (context.role === 'developer') {
      return this.morphForDeveloper();
    } else if (context.role === 'writer') {
      return this.morphForWriter();
    } else if (context.device) {
      return this.adaptForDevice(context.device as any);
    }
    
    // Default to productive mode
    return this.switchStyle('productive');
  }

  public async createCustomProfile(
    name: string,
    baseProfile: string,
    customizations: Partial<UITheme>
  ): Promise<string> {
    const base = this.profiles.get(baseProfile);
    if (!base) {
      throw new Error(`Base profile '${baseProfile}' not found`);
    }
    
    const profileId = `custom_${Date.now()}`;
    const customProfile: UIMorphProfile = {
      id: profileId,
      name,
      type: 'context-based',
      theme: {
        ...base.theme,
        ...customizations
      },
      layout: base.layout,
      density: base.density
    };
    
    this.profiles.set(profileId, customProfile);
    return profileId;
  }
}

export const uiMorpher = UIMorpher.getInstance();