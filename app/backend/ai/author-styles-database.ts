export interface AuthorStyle {
  name: string;
  era: string;
  genre: string[];
  nationality: string;
  lifespan: string;
  characteristics: AuthorCharacteristics;
  linguisticProfile: AuthorLinguisticProfile;
  thematicElements: ThematicProfile;
  narrativeTechniques: NarrativeProfile;
  culturalInfluences: CulturalProfile;
  historicalContext: HistoricalProfile;
  literaryMovement: LiteraryMovement;
  signature: AuthorSignature;
  sample: string;
  marketValue: MarketProfile;
  competitivePosition: CompetitiveProfile;
}

export interface AuthorCharacteristics {
  vocabulary: string[];
  sentenceStructure: string[];
  emotionalRange: string[];
  distinctiveFeatures: string[];
  writingTechniques: string[];
  stylistic_innovations: string[];
  recurring_motifs: string[];
  philosophical_themes: string[];
}

export const comprehensiveAuthorStyles: Record<string, AuthorStyle> = {
  'william-shakespeare': {
    name: 'William Shakespeare',
    era: 'Renaissance',
    genre: ['Drama', 'Poetry', 'Tragedy', 'Comedy', 'History'],
    nationality: 'English',
    lifespan: '1564-1616',
    characteristics: {
      vocabulary: ['archaic', 'poetic', 'metaphorical', 'inventive', 'layered'],
      sentenceStructure: ['iambic pentameter', 'complex', 'rhythmic', 'balanced', 'musical'],
      emotionalRange: ['dramatic', 'passionate', 'tragic', 'comedic', 'profound'],
      distinctiveFeatures: ['soliloquies', 'wordplay', 'sonnets', 'double meanings', 'puns'],
      writingTechniques: ['blank verse', 'prose', 'rhyming couplets', 'metaphor', 'symbolism'],
      stylistic_innovations: ['psychological depth', 'character development', 'plot complexity'],
      recurring_motifs: ['fate vs free will', 'appearance vs reality', 'power corruption'],
      philosophical_themes: ['human nature', 'mortality', 'love', 'justice', 'redemption']
    },
    linguisticProfile: {
      lexicalDensity: 0.92,
      syntacticComplexity: 0.88,
      metaphoricalRichness: 0.95,
      rhythmicQuality: 0.98,
      semanticLayering: 0.90
    },
    thematicElements: {
      primaryThemes: ['love', 'power', 'betrayal', 'redemption', 'mortality'],
      secondaryThemes: ['appearance vs reality', 'fate vs free will', 'nature vs nurture'],
      symbolism: ['light/dark', 'blood', 'sleep/death', 'nature', 'time'],
      archetypes: ['tragic hero', 'wise fool', 'femme fatale', 'mentor', 'trickster']
    },
    narrativeTechniques: {
      pointOfView: ['third person omniscient', 'first person soliloquy'],
      structure: ['five-act structure', 'subplot weaving', 'parallel plots'],
      pacing: ['varied tempo', 'dramatic tension', 'comic relief'],
      characterization: ['psychological depth', 'character arcs', 'foil characters']
    },
    culturalInfluences: {
      historical: ['Elizabethan England', 'Renaissance humanism', 'Protestant Reformation'],
      literary: ['Classical mythology', 'Medieval romance', 'Morality plays'],
      social: ['Court culture', 'Rising merchant class', 'Religious tensions'],
      philosophical: ['Neoplatonism', 'Stoicism', 'Christian theology']
    },
    historicalContext: {
      politicalClimate: 'Elizabethan/Jacobean monarchy',
      socialStructure: 'Feudal to early modern transition',
      religiousContext: 'Protestant England with Catholic tensions',
      culturalMovement: 'English Renaissance',
      technologicalAdvances: 'Printing press proliferation'
    },
    literaryMovement: {
      primary: 'English Renaissance',
      secondary: ['Elizabethan Drama', 'Metaphysical Poetry'],
      influences: ['Classical literature', 'Italian Renaissance', 'Medieval traditions'],
      innovations: ['Psychological realism', 'Complex characterization', 'Poetic drama']
    },
    signature: {
      openingStyle: 'Dramatic exposition with poetic language',
      closingStyle: 'Moral resolution with rhyming couplet',
      dialoguePattern: 'Witty exchanges with double meanings',
      descriptiveStyle: 'Rich metaphorical imagery',
      emotionalExpression: 'Passionate and philosophical'
    },
    sample: 'To be, or not to be: that is the question: Whether \'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles, and by opposing end them?',
    marketValue: {
      commercialAppeal: 0.95,
      educationalValue: 0.98,
      brandRecognition: 0.99,
      adaptabilityScore: 0.90,
      timelessness: 0.99
    },
    competitivePosition: {
      uniqueness: 0.98,
      marketDemand: 0.92,
      differentiationFactor: 0.95,
      scalabilityPotential: 0.88,
      monetizationOpportunity: 0.85
    }
  },

  'ernest-hemingway': {
    name: 'Ernest Hemingway',
    era: 'Modernist',
    genre: ['Fiction', 'Journalism', 'Short Stories', 'Novels'],
    nationality: 'American',
    lifespan: '1899-1961',
    characteristics: {
      vocabulary: ['simple', 'direct', 'concise', 'understated', 'precise'],
      sentenceStructure: ['short', 'declarative', 'minimalist', 'coordinated', 'rhythmic'],
      emotionalRange: ['understated', 'masculine', 'stoic', 'melancholic', 'intense'],
      distinctiveFeatures: ['iceberg theory', 'dialog-heavy', 'action-oriented', 'subtext'],
      writingTechniques: ['omission', 'repetition', 'understatement', 'symbolism'],
      stylistic_innovations: ['iceberg theory', 'objective narration', 'spare prose'],
      recurring_motifs: ['war', 'death', 'love', 'nature', 'honor'],
      philosophical_themes: ['existentialism', 'nihilism', 'code of honor', 'grace under pressure']
    },
    linguisticProfile: {
      lexicalDensity: 0.65,
      syntacticComplexity: 0.45,
      metaphoricalRichness: 0.70,
      rhythmicQuality: 0.85,
      semanticLayering: 0.88
    },
    thematicElements: {
      primaryThemes: ['war', 'death', 'love', 'loss', 'masculinity'],
      secondaryThemes: ['nature', 'honor', 'courage', 'disillusionment', 'alienation'],
      symbolism: ['bulls', 'fish', 'rain', 'mountains', 'alcohol'],
      archetypes: ['wounded hero', 'code hero', 'earth mother', 'mentor', 'antagonist']
    },
    narrativeTechniques: {
      pointOfView: ['third person limited', 'first person'],
      structure: ['linear narrative', 'episodic', 'circular structure'],
      pacing: ['steady rhythm', 'building tension', 'climactic moments'],
      characterization: ['behavioral revelation', 'dialogue-driven', 'action-based']
    },
    culturalInfluences: {
      historical: ['World War I', 'Spanish Civil War', 'Lost Generation'],
      literary: ['Gertrude Stein', 'Ezra Pound', 'James Joyce'],
      social: ['Post-war disillusionment', 'Expatriate culture', 'Modernist movement'],
      philosophical: ['Existentialism', 'Stoicism', 'Naturalism']
    },
    historicalContext: {
      politicalClimate: 'Post-WWI America and Europe',
      socialStructure: 'Modern industrial society',
      religiousContext: 'Declining traditional faith',
      culturalMovement: 'Modernism and Lost Generation',
      technologicalAdvances: 'Mass media and transportation'
    },
    literaryMovement: {
      primary: 'Modernism',
      secondary: ['Lost Generation', 'American Realism'],
      influences: ['Naturalism', 'Impressionism', 'Journalism'],
      innovations: ['Iceberg theory', 'Objective prose', 'Minimalist style']
    },
    signature: {
      openingStyle: 'Direct action or dialogue',
      closingStyle: 'Understated emotional impact',
      dialoguePattern: 'Realistic, subtext-heavy conversations',
      descriptiveStyle: 'Precise, sensory details',
      emotionalExpression: 'Restrained and implicit'
    },
    sample: 'He was an old man who fished alone in a skiff in the Gulf Stream and he had gone eighty-four days now without taking a fish.',
    marketValue: {
      commercialAppeal: 0.88,
      educationalValue: 0.92,
      brandRecognition: 0.94,
      adaptabilityScore: 0.85,
      timelessness: 0.90
    },
    competitivePosition: {
      uniqueness: 0.92,
      marketDemand: 0.85,
      differentiationFactor: 0.90,
      scalabilityPotential: 0.82,
      monetizationOpportunity: 0.88
    }
  },

  'jane-austen': {
    name: 'Jane Austen',
    era: 'Regency',
    genre: ['Romance', 'Social Commentary', 'Comedy of Manners'],
    nationality: 'English',
    lifespan: '1775-1817',
    characteristics: {
      vocabulary: ['elegant', 'witty', 'refined', 'precise', 'ironic'],
      sentenceStructure: ['complex', 'balanced', 'periodic', 'sophisticated', 'flowing'],
      emotionalRange: ['subtle', 'romantic', 'satirical', 'gentle', 'perceptive'],
      distinctiveFeatures: ['free indirect speech', 'social observation', 'character development'],
      writingTechniques: ['irony', 'wit', 'social satire', 'psychological insight'],
      stylistic_innovations: ['free indirect discourse', 'psychological realism'],
      recurring_motifs: ['marriage', 'social class', 'money', 'education', 'morality'],
      philosophical_themes: ['social criticism', 'individual vs society', 'moral development']
    },
    linguisticProfile: {
      lexicalDensity: 0.78,
      syntacticComplexity: 0.82,
      metaphoricalRichness: 0.75,
      rhythmicQuality: 0.88,
      semanticLayering: 0.85
    },
    thematicElements: {
      primaryThemes: ['love', 'marriage', 'social class', 'money', 'morality'],
      secondaryThemes: ['education', 'family', 'friendship', 'prejudice', 'pride'],
      symbolism: ['estates', 'letters', 'dancing', 'walking', 'reading'],
      archetypes: ['heroine', 'rake', 'mentor', 'fool', 'rival']
    },
    narrativeTechniques: {
      pointOfView: ['third person omniscient', 'free indirect discourse'],
      structure: ['three-volume novel', 'parallel plots', 'symmetrical design'],
      pacing: ['measured development', 'social scenes', 'intimate moments'],
      characterization: ['psychological depth', 'social types', 'moral development']
    },
    culturalInfluences: {
      historical: ['Regency England', 'Napoleonic Wars', 'Industrial Revolution'],
      literary: ['Richardson', 'Fielding', 'Johnson', 'Burney'],
      social: ['Landed gentry', 'Marriage market', 'Social mobility'],
      philosophical: ['Enlightenment', 'Moral philosophy', 'Sensibility']
    },
    historicalContext: {
      politicalClimate: 'Regency period stability',
      socialStructure: 'Rigid class hierarchy',
      religiousContext: 'Anglican establishment',
      culturalMovement: 'Romantic period emergence',
      technologicalAdvances: 'Early industrial development'
    },
    literaryMovement: {
      primary: 'Regency Literature',
      secondary: ['Novel of Manners', 'Domestic Realism'],
      influences: ['Augustan literature', 'Sentimental novel', 'Gothic romance'],
      innovations: ['Psychological realism', 'Social comedy', 'Ironic narration']
    },
    signature: {
      openingStyle: 'Witty social observation',
      closingStyle: 'Moral resolution with romantic fulfillment',
      dialoguePattern: 'Sparkling wit and social commentary',
      descriptiveStyle: 'Elegant and precise social detail',
      emotionalExpression: 'Restrained but deeply felt'
    },
    sample: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
    marketValue: {
      commercialAppeal: 0.90,
      educationalValue: 0.95,
      brandRecognition: 0.92,
      adaptabilityScore: 0.88,
      timelessness: 0.94
    },
    competitivePosition: {
      uniqueness: 0.89,
      marketDemand: 0.87,
      differentiationFactor: 0.91,
      scalabilityPotential: 0.85,
      monetizationOpportunity: 0.90
    }
  },

  'george-orwell': {
    name: 'George Orwell',
    era: 'Modern',
    genre: ['Dystopian Fiction', 'Political Commentary', 'Essays'],
    nationality: 'British',
    lifespan: '1903-1950',
    characteristics: {
      vocabulary: ['clear', 'direct', 'political', 'analytical', 'accessible'],
      sentenceStructure: ['straightforward', 'logical', 'persuasive', 'varied', 'effective'],
      emotionalRange: ['urgent', 'concerned', 'analytical', 'passionate', 'warning'],
      distinctiveFeatures: ['political allegory', 'social criticism', 'dystopian vision'],
      writingTechniques: ['allegory', 'satire', 'plain style', 'logical argument'],
      stylistic_innovations: ['political allegory', 'dystopian realism', 'plain English'],
      recurring_motifs: ['totalitarianism', 'surveillance', 'language manipulation', 'power'],
      philosophical_themes: ['political freedom', 'truth', 'individual vs state', 'language power']
    },
    linguisticProfile: {
      lexicalDensity: 0.72,
      syntacticComplexity: 0.68,
      metaphoricalRichness: 0.82,
      rhythmicQuality: 0.75,
      semanticLayering: 0.90
    },
    thematicElements: {
      primaryThemes: ['totalitarianism', 'freedom', 'truth', 'power', 'surveillance'],
      secondaryThemes: ['language', 'history', 'class', 'revolution', 'corruption'],
      symbolism: ['Big Brother', 'Room 101', 'telescreens', 'doublethink', 'newspeak'],
      archetypes: ['rebel', 'dictator', 'everyman', 'betrayer', 'victim']
    },
    narrativeTechniques: {
      pointOfView: ['third person limited', 'omniscient narrator'],
      structure: ['chronological', 'allegorical', 'episodic'],
      pacing: ['building tension', 'climactic revelation', 'inevitable conclusion'],
      characterization: ['symbolic representation', 'psychological development', 'social types']
    },
    culturalInfluences: {
      historical: ['World War II', 'Spanish Civil War', 'Rise of totalitarianism'],
      literary: ['Swift', 'Dickens', 'Wells', 'Zamyatin'],
      social: ['Imperial decline', 'Class struggle', 'Political upheaval'],
      philosophical: ['Socialism', 'Anti-totalitarianism', 'Democratic socialism']
    },
    historicalContext: {
      politicalClimate: 'Rise of fascism and communism',
      socialStructure: 'Class-conscious British society',
      religiousContext: 'Declining religious influence',
      culturalMovement: 'Political modernism',
      technologicalAdvances: 'Mass communication and surveillance'
    },
    literaryMovement: {
      primary: 'Political Literature',
      secondary: ['Dystopian Fiction', 'Social Realism'],
      influences: ['Satirical tradition', 'Political journalism', 'Socialist realism'],
      innovations: ['Modern dystopia', 'Political allegory', 'Plain style advocacy']
    },
    signature: {
      openingStyle: 'Immediate immersion in dystopian reality',
      closingStyle: 'Bleak but powerful conclusion',
      dialoguePattern: 'Ideological and revealing conversations',
      descriptiveStyle: 'Clear, vivid, and symbolic',
      emotionalExpression: 'Controlled passion and urgency'
    },
    sample: 'It was a bright cold day in April, and the clocks were striking thirteen.',
    marketValue: {
      commercialAppeal: 0.92,
      educationalValue: 0.98,
      brandRecognition: 0.96,
      adaptabilityScore: 0.90,
      timelessness: 0.97
    },
    competitivePosition: {
      uniqueness: 0.94,
      marketDemand: 0.91,
      differentiationFactor: 0.93,
      scalabilityPotential: 0.89,
      monetizationOpportunity: 0.92
    }
  }
};

