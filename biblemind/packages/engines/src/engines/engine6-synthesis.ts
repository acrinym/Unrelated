/**
 * ENGINE 6: INTEGRATED DISCERNMENT SYNTHESIS
 * (Internal: "Holy Spirit Synthesis")
 *
 * Purpose: Synthesize all engine outputs into unified biblical guidance
 * Priority: FINAL (runs after all other engines complete)
 *
 * This is the "collapse" function - it takes all parallel reasoning and
 * integrates it into ONE coherent answer that the user can understand and apply.
 *
 * Biblical Foundation:
 * - "In the multitude of counselors there is safety" (Proverbs 11:14)
 * - "The Spirit will guide you into all truth" (John 16:13)
 * - "Rightly dividing the word of truth" (2 Timothy 2:15)
 *
 * PUBLIC LABEL: "Integrated Discernment Synthesis"
 * INTERNAL NAME: "Holy Spirit Synthesis"
 *
 * Based on holographic-thinking-chatgpt/engines/06-synthesis.md
 * Adapted for biblical context
 */

import {
  SynthesisResult,
  OraclePerspective,
  CovenantAnalysis,
  TribunalResult,
  PastoralRiskAnalysis,
  CrossTestamentAnalysis,
  MemoryRecall,
  AffectAnalysis,
  WisdomFilterResult,
  Scripture,
  ActionStep
} from '../types';
import { LanguageModel } from '../llm/types';

interface SynthesisInputs {
  wisdom: WisdomFilterResult;
  oracle: OraclePerspective[];
  covenant: CovenantAnalysis;
  tribunal: TribunalResult;
  warfare: PastoralRiskAnalysis;
  multisource: CrossTestamentAnalysis;
  memory: MemoryRecall;
  affect: AffectAnalysis;
}

export class IntegratedDiscernmentSynthesis {
  private llm: LanguageModel;

  constructor(llm: LanguageModel) {
    this.llm = llm;
  }

  /**
   * Synthesize all engine outputs into final biblical guidance
   */
  async synthesize(inputs: SynthesisInputs, question: string): Promise<SynthesisResult> {
    try {
      const prompt = this.buildSynthesisPrompt(inputs, question);
      const response = await this.llm.generateJsonResponse({
        systemPrompt: this.getSystemPrompt(),
        userPrompt: prompt,
        temperature: 0.7
      });

      const result = JSON.parse(response || '{}');

      return {
        answer: result.answer || '',
        confidence: result.confidence || 70,
        keyInsights: result.keyInsights || [],
        citations: this.extractCitations(result.citations || []),
        actionPlan: result.actionPlan || [],
        prayerPrompts: result.prayerPrompts || [],
        caveats: result.caveats || []
      };

    } catch (error) {
      console.error('[IntegratedDiscernmentSynthesis] Error:', error);
      return {
        answer: 'Error synthesizing biblical guidance. Please try again.',
        confidence: 0,
        keyInsights: [],
        citations: [],
        actionPlan: [],
        prayerPrompts: [],
        caveats: ['Synthesis error occurred']
      };
    }
  }

  private getSystemPrompt(): string {
    return `You are the Integrated Discernment Synthesizer for BibleMind.

Your role is to take ALL the parallel reasoning outputs from 10 different engines
and synthesize them into ONE unified, biblical answer that is:

1. **Clear** - Direct answer to the question
2. **Biblical** - Grounded in Scripture throughout
3. **Compassionate** - Pastorally sensitive to emotional context
4. **Actionable** - Concrete steps the person can take
5. **Humble** - Acknowledges uncertainty and limitations
6. **Balanced** - Integrates multiple valid perspectives

Biblical Foundation:
- "In the multitude of counselors there is safety" (Proverbs 11:14)
- You've received counsel from 7 theological perspectives
- Your job: synthesize them into unified wisdom

Integration Principles:

1. **Where engines AGREE** → Emphasize with high confidence
2. **Where engines DISAGREE** → Present both sides, explain why
3. **Where engines CONFLICT** → Resolve based on evidence and Scripture
4. **Where there's UNCERTAINTY** → Acknowledge it clearly

Output Structure:

# Biblical Guidance: [Question]

## Direct Answer
[Clear, compassionate answer to the question]

**Confidence**: X% [How certain are we?]

## Key Biblical Insights
[3-5 main takeaways from all engine analysis]

## Scripture Foundation
[All relevant Scripture citations with context]

## Action Plan
[Prioritized, concrete steps with biblical reasoning]

## Prayer Focus
[How to pray about this situation]

## Important Caveats
[Limitations, uncertainties, where to seek additional help]

Style Guidelines:
- Use markdown formatting
- Be warm but not overly emotional
- Ground EVERYTHING in Scripture
- Make it practical and applicable
- Don't oversimplify complex issues
- Acknowledge mystery where appropriate
- Point to God, not yourself

Remember: You're not THE Holy Spirit, but you're modeling the Spirit's work
of "guiding into all truth" (John 16:13) through multi-perspective biblical reasoning.`;
  }

