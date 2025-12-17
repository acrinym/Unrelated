/**
 * ENGINE 3: THEOLOGICAL COUNCIL (TRIBUNAL)
 *
 * Purpose: Weigh perspectives from different Christian traditions
 * Priority: SYNTHESIS (runs after Oracle completes)
 *
 * The Council Members (Voices):
 * 1. Orthodox Rabbi - Torah/Tanakh perspective
 * 2. Catholic Theologian - Tradition + Scripture
 * 3. Reformed Pastor - Sola Scriptura, Reformed theology
 * 4. Pentecostal Leader - Holy Spirit emphasis
 * 5. Eastern Orthodox Priest - Patristic tradition
 * 6. Messianic Rabbi - Jesus as Torah fulfilled
 *
 * Biblical Foundation:
 * - "In the multitude of counselors there is safety" (Proverbs 11:14)
 * - "Let two or three witnesses establish every matter" (2 Corinthians 13:1)
 * - "Test everything; hold fast what is good" (1 Thessalonians 5:21)
 *
 * This engine:
 * - Evaluates competing theological claims
 * - Weights evidence by Scripture support and historical consensus
 * - Identifies where traditions agree and disagree
 * - Renders a verdict based on evidence, not politics
 *
 * Based on holographic-thinking-chatgpt/engines/03-tribunal.md
 * Adapted for theological/denominational context
 */

import { OpenAI } from 'openai';
import {
  TribunalResult,
  TribunalVoice,
  OraclePerspective,
  AffectAnalysis
} from '../types';

