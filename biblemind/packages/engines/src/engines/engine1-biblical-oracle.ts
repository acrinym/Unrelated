/**
 * ENGINE 1: BIBLICAL ORACLE (MULTI-PERSPECTIVE ANALYSIS)
 *
 * Purpose: Explore questions from 7 theological perspectives simultaneously
 * Priority: CORE (main reasoning engine)
 *
 * The 7 Perspectives:
 * 1. Torah (Law & Wisdom) - Foundational principles from the Pentateuch
 * 2. Prophetic (Justice & Kingdom) - God's heart for justice and His Kingdom
 * 3. Wisdom Literature - Practical wisdom from Proverbs, Ecclesiastes, Job
 * 4. Gospel (Grace & Jesus) - The person and work of Christ
 * 5. Apostolic (Church & Doctrine) - Early church teaching and practice
 * 6. Messianic (Jesus-Centered) - How Jesus fulfills all Scripture
 * 7. Mystical (Holy Spirit) - The work and presence of the Spirit
 *
 * Each perspective runs in parallel, analyzing the question independently,
 * then the results are synthesized by Engine 6.
 *
 * Based on holographic-thinking-chatgpt/engines/01-oracle.md
 * Adapted for biblical/theological context
 */

import { OpenAI } from 'openai';
import {
  OraclePerspective,
  TheologicalPerspective,
  AffectAnalysis,
  Scripture
} from '../types';

// Placeholder for KnowledgeGraph - will be implemented separately
interface KnowledgeGraph {
  searchScriptures(query: string, filters?: any, topK?: number): Promise<any[]>;
}

export class BiblicalOracle {
  private openai: OpenAI;
  private knowledgeGraph: KnowledgeGraph;

  constructor(openai: OpenAI, knowledgeGraph: KnowledgeGraph) {
    this.openai = openai;
    this.knowledgeGraph = knowledgeGraph;
  }

  /**
   * Explore question from all 7 theological perspectives in parallel
   */
  async explore(
    question: string,
    affectContext: AffectAnalysis
  ): Promise<OraclePerspective[]> {
    const perspectives: TheologicalPerspective[] = [
      'Torah (Law & Wisdom)',
      'Prophetic (Justice & Kingdom)',
      'Wisdom Literature (Proverbs/Ecclesiastes)',
      'Gospel (Grace & Jesus)',
      'Apostolic (Church & Doctrine)',
      'Messianic (Jesus-Centered)',
      'Mystical (Holy Spirit)'
    ];

    // Run all perspectives in parallel
    const results = await Promise.all(
      perspectives.map(p => this.explorePerspective(question, p, affectContext))
    );

    return results;
  }

  /**
   * Explore question from a single theological perspective
   */
  private async explorePerspective(
    question: string,
    perspective: TheologicalPerspective,
    affectContext: AffectAnalysis
  ): Promise<OraclePerspective> {
    try {
      // Step 1: Search knowledge graph for relevant scriptures
      const scriptures = await this.searchForPerspective(question, perspective);

      // Step 2: Generate insights using GPT-4
      const insights = await this.generateInsights(
        question,
        perspective,
        scriptures,
        affectContext
      );

      return {
        name: perspective,
        insights: insights.insights,
        scriptures: insights.scriptures,
        confidence: insights.confidence,
        reasoning: insights.reasoning
      };

    } catch (error) {
      console.error(`[BiblicalOracle] Error exploring ${perspective}:`, error);
      return {
        name: perspective,
        insights: [`Error analyzing from ${perspective} perspective`],
        scriptures: [],
        confidence: 0,
        reasoning: 'Error occurred during analysis'
      };
    }
  }

  /**
   * Search knowledge graph for scriptures relevant to this perspective
   */
  private async searchForPerspective(
    question: string,
    perspective: TheologicalPerspective
  ): Promise<Scripture[]> {
    const themeMap: Record<TheologicalPerspective, string[]> = {
      'Torah (Law & Wisdom)': ['law', 'commandments', 'wisdom', 'torah'],
      'Prophetic (Justice & Kingdom)': ['justice', 'righteousness', 'kingdom', 'prophetic'],
      'Wisdom Literature (Proverbs/Ecclesiastes)': ['wisdom', 'understanding', 'prudence'],
      'Gospel (Grace & Jesus)': ['gospel', 'grace', 'salvation', 'Jesus'],
      'Apostolic (Church & Doctrine)': ['apostolic', 'church', 'doctrine', 'teaching'],
      'Messianic (Jesus-Centered)': ['messianic', 'Christ', 'fulfillment'],
      'Mystical (Holy Spirit)': ['spirit', 'spiritual', 'pneuma', 'holy-spirit']
    };

    const themes = themeMap[perspective] || ['general'];

    // For now, return empty array (will be implemented with KnowledgeGraph)
    // In real implementation, this would search Pinecone
    return [];
  }

