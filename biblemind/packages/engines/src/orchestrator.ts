/**
 * HOLOGRAPHIC REASONING ORCHESTRATOR
 *
 * The main coordinator that runs all 10 engines in the proper order
 * and synthesizes their outputs into unified biblical guidance.
 *
 * Execution Flow:
 * 1. Engine 0: Biblical Wisdom Filter (safety check)
 * 2. Engine 9: Heart Condition Analysis (understand emotion/spirit)
 * 3. PARALLEL PHASE 1: Engines 1, 2, 4 (Oracle, Covenant, Pastoral Risk)
 * 4. PARALLEL PHASE 2: Engines 3, 5 (Tribunal, Cross-Testament)
 * 5. Engine 7: Scripture Memory (historical context)
 * 6. Engine 6: Integrated Discernment Synthesis (final answer)
 * 7. Engine 8: Discipleship Tracking (record prediction)
 * 8. Return complete BiblicalReasoning result
 */

import { OpenAI } from 'openai';
import {
  BiblicalReasoning,
  UserContext,
  WisdomFilterResult,
  AffectAnalysis,
  OraclePerspective,
  CovenantAnalysis,
  PastoralRiskAnalysis,
  TribunalResult,
  CrossTestamentAnalysis,
  MemoryRecall,
  SynthesisResult,
  DiscipleshipPrediction
} from './types';

// Import all engines
import { BiblicalWisdomFilter } from './engines/engine0-wisdom-filter';
import { BiblicalOracle } from './engines/engine1-biblical-oracle';
import { CovenantAnalysisEngine } from './engines/engine2-covenant';
import { TheologicalCouncil } from './engines/engine3-tribunal';
import { PastoralRiskEngine } from './engines/engine4-pastoral-risk';
import { CrossTestamentIntegration } from './engines/engine5-cross-testament';
import { IntegratedDiscernmentSynthesis } from './engines/engine6-synthesis';
import { ScriptureMemory } from './engines/engine7-memory';
import { DiscipleshipTracking } from './engines/engine8-discipleship';
import { HeartConditionAnalysis } from './engines/engine9-heart-condition';

// Placeholder for KnowledgeGraph (user will implement with Pinecone)
interface KnowledgeGraph {
  searchScriptures(query: string, filters?: any, topK?: number): Promise<any[]>;
}

export interface OrchestratorConfig {
  openaiApiKey: string;
  knowledgeGraph?: KnowledgeGraph;
  enabledEngines?: number[]; // Which engines to run (default: all)
  depth?: 1 | 2 | 3 | 4 | 5; // How deep to analyze (default: 3)
}

export class HolographicReasoningOrchestrator {
  private openai: OpenAI;
  private knowledgeGraph?: KnowledgeGraph;
  private engines: {
    wisdomFilter: BiblicalWisdomFilter;
    oracle: BiblicalOracle;
    covenant: CovenantAnalysisEngine;
    tribunal: TheologicalCouncil;
    pastoralRisk: PastoralRiskEngine;
    crossTestament: CrossTestamentIntegration;
    synthesis: IntegratedDiscernmentSynthesis;
    memory: ScriptureMemory;
    discipleship: DiscipleshipTracking;
    heartCondition: HeartConditionAnalysis;
  };

  constructor(config: OrchestratorConfig) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.knowledgeGraph = config.knowledgeGraph;