export class AuthorStyleDatabase {
  private static instance: AuthorStyleDatabase;
  private authorProfiles: Map<string, AuthorStyle> = new Map();
  
  private constructor() {
    this.loadAuthorProfiles();
  }
  
  public static getInstance(): AuthorStyleDatabase {
    if (!AuthorStyleDatabase.instance) {
      AuthorStyleDatabase.instance = new AuthorStyleDatabase();
    }
    return AuthorStyleDatabase.instance;
  }
  
  private loadAuthorProfiles(): void {
    Object.entries(comprehensiveAuthorStyles).forEach(([key, profile]) => {
      this.authorProfiles.set(key, profile);
    });
    
    console.log(`📚 Loaded ${this.authorProfiles.size} comprehensive author profiles`);
  }
  
  public getAuthorProfile(authorName: string): AuthorStyle | undefined {
    return this.authorProfiles.get(authorName);
  }
  
  public getAllAuthors(): string[] {
    return Array.from(this.authorProfiles.keys());
  }
  
  public getAuthorsByEra(era: string): AuthorStyle[] {
    return Array.from(this.authorProfiles.values())
      .filter(profile => profile.era === era);
  }
  
  public getAuthorsByGenre(genre: string): AuthorStyle[] {
    return Array.from(this.authorProfiles.values())
      .filter(profile => profile.genre.includes(genre));
  }
  