export class TheologicalCouncil {
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  /**
   * Convene the theological council to weigh Oracle perspectives
   */
  async weigh(
    oraclePerspectives: OraclePerspective[],
    question: string,
    affectContext: AffectAnalysis
  ): Promise<TribunalResult> {
    try {
      const prompt = this.buildTribunalPrompt(oraclePerspectives, question, affectContext);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        voices: result.voices || [],
        consensus: result.consensus || [],
        disagreements: result.disagreements || [],
        weightedVerdict: result.weightedVerdict || '',
        confidence: result.confidence || 70
      };

    } catch (error) {
      console.error('[TheologicalCouncil] Error:', error);
      return {
        voices: [],
        consensus: [],
        disagreements: [],
        weightedVerdict: 'Unable to render verdict due to error',
        confidence: 0
      };
    }
  }

  private getSystemPrompt(): string {
    return `You are the Theological Council Moderator for BibleMind.

Your role is to convene a council of voices from different Christian traditions
to weigh evidence and reach informed theological judgment.

## The Council Members:

### 1. ORTHODOX RABBI
- **Perspective**: Torah/Tanakh (Old Testament only)
- **Authority**: Hebrew Scripture, rabbinic tradition
- **Strengths**: Deep understanding of Hebrew, Jewish context
- **Limitations**: Does not accept Jesus as Messiah
- **Weight**: High for OT interpretation, low for NT claims

### 2. CATHOLIC THEOLOGIAN
- **Perspective**: Scripture + Tradition + Magisterium
- **Authority**: Bible, Church Fathers, papal teaching
- **Strengths**: 2000 years of theological development
- **Limitations**: Extra-biblical traditions may not convince Protestants
- **Weight**: High for historical theology, moderate for sola scriptura questions

### 3. REFORMED PASTOR
- **Perspective**: Sola Scriptura, Reformed theology (Calvin, Westminster)
- **Authority**: Scripture alone, systematic theology
- **Strengths**: Biblical precision, theological rigor
- **Limitations**: Can be overly systematic, less emphasis on experience
- **Weight**: High for doctrinal questions, biblical exegesis

### 4. PENTECOSTAL LEADER
- **Perspective**: Scripture + Holy Spirit experience
- **Authority**: Bible, contemporary Holy Spirit work
- **Strengths**: Emphasis on spiritual gifts, personal relationship with God
- **Limitations**: Can overemphasize experience over doctrine
- **Weight**: High for pneumatology, spiritual gifts; moderate for systematic theology

### 5. EASTERN ORTHODOX PRIEST
- **Perspective**: Scripture + Holy Tradition + Patristic consensus
- **Authority**: Bible, Church Fathers, liturgy
- **Strengths**: Ancient wisdom, mystical theology, continuity with early church
- **Limitations**: Tradition-heavy, less accessible to Western evangelicals
- **Weight**: High for early church history, Christology, sacraments

### 6. MESSIANIC RABBI
- **Perspective**: Torah fulfilled in Yeshua (Jesus)
- **Authority**: Tanakh + New Testament, Jewish context
- **Strengths**: Bridges Jewish and Christian understanding
- **Limitations**: Marginalized by both Jews and some Christians
- **Weight**: High for Jewish context of Jesus, Torah application

## Your Process:

### STEP 1: FRAME THE QUESTION
- What exactly are we deliberating?
- What's at stake theologically?
- What Scripture speaks to this?
- What level of certainty is needed?

### STEP 2: HEAR EACH VOICE
Each council member provides:
- Their position on the question
- Biblical/theological evidence
- Reasoning
- Confidence level (0-100%)
- Where they agree/disagree with others

### STEP 3: EVALUATE EVIDENCE
Weight each voice by:
- **Scripture support**: How clear is the biblical basis?
- **Historical consensus**: Do Church Fathers/Reformers agree?
- **Theological rigor**: Is the reasoning sound?
- **Tradition reliability**: How trustworthy is this tradition's interpretation?

### STEP 4: IDENTIFY CONSENSUS
- Where do ALL voices agree? → High confidence
- Where do MOST voices agree? → Moderate confidence
- Where do voices conflict? → Present both sides, explain why

### STEP 5: RENDER VERDICT
- Synthesize the council's wisdom
- Weight by evidence quality, not by counting votes
- Acknowledge legitimate disagreements
- State overall confidence

## Key Principles:

1. **Scripture is the final authority** - Weigh all claims against Bible
2. **Historical consensus matters** - 2000 years of faithful interpretation
3. **Not all disagreements are equal** - Some are essential, some are secondary
4. **Legitimate diversity exists** - Different traditions see different truths
5. **Evidence > Politics** - Weight by biblical support, not denominational loyalty

## Example Weighting:

QUESTION: "How are we saved?"
- Orthodox Rabbi: "Obedience to Torah" → Low weight (misses grace)
- Catholic: "Faith + works cooperating with grace" → Medium weight (biblical, but complex)
- Reformed: "By grace alone through faith alone" → High weight (clear biblical support: Ephesians 2:8-9)
- Pentecostal: "By faith, evidenced by Spirit" → High weight (biblical)
- Orthodox Priest: "Theosis through sacraments" → Medium weight (ancient, but language differs)
- Messianic: "Faith in Yeshua, not works of Torah" → High weight (Galatians 2:16)

CONSENSUS: Salvation is by grace through faith, not works (ALL Christian voices agree)
DISAGREEMENT: Role of sacraments, definition of "faith" (secondary issues)
VERDICT: Salvation by grace through faith in Christ (Ephesians 2:8-9) → 95% confidence

Be respectful to all traditions while maintaining biblical fidelity.`;
  }

  private buildTribunalPrompt(
    oraclePerspectives: OraclePerspective[],
    question: string,
    affectContext: AffectAnalysis
  ): string {
    return `Convene the Theological Council to deliberate on this question:

QUESTION: "${question}"

EMOTIONAL/SPIRITUAL CONTEXT:
${affectContext.summary}

---

## ORACLE PERSPECTIVES (7 angles already explored):

${oraclePerspectives.map(p => `
### ${p.name}
**Confidence**: ${p.confidence}%
**Insights**:
${p.insights.map(i => `  - ${i}`).join('\n')}
**Reasoning**: ${p.reasoning}
`).join('\n')}

---

## YOUR TASK:

Convene a council of 6 voices from different Christian traditions to weigh these perspectives:

1. **Orthodox Rabbi** - Torah/Tanakh perspective
2. **Catholic Theologian** - Scripture + Tradition
3. **Reformed Pastor** - Sola Scriptura, Reformed theology
4. **Pentecostal Leader** - Scripture + Spirit experience
5. **Eastern Orthodox Priest** - Patristic tradition
6. **Messianic Rabbi** - Jesus as Torah fulfilled

For EACH voice, provide:
- Their position on the question
- Evidence (Scripture + tradition as appropriate)
- Confidence level
- Where they AGREE with other voices
- Where they DISAGREE with other voices

Then:
- Identify CONSENSUS points (where all or most agree)
- Identify DISAGREEMENTS (where traditions differ)
- Render WEIGHTED VERDICT (based on biblical evidence, not votes)
- State CONFIDENCE level

Return JSON:
{
  "voices": [
    {
      "name": "Orthodox Rabbi",
      "perspective": "Position on the question from Torah perspective",
      "evidence": [
        "Genesis 1:1 - In the beginning...",
        "Deuteronomy 6:4 - Hear O Israel..."
      ],
      "confidence": 75,
      "agreementsWith": ["Messianic Rabbi on Torah authority"],
      "disagreementsWith": ["All Christian voices on Jesus as Messiah"]
    },
    {
      "name": "Catholic Theologian",
      "perspective": "Position from Catholic perspective",
      "evidence": ["Scripture", "Church Fathers", "Magisterium"],
      "confidence": 85,
      "agreementsWith": ["Reformed Pastor on core doctrine"],
      "disagreementsWith": ["Reformed Pastor on authority structure"]
    }
    // ... continue for all 6 voices
  ],

  "consensus": [
    "All Christian voices agree: Jesus is Lord and Savior",
    "All agree: Scripture is authoritative (though differ on tradition)",
    "All agree: Grace is necessary for salvation"
  ],

  "disagreements": [
    "Role of tradition: Catholic/Orthodox emphasize, Reformed minimizes",
    "Sacramental theology: Catholic/Orthodox high view, Pentecostal low view",
    "Charismatic gifts: Pentecostal emphasizes, Reformed cessationist"
  ],

  "weightedVerdict": "Based on the evidence, here is the council's verdict: [Synthesize the weighted judgment, emphasizing points with strongest biblical support and widest consensus. Acknowledge legitimate disagreements. 200-300 words.]",

  "confidence": 85
}

IMPORTANT: Weight by EVIDENCE quality, not by counting votes. A single voice with strong Scripture support outweighs multiple voices with weak support.`;
  }

  /**
   * Calculate confidence based on consensus level
   */
  static calculateConsensusConfidence(voices: TribunalVoice[]): number {
    if (voices.length === 0) return 0;

    // Count how many voices agree on major points
    const agreementScores = voices.map(v => v.agreementsWith.length);
    const avgAgreement = agreementScores.reduce((sum, s) => sum + s, 0) / voices.length;

    // High agreement = high confidence
    // 6 voices, if all agree with 5 others = perfect consensus = 100%
    const maxPossibleAgreements = voices.length - 1;
    const consensusRatio = avgAgreement / maxPossibleAgreements;

    return Math.round(consensusRatio * 100);
  }

  /**
   * Identify essential vs secondary disagreements
   */
  static categorizeDisagreements(disagreements: string[]): {
    essential: string[];
    secondary: string[];
  } {
    const essentialKeywords = [
      'jesus', 'christ', 'salvation', 'grace', 'faith',
      'trinity', 'resurrection', 'deity', 'atonement'
    ];

    const essential: string[] = [];
    const secondary: string[] = [];

    disagreements.forEach(d => {
      const lower = d.toLowerCase();
      if (essentialKeywords.some(keyword => lower.includes(keyword))) {
        essential.push(d);
      } else {
        secondary.push(d);
      }
    });

    return { essential, secondary };
  }
}
