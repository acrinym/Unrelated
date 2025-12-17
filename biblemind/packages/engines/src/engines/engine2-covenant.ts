/**
 * ENGINE 2: COVENANT ANALYSIS
 *
 * Purpose: Analyze questions through the lens of biblical covenants
 * Priority: CORE (runs in parallel with Oracle)
 *
 * The 6 Major Biblical Covenants:
 * 1. Adamic Covenant - Creation, dominion, fall
 * 2. Noahic Covenant - Preservation, rainbow promise
 * 3. Abrahamic Covenant - Blessing, land, offspring
 * 4. Mosaic Covenant - Law, Sinai, Torah
 * 5. Davidic Covenant - Kingship, Messiah, eternal throne
 * 6. New Covenant - Grace, Jesus' blood, internal law
 *
 * Biblical Foundation:
 * - "I will establish my covenant" (Genesis 6:18)
 * - "This is my blood of the covenant" (Matthew 26:28)
 * - "He is the mediator of a new covenant" (Hebrews 9:15)
 *
 * This engine analyzes:
 * - Which covenants are relevant to the question
 * - What promises God makes
 * - What obligations exist
 * - How Christ fulfills these covenants
 *
 * Based on holographic-thinking-chatgpt/engines/02-mechanical.md
 * Adapted for covenant theology context
 */

import { OpenAI } from 'openai';
import { CovenantAnalysis, BiblicalCovenant, Scripture, AffectAnalysis } from '../types';