    // Initialize all 10 engines
    this.engines = {
      wisdomFilter: new BiblicalWisdomFilter(this.openai),
      oracle: new BiblicalOracle(this.openai, this.knowledgeGraph as any),
      covenant: new CovenantAnalysisEngine(this.openai),
      tribunal: new TheologicalCouncil(this.openai),
      pastoralRisk: new PastoralRiskEngine(this.openai),
      crossTestament: new CrossTestamentIntegration(this.openai),
      synthesis: new IntegratedDiscernmentSynthesis(this.openai),
      memory: new ScriptureMemory(),
      discipleship: new DiscipleshipTracking(this.openai),
      heartCondition: new HeartConditionAnalysis(this.openai)
    };
  }

  /**
   * Main entry point: Process a biblical question through all engines
   */
  async processQuestion(
    question: string,
    userId: string,
    userContext?: UserContext
  ): Promise<BiblicalReasoning> {
    const startTime = Date.now();

    console.log('[Orchestrator] Starting holographic analysis...');
    console.log(`[Orchestrator] Question: "${question}"`);

    try {
      // ================================================================
      // PHASE 0: SAFETY CHECK (Engine 0)
      // ================================================================
      console.log('[Orchestrator] Phase 0: Biblical Wisdom Filter');
      const wisdomCheck = await this.engines.wisdomFilter.evaluate(question);

      if (wisdomCheck.status === 'VETO') {
        console.log('[Orchestrator] Question VETOED by Wisdom Filter');
        return {
          status: 'vetoed',
          question,
          synthesis: '',
          confidence: 0,
          reasoning: {
            engine0: wisdomCheck,
            engine1: [],
            engine2: {
              relevantCovenants: [],
              promises: [],
              obligations: [],
              christologicalFulfillment: '',
              scriptures: [],
              confidence: 0
            },
            engine3: {
              voices: [],
              consensus: [],
              disagreements: [],
              weightedVerdict: '',
              confidence: 0
            },
            engine4: {
              distressFactors: [],
              godsPromises: [],
              spiritualDisciplines: [],
              confidence: 0
            },
            engine5: {
              oldTestament: { passages: [], themes: [] },
              newTestament: { passages: [], fulfillment: '' },
              integrationPattern: 'promise-fulfillment',
              unifiedWisdom: '',
              confidence: 0
            },
            engine6: {
              answer: '',
              confidence: 0,
              keyInsights: [],
              citations: [],
              actionPlan: [],
              prayerPrompts: [],
              caveats: []
            },
            engine7: {
              similarQuestions: [],
              relevantHistory: [],
              applicablePatterns: [],
              contextualNotes: []
            },
            engine9: {
              primaryEmotion: 'unknown',
              urgency: 0,
              spiritualState: 'unknown',
              heartPosture: 'unknown',
              primingWeights: {},
              summary: 'Question vetoed before affect analysis'
            }
          },
          scriptures: [],
          processingTimeMs: Date.now() - startTime,
          reason: wisdomCheck.reason,
          guidance: wisdomCheck.alternativeGuidance
        };
      }

      console.log(`[Orchestrator] Wisdom Filter: ${wisdomCheck.status}`);

      // ================================================================
      // PHASE 1: AFFECT ANALYSIS (Engine 9)
      // This primes all other engines
      // ================================================================
      console.log('[Orchestrator] Phase 1: Heart Condition Analysis');
      const affectAnalysis = await this.engines.heartCondition.analyze(
        question,
        userContext
      );

      console.log(`[Orchestrator] Emotion: ${affectAnalysis.primaryEmotion}, Urgency: ${affectAnalysis.urgency}/10`);

      // ================================================================
      // PHASE 2: PARALLEL CORE ANALYSIS
      // Engines 1, 2, 4 run simultaneously
      // ================================================================
      console.log('[Orchestrator] Phase 2: Parallel Core Analysis (Engines 1, 2, 4)');

      const [oracleResult, covenantResult, pastoralRiskResult] = await Promise.all([
        this.engines.oracle.explore(question, affectAnalysis),
        this.engines.covenant.analyze(question, affectAnalysis),
        this.engines.pastoralRisk.analyze(question, affectAnalysis)
      ]);

      console.log(`[Orchestrator] Oracle: ${oracleResult.length} perspectives analyzed`);
      console.log(`[Orchestrator] Covenant: ${covenantResult.relevantCovenants.length} covenants identified`);
      console.log(`[Orchestrator] Pastoral Risk: ${pastoralRiskResult.distressFactors.length} distress factors detected`);

      // ================================================================
      // PHASE 3: PARALLEL SYNTHESIS PHASE
      // Engines 3, 5 run simultaneously (using Phase 2 results)
      // ================================================================
      console.log('[Orchestrator] Phase 3: Parallel Synthesis (Engines 3, 5)');

      const [tribunalResult, crossTestamentResult] = await Promise.all([
        this.engines.tribunal.weigh(oracleResult, question, affectAnalysis),
        this.engines.crossTestament.integrate(question, affectAnalysis)
      ]);

      console.log(`[Orchestrator] Tribunal: ${tribunalResult.voices.length} voices deliberated`);
      console.log(`[Orchestrator] Cross-Testament: ${crossTestamentResult.integrationPattern} pattern`);

      // ================================================================
      // PHASE 4: MEMORY CONTEXT (Engine 7)
      // ================================================================
      console.log('[Orchestrator] Phase 4: Scripture Memory & Context');
      const memoryResult = await this.engines.memory.recall(
        question,
        userId,
        userContext
      );

      console.log(`[Orchestrator] Memory: ${memoryResult.similarQuestions.length} similar questions found`);

      // ================================================================
      // PHASE 5: FINAL SYNTHESIS (Engine 6)
      // Collapse all parallel results into unified guidance
      // ================================================================
      console.log('[Orchestrator] Phase 5: Integrated Discernment Synthesis');
      const synthesis = await this.engines.synthesis.synthesize(
        {
          wisdom: wisdomCheck,
          oracle: oracleResult,
          covenant: covenantResult,
          tribunal: tribunalResult,
          warfare: pastoralRiskResult,
          multisource: crossTestamentResult,
          memory: memoryResult,
          affect: affectAnalysis
        },
        question
      );

      console.log(`[Orchestrator] Synthesis complete: ${synthesis.confidence}% confidence`);

      // ================================================================
      // PHASE 6: DISCIPLESHIP TRACKING (Engine 8)
      // Record prediction for future learning
      // ================================================================
      console.log('[Orchestrator] Phase 6: Discipleship Growth Tracking');

      const fullReasoning: BiblicalReasoning = {
        status: 'complete',
        question,
        synthesis: synthesis.answer,
        confidence: synthesis.confidence,
        reasoning: {
          engine0: wisdomCheck,
          engine1: oracleResult,
          engine2: covenantResult,
          engine3: tribunalResult,
          engine4: pastoralRiskResult,
          engine5: crossTestamentResult,
          engine6: synthesis,
          engine7: memoryResult,
          engine9: affectAnalysis
        },
        scriptures: synthesis.citations,
        processingTimeMs: Date.now() - startTime
      };

      const discipleshipPrediction = await this.engines.discipleship.recordPrediction(
        userId,
        question,
        fullReasoning
      );

      // Add discipleship prediction to reasoning
      (fullReasoning.reasoning as any).engine8 = discipleshipPrediction;

      console.log(`[Orchestrator] Complete! Processed in ${fullReasoning.processingTimeMs}ms`);

      return fullReasoning;

    } catch (error) {
      console.error('[Orchestrator] ERROR:', error);

      // Return error result
      return {
        status: 'error',
        question,
        synthesis: 'An error occurred during biblical analysis. Please try again.',
        confidence: 0,
        reasoning: {
          engine0: {
            status: 'CLEAR',
            confidence: 0
          },
          engine1: [],
          engine2: {
            relevantCovenants: [],
            promises: [],
            obligations: [],
            christologicalFulfillment: '',
            scriptures: [],
            confidence: 0
          },
          engine3: {
            voices: [],
            consensus: [],
            disagreements: [],
            weightedVerdict: '',
            confidence: 0
          },
          engine4: {
            distressFactors: [],
            godsPromises: [],
            spiritualDisciplines: [],
            confidence: 0
          },
          engine5: {
            oldTestament: { passages: [], themes: [] },
            newTestament: { passages: [], fulfillment: '' },
            integrationPattern: 'promise-fulfillment',
            unifiedWisdom: '',
            confidence: 0
          },
          engine6: {
            answer: 'Error during synthesis',
            confidence: 0,
            keyInsights: [],
            citations: [],
            actionPlan: [],
            prayerPrompts: [],
            caveats: ['An error occurred - please try again']
          },
          engine7: {
            similarQuestions: [],
            relevantHistory: [],
            applicablePatterns: [],
            contextualNotes: []
          },
          engine9: {
            primaryEmotion: 'unknown',
            urgency: 0,
            spiritualState: 'unknown',
            heartPosture: 'unknown',
            primingWeights: {},
            summary: 'Error before affect analysis'
          }
        },
        scriptures: [],
        processingTimeMs: Date.now() - startTime,
        reason: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Helper: Get engine performance metrics
   */
  getEngineMetrics(): {
    enginesImplemented: number;
    totalEngines: number;
    completionPercentage: number;
  } {
    return {
      enginesImplemented: 10,
      totalEngines: 10,
      completionPercentage: 100
    };
  }

  /**
   * Helper: Validate configuration
   */
  static validateConfig(config: OrchestratorConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.openaiApiKey) {
      errors.push('OpenAI API key is required');
    }

    if (config.enabledEngines) {
      const invalidEngines = config.enabledEngines.filter(e => e < 0 || e > 9);
      if (invalidEngines.length > 0) {
        errors.push(`Invalid engine numbers: ${invalidEngines.join(', ')}`);
      }
    }

    if (config.depth && (config.depth < 1 || config.depth > 5)) {
      errors.push('Depth must be between 1 and 5');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Convenience function: Create and use orchestrator in one call
 */
export async function analyzeBiblicalQuestion(
  question: string,
  userId: string,
  config: OrchestratorConfig,
  userContext?: UserContext
): Promise<BiblicalReasoning> {
  const orchestrator = new HolographicReasoningOrchestrator(config);
  return orchestrator.processQuestion(question, userId, userContext);
}

/**
 * Example usage:
 *
 * ```typescript
 * import { analyzeBiblicalQuestion } from '@biblemind/engines';
 *
 * const result = await analyzeBiblicalQuestion(
 *   "How do I forgive someone who hurt me deeply?",
 *   "user123",
 *   {
 *     openaiApiKey: process.env.OPENAI_API_KEY,
 *     knowledgeGraph: myKnowledgeGraphInstance
 *   }
 * );
 *
 * console.log(result.synthesis); // The final biblical guidance
 * console.log(result.confidence); // Confidence level (0-100)
 * console.log(result.scriptures); // All scripture citations
 * ```
 */