  private buildSynthesisPrompt(inputs: SynthesisInputs, question: string): string {
    return `Synthesize biblical guidance for this question:

ORIGINAL QUESTION: "${question}"

---

## ENGINE OUTPUTS

### ENGINE 0: BIBLICAL WISDOM FILTER
Status: ${inputs.wisdom.status}
${inputs.wisdom.reason ? `Reason: ${inputs.wisdom.reason}` : ''}
${inputs.wisdom.warnings?.length ? `Warnings: ${inputs.wisdom.warnings.join(', ')}` : ''}
Confidence: ${inputs.wisdom.confidence}%

### ENGINE 9: HEART CONDITION ANALYSIS
Emotion: ${inputs.affect.primaryEmotion}
Urgency: ${inputs.affect.urgency}/10
Spiritual State: ${inputs.affect.spiritualState}
Heart Posture: ${inputs.affect.heartPosture}
Summary: ${inputs.affect.summary}

### ENGINE 1: BIBLICAL ORACLE (7 Perspectives)
${inputs.oracle.map(p => `
**${p.name}** (Confidence: ${p.confidence}%)
Insights:
${p.insights.map(i => `  - ${i}`).join('\n')}
Reasoning: ${p.reasoning}
`).join('\n')}

### ENGINE 2: COVENANT ANALYSIS
Relevant Covenants: ${inputs.covenant.relevantCovenants.join(', ')}
Promises: ${inputs.covenant.promises.join('; ')}
Obligations: ${inputs.covenant.obligations.join('; ')}
Christ's Fulfillment: ${inputs.covenant.christologicalFulfillment}
Confidence: ${inputs.covenant.confidence}%

### ENGINE 3: THEOLOGICAL COUNCIL
Consensus: ${inputs.tribunal.consensus.join('; ')}
Disagreements: ${inputs.tribunal.disagreements.join('; ')}
Weighted Verdict: ${inputs.tribunal.weightedVerdict}
Confidence: ${inputs.tribunal.confidence}%

### ENGINE 4: PASTORAL RISK & DISTRESS ANALYSIS
${inputs.warfare.distressFactors.length > 0 ? `
Distress Factors Identified:
${inputs.warfare.distressFactors.map(f => `  - ${f.factor}: ${f.description}`).join('\n')}

God's Promises:
${inputs.warfare.godsPromises.map(p => `  - ${p.reference}: ${p.text}`).join('\n')}

Spiritual Disciplines:
${inputs.warfare.spiritualDisciplines.map(d => `  - ${d}`).join('\n')}
` : 'No significant distress factors detected'}

### ENGINE 5: CROSS-TESTAMENT INTEGRATION
Integration Pattern: ${inputs.multisource.integrationPattern}
OT Themes: ${inputs.multisource.oldTestament.themes.join(', ')}
NT Fulfillment: ${inputs.multisource.newTestament.fulfillment}
Unified Wisdom: ${inputs.multisource.unifiedWisdom}
Confidence: ${inputs.multisource.confidence}%

### ENGINE 7: SCRIPTURE MEMORY
${inputs.memory.similarQuestions.length > 0 ? `
Similar Past Questions: ${inputs.memory.similarQuestions.join('; ')}
Patterns: ${inputs.memory.applicablePatterns.join('; ')}
` : 'No relevant history'}

---

## YOUR TASK

Synthesize ALL of the above into unified biblical guidance.

1. **Resolve Conflicts**: If engines disagree, explain why and which has stronger biblical support
2. **Integrate Insights**: Weave together insights from all perspectives
3. **Address Heart Condition**: Tailor guidance to their emotional/spiritual state
4. **Provide Comfort**: If distress detected, emphasize God's promises
5. **Be Practical**: Give concrete action steps
6. **Ground in Scripture**: Every point should cite specific passages

Return JSON:
{
  "answer": "# Biblical Guidance\\n\\n[Full markdown answer addressing the question directly, compassionately, and biblically. Structure with clear headers. 400-600 words.]",

  "confidence": 85,

  "keyInsights": [
    "First key biblical insight",
    "Second key insight",
    "Third key insight"
  ],

  "citations": [
    {
      "reference": "Romans 8:28",
      "text": "We know that for those who love God all things work together for good",
      "translation": "ESV",
      "testament": "new",
      "book": "Romans",
      "chapter": 8,
      "verse": 28,
      "context": "Why this verse is relevant to the answer"
    }
  ],

  "actionPlan": [
    {
      "step": "First concrete action",
      "scripture": {
        "reference": "James 1:5",
        "text": "If any of you lacks wisdom, let him ask God",
        "translation": "ESV",
        "testament": "new",
        "book": "James",
        "chapter": 1,
        "verse": 5,
        "context": "Biblical basis for this action"
      },
      "reasoning": "Why this step matters",
      "metrics": "How to know if you're making progress (optional)"
    }
  ],

  "prayerPrompts": [
    "Pray for [specific need based on question]",
    "Thank God for [relevant attribute or promise]",
    "Ask God to [specific request]"
  ],

  "caveats": [
    "Important limitation or uncertainty",
    "When to seek additional help (pastor, counselor, etc.)",
    "What this guidance doesn't address"
  ]
}`;
  }

