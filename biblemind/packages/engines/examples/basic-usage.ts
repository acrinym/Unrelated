/**
 * BIBLEMIND BASIC USAGE EXAMPLE
 *
 * This example shows how to use the Holographic Reasoning Orchestrator
 * to analyze biblical questions.
 */

import {
  analyzeBiblicalQuestion,
  HolographicReasoningOrchestrator,
  type OrchestratorConfig,
  type UserContext,
  type BiblicalReasoning
} from '../src';

// ============================================================================
// EXAMPLE 1: Simple One-Line Usage
// ============================================================================

async function example1_SimpleUsage() {
  console.log('=== EXAMPLE 1: Simple Usage ===\n');

  const result = await analyzeBiblicalQuestion(
    "How do I forgive someone who hurt me deeply?",
    "user123",
    {
      geminiApiKey: process.env.GEMINI_API_KEY!
    }
  );

  console.log('Status:', result.status);
  console.log('Confidence:', result.confidence + '%');
  console.log('\nBiblical Guidance:');
  console.log(result.synthesis);
  console.log('\nScriptures cited:', result.scriptures.length);
}

// ============================================================================
// EXAMPLE 2: With User Context
// ============================================================================

async function example2_WithUserContext() {
  console.log('\n=== EXAMPLE 2: With User Context ===\n');

  const userContext: UserContext = {
    userId: 'user456',
    denomination: 'protestant',
    theologicalLean: 'reformed',
    preferences: {
      showHebrewGreek: true,
      enableCrossReferences: true,
      preferredTranslation: 'ESV'
    },
    history: {
      recentQuestions: [
        'What does the Bible say about anxiety?',
        'How do I trust God when I\'m afraid?'
      ],
      savedPassages: []
    }
  };

  const result = await analyzeBiblicalQuestion(
    "I'm struggling with fear about the future",
    "user456",
    {
      geminiApiKey: process.env.GEMINI_API_KEY!
    },
    userContext
  );

  // Access specific engine outputs
  console.log('Heart Condition:', result.reasoning.engine9.primaryEmotion);
  console.log('Spiritual State:', result.reasoning.engine9.spiritualState);
  console.log('Urgency:', result.reasoning.engine9.urgency + '/10');

  console.log('\nDistress Factors:', result.reasoning.engine4.distressFactors.length);
  console.log('God\'s Promises:', result.reasoning.engine4.godsPromises.length);

  console.log('\nOracle Perspectives:', result.reasoning.engine1.length);
  result.reasoning.engine1.forEach(p => {
    console.log(`  - ${p.name}: ${p.confidence}% confidence`);
  });
}

// ============================================================================
// EXAMPLE 3: Reusable Orchestrator Instance
// ============================================================================

async function example3_ReusableOrchestrator() {
  console.log('\n=== EXAMPLE 3: Reusable Orchestrator ===\n');

  // Create orchestrator once, reuse for multiple questions
  const orchestrator = new HolographicReasoningOrchestrator({
    geminiApiKey: process.env.GEMINI_API_KEY!
  });

  const questions = [
    "What does it mean to love my neighbor?",
    "How should I handle conflict with a brother in Christ?",
    "What is biblical wisdom?"
  ];

  for (const question of questions) {
    console.log(`\nQuestion: "${question}"`);

    const result = await orchestrator.processQuestion(
      question,
      "user789"
    );

    console.log(`Answer confidence: ${result.confidence}%`);
    console.log(`Processing time: ${result.processingTimeMs}ms`);
    console.log(`Scriptures: ${result.scriptures.length}`);
  }
}

// ============================================================================
// EXAMPLE 4: Accessing Individual Engine Results
// ============================================================================

