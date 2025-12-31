# @biblemind/engines

**Biblical Holographic Reasoning Engines**

This package contains the 10 parallel reasoning engines that power BibleMind's multi-perspective theological analysis.

## Architecture

BibleMind uses a holographic reasoning system where each question is analyzed by 10 specialized engines running in parallel, then synthesized into unified biblical guidance.

```
USER QUESTION
    ↓
[0] Biblical Wisdom Filter → Safety check
    ↓
[9] Heart Condition Analysis → Understand emotional/spiritual state
    ↓
PARALLEL PHASE 1
    [1] Biblical Oracle → 7 theological perspectives
    [4] Pastoral Risk Analysis → Identify distress, provide comfort
    ↓
PARALLEL PHASE 2
    [2] Covenant Analysis → God's promises
    [3] Theological Council → Weigh evidence
    [5] Cross-Testament Integration → OT + NT
    ↓
[7] Scripture Memory → Your history + patterns
    ↓
[6] Integrated Discernment Synthesis → Final answer
    ↓
[8] Discipleship Tracking → Learn over time
```

## All 10 Engines - COMPLETE ✅

| Engine | File | Public Label | Purpose |
|--------|------|--------------|---------|
| **0** | `engine0-wisdom-filter.ts` | Biblical Wisdom Filter | Safety check and theological soundness |
| **1** | `engine1-biblical-oracle.ts` | Multi-Perspective Analysis | 7 theological perspectives |
| **2** | `engine2-covenant.ts` | Covenant Analysis | How biblical covenants apply |
| **3** | `engine3-tribunal.ts` | Theological Council | Weighs perspectives from different traditions |
| **4** | `engine4-pastoral-risk.ts` | Pastoral Risk & Distress Analysis | Identify distress, provide comfort |
| **5** | `engine5-cross-testament.ts` | Cross-Testament Integration | Connects OT and NT wisdom |
| **6** | `engine6-synthesis.ts` | Integrated Discernment Synthesis | Synthesize all perspectives |
| **7** | `engine7-memory.ts` | Scripture Memory & Context | Recalls your history and patterns |
| **8** | `engine8-discipleship.ts` | Discipleship Growth Tracking | Tracks spiritual growth over time |
| **9** | `engine9-heart-condition.ts` | Heart Condition Analysis | Understand emotional/spiritual state |

## Branding: Public vs Internal Names

Some engines have different public-facing labels for clarity and accessibility:

| Internal Name | Public Label | Reason |
|---------------|--------------|--------|
| "Holy Spirit Synthesis" | "Integrated Discernment Synthesis" | Theological humility |
| "Spiritual Warfare Check" | "Pastoral Risk & Distress Analysis" | Professional framing |

See `src/branding.ts` for the complete branding configuration.

## Quick Start: Orchestrator (Recommended)

The **Holographic Reasoning Orchestrator** coordinates all 10 engines automatically:

```typescript
import { analyzeBiblicalQuestion } from '@biblemind/engines';

// Simple one-line usage
const result = await analyzeBiblicalQuestion(
  "How do I forgive someone who hurt me deeply?",
  "user123",
  {
    geminiApiKey: process.env.GEMINI_API_KEY!
  }
);

console.log(result.synthesis); // Final biblical guidance
console.log(result.confidence); // Confidence level (0-100)
console.log(result.scriptures); // All scripture citations
```

### With User Context

```typescript
import { analyzeBiblicalQuestion } from '@biblemind/engines';

const userContext = {
  userId: 'user456',
  denomination: 'protestant',
  theologicalLean: 'reformed',
  preferences: {
    showHebrewGreek: true,
    enableCrossReferences: true,
    preferredTranslation: 'ESV'
  },
  history: {
    recentQuestions: ['Previous question 1', 'Previous question 2'],
    savedPassages: []
  }
};

const result = await analyzeBiblicalQuestion(
  "Your question here",
  "user456",
  { geminiApiKey: process.env.GEMINI_API_KEY! },
  userContext
);

// Access individual engine outputs
console.log('Heart Condition:', result.reasoning.engine9.primaryEmotion);
console.log('Distress Factors:', result.reasoning.engine4.distressFactors.length);
console.log('Oracle Perspectives:', result.reasoning.engine1.length);
```

