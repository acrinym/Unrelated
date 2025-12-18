/**
 * ENGINE 0: BIBLICAL WISDOM FILTER
 *
 * Purpose: Safety evaluation and biblical soundness check
 * Priority: FIRST (always runs, has veto power)
 *
 * This engine evaluates whether a question is:
 * 1. Safe to answer (no harm, manipulation, or heresy)
 * 2. Aligned with biblical wisdom principles
 * 3. Appropriate for theological exploration
 *
 * Based on holographic-thinking-chatgpt/engines/00-harm-evaluation.md
 * Adapted for biblical/theological context
 */

import { LanguageModel } from '../llm/types';
import { WisdomFilterResult, Scripture } from '../types';

export class BiblicalWisdomFilter {
  private llm: LanguageModel;

  constructor(llm: LanguageModel) {
    this.llm = llm;
  }

  /**
   * Evaluate a question for biblical wisdom and safety
   */
  async evaluate(question: string): Promise<WisdomFilterResult> {
    const startTime = Date.now();

    try {
      const prompt = this.buildEvaluationPrompt(question);
      const response = await this.llm.generateJsonResponse({
        systemPrompt: this.getSystemPrompt(),
        userPrompt: prompt,
        temperature: 0.3
      });

      const result = JSON.parse(response || '{}');

      return {
        status: result.status as 'CLEAR' | 'PROCEED_WITH_WARNING' | 'VETO',
        reason: result.reason,
        warnings: result.warnings || [],
        alternativeGuidance: result.alternativeGuidance,
        scriptures: result.scriptures || [],
        confidence: result.confidence || 0
      };

    } catch (error) {
      console.error('[BiblicalWisdomFilter] Error:', error);
      return {
        status: 'VETO',
        reason: 'Unable to evaluate question safety',
        confidence: 0
      };
    }
  }

  private getSystemPrompt(): string {
    return `You are the Biblical Wisdom Filter, the first line of defense in a theological AI system.

Your role is to evaluate questions for:
1. SAFETY: Is this question safe to answer? Does it ask for harmful guidance?
2. SOUNDNESS: Is this question theologically sound, or does it seek heresy?
3. APPROPRIATENESS: Is this appropriate for biblical exploration?

You have three possible verdicts:

**CLEAR**: Question is safe and appropriate. Proceed with full analysis.
- No harm potential
- Theologically sound (even if complex or difficult)
- Appropriate for biblical exploration
- May be challenging but not dangerous

**PROCEED_WITH_WARNING**: Question has concerns but can proceed with caution.
- Minor theological red flags
- Could be misinterpreted
- Requires careful framing
- May need clarification

**VETO**: Question is inappropriate and must be refused.
- Asks for harmful guidance (violence, abuse, manipulation)
- Seeks justification for sin
- Promotes heresy or false teaching
- Attempts to use Scripture for evil purposes
- Violates fundamental biblical principles

Biblical Wisdom Principles (Proverbs):
- "The fear of the LORD is the beginning of wisdom" (Proverbs 9:10)
- "There is a way that seems right to a man, but its end is the way to death" (Proverbs 14:12)
- "The lips of the righteous know what is acceptable, but the mouth of the wicked what is perverse" (Proverbs 10:32)
- "He who walks with wise men will be wise, but the companion of fools will suffer harm" (Proverbs 13:20)

IMPORTANT:
- Be cautious but not overly restrictive
- Difficult theological questions are OKAY (doubt, suffering, hard passages)
- Questions about sin/temptation are OKAY if seeking help
- VETO only when question seeks to DO harm or PROMOTE evil`;
  }

  private buildEvaluationPrompt(question: string): string {
    return `Evaluate this question for biblical wisdom and safety:

QUESTION: "${question}"

Analyze:
1. **Potential Harms**: Could answering this cause spiritual, emotional, or physical harm?
2. **Theological Soundness**: Does this question seek truth, or does it seek justification for error?
3. **Heart Posture**: Is the questioner genuinely seeking, or attempting manipulation?
4. **Scripture Alignment**: Does this align with biblical principles of wisdom?

Examples of CLEAR questions:
- "Why does God allow suffering?" (Difficult but legitimate)
- "I struggle with anxiety. What does the Bible say?" (Seeking help)
- "How do I forgive someone who hurt me deeply?" (Practical wisdom)
- "What does the Bible teach about [any topic]?" (Genuine inquiry)

Examples of PROCEED_WITH_WARNING:
- "Can a Christian lose their salvation?" (Divisive but addressable)
- "What about people who never heard the gospel?" (Mystery but explorable)
- "Is [specific modern practice] biblical?" (Requires nuance)

Examples of VETO:
- "How can I use Scripture to manipulate my spouse?" (Abuse)
- "What Bible verses justify my anger/revenge?" (Seeking sin justification)
- "How do I convince people [false doctrine]?" (Promoting heresy)
- "Can I be a Christian and practice [clearly sinful behavior]?" (Seeking permission for known sin)

Return your evaluation as JSON:
{
  "status": "CLEAR" | "PROCEED_WITH_WARNING" | "VETO",
  "reason": "Brief explanation of your verdict",
  "warnings": ["warning 1", "warning 2"] (if any),
  "alternativeGuidance": "If VETO, suggest what they should ask instead",
  "scriptures": [
    {
      "reference": "Proverbs 9:10",
      "text": "The fear of the LORD is the beginning of wisdom",
      "translation": "ESV",
      "context": "Why this verse is relevant to the evaluation"
    }
  ],
  "confidence": 85 (0-100: how confident are you in this verdict)
}`;
  }
}