async function example4_EngineDrilldown() {
  console.log('\n=== EXAMPLE 4: Engine Drilldown ===\n');

  const result = await analyzeBiblicalQuestion(
    "Can a Christian lose their salvation?",
    "user000",
    {
      geminiApiKey: process.env.GEMINI_API_KEY!
    }
  );

  // Engine 0: Wisdom Filter
  console.log('Wisdom Filter Status:', result.reasoning.engine0.status);
  if (result.reasoning.engine0.warnings) {
    console.log('Warnings:', result.reasoning.engine0.warnings);
  }

  // Engine 1: Oracle (7 perspectives)
  console.log('\nOracle Perspectives:');
  result.reasoning.engine1.forEach(perspective => {
    console.log(`\n${perspective.name}:`);
    console.log(`  Confidence: ${perspective.confidence}%`);
    console.log(`  Insights: ${perspective.insights.length}`);
    perspective.insights.slice(0, 2).forEach((insight, i) => {
      console.log(`    ${i + 1}. ${insight}`);
    });
  });

  // Engine 2: Covenant Analysis
  console.log('\nRelevant Covenants:', result.reasoning.engine2.relevantCovenants.join(', '));
  console.log('Key Promises:', result.reasoning.engine2.promises.slice(0, 2));

  // Engine 3: Theological Council
  console.log('\nCouncil Consensus:', result.reasoning.engine3.consensus.slice(0, 3));
  console.log('Disagreements:', result.reasoning.engine3.disagreements.slice(0, 2));

  // Engine 4: Pastoral Risk
  if (result.reasoning.engine4.distressFactors.length > 0) {
    console.log('\nDistress Detected:');
    result.reasoning.engine4.distressFactors.forEach(d => {
      console.log(`  - ${d.factor}: ${d.description}`);
    });
  }

  // Engine 5: Cross-Testament
  console.log('\nIntegration Pattern:', result.reasoning.engine5.integrationPattern);
  console.log('OT Themes:', result.reasoning.engine5.oldTestament.themes.slice(0, 3));

  // Engine 6: Final Synthesis
  console.log('\nKey Insights:');
  result.reasoning.engine6.keyInsights.forEach((insight, i) => {
    console.log(`  ${i + 1}. ${insight}`);
  });

  console.log('\nAction Plan:');
  result.reasoning.engine6.actionPlan.forEach((action, i) => {
    console.log(`  ${i + 1}. ${action.step}`);
    console.log(`     Scripture: ${action.scripture.reference}`);
  });

  console.log('\nPrayer Prompts:');
  result.reasoning.engine6.prayerPrompts.forEach((prompt, i) => {
    console.log(`  ${i + 1}. ${prompt}`);
  });

  // Engine 7: Memory
  if (result.reasoning.engine7.similarQuestions.length > 0) {
    console.log('\nSimilar Past Questions:');
    result.reasoning.engine7.similarQuestions.forEach(q => {
      console.log(`  - ${q}`);
    });
  }

  // Engine 9: Heart Condition
  console.log('\nHeart Analysis:');
  console.log(`  Emotion: ${result.reasoning.engine9.primaryEmotion}`);
  console.log(`  Urgency: ${result.reasoning.engine9.urgency}/10`);
  console.log(`  Spiritual State: ${result.reasoning.engine9.spiritualState}`);
  console.log(`  Heart Posture: ${result.reasoning.engine9.heartPosture}`);
}

// ============================================================================
// EXAMPLE 5: Error Handling
// ============================================================================

async function example5_ErrorHandling() {
  console.log('\n=== EXAMPLE 5: Error Handling ===\n');

  try {
    const result = await analyzeBiblicalQuestion(
      "Your question here",
      "user999",
      {
        geminiApiKey: process.env.GEMINI_API_KEY!
      }
    );

    if (result.status === 'vetoed') {
      console.log('Question was vetoed by Wisdom Filter');
      console.log('Reason:', result.reason);
      console.log('Alternative guidance:', result.guidance);
      return;
    }

    if (result.status === 'error') {
      console.log('An error occurred');
      console.log('Reason:', result.reason);
      return;
    }

    // Success
    console.log('Success! Analysis complete.');
    console.log(`Confidence: ${result.confidence}%`);

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// ============================================================================
// EXAMPLE 6: Configuration Validation
// ============================================================================

async function example6_ConfigValidation() {
  console.log('\n=== EXAMPLE 6: Config Validation ===\n');

  const config: OrchestratorConfig = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    depth: 3,
    enabledEngines: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  };

  const validation = HolographicReasoningOrchestrator.validateConfig(config);

  if (!validation.valid) {
    console.log('Configuration errors:');
    validation.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
    return;
  }

  console.log('Configuration is valid!');

  // Create orchestrator
  const orchestrator = new HolographicReasoningOrchestrator(config);

  // Get metrics
  const metrics = orchestrator.getEngineMetrics();
  console.log('\nEngine Metrics:');
  console.log(`  Implemented: ${metrics.enginesImplemented}/${metrics.totalEngines}`);
  console.log(`  Completion: ${metrics.completionPercentage}%`);
}

// ============================================================================
// RUN EXAMPLES
// ============================================================================

async function main() {
  // Check for API key
if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY environment variable not set');
  console.error('Set it with: export GEMINI_API_KEY=your-key-here');
  process.exit(1);
}

  console.log('BibleMind Holographic Reasoning Engine - Examples\n');
  console.log('='.repeat(60));

  // Uncomment the examples you want to run:

  // await example1_SimpleUsage();
  // await example2_WithUserContext();
  // await example3_ReusableOrchestrator();
  // await example4_EngineDrilldown();
  // await example5_ErrorHandling();
  await example6_ConfigValidation();

  console.log('\n' + '='.repeat(60));
  console.log('\nExamples complete!');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  example1_SimpleUsage,
  example2_WithUserContext,
  example3_ReusableOrchestrator,
  example4_EngineDrilldown,
  example5_ErrorHandling,
  example6_ConfigValidation
};