  public getMarketLeaders(): AuthorStyle[] {
    return Array.from(this.authorProfiles.values())
      .filter(profile => profile.marketValue.commercialAppeal > 0.9)
      .sort((a, b) => b.marketValue.commercialAppeal - a.marketValue.commercialAppeal);
  }
  
  public getCompetitiveAnalysis(): CompetitiveAnalysis {
    const profiles = Array.from(this.authorProfiles.values());
    
    return {
      marketLeaders: profiles.filter(p => p.competitivePosition.uniqueness > 0.9),
      emergingTrends: this.identifyEmergingTrends(profiles),
      marketGaps: this.identifyMarketGaps(profiles),
      competitiveThreats: this.identifyCompetitiveThreats(profiles),
      opportunities: this.identifyOpportunities(profiles)
    };
  }
  
  private identifyEmergingTrends(profiles: AuthorStyle[]): TrendAnalysis[] {
    // Analyze patterns in author characteristics to identify trends
    return [
      {
        trend: 'Minimalist prose',
        strength: 0.85,
        examples: ['hemingway'],
        marketPotential: 0.88
      },
      {
        trend: 'Psychological realism',
        strength: 0.92,
        examples: ['austen', 'shakespeare'],
        marketPotential: 0.90
      }
    ];
  }
  
  private identifyMarketGaps(profiles: AuthorStyle[]): MarketGap[] {
    return [
      {
        gap: 'Digital native writing styles',
        opportunity: 0.95,
        description: 'Modern digital communication patterns'
      },
      {
        gap: 'Cross-cultural fusion styles',
        opportunity: 0.88,
        description: 'Blending multiple cultural writing traditions'
      }
    ];
  }
  
  private identifyCompetitiveThreats(profiles: AuthorStyle[]): CompetitiveThreat[] {
    return [
      {
        threat: 'AI-generated content',
        severity: 0.75,
        timeframe: 'immediate',
        mitigation: 'Emphasize human creativity and emotional depth'
      }
    ];
  }
  
  private identifyOpportunities(profiles: AuthorStyle[]): MarketOpportunity[] {
    return [
      {
        opportunity: 'Personalized style adaptation',
        potential: 0.92,
        investment: 'high',
        timeline: '6-12 months'
      },
      {
        opportunity: 'Real-time style coaching',
        potential: 0.88,
        investment: 'medium',
        timeline: '3-6 months'
      }
    ];
  }
}