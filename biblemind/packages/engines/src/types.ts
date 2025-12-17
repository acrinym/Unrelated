/**
 * BibleMind Core Types
 *
 * Type definitions for the Biblical Holographic Reasoning Engine
 */

// ============================================================================
// SCRIPTURE TYPES
// ============================================================================

export interface Scripture {
  reference: string;        // "John 3:16"
  text: string;            // Full verse text
  translation: string;     // "ESV", "NIV", "KJV"
  testament: 'old' | 'new';
  book: string;
  chapter: number;
  verse: number;
  context?: string;        // Why this verse is relevant
  hebrewGreek?: string;    // Original language text
  strongsNumbers?: string[]; // Strong's concordance numbers
  themes?: string[];       // ["salvation", "grace", "love"]
}

export interface CrossReference {
  primary: string;         // Primary verse reference
  related: string[];       // Related verse references
  relationship: 'parallel' | 'contrast' | 'fulfillment' | 'application';
}

// ============================================================================
// USER CONTEXT TYPES
// ============================================================================

export interface UserContext {
  userId: string;
  denomination?: 'catholic' | 'protestant' | 'orthodox' | 'messianic' | 'nondenominational';
  theologicalLean?: 'reformed' | 'arminian' | 'pentecostal' | 'mainline' | 'balanced';
  preferences: {
    showHebrewGreek: boolean;
    enableCrossReferences: boolean;
    preferredTranslation: string;
  };
  history?: {
    recentQuestions: string[];
    savedPassages: Scripture[];
  };
}

// ============================================================================
// ENGINE 0: BIBLICAL WISDOM FILTER
// ============================================================================

export interface WisdomFilterResult {
  status: 'CLEAR' | 'PROCEED_WITH_WARNING' | 'VETO';
  reason?: string;
  warnings?: string[];
  alternativeGuidance?: string;
  scriptures?: Scripture[];
  confidence: number;  // 0-100
}

// ============================================================================
// ENGINE 1: BIBLICAL ORACLE (7 PERSPECTIVES)
// ============================================================================

export interface OraclePerspective {
  name: string;            // e.g., "Torah (Law & Wisdom)"
  insights: string[];      // 3-5 key insights
  scriptures: Scripture[]; // Supporting verses
  confidence: number;      // 0-100
  reasoning: string;       // How we arrived at these insights
}

export type TheologicalPerspective =
  | 'Torah (Law & Wisdom)'
  | 'Prophetic (Justice & Kingdom)'
  | 'Wisdom Literature (Proverbs/Ecclesiastes)'
  | 'Gospel (Grace & Jesus)'
  | 'Apostolic (Church & Doctrine)'
  | 'Messianic (Jesus-Centered)'
  | 'Mystical (Holy Spirit)';

// ============================================================================
// ENGINE 2: COVENANT ANALYSIS
// ============================================================================

export interface CovenantAnalysis {
  relevantCovenants: string[];  // Which covenants apply
  promises: string[];           // Covenant promises
  obligations: string[];        // Covenant obligations
  christologicalFulfillment: string;  // How Christ fulfills this
  scriptures: Scripture[];
  confidence: number;
}

export type BiblicalCovenant =
  | 'Adamic'
  | 'Noahic'
  | 'Abrahamic'
  | 'Mosaic'
  | 'Davidic'
  | 'New Covenant';

// ============================================================================
// ENGINE 3: COUNCIL OF VOICES (TRIBUNAL)
// ============================================================================

export interface TribunalVoice {
  name: string;                 // e.g., "Orthodox Rabbi"
  perspective: string;          // Their viewpoint
  evidence: string[];           // Supporting evidence
  confidence: number;           // How confident they are
  agreementsWith: string[];     // Which voices they agree with
  disagreementsWith: string[];  // Which voices they disagree with
}

export interface TribunalResult {
  voices: TribunalVoice[];
  consensus: string[];          // Points of agreement
  disagreements: string[];      // Points of legitimate disagreement
  weightedVerdict: string;      // Final weighted conclusion
  confidence: number;
}

// ============================================================================
// ENGINE 4: PASTORAL RISK & DISTRESS ANALYSIS
// (Internal: "Spiritual Warfare Check" - External: "Pastoral Risk Analysis")
// ============================================================================

export interface PastoralRiskAnalysis {
  distressFactors: {
    factor: string;             // e.g., "fear", "doubt", "shame", "despair"
    description: string;
    scripture: Scripture;       // Counter-scripture / God's truth
  }[];
  godsPromises: Scripture[];    // God's promises to claim
  spiritualDisciplines: string[]; // Recommended practices (prayer, Scripture, community)
  confidence: number;
}