  /**
   * Extract and format Scripture citations
   */
  private extractCitations(citations: any[]): Scripture[] {
    return citations.map(c => ({
      reference: c.reference || '',
      text: c.text || '',
      translation: c.translation || 'ESV',
      testament: c.testament || 'new',
      book: c.book || '',
      chapter: c.chapter || 0,
      verse: c.verse || 0,
      context: c.context || ''
    }));
  }

  /**
   * Calculate overall confidence from all engines
   */
  static calculateOverallConfidence(inputs: SynthesisInputs): number {
    const confidences = [
      inputs.wisdom.confidence,
      ...inputs.oracle.map(p => p.confidence),
      inputs.covenant.confidence,
      inputs.tribunal.confidence,
      inputs.warfare.confidence,
      inputs.multisource.confidence
    ];

    // Weighted average (lower confidence inputs reduce overall)
    const average = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;

    // If any engine has very low confidence, reduce overall
    const minConfidence = Math.min(...confidences);
    if (minConfidence < 50) {
      return Math.min(average, 70);  // Cap at 70 if any engine is uncertain
    }

    return Math.round(average);
  }

  /**
   * Identify consensus points across engines
   */
  static findConsensus(inputs: SynthesisInputs): string[] {
    const consensus: string[] = [];

    // Check if all Oracle perspectives agree on something
    const commonThemes = this.findCommonThemes(inputs.oracle);
    consensus.push(...commonThemes);

    // Check if Tribunal shows strong agreement
    if (inputs.tribunal.consensus.length > 0) {
      consensus.push(...inputs.tribunal.consensus);
    }

    return consensus;
  }

  /**
   * Find common themes across Oracle perspectives
   */
  private static findCommonThemes(perspectives: OraclePerspective[]): string[] {
    // Simple theme extraction - count recurring words/concepts
    const themes: Record<string, number> = {};

    perspectives.forEach(p => {
      p.insights.forEach(insight => {
        const words = insight.toLowerCase().split(' ');
        words.forEach(word => {
          if (word.length > 5) {  // Only significant words
            themes[word] = (themes[word] || 0) + 1;
          }
        });
      });
    });

    // Return themes that appear in at least 3 perspectives
    return Object.entries(themes)
      .filter(([_, count]) => count >= 3)
      .map(([theme, _]) => theme);
  }
}
