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

## Engines

### Implemented ✅

| Engine | File | Public Label | Purpose |
|--------|------|--------------|---------|
| **0** | `engine0-wisdom-filter.ts` | Biblical Wisdom Filter | Safety check and theological soundness |
| **1** | `engine1-biblical-oracle.ts` | Multi-Perspective Analysis | 7 theological perspectives |
| **4** | `engine4-pastoral-risk.ts` | Pastoral Risk & Distress Analysis | Identify distress, provide comfort |
| **6** | `engine6-synthesis.ts` | Integrated Discernment Synthesis | Synthesize all perspectives |
| **9** | `engine9-heart-condition.ts` | Heart Condition Analysis | Understand emotional/spiritual state |

### Pending 🚧

| Engine | Public Label | Purpose |
|--------|--------------|---------|
| **2** | Covenant Analysis | How biblical covenants apply |
| **3** | Theological Council | Weighs perspectives from different traditions |
| **5** | Cross-Testament Integration | Connects OT and NT wisdom |
| **7** | Scripture Memory & Context | Recalls your history and patterns |
| **8** | Discipleship Growth Tracking | Tracks spiritual growth over time |

## Branding: Public vs Internal Names

Some engines have different public-facing labels for clarity and accessibility:

| Internal Name | Public Label | Reason |
|---------------|--------------|--------|
| "Holy Spirit Synthesis" | "Integrated Discernment Synthesis" | Theological humility |
| "Spiritual Warfare Check" | "Pastoral Risk & Distress Analysis" | Professional framing |

See `src/branding.ts` for the complete branding configuration.

## Usage

```typescript
import {
  BiblicalWisdomFilter,
  BiblicalOracle,
  PastoralRiskEngine,
  IntegratedDiscernmentSynthesis,
  HeartConditionAnalysis
} from '@biblemind/engines';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const knowledgeGraph = new KnowledgeGraph(); // Your Pinecone integration

// Engine 0: Safety check
const wisdomFilter = new BiblicalWisdomFilter(openai);
const wisdomResult = await wisdomFilter.evaluate(question);

if (wisdomResult.status === 'VETO') {
  // Question is inappropriate
  return wisdomResult;
}

// Engine 9: Understand heart condition
const heartAnalysis = new HeartConditionAnalysis(openai);
const affectContext = await heartAnalysis.analyze(question, userContext);

// Engine 1: Multi-perspective analysis
const oracle = new BiblicalOracle(openai, knowledgeGraph);
const perspectives = await oracle.explore(question, affectContext);

// Engine 4: Pastoral risk check
const pastoralRisk = new PastoralRiskEngine(openai);
const riskAnalysis = await pastoralRisk.analyze(question, affectContext);

// Engine 6: Synthesize everything
const synthesis = new IntegratedDiscernmentSynthesis(openai);
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