// ============================================================================
// ENGINE 5: CROSS-TESTAMENT INTEGRATION
// ============================================================================

export interface CrossTestamentAnalysis {
  oldTestament: {
    passages: Scripture[];
    themes: string[];
  };
  newTestament: {
    passages: Scripture[];
    fulfillment: string;        // How NT fulfills OT
  };
  integrationPattern: 'promise-fulfillment' | 'type-antitype' | 'shadow-reality' | 'law-grace';
  unifiedWisdom: string;
  confidence: number;
}

// ============================================================================
// ENGINE 6: INTEGRATED DISCERNMENT SYNTHESIS
// (Internal: "Holy Spirit Synthesis" - External: "Integrated Discernment")
// ============================================================================

export interface SynthesisResult {
  answer: string;               // Direct answer (markdown)
  confidence: number;           // 0-100
  keyInsights: string[];        // Top 3-5 insights
  citations: Scripture[];       // All scripture citations
  actionPlan: ActionStep[];
  prayerPrompts: string[];
  caveats: string[];           // Important limitations/notes
}

export interface ActionStep {
  step: string;
  scripture: Scripture;
  reasoning: string;
  metrics?: string;            // How to measure success
}

// ============================================================================
// ENGINE 7: SCRIPTURE MEMORY
// ============================================================================

export interface MemoryRecall {
  similarQuestions: string[];
  relevantHistory: {
    question: string;
    date: Date;
    outcome: string;
  }[];
  applicablePatterns: string[];
  contextualNotes: string[];
}

// ============================================================================
// ENGINE 8: DISCIPLESHIP TRACKING
// ============================================================================

export interface DiscipleshipPrediction {
  prediction: string;
  confidence: number;
  growthAreas: string[];
  scripturesToMemorize: Scripture[];
  followUpQuestions: string[];
}

// ============================================================================
// ENGINE 9: HEART CONDITION ANALYSIS (AFFECT)
// ============================================================================

export interface AffectAnalysis {
  primaryEmotion: string;       // e.g., "anxious fear", "hopeful seeking"
  urgency: number;              // 0-10
  spiritualState: string;       // "seeking", "doubting", "hurting", "growing"
  heartPosture: string;         // "humble", "prideful", "genuine"
  primingWeights: {
    [key: string]: number;      // Which engines to emphasize
  };
  summary: string;
}

// ============================================================================
// ORCHESTRATOR TYPES
// ============================================================================

export interface BiblicalReasoning {
  status: 'complete' | 'vetoed' | 'error';
  question: string;
  synthesis: string;            // Final answer (markdown)
  confidence: number;
  reasoning: {
    engine0: WisdomFilterResult;
    engine1: OraclePerspective[];
    engine2: CovenantAnalysis;
    engine3: TribunalResult;
    engine4: PastoralRiskAnalysis;
    engine5: CrossTestamentAnalysis;
    engine6: SynthesisResult;
    engine7: MemoryRecall;
    engine8?: DiscipleshipPrediction;
    engine9: AffectAnalysis;
  };
  scriptures: Scripture[];
  processingTimeMs: number;
  // If vetoed
  reason?: string;
  guidance?: string;
}

// ============================================================================
// KNOWLEDGE GRAPH TYPES
// ============================================================================

export interface KnowledgeGraphQuery {
  query: string;
  filters?: {
    testament?: 'old' | 'new';
    books?: string[];
    themes?: string[];
  };
  topK?: number;
}

export interface KnowledgeGraphResult {
  scriptures: Scripture[];
  crossReferences?: CrossReference[];
  churchFathersQuotes?: ChurchFatherQuote[];
  systematicTheology?: TheologyResult[];
}

export interface ChurchFatherQuote {
  father: string;              // e.g., "Augustine", "Aquinas"
  work: string;                // e.g., "Confessions", "Summa Theologica"
  quote: string;
  reference: string;
  relevance: number;           // 0-1
}

export interface TheologyResult {
  theologian: string;
  tradition: string;           // 'reformed', 'catholic', 'arminian', etc.
  position: string;
  scriptureSupport: string[];  // Verse references
  confidence: number;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type EngineDepth = 1 | 2 | 3 | 4 | 5;

export interface EngineConfig {
  depth: EngineDepth;
  emphasize?: string[];        // Which engines to emphasize
  skipEngines?: number[];      // Which engines to skip
}
