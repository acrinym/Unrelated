/**
 * ENGINE 5: CROSS-TESTAMENT INTEGRATION
 *
 * Purpose: Connect Old Testament and New Testament wisdom
 * Priority: ENRICHMENT (runs in parallel with Tribunal)
 *
 * Integration Patterns:
 * 1. Promise → Fulfillment (prophecy fulfilled in Christ)
 * 2. Type → Antitype (OT pattern finds reality in Christ)
 * 3. Shadow → Reality (OT ceremony points to Christ)
 * 4. Law → Grace (Mosaic law reveals need, Christ provides)
 *
 * Biblical Foundation:
 * - "The law was our guardian until Christ came" (Galatians 3:24)
 * - "These are a shadow; the substance belongs to Christ" (Colossians 2:17)
 * - "In the past God spoke through prophets; in these last days by His Son" (Hebrews 1:1-2)
 * - "Beginning with Moses and all the Prophets, he interpreted to them the Scriptures concerning himself" (Luke 24:27)
 *
 * This engine:
 * - Finds relevant OT passages
 * - Finds relevant NT passages
 * - Shows how NT fulfills/interprets/applies OT
 * - Provides unified biblical wisdom
 *
 * Based on holographic-thinking-chatgpt/engines/05-multisource.md
 * Adapted for Old Testament/New Testament integration
 */

import { OpenAI } from 'openai';
import { CrossTestamentAnalysis, AffectAnalysis, Scripture } from '../types';

