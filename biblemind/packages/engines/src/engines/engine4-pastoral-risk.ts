/**
 * ENGINE 4: PASTORAL RISK & DISTRESS ANALYSIS
 * (Internal: "Spiritual Warfare Check")
 *
 * Purpose: Identify spiritual/emotional distress and provide biblical comfort
 * Priority: SAFETY/PASTORAL (runs in parallel with other engines)
 *
 * Biblical Foundation:
 * - "We do not wrestle against flesh and blood" (Ephesians 6:12)
 * - "The enemy comes to steal, kill, and destroy" (John 10:10)
 * - "Resist the devil, and he will flee from you" (James 4:7)
 * - "God has not given us a spirit of fear" (2 Timothy 1:7)
 *
 * This engine identifies when questions reveal spiritual/emotional distress:
 * - Fear → God's promises of presence and sovereignty
 * - Doubt → Evidence of God's faithfulness
 * - Shame → Gospel of grace and forgiveness
 * - Despair → Hope in God's character
 * - Bitterness → Call to forgiveness
 *
 * PUBLIC LABEL: "Pastoral Risk & Distress Analysis"
 * INTERNAL NAME: "Spiritual Warfare Check"
 *
 * Why the different labels?
 * - External: Professional, pastoral framing
 * - Internal: Accurate spiritual reality
 * - Same function: Identify attacks and provide God's truth
 *
 * Based on holographic-thinking-chatgpt/engines/04-edgecase.md
 * Adapted for spiritual warfare / pastoral care context
 */

import { PastoralRiskAnalysis, AffectAnalysis, Scripture } from '../types';
import { LanguageModel } from '../llm/types';

export class PastoralRiskEngine {
  private llm: LanguageModel;

  constructor(llm: LanguageModel) {
    this.llm = llm;
  }

  /**
   * Analyze question for spiritual/emotional distress factors
   */
  async analyze(
    question: string,
    affectContext: AffectAnalysis
  ): Promise<PastoralRiskAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(question, affectContext);
      const response = await this.llm.generateJsonResponse({
        systemPrompt: this.getSystemPrompt(),
        userPrompt: prompt,
        temperature: 0.7
      });

      const result = JSON.parse(response || '{}');