  /**
   * Generate insights from scriptures using GPT-4
   */
  private async generateInsights(
    question: string,
    perspective: TheologicalPerspective,
    scriptures: Scripture[],
    affectContext: AffectAnalysis
  ): Promise<{
    insights: string[];
    scriptures: Scripture[];
    confidence: number;
    reasoning: string;
  }> {
    const perspectiveDescriptions: Record<TheologicalPerspective, string> = {
      'Torah (Law & Wisdom)':
        'Analyze from the Torah perspective: What foundational principles, laws, and wisdom from Genesis-Deuteronomy apply? How does God\'s revealed law speak to this?',
      'Prophetic (Justice & Kingdom)':
        'Analyze from the Prophetic perspective: What does God\'s heart for justice and His Kingdom say about this? What would the prophets declare?',
      'Wisdom Literature (Proverbs/Ecclesiastes)':
        'Analyze from the Wisdom Literature perspective: What practical wisdom from Proverbs, Ecclesiastes, and Job applies? What is the wise path?',
      'Gospel (Grace & Jesus)':
        'Analyze from the Gospel perspective: How does the person and work of Jesus Christ speak to this? What does grace teach us?',
      'Apostolic (Church & Doctrine)':
        'Analyze from the Apostolic perspective: What did the early church teach? How did the apostles apply the gospel? What doctrine guides us?',
      'Messianic (Jesus-Centered)':
        'Analyze from the Messianic perspective: How does Jesus fulfill and embody the answer to this? How is Christ central?',
      'Mystical (Holy Spirit)':
        'Analyze from the Holy Spirit perspective: How does the Spirit guide, empower, and reveal truth here? What is the spiritual dimension?'
    };

    const prompt = `You are analyzing a question from the ${perspective} perspective.

QUESTION: "${question}"

EMOTIONAL/SPIRITUAL CONTEXT:
${affectContext.summary}

PERSPECTIVE DESCRIPTION:
${perspectiveDescriptions[perspective]}

${scriptures.length > 0 ? `
RELEVANT SCRIPTURES (from knowledge graph):
${scriptures.slice(0, 10).map(s => `${s.reference}: ${s.text}`).join('\n\n')}
` : `
NOTE: Scripture search results unavailable. Use your knowledge of Scripture to provide ${perspective} insights.
`}

Provide 3-5 key insights from this perspective:

1. Each insight should be clear and actionable
2. Support each insight with specific Scripture references
3. Explain the biblical reasoning
4. Rate your confidence (0-100%) for each insight
5. Consider the emotional/spiritual context

Return JSON:
{
  "insights": [
    {
      "insight": "Clear, actionable insight from this perspective",
      "scriptures": ["Reference 1", "Reference 2"],
      "reasoning": "Why this insight follows from these scriptures",
      "confidence": 85
    }
  ],
  "overallConfidence": 80,
  "summary": "Brief summary of what ${perspective} perspective contributes"
}`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a biblical scholar analyzing questions from different theological perspectives. You have deep knowledge of Scripture, theology, and how different traditions approach biblical interpretation. Provide insights that are faithful to Scripture, pastorally sensitive, and theologically sound.`
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

    // Extract insights and scripture references
    const insights = result.insights || [];
    const insightTexts = insights.map((i: any) => i.insight);

    // TODO: Convert scripture references to full Scripture objects
    // For now, create placeholder Scripture objects
    const scriptureRefs = insights.flatMap((i: any) => i.scriptures || []);
    const scriptureObjects: Scripture[] = scriptureRefs.map((ref: string) => ({
      reference: ref,
      text: '', // Would be fetched from knowledge graph
      translation: 'ESV',
      testament: this.guessTestament(ref),
      book: ref.split(' ')[0],
      chapter: 0, // Would be parsed
      verse: 0,   // Would be parsed
      context: `Referenced in ${perspective} analysis`
    }));

    return {
      insights: insightTexts,
      scriptures: scriptureObjects,
      confidence: result.overallConfidence || 70,
      reasoning: result.summary || ''
    };
  }

  /**
   * Guess testament from book name (helper until we have proper parsing)
   */
  private guessTestament(reference: string): 'old' | 'new' {
    const newTestamentBooks = [
      'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
      '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
      'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
      '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
      'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
      'Jude', 'Revelation'
    ];

    const book = reference.split(' ')[0];
    return newTestamentBooks.includes(book) ? 'new' : 'old';
  }

  /**
   * Apply emotional priming to perspective weights
   * (Used by orchestrator to adjust which perspectives to emphasize)
   */
  static applyEmotionalPriming(
    perspectives: OraclePerspective[],
    affectContext: AffectAnalysis
  ): OraclePerspective[] {
    // Emotional priming weights from Engine 9
    const weights = affectContext.primingWeights?.engine1_oracle || 1.0;

    // Apply weight adjustments based on emotional state
    if (affectContext.primaryEmotion.includes('fear')) {
      // Boost Gospel (grace) and Mystical (comfort) for fearful questions
      perspectives.forEach(p => {
        if (p.name === 'Gospel (Grace & Jesus)' || p.name === 'Mystical (Holy Spirit)') {
          p.confidence = Math.min(100, p.confidence * 1.2);
        }
      });
    }

    if (affectContext.primaryEmotion.includes('doubt')) {
      // Boost Apostolic (evidence) and Prophetic (God's faithfulness)
      perspectives.forEach(p => {
        if (p.name === 'Apostolic (Church & Doctrine)' || p.name === 'Prophetic (Justice & Kingdom)') {
          p.confidence = Math.min(100, p.confidence * 1.2);
        }
      });
    }

    if (affectContext.primaryEmotion.includes('joy') || affectContext.primaryEmotion.includes('gratitude')) {
      // Boost Wisdom (stewardship) and Torah (obedience)
      perspectives.forEach(p => {
        if (p.name === 'Wisdom Literature (Proverbs/Ecclesiastes)' || p.name === 'Torah (Law & Wisdom)') {
          p.confidence = Math.min(100, p.confidence * 1.2);
        }
      });
    }

    return perspectives;
  }
}