### Reusable Orchestrator

```typescript
import { HolographicReasoningOrchestrator } from '@biblemind/engines';

// Create once, reuse for multiple questions
const orchestrator = new HolographicReasoningOrchestrator({
  geminiApiKey: process.env.GEMINI_API_KEY!,
  knowledgeGraph: myKnowledgeGraphInstance // Optional
});

const result1 = await orchestrator.processQuestion("Question 1", "user123");
const result2 = await orchestrator.processQuestion("Question 2", "user123");
```

See `examples/basic-usage.ts` for complete examples.

## Advanced Usage: Individual Engines

You can also use engines individually if you don't need the full orchestrator:

```typescript
import {
  BiblicalWisdomFilter,
  BiblicalOracle,
  PastoralRiskEngine,
  IntegratedDiscernmentSynthesis,
  HeartConditionAnalysis
  GeminiFlashClient
} from '@biblemind/engines';

const llm = new GeminiFlashClient(process.env.GEMINI_API_KEY!);
const knowledgeGraph = new KnowledgeGraph(); // Your Pinecone integration

// Engine 0: Safety check
const wisdomFilter = new BiblicalWisdomFilter(llm);
const wisdomResult = await wisdomFilter.evaluate(question);

if (wisdomResult.status === 'VETO') {
  // Question is inappropriate
  return wisdomResult;
}

// Engine 9: Understand heart condition
const heartAnalysis = new HeartConditionAnalysis(llm);
const affectContext = await heartAnalysis.analyze(question, userContext);

// Engine 1: Multi-perspective analysis
const oracle = new BiblicalOracle(llm, knowledgeGraph);
const perspectives = await oracle.explore(question, affectContext);

// Engine 4: Pastoral risk check
const pastoralRisk = new PastoralRiskEngine(llm);
const riskAnalysis = await pastoralRisk.analyze(question, affectContext);

// Engine 6: Synthesize everything
const synthesis = new IntegratedDiscernmentSynthesis(llm);
const finalAnswer = await synthesis.synthesize({
  wisdom: wisdomResult,
  oracle: perspectives,
  covenant: {}, // TODO: implement
  tribunal: {}, // TODO: implement
  warfare: riskAnalysis,
  multisource: {}, // TODO: implement
  memory: {}, // TODO: implement
  affect: affectContext
}, question);

console.log(finalAnswer.answer);
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Lint
npm run lint

# Test
npm run test
```

## Type Definitions

All engine interfaces are defined in `src/types.ts`:

- `WisdomFilterResult` - Engine 0 output
- `OraclePerspective` - Engine 1 output
- `CovenantAnalysis` - Engine 2 output
- `TribunalResult` - Engine 3 output
- `PastoralRiskAnalysis` - Engine 4 output
- `CrossTestamentAnalysis` - Engine 5 output
- `SynthesisResult` - Engine 6 output
- `MemoryRecall` - Engine 7 output
- `DiscipleshipPrediction` - Engine 8 output
- `AffectAnalysis` - Engine 9 output

## Biblical Foundation

Each engine is grounded in biblical principles:

- **Engine 0**: "The beginning of wisdom is the fear of the LORD" (Proverbs 9:10)
- **Engine 1**: "In the multitude of counselors there is safety" (Proverbs 11:14)
- **Engine 4**: "Cast all your anxieties on Him" (1 Peter 5:7)
- **Engine 6**: "The Spirit will guide you into all truth" (John 16:13)
- **Engine 9**: "Man looks at the outward appearance, but the LORD looks at the heart" (1 Samuel 16:7)

## License

MIT