      return {
        distressFactors: result.distressFactors || [],
        godsPromises: result.godsPromises || [],
        spiritualDisciplines: result.spiritualDisciplines || [],
        confidence: result.confidence || 70
      };

    } catch (error) {
      console.error('[PastoralRiskEngine] Error:', error);
      return {
        distressFactors: [],
        godsPromises: [],
        spiritualDisciplines: ['Prayer', 'Scripture reading', 'Fellowship'],
        confidence: 0
      };
    }
  }

  private getSystemPrompt(): string {
    return `You are the Pastoral Risk & Distress Analyzer for BibleMind.

Your role is to identify spiritual and emotional distress factors in questions,
then provide biblical comfort and practical spiritual disciplines.

Biblical Foundation:
- "We do not wrestle against flesh and blood, but against spiritual forces" (Ephesians 6:12)
- "The thief comes to steal, kill, and destroy" (John 10:10)
- "God has not given us a spirit of fear, but of power and love" (2 Timothy 1:7)
- "Resist the devil, and he will flee from you" (James 4:7)

Common Distress Factors (Enemy Tactics):

1. **FEAR** - "God has not given us a spirit of fear" (2 Timothy 1:7)
   - Manifestations: Anxiety, worry, panic, terror
   - God's truth: "I am with you always" (Matthew 28:20)
   - Discipline: Memorize promises, pray for peace

2. **DOUBT** - "Help my unbelief" (Mark 9:24)
   - Manifestations: Questioning God's goodness, wondering if He cares
   - God's truth: "I will never leave you nor forsake you" (Hebrews 13:5)
   - Discipline: Study God's faithfulness in Scripture

3. **SHAME** - "No condemnation in Christ" (Romans 8:1)
   - Manifestations: Feeling dirty, unworthy, unforgiven
   - God's truth: "You are a new creation" (2 Corinthians 5:17)
   - Discipline: Meditate on gospel, confess to trusted friend

4. **DESPAIR** - "Hope does not disappoint" (Romans 5:5)
   - Manifestations: Hopelessness, suicidal thoughts, giving up
   - God's truth: "His mercies are new every morning" (Lamentations 3:22-23)
   - Discipline: Lament psalms, counseling, community

5. **PRIDE** - "Pride goes before destruction" (Proverbs 16:18)
   - Manifestations: Self-sufficiency, refusal to repent, defensiveness
   - God's truth: "God opposes the proud but gives grace to the humble" (James 4:6)
   - Discipline: Confession, accountability, serve others

6. **BITTERNESS** - "Let go of bitterness" (Ephesians 4:31)
   - Manifestations: Unforgiveness, resentment, anger
   - God's truth: "Forgive as you have been forgiven" (Ephesians 4:32)
   - Discipline: Choose forgiveness daily, pray for offender

7. **DECEPTION** - "The devil is the father of lies" (John 8:44)
   - Manifestations: Believing false things about God, self, or others
   - God's truth: "You will know the truth, and it will set you free" (John 8:32)
   - Discipline: Test everything against Scripture

8. **CONDEMNATION** - "No condemnation" (Romans 8:1)
   - Manifestations: False guilt, self-punishment, perfectionism
   - God's truth: "Christ bore your condemnation" (Galatians 3:13)
   - Discipline: Preach gospel to yourself daily

IMPORTANT DISTINCTIONS:

**Conviction vs. Condemnation**:
- Conviction: Holy Spirit pointing to specific sin, leading to repentance
- Condemnation: Enemy's accusation, leading to shame and despair
- Test: Does it lead to hope or hopelessness?

**Healthy Fear vs. Sinful Fear**:
- Fear of the Lord: Reverence, awe, respect (Proverbs 9:10)
- Spirit of fear: Anxiety, panic, terror (NOT from God per 2 Timothy 1:7)

**Grief vs. Despair**:
- Grief: Healthy mourning with hope (1 Thessalonians 4:13)
- Despair: Hopeless mourning, giving up

Your task:
1. Identify distress factors (what's attacking their peace/faith?)
2. Provide God's promises that counter each factor
3. Recommend spiritual disciplines to fight back
4. Be compassionate, not clinical

NOT every question has distress factors. Some are just genuine inquiry.
Only flag actual spiritual/emotional distress.`;
  }

  private buildAnalysisPrompt(
    question: string,
    affectContext: AffectAnalysis
  ): string {
    return `Analyze this question for spiritual/emotional distress factors:

QUESTION: "${question}"

EMOTIONAL/SPIRITUAL CONTEXT:
- Primary emotion: ${affectContext.primaryEmotion}
- Urgency: ${affectContext.urgency}/10
- Spiritual state: ${affectContext.spiritualState}
- Heart posture: ${affectContext.heartPosture}
- Summary: ${affectContext.summary}

Analyze for distress factors:

1. **Identify Distress Factors**: What spiritual/emotional attacks do you see?
   - Fear, doubt, shame, despair, pride, bitterness, deception, condemnation?
   - Be specific about how it manifests in this question

2. **God's Promises**: For each distress factor, what promise of God counters it?
   - Provide specific Scripture references
   - Explain how this promise speaks to their situation

3. **Spiritual Disciplines**: What practices would help?
   - Prayer (specific types: lament, thanksgiving, intercession)
   - Scripture (what to memorize, meditate on)
   - Community (confession, accountability, fellowship)
   - Worship, fasting, serving, etc.

Examples:

QUESTION: "I'm terrified I committed the unforgivable sin"
DISTRESS: Fear + condemnation
PROMISE: Mark 3:28-29 explains the unforgivable sin (you're worried about it = you haven't committed it)
DISCIPLINE: Memorize Romans 8:1, talk to pastor

QUESTION: "Why does God allow suffering?"
DISTRESS: None (this is honest questioning, not distress)
PROMISE: N/A (provide answers, not comfort)

QUESTION: "I hate the person who hurt me"
DISTRESS: Bitterness, unforgiveness
PROMISE: Ephesians 4:32 - forgive as you've been forgiven
DISCIPLINE: Daily prayer for them, choose forgiveness

Return JSON:
{
  "distressFactors": [
    {
      "factor": "fear" | "doubt" | "shame" | "despair" | "pride" | "bitterness" | "deception" | "condemnation",
      "description": "How this manifests in the question",
      "scripture": {
        "reference": "2 Timothy 1:7",
        "text": "God has not given us a spirit of fear...",
        "translation": "ESV",
        "testament": "new",
        "book": "2 Timothy",
        "chapter": 1,
        "verse": 7,
        "context": "God's truth that counters this distress"
      }
    }
  ],
  "godsPromises": [
    {
      "reference": "Matthew 28:20",
      "text": "I am with you always, to the end of the age",
      "translation": "ESV",
      "testament": "new",
      "book": "Matthew",
      "chapter": 28,
      "verse": 20,
      "context": "God promises His presence for those experiencing fear/isolation"
    }
  ],
  "spiritualDisciplines": [
    "Memorize 2 Timothy 1:7 and recite when fear arises",
    "Pray Psalm 23 daily for comfort",
    "Share this struggle with a trusted friend or pastor"
  ],
  "confidence": 85
}

If NO distress factors detected, return empty arrays for distressFactors and godsPromises.`;
  }

  /**
   * Quick check: Does this question show signs of spiritual distress?
   */
  static hasDistressSignals(question: string, affectContext: AffectAnalysis): boolean {
    // High urgency + negative emotion = likely distress
    if (affectContext.urgency >= 7 && affectContext.primaryEmotion.includes('fear|doubt|shame|despair')) {
      return true;
    }

    // Explicit distress words
    const distressWords = [
      'terrified', 'afraid', 'fear', 'anxious', 'worried',
      'ashamed', 'guilty', 'condemned', 'unforgivable',
      'hopeless', 'despair', 'give up', 'suicidal',
      'hate', 'bitter', 'unforgivable', 'unforgiven'
    ];

    const questionLower = question.toLowerCase();
    return distressWords.some(word => questionLower.includes(word));
  }

  /**
   * Get immediate comfort scripture for a distress type
   */
  static getImmediateComfort(distressType: string): {
    reference: string;
    text: string;
    why: string;
  } {
    const comfortMap: Record<string, { reference: string; text: string; why: string }> = {
      fear: {
        reference: '2 Timothy 1:7',
        text: 'For God gave us a spirit not of fear but of power and love and self-control',
        why: 'Fear is not from God - He gives power instead'
      },
      doubt: {
        reference: 'Mark 9:24',
        text: 'I believe; help my unbelief!',
        why: 'Jesus welcomes honest doubt and strengthens weak faith'
      },
      shame: {
        reference: 'Romans 8:1',
        text: 'There is therefore now no condemnation for those who are in Christ Jesus',
        why: 'In Christ, your shame is removed - no condemnation'
      },
      despair: {
        reference: 'Lamentations 3:22-23',
        text: 'The steadfast love of the LORD never ceases; his mercies never come to an end; they are new every morning',
        why: 'Even in darkest despair, God\'s mercy is new every day'
      },
      bitterness: {
        reference: 'Ephesians 4:32',
        text: 'Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you',
        why: 'Forgiveness flows from remembering how much we\'ve been forgiven'
      }
    };

    return comfortMap[distressType] || {
      reference: 'Psalm 46:1',
      text: 'God is our refuge and strength, a very present help in trouble',
      why: 'God is present and ready to help in any distress'
    };
  }
}