export class CovenantAnalysisEngine {
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  /**
   * Analyze question through covenant framework
   */
  async analyze(
    question: string,
    affectContext: AffectAnalysis
  ): Promise<CovenantAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(question, affectContext);
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
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        relevantCovenants: result.relevantCovenants || [],
        promises: result.promises || [],
        obligations: result.obligations || [],
        christologicalFulfillment: result.christologicalFulfillment || '',
        scriptures: result.scriptures || [],
        confidence: result.confidence || 70
      };

    } catch (error) {
      console.error('[CovenantAnalysisEngine] Error:', error);
      return {
        relevantCovenants: [],
        promises: [],
        obligations: [],
        christologicalFulfillment: '',
        scriptures: [],
        confidence: 0
      };
    }
  }

  private getSystemPrompt(): string {
    return `You are the Covenant Analysis Engine for BibleMind.

Your role is to analyze questions through the framework of biblical covenants -
God's binding agreements with humanity that structure all of redemptive history.

## The 6 Major Biblical Covenants:

### 1. ADAMIC COVENANT (Genesis 1-3)
- **Established**: Creation and Fall
- **Parties**: God and humanity through Adam
- **Promises**:
  - Dominion over creation (Genesis 1:28)
  - Seed of woman will crush serpent (Genesis 3:15)
- **Obligations**: Cultivate, keep, obey
- **Status**: Broken at the Fall, but protoevangelium (first gospel) given

### 2. NOAHIC COVENANT (Genesis 6-9)
- **Established**: After the Flood
- **Parties**: God with Noah and all creation
- **Promises**:
  - Never destroy earth by flood again (Genesis 9:11)
  - Seasons will continue (Genesis 8:22)
  - Sign: Rainbow (Genesis 9:13)
- **Obligations**: Be fruitful, fill earth, respect life
- **Status**: Unconditional, still in effect

### 3. ABRAHAMIC COVENANT (Genesis 12, 15, 17)
- **Established**: Call of Abraham
- **Parties**: God with Abraham and his descendants
- **Promises**:
  - Great nation (Genesis 12:2)
  - Land (Genesis 15:18)
  - Blessing to all nations (Genesis 12:3)
  - Countless offspring (Genesis 15:5)
- **Obligations**: Walk before God, circumcision
- **Status**: Unconditional, fulfilled in Christ and the Church

### 4. MOSAIC COVENANT (Exodus 19-24)
- **Established**: Mount Sinai
- **Parties**: God with Israel
- **Promises**:
  - Be God's treasured possession (Exodus 19:5)
  - Kingdom of priests, holy nation (Exodus 19:6)
  - Blessings for obedience (Deuteronomy 28)
- **Obligations**: Keep the Law (Torah) - 613 commandments
- **Status**: Conditional, fulfilled in Christ, revealed need for grace

### 5. DAVIDIC COVENANT (2 Samuel 7)
- **Established**: God's promise to David
- **Parties**: God with David and his line
- **Promises**:
  - Eternal dynasty (2 Samuel 7:16)
  - Son will build temple (2 Samuel 7:13)
  - Kingdom will never end (2 Samuel 7:13)
  - Father-son relationship with God (2 Samuel 7:14)
- **Obligations**: Righteousness (though failures don't nullify)
- **Status**: Unconditional, fulfilled in Jesus as eternal King

### 6. NEW COVENANT (Jeremiah 31, Luke 22, Hebrews 8-10)
- **Established**: Jesus' death and resurrection
- **Parties**: God with all who believe in Christ
- **Promises**:
  - Forgiveness of sins (Jeremiah 31:34)
  - Law written on hearts (Jeremiah 31:33)
  - Know the Lord personally (Jeremiah 31:34)
  - Holy Spirit indwelling (Ezekiel 36:27)
  - Eternal life (John 3:16)
- **Obligations**: Faith in Christ (John 6:29)
- **Status**: Inaugurated at the cross, fully realized at Christ's return

## Your Analysis Framework:

For each question, determine:

1. **Which covenant(s) are relevant?**
   - Does this relate to creation? (Adamic)
   - Does this relate to preservation/providence? (Noahic)
   - Does this relate to blessing/promises? (Abrahamic)
   - Does this relate to law/obedience? (Mosaic)
   - Does this relate to kingdom/kingship? (Davidic)
   - Does this relate to grace/new life? (New Covenant)

2. **What promises apply?**
   - What has God promised in these covenants?
   - How do these promises speak to the question?

3. **What obligations exist?**
   - What does God require in these covenants?
   - How should this shape the answer?

4. **How does Christ fulfill this?**
   - Jesus is the fulfillment of all covenants
   - How does His work speak to this question?

## Integration Patterns:

- **Promise → Fulfillment**: OT promise fulfilled in Christ
- **Type → Antitype**: OT pattern finds reality in Christ
- **Shadow → Reality**: OT ceremony points to Christ
- **Law → Grace**: Mosaic law reveals need, Christ provides

## Key Principles:

1. All covenants point to Christ
2. Earlier covenants are not abolished but fulfilled
3. New Covenant doesn't erase prior covenants; it completes them
4. God is always faithful to His covenants
5. Our confidence is in God's covenant promises

Be theologically precise but pastorally accessible.`;
  }

  private buildAnalysisPrompt(
    question: string,
    affectContext: AffectAnalysis
  ): string {
    return `Analyze this question through the framework of biblical covenants:

QUESTION: "${question}"

EMOTIONAL/SPIRITUAL CONTEXT:
- Primary emotion: ${affectContext.primaryEmotion}
- Spiritual state: ${affectContext.spiritualState}
- Summary: ${affectContext.summary}

## Your Task:

1. **Identify Relevant Covenants**: Which of the 6 covenants speak to this question?
   - Adamic (creation, dominion, fall)
   - Noahic (preservation, providence)
   - Abrahamic (blessing, promises)
   - Mosaic (law, obedience)
   - Davidic (kingdom, kingship)
   - New Covenant (grace, Christ's work)

2. **Extract Promises**: What covenant promises apply here?
   - Be specific about what God has promised
   - Show how these promises address the question

3. **Identify Obligations**: What covenant obligations are relevant?
   - What does God require?
   - How should this shape behavior/decisions?

4. **Show Christological Fulfillment**: How does Jesus fulfill this?
   - All covenants point to Christ
   - How does His work speak to this question?

Examples:

QUESTION: "Can I lose my salvation?"
RELEVANT COVENANTS:
- New Covenant (eternal security)
- Abrahamic (God's faithfulness)
PROMISES:
- "I will never leave you nor forsake you" (Hebrews 13:5)
- "I give them eternal life, and they will never perish" (John 10:28)
OBLIGATIONS: Persevering faith (though this is also a gift)
CHRIST'S FULFILLMENT: Jesus secures our salvation; we are sealed by Holy Spirit

QUESTION: "How should I relate to Old Testament law?"
RELEVANT COVENANTS:
- Mosaic (the Law)
- New Covenant (Christ's fulfillment)
PROMISES: Law reveals God's character and our need for grace
OBLIGATIONS: Not under law as covenant of works, but law guides sanctification
CHRIST'S FULFILLMENT: Jesus fulfilled the law perfectly (Matthew 5:17); we're under grace

QUESTION: "What is God's purpose for creation?"
RELEVANT COVENANTS:
- Adamic (original mandate)
- Noahic (preserving creation)
- New Covenant (new creation)
PROMISES: Creation will be renewed (Romans 8:21)
OBLIGATIONS: Steward creation, await restoration
CHRIST'S FULFILLMENT: Jesus is the new Adam, inaugurating new creation

Return JSON:
{
  "relevantCovenants": ["New Covenant", "Abrahamic"],

  "promises": [
    "God promises eternal life to all who believe (John 3:16)",
    "God promises to never leave nor forsake His people (Hebrews 13:5)",
    "God promises to complete the work He began (Philippians 1:6)"
  ],

  "obligations": [
    "Believe in Jesus Christ (John 6:29)",
    "Persevere in faith (though this is empowered by grace)",
    "Walk in obedience as evidence of faith (James 2:17)"
  ],

  "christologicalFulfillment": "Jesus is the mediator of the New Covenant (Hebrews 9:15). Through His blood, He secured eternal redemption. Our salvation is not based on our performance (Mosaic) but on His finished work. Just as God swore to Abraham and it was irrevocable, so Christ's work is complete and our position in Him is secure.",

  "scriptures": [
    {
      "reference": "Hebrews 9:15",
      "text": "Therefore he is the mediator of a new covenant...",
      "translation": "ESV",
      "testament": "new",
      "book": "Hebrews",
      "chapter": 9,
      "verse": 15,
      "context": "Jesus mediates the New Covenant"
    }
  ],

  "confidence": 90
}

If no covenants are clearly relevant, return empty arrays and explain why in christologicalFulfillment.`;
  }

  /**
   * Get quick covenant summary for a topic
   */
  static getCovenantSummary(covenant: BiblicalCovenant): {
    name: string;
    reference: string;
    promise: string;
    fulfillment: string;
  } {
    const summaries: Record<BiblicalCovenant, {
      name: string;
      reference: string;
      promise: string;
      fulfillment: string;
    }> = {
      Adamic: {
        name: 'Adamic Covenant',
        reference: 'Genesis 1-3',
        promise: 'Seed of woman will crush the serpent (Genesis 3:15)',
        fulfillment: 'Jesus is the promised seed who defeats Satan'
      },
      Noahic: {
        name: 'Noahic Covenant',
        reference: 'Genesis 6-9',
        promise: 'Never destroy earth by flood; seasons continue (Genesis 9:11)',
        fulfillment: 'God preserves creation until Christ returns'
      },
      Abrahamic: {
        name: 'Abrahamic Covenant',
        reference: 'Genesis 12, 15, 17',
        promise: 'Blessing to all nations through Abraham\'s seed (Genesis 12:3)',
        fulfillment: 'Jesus is the seed; believers are Abraham\'s children (Galatians 3:29)'
      },
      Mosaic: {
        name: 'Mosaic Covenant',
        reference: 'Exodus 19-24',
        promise: 'Be God\'s treasured possession, kingdom of priests (Exodus 19:5-6)',
        fulfillment: 'Jesus fulfills the law; believers are a royal priesthood (1 Peter 2:9)'
      },
      Davidic: {
        name: 'Davidic Covenant',
        reference: '2 Samuel 7',
        promise: 'Eternal dynasty, kingdom will never end (2 Samuel 7:16)',
        fulfillment: 'Jesus is the eternal King, Son of David (Luke 1:32-33)'
      },
      'New Covenant': {
        name: 'New Covenant',
        reference: 'Jeremiah 31, Luke 22, Hebrews 8-10',
        promise: 'Forgiveness of sins, law on hearts, know the Lord (Jeremiah 31:31-34)',
        fulfillment: 'Inaugurated by Jesus\' death, sealed by His blood (Luke 22:20)'
      }
    };

    return summaries[covenant];
  }
}
