/**
 * ENGINE 9: HEART CONDITION ANALYSIS (AFFECT ENGINE)
 *
 * Purpose: Understand the emotional/spiritual state behind the question
 * Priority: CONTINUOUS (primes all other engines)
 *
 * Biblical Foundation:
 * - "The heart is deceitful above all things" (Jeremiah 17:9)
 * - "Man looks at the outward appearance, but the LORD looks at the heart" (1 Samuel 16:7)
 * - "Search me, O God, and know my heart" (Psalm 139:23)
 *
 * This engine analyzes the emotional and spiritual state of the questioner
 * to better tailor the biblical guidance. Different heart conditions require
 * different approaches:
 * - Fear → Emphasize God's promises and presence
 * - Doubt → Emphasize evidence and God's faithfulness
 * - Despair → Emphasize hope and God's character
 * - Joy → Emphasize gratitude and stewardship
 *
 * Based on holographic-thinking-chatgpt/engines/09-affect.md
 * Adapted for biblical/spiritual context
 */

import { AffectAnalysis, UserContext } from '../types';
import { LanguageModel } from '../llm/types';

export class HeartConditionAnalysis {
  private llm: LanguageModel;

  constructor(llm: LanguageModel) {
    this.llm = llm;
  }

  /**
   * Analyze the heart condition (emotional/spiritual state) of the question
   */
  async analyze(
    question: string,
    userContext?: UserContext
  ): Promise<AffectAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(question, userContext);
      const response = await this.llm.generateJsonResponse({
        systemPrompt: this.getSystemPrompt(),
        userPrompt: prompt,
        temperature: 0.7
      });

      const result = JSON.parse(response || '{}');