export class CrossTestamentIntegration {
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  /**
   * Integrate Old and New Testament perspectives on a question
   */
  async integrate(
    question: string,
    affectContext: AffectAnalysis
  ): Promise<CrossTestamentAnalysis> {
    try {
      const prompt = this.buildIntegrationPrompt(question, affectContext);
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
        oldTestament: {
          passages: result.oldTestament?.passages || [],
          themes: result.oldTestament?.themes || []
        },
        newTestament: {
          passages: result.newTestament?.passages || [],
          fulfillment: result.newTestament?.fulfillment || ''
        },
        integrationPattern: result.integrationPattern || 'promise-fulfillment',
        unifiedWisdom: result.unifiedWisdom || '',
        confidence: result.confidence || 70
      };

    } catch (error) {
      console.error('[CrossTestamentIntegration] Error:', error);
      return {
        oldTestament: { passages: [], themes: [] },
        newTestament: { passages: [], fulfillment: '' },
        integrationPattern: 'promise-fulfillment',
        unifiedWisdom: 'Error integrating testaments',
        confidence: 0
      };
    }
  }

  private getSystemPrompt(): string {
    return `You are the Cross-Testament Integration Engine for BibleMind.

Your role is to show how the Old Testament and New Testament speak TOGETHER
to answer questions. The Bible is one unified story, and Christ is the key
that unlocks the OT.

## The 4 Integration Patterns:

### 1. PROMISE → FULFILLMENT
The OT makes a promise; the NT shows Christ fulfilling it.

**Examples**:
- OT: "Virgin will conceive" (Isaiah 7:14)
- NT: Jesus born of Mary (Matthew 1:23)

- OT: "Out of Egypt I called my son" (Hosea 11:1)
- NT: Jesus returns from Egypt (Matthew 2:15)

- OT: "They will look on him they have pierced" (Zechariah 12:10)
- NT: Jesus crucified (John 19:37)

### 2. TYPE → ANTITYPE
The OT provides a pattern (type); Christ is the reality (antitype).

**Examples**:
- Adam (type of humanity) → Christ (new Adam, 1 Corinthians 15:45)
- Passover lamb → Christ our Passover (1 Corinthians 5:7)
- Manna in wilderness → Bread of Life (John 6:32-35)
- Bronze serpent → Christ lifted up (John 3:14)
- Tabernacle → Christ dwelling among us (John 1:14)

### 3. SHADOW → REALITY
OT ceremonies/laws are shadows; Christ is the substance.

**Examples**:
- Sacrificial system → Christ's once-for-all sacrifice (Hebrews 10:1-14)
- High Priest entering Holy of Holies → Christ entering heaven (Hebrews 9:11-12)
- Day of Atonement → Christ as our atonement (Romans 3:25)
- Sabbath rest → Rest in Christ (Hebrews 4:9-10)

### 4. LAW → GRACE
The OT law reveals God's standard and our need; Christ provides grace.

**Examples**:
- Law: "You shall not murder" → Jesus: "Don't even be angry" (Matthew 5:21-22)
- Law: Sacrifices cover sin → Jesus: One sacrifice removes sin (Hebrews 10:4-10)
- Law: Written on stone → Grace: Written on hearts (2 Corinthians 3:3)
- Law: Reveals sin → Grace: Saves from sin (Romans 7:7-8:2)

## Your Task:

For each question:

1. **Find OT Foundation**:
   - What OT passages speak to this?
   - What themes emerge?
   - What was God teaching Israel?

2. **Find NT Fulfillment**:
   - How does the NT interpret these OT passages?
   - How does Christ fulfill this theme?
   - What does the NT add or clarify?

3. **Identify Pattern**:
   - Which integration pattern fits best?
   - Promise→Fulfillment, Type→Antitype, Shadow→Reality, or Law→Grace?

4. **Provide Unified Wisdom**:
   - What does the WHOLE Bible teach on this?
   - How do both testaments work together?

## Key Principles:

1. **Christ is the center** - All OT points to Him (Luke 24:27)
2. **Progressive revelation** - God reveals more over time, culminating in Christ
3. **Unity in diversity** - One story, many chapters
4. **OT is not obsolete** - It's fulfilled, not abolished (Matthew 5:17)
5. **NT interprets OT** - Read OT through Christ's lens

## Example Analysis:

QUESTION: "What does the Bible teach about forgiveness?"

OLD TESTAMENT:
- Leviticus 16: Day of Atonement (scapegoat bears sins)
- Isaiah 53: Suffering Servant bears iniquities
- Psalm 103:12: "As far as east from west, so far has he removed our transgressions"
Themes: Sin requires atonement, God removes sin, sacrifice needed

NEW TESTAMENT:
- Hebrews 10:1-18: Christ's once-for-all sacrifice
- Ephesians 4:32: "Forgive as God in Christ forgave you"
- 1 John 1:9: "If we confess, he is faithful to forgive"
Fulfillment: Christ IS the atonement; His blood cleanses completely

PATTERN: Shadow → Reality
- OT sacrifices were shadows
- Christ is the substance (Hebrews 10:1)

UNIFIED WISDOM:
"The OT taught that sin requires sacrifice and God is willing to forgive.
The NT reveals that Christ IS the final sacrifice, and His blood cleanses
completely. We now forgive others because we've been forgiven by Christ's
blood (Ephesians 4:32). The whole Bible teaches: God takes sin seriously,
provides atonement, and calls us to extend that grace to others."

Be theologically precise and Christologically centered.`;
  }

  private buildIntegrationPrompt(
    question: string,
    affectContext: AffectAnalysis
  ): string {
    return `Integrate Old Testament and New Testament wisdom for this question:

QUESTION: "${question}"

EMOTIONAL/SPIRITUAL CONTEXT:
${affectContext.summary}

## Your Task:

### STEP 1: OLD TESTAMENT FOUNDATION
Find relevant OT passages and themes:
- What does the Torah/Prophets/Writings teach?
- What themes emerge?
- What was God revealing to Israel?

### STEP 2: NEW TESTAMENT FULFILLMENT
Find relevant NT passages and show fulfillment:
- How does the NT interpret the OT passages?
- How does Christ fulfill these themes?
- What does the gospel add or clarify?

### STEP 3: IDENTIFY INTEGRATION PATTERN
Which pattern best fits?
- **Promise → Fulfillment**: OT prophecy fulfilled in Christ
- **Type → Antitype**: OT pattern finds reality in Christ
- **Shadow → Reality**: OT ceremony points to Christ's work
- **Law → Grace**: OT law reveals need, Christ provides

### STEP 4: UNIFIED WISDOM
What does the WHOLE Bible teach?
- How do both testaments work together?
- What is the unified biblical answer?

Return JSON:
{
  "oldTestament": {
    "passages": [
      {
        "reference": "Isaiah 53:5",
        "text": "He was pierced for our transgressions...",
        "translation": "ESV",
        "testament": "old",
        "book": "Isaiah",
        "chapter": 53,
        "verse": 5,
        "context": "Why this passage is relevant"
      }
    ],
    "themes": [
      "Suffering Servant bears sin",
      "Vicarious atonement",
      "God provides the sacrifice"
    ]
  },

  "newTestament": {
    "passages": [
      {
        "reference": "1 Peter 2:24",
        "text": "He himself bore our sins in his body on the tree...",
        "translation": "ESV",
        "testament": "new",
        "book": "1 Peter",
        "chapter": 2,
        "verse": 24,
        "context": "Peter applies Isaiah 53 to Jesus"
      }
    ],
    "fulfillment": "Jesus IS the Suffering Servant of Isaiah 53. He bore our sins on the cross, fulfilling the OT prophecy of vicarious atonement. What Isaiah saw prophetically, the NT reveals historically in Christ's crucifixion."
  },

  "integrationPattern": "promise-fulfillment",

  "unifiedWisdom": "The whole Bible teaches that sin requires a substitute. The OT prophesied a Suffering Servant who would bear our sins (Isaiah 53). The NT reveals that Jesus IS this Servant - He took our place on the cross (1 Peter 2:24). Both testaments proclaim: God provides the sacrifice, and that sacrifice is Christ. We are saved not by our works but by trusting in His finished work.",

  "confidence": 92
}`;
  }

  /**
   * Quick reference for common integration patterns
   */
  static getIntegrationExample(
    pattern: 'promise-fulfillment' | 'type-antitype' | 'shadow-reality' | 'law-grace'
  ): { otExample: string; ntExample: string; explanation: string } {
    const examples = {
      'promise-fulfillment': {
        otExample: 'Isaiah 7:14 - "Virgin will conceive a son"',
        ntExample: 'Matthew 1:23 - "The virgin shall conceive"',
        explanation: 'OT prophecy directly fulfilled in Jesus\' birth'
      },
      'type-antitype': {
        otExample: 'Passover lamb (Exodus 12) - Unblemished lamb saves from death',
        ntExample: '1 Corinthians 5:7 - "Christ, our Passover lamb, has been sacrificed"',
        explanation: 'OT pattern (Passover) finds ultimate reality in Christ'
      },
      'shadow-reality': {
        otExample: 'Levitical sacrifices (Leviticus 1-7) - Daily animal sacrifices',
        ntExample: 'Hebrews 10:1-14 - Christ\'s once-for-all sacrifice',
        explanation: 'OT ceremonies were shadows pointing to Christ\'s ultimate sacrifice'
      },
      'law-grace': {
        otExample: 'Exodus 20 - Ten Commandments written on stone',
        ntExample: '2 Corinthians 3:3 - Law written on hearts by the Spirit',
        explanation: 'OT law reveals standard; NT grace transforms from within'
      }
    };

    return examples[pattern];
  }
}