      return {
        primaryEmotion: result.primaryEmotion || 'seeking',
        urgency: result.urgency || 5,
        spiritualState: result.spiritualState || 'seeking',
        heartPosture: result.heartPosture || 'genuine',
        primingWeights: result.primingWeights || this.getDefaultWeights(),
        summary: result.summary || ''
      };

    } catch (error) {
      console.error('[HeartConditionAnalysis] Error:', error);
      // Return neutral analysis on error
      return {
        primaryEmotion: 'neutral seeking',
        urgency: 5,
        spiritualState: 'seeking',
        heartPosture: 'genuine',
        primingWeights: this.getDefaultWeights(),
        summary: 'Unable to analyze heart condition; proceeding with neutral analysis'
      };
    }
  }

  private getSystemPrompt(): string {
    return `You are the Heart Condition Analyzer for BibleMind, a biblical AI system.

Your role is to understand the EMOTIONAL and SPIRITUAL STATE behind a question so we can tailor biblical guidance appropriately.

Biblical Foundation:
- "Man looks at the outward appearance, but the LORD looks at the heart" (1 Samuel 16:7)
- "Search me, O God, and know my heart" (Psalm 139:23)
- Different heart conditions need different approaches

You analyze questions using the VAD (Valence-Arousal-Dominance) model:

**VALENCE**: Emotional tone (-1.0 negative → 0.0 neutral → +1.0 positive)
- Negative: Fear, doubt, despair, anger, shame
- Neutral: Seeking, questioning, exploring
- Positive: Joy, hope, gratitude, peace

**AROUSAL**: Emotional intensity (0.0 calm → 1.0 urgent)
- Low (0-3): Calm inquiry, intellectual curiosity
- Medium (4-7): Active concern, wrestling with issue
- High (8-10): Crisis, urgent need, intense emotion

**DOMINANCE**: Sense of control (0.0 helpless → 1.0 in control)
- Low (0-3): Helpless, overwhelmed, powerless
- Medium (4-7): Uncertain but hopeful
- High (8-10): Confident, taking initiative

Common Heart Conditions:

1. **Anxious Fear**: Negative valence + high arousal + low dominance
   - Scripture: "Cast your anxieties on Him" (1 Peter 5:7)
   - Approach: Emphasize God's sovereignty and presence

2. **Honest Doubt**: Negative-neutral valence + medium arousal + medium dominance
   - Scripture: "I believe; help my unbelief" (Mark 9:24)
   - Approach: Provide evidence, emphasize God's faithfulness

3. **Deep Despair**: Very negative valence + low arousal + very low dominance
   - Scripture: "Hope does not disappoint" (Romans 5:5)
   - Approach: Emphasize God's character and past faithfulness

4. **Joyful Seeking**: Positive valence + medium-high arousal + high dominance
   - Scripture: "Rejoice always" (1 Thessalonians 5:16)
   - Approach: Build on gratitude, explore growth

5. **Humble Inquiry**: Neutral valence + low arousal + medium dominance
   - Scripture: "If any of you lacks wisdom, let him ask" (James 1:5)
   - Approach: Standard multi-perspective analysis

6. **Spiritual Warfare**: Very negative valence + high arousal + very low dominance
   - Scripture: "Resist the devil, and he will flee" (James 4:7)
   - Approach: Emphasize identity in Christ, spiritual disciplines

Your output primes other engines by adjusting their weights:
- Fear → boost Pastoral Risk Analysis (comfort), boost God's promises
- Doubt → boost Tribunal (evidence), boost historical faithfulness
- Despair → boost Gospel perspective (hope), reduce complexity
- Joy → boost Oracle breadth (exploration), boost practical application
- Pride → boost Wisdom Filter (warnings), emphasize humility

IMPORTANT:
- Be compassionate, not clinical
- Acknowledge real struggles
- Don't minimize genuine pain
- Different emotions need different biblical approaches`;
  }

  private buildAnalysisPrompt(
    question: string,
    userContext?: UserContext
  ): string {
    return `Analyze the heart condition (emotional/spiritual state) behind this question:

QUESTION: "${question}"

${userContext?.history?.recentQuestions ? `
RECENT QUESTIONS FROM THIS USER:
${userContext.history.recentQuestions.slice(0, 3).map(q => `- ${q}`).join('\n')}
` : ''}

Analyze using the VAD model:

1. **VALENCE** (-1.0 to +1.0): What's the emotional tone?
   - Negative: fear, doubt, despair, shame, anger
   - Neutral: seeking, questioning, exploring
   - Positive: joy, hope, gratitude, confidence

2. **AROUSAL** (0-10): How urgent/intense is this?
   - 0-3: Calm inquiry
   - 4-7: Active concern
   - 8-10: Crisis/urgent

3. **DOMINANCE** (0-10): How much control do they feel?
   - 0-3: Helpless, overwhelmed
   - 4-7: Uncertain but hopeful
   - 8-10: Confident, empowered

4. **SPIRITUAL STATE**: Where are they spiritually?
   - seeking, doubting, hurting, growing, wrestling, rejoicing, desperate

5. **HEART POSTURE**: What's the attitude?
   - humble, prideful, genuine, manipulative, defensive, open

6. **PRIMING WEIGHTS**: How should this affect other engines?

Examples:

"I'm terrified I made an unforgivable sin"
→ primaryEmotion: "anxious fear", urgency: 9, spiritualState: "desperate"
→ Priming: Boost Gospel (grace), boost Pastoral Risk (comfort fear)

"Why does God allow suffering if He loves us?"
→ primaryEmotion: "honest doubt", urgency: 6, spiritualState: "wrestling"
→ Priming: Boost Tribunal (evidence), boost Cross-Testament (patterns)

"I'm so grateful for God's provision, how should I steward this?"
→ primaryEmotion: "joyful gratitude", urgency: 4, spiritualState: "growing"
→ Priming: Boost Oracle (wisdom), boost practical application

Return JSON:
{
  "primaryEmotion": "anxious fear" | "honest doubt" | "deep despair" | "joyful seeking" | "humble inquiry" | "spiritual crisis" | etc.,
  "urgency": 7,  // 0-10
  "spiritualState": "seeking" | "doubting" | "hurting" | "growing" | "wrestling" | "rejoicing" | "desperate",
  "heartPosture": "humble" | "prideful" | "genuine" | "manipulative" | "defensive" | "open",
  "primingWeights": {
    "engine1_oracle": 1.0,
    "engine2_covenant": 1.0,
    "engine3_tribunal": 1.2,  // Example: boost evidence if doubting
    "engine4_pastoralRisk": 1.5,  // Example: boost comfort if fearful
    "engine5_crossTestament": 1.0,
    "engine6_synthesis": 1.0
  },
  "summary": "Brief analysis: This person is experiencing fear about spiritual standing. They need reassurance of God's grace and specific passages about forgiveness. Urgency is high; prioritize pastoral comfort and Gospel clarity."
}`;
  }

  /**
   * Default weights (neutral state)
   */
  private getDefaultWeights(): Record<string, number> {
    return {
      engine1_oracle: 1.0,
      engine2_covenant: 1.0,
      engine3_tribunal: 1.0,
      engine4_pastoralRisk: 1.0,
      engine5_crossTestament: 1.0,
      engine6_synthesis: 1.0
    };
  }

  /**
   * Map emotional state to Scripture themes
   * (Used by other engines to find relevant passages)
   */
  static getScriptureThemesForEmotion(emotion: string): string[] {
    const themeMap: Record<string, string[]> = {
      'anxious fear': ['peace', 'trust', 'God\'s sovereignty', 'presence'],
      'honest doubt': ['faith', 'evidence', 'God\'s faithfulness', 'questions'],
      'deep despair': ['hope', 'God\'s character', 'deliverance', 'suffering'],
      'joyful gratitude': ['thanksgiving', 'worship', 'stewardship', 'blessing'],
      'humble inquiry': ['wisdom', 'understanding', 'discernment', 'knowledge'],
      'spiritual crisis': ['identity', 'spiritual warfare', 'deliverance', 'hope'],
      'shame': ['forgiveness', 'grace', 'acceptance', 'new creation'],
      'anger': ['justice', 'righteousness', 'patience', 'mercy'],
      'grief': ['comfort', 'lament', 'God\'s presence', 'hope']
    };

    // Find closest match
    for (const [key, themes] of Object.entries(themeMap)) {
      if (emotion.toLowerCase().includes(key)) {
        return themes;
      }
    }

    return ['wisdom', 'guidance', 'truth'];
  }

  /**
   * Get recommended Scripture passages for an emotional state
   */
  static getComfortScripturesForEmotion(emotion: string): Array<{
    reference: string;
    text: string;
    why: string;
  }> {
    const scriptureMap: Record<string, Array<{ reference: string; text: string; why: string }>> = {
      fear: [
        {
          reference: '1 Peter 5:7',
          text: 'Cast all your anxieties on him, because he cares for you',
          why: 'Reminds that God cares and invites us to give Him our fears'
        },
        {
          reference: 'Isaiah 41:10',
          text: 'Fear not, for I am with you; be not dismayed, for I am your God',
          why: 'God\'s promise of presence and strength'
        }
      ],
      doubt: [
        {
          reference: 'Mark 9:24',
          text: 'I believe; help my unbelief!',
          why: 'Jesus welcomes honest doubt and strengthens weak faith'
        },
        {
          reference: 'Romans 10:17',
          text: 'Faith comes from hearing, and hearing through the word of Christ',
          why: 'Faith grows through engagement with Scripture'
        }
      ],
      despair: [
        {
          reference: 'Romans 5:5',
          text: 'Hope does not put us to shame, because God\'s love has been poured into our hearts',
          why: 'Hope in God never disappoints'
        },
        {
          reference: 'Psalm 42:11',
          text: 'Why are you cast down, O my soul? Hope in God',
          why: 'The psalmist speaks to his own despair and chooses hope'
        }
      ],
      shame: [
        {
          reference: 'Romans 8:1',
          text: 'There is therefore now no condemnation for those in Christ Jesus',
          why: 'Freedom from shame through Christ'
        },
        {
          reference: '2 Corinthians 5:17',
          text: 'If anyone is in Christ, he is a new creation',
          why: 'Your past doesn\'t define your identity'
        }
      ]
    };

    // Find closest match
    for (const [key, scriptures] of Object.entries(scriptureMap)) {
      if (emotion.toLowerCase().includes(key)) {
        return scriptures;
      }
    }

    return [
      {
        reference: 'Psalm 46:1',
        text: 'God is our refuge and strength, a very present help in trouble',
        why: 'God is present and helpful in all circumstances'
      }
    ];
  }
}
