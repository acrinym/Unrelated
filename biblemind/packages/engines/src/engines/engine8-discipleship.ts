/**
 * ENGINE 8: DISCIPLESHIP GROWTH TRACKING
 *
 * Purpose: Track spiritual growth and learn from outcomes
 * Priority: IMPROVEMENT (runs after synthesis, enables learning)
 *
 * This engine tracks:
 * 1. What biblical guidance we provided
 * 2. What the user did with it
 * 3. How it turned out
 * 4. What we learned for next time
 *
 * Biblical Foundation:
 * - "Test everything; hold fast what is good" (1 Thessalonians 5:21)
 * - "Solid food is for the mature, who by constant use have trained themselves" (Hebrews 5:14)
 * - "Whatever you have learned or received or heard from me, or seen in me—put it into practice" (Philippians 4:9)
 * - "Iron sharpens iron, and one man sharpens another" (Proverbs 27:17)
 *
 * Unlike secular learning engines, this tracks:
 * - Spiritual maturity indicators
 * - Growth in Christ-likeness
 * - How God answered prayers
 * - Which biblical guidance bore fruit
 *
 * Based on holographic-thinking-chatgpt/engines/08-learning.md
 * Adapted for spiritual formation / discipleship context
 */

import { OpenAI } from 'openai';
import { DiscipleshipPrediction, BiblicalReasoning } from '../types';

export class DiscipleshipTracking {
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  /**
   * Record a prediction (what we expect will happen)
   * This is called AFTER synthesis but BEFORE user acts
   */
  async recordPrediction(
    userId: string,
    question: string,
    synthesis: BiblicalReasoning
  ): Promise<DiscipleshipPrediction> {
    try {
      // In full implementation, would save to Firestore
      // For now, generate prediction structure

      const prediction: DiscipleshipPrediction = {
        prediction: this.generatePrediction(question, synthesis),
        confidence: synthesis.confidence,
        growthAreas: this.identifyGrowthAreas(question, synthesis),
        scripturesToMemorize: this.selectScripturesForMemorization(synthesis),
        followUpQuestions: this.generateFollowUpQuestions(question, synthesis)
      };

      // TODO: Save to Firestore with timestamp for follow-up
      // await firestore.collection('predictions').add({
      //   userId,
      //   question,
      //   prediction,
      //   timestamp: new Date()
      // });

      return prediction;

    } catch (error) {
      console.error('[DiscipleshipTracking] Error:', error);
      return {
        prediction: '',
        confidence: 0,
        growthAreas: [],
        scripturesToMemorize: [],
        followUpQuestions: []
      };
    }
  }

  /**
   * Track an outcome (what actually happened)
   * This is called when user provides follow-up
   */
  async trackOutcome(
    userId: string,
    predictionId: string,
    outcome: {
      whatHappened: string;
      howHelpful: number; // 1-10
      whatChanged: string;
    }
  ): Promise<void> {
    try {
      // In full implementation:
      // 1. Fetch original prediction from Firestore
      // 2. Compare prediction vs reality
      // 3. Update confidence calibration
      // 4. Identify what worked / what didn't
      // 5. Store learnings for future questions

      // For now, log for development
      console.log('[DiscipleshipTracking] Outcome recorded:', {
        userId,
        predictionId,
        outcome
      });

    } catch (error) {
      console.error('[DiscipleshipTracking] Error tracking outcome:', error);
    }
  }

  /**
   * Generate a prediction of what will happen
   */
  private generatePrediction(
    question: string,
    synthesis: BiblicalReasoning
  ): string {
    // Extract action plan from synthesis
    if (synthesis.reasoning.engine6?.actionPlan) {
      const actions = synthesis.reasoning.engine6.actionPlan
        .map(a => a.step)
        .join(', ');

      return `If you follow this guidance (${actions}), we expect you will experience spiritual growth in this area, develop deeper understanding of God's will, and find peace about this decision.`;
    }

    return 'We expect this biblical guidance will help you grow in wisdom and faith.';
  }

  /**
   * Identify spiritual growth areas based on the question
   */
  private identifyGrowthAreas(
    question: string,
    synthesis: BiblicalReasoning
  ): string[] {
    const growthAreas: string[] = [];

    // Analyze the question type to identify growth opportunities
    const questionLower = question.toLowerCase();

    if (questionLower.includes('fear') || questionLower.includes('afraid') || questionLower.includes('anxious')) {
      growthAreas.push('Growing in trust and faith over fear');
    }

    if (questionLower.includes('doubt') || questionLower.includes('uncertain')) {
      growthAreas.push('Building confidence in God\'s faithfulness');
    }

    if (questionLower.includes('forgive') || questionLower.includes('hurt') || questionLower.includes('anger')) {
      growthAreas.push('Developing Christ-like forgiveness');
    }

    if (questionLower.includes('purpose') || questionLower.includes('calling')) {
      growthAreas.push('Discovering and walking in God\'s calling');
    }

    if (questionLower.includes('sin') || questionLower.includes('temptation')) {
      growthAreas.push('Growing in holiness and resisting temptation');
    }

    if (questionLower.includes('relationship') || questionLower.includes('marriage') || questionLower.includes('family')) {
      growthAreas.push('Developing biblical relationships');
    }

    // Check affect analysis for additional growth areas
    if (synthesis.reasoning.engine9) {
      const affect = synthesis.reasoning.engine9;

      if (affect.spiritualState === 'hurting') {
        growthAreas.push('Healing and restoration through God\'s comfort');
      }

      if (affect.spiritualState === 'seeking') {
        growthAreas.push('Deepening relationship with God');
      }

      if (affect.spiritualState === 'growing') {
        growthAreas.push('Continuing to mature in faith');
      }
    }

    // Default if no specific areas identified
    if (growthAreas.length === 0) {
      growthAreas.push('Growing in biblical wisdom and discernment');
    }

    return growthAreas;
  }

  /**
   * Select key Scriptures for memorization
   */
  private selectScripturesForMemorization(
    synthesis: BiblicalReasoning
  ): Array<{
    reference: string;
    text: string;
    why: string;
  }> {
    const scriptures: Array<{ reference: string; text: string; why: string }> = [];

    // Get top 3 most relevant scriptures from synthesis
    if (synthesis.scriptures && synthesis.scriptures.length > 0) {
      const topScriptures = synthesis.scriptures.slice(0, 3);

      topScriptures.forEach(s => {
        scriptures.push({
          reference: s.reference,
          text: s.text,
          why: s.context || 'This verse directly addresses your question'
        });
      });
    }

    // Add pastoral comfort scriptures if distress detected
    if (synthesis.reasoning.engine4?.distressFactors?.length > 0) {
      const comfortScriptures = synthesis.reasoning.engine4.godsPromises.slice(0, 2);
      comfortScriptures.forEach(s => {
        if (!scriptures.find(existing => existing.reference === s.reference)) {
          scriptures.push({
            reference: s.reference,
            text: s.text,
            why: 'This promise of God speaks to your current struggle'
          });
        }
      });
    }

    return scriptures.slice(0, 3); // Max 3 for memorization
  }

  /**
   * Generate follow-up questions for checking in
   */
  private generateFollowUpQuestions(
    question: string,
    synthesis: BiblicalReasoning
  ): string[] {
    const followUps: string[] = [];

    // Ask about applying the guidance
    followUps.push('Have you been able to apply the biblical guidance we discussed?');

    // Ask about specific action plan items
    if (synthesis.reasoning.engine6?.actionPlan && synthesis.reasoning.engine6.actionPlan.length > 0) {
      const firstAction = synthesis.reasoning.engine6.actionPlan[0];
      followUps.push(`How did it go when you tried: "${firstAction.step}"?`);
    }

    // Ask about Scripture memorization
    followUps.push('Have you memorized or meditated on any of the suggested Scriptures?');

    // Ask about spiritual growth
    followUps.push('What has God been teaching you through this situation?');

    // Ask about prayer
    if (synthesis.reasoning.engine6?.prayerPrompts && synthesis.reasoning.engine6.prayerPrompts.length > 0) {
      followUps.push('How has your prayer life been regarding this matter?');
    }

    return followUps;
  }

  /**
   * Analyze growth trajectory over time
   */
  static analyzeGrowthTrajectory(
    questions: Array<{
      question: string;
      date: Date;
      outcome?: string;
    }>
  ): {
    trajectory: 'growing' | 'plateau' | 'declining' | 'unknown';
    insights: string[];
  } {
    if (questions.length < 3) {
      return {
        trajectory: 'unknown',
        insights: ['Need more data to assess growth trajectory']
      };
    }

    const insights: string[] = [];

    // Analyze question maturity over time
    const questionComplexity = questions.map(q => {
      // Simple heuristic: longer questions with more context = more mature
      return q.question.length;
    });

    const earlyAvg = questionComplexity.slice(0, Math.floor(questions.length / 2))
      .reduce((sum, c) => sum + c, 0) / Math.floor(questions.length / 2);
    const recentAvg = questionComplexity.slice(Math.floor(questions.length / 2))
      .reduce((sum, c) => sum + c, 0) / (questions.length - Math.floor(questions.length / 2));

    let trajectory: 'growing' | 'plateau' | 'declining' | 'unknown' = 'unknown';

    if (recentAvg > earlyAvg * 1.2) {
      trajectory = 'growing';
      insights.push('Questions are becoming more thoughtful and detailed');
    } else if (recentAvg < earlyAvg * 0.8) {
      trajectory = 'declining';
      insights.push('Questions are becoming simpler - may indicate distraction or discouragement');
    } else {
      trajectory = 'plateau';
      insights.push('Question complexity is stable');
    }

    // Analyze frequency
    const dates = questions.map(q => q.date);
    const daysBetween = [];
    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      daysBetween.push(diff);
    }

    const avgDaysBetween = daysBetween.reduce((sum, d) => sum + d, 0) / daysBetween.length;

    if (avgDaysBetween < 7) {
      insights.push('Frequent engagement with biblical guidance - good consistency');
    } else if (avgDaysBetween > 30) {
      insights.push('Infrequent engagement - consider regular spiritual disciplines');
    }

    return { trajectory, insights };
  }

  /**
   * Calculate spiritual maturity indicators
   */
  static calculateMaturityIndicators(
    questions: string[]
  ): {
    selfFocusRatio: number; // Lower is more mature (thinking of others)
    questionDepth: number;  // Higher is more mature (thoughtful questions)
    faithLanguage: number;  // Higher is more mature (faith-oriented)
  } {
    const allText = questions.join(' ').toLowerCase();

    // Self-focus: Count "I/me/my" vs "they/them/others"
    const selfWords = (allText.match(/\b(i|me|my|myself)\b/g) || []).length;
    const othersWords = (allText.match(/\b(they|them|their|others|people)\b/g) || []).length;
    const selfFocusRatio = selfWords / (selfWords + othersWords + 1);

    // Question depth: Average question length (longer = more context/thought)
    const avgLength = questions.reduce((sum, q) => sum + q.length, 0) / questions.length;
    const questionDepth = Math.min(10, avgLength / 20); // Normalize to 0-10 scale

    // Faith language: Count faith-related words
    const faithWords = [
      'god', 'jesus', 'christ', 'lord', 'spirit', 'faith', 'believe',
      'trust', 'pray', 'prayer', 'scripture', 'bible', 'worship'
    ];
    const faithCount = faithWords.reduce((count, word) => {
      return count + (allText.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
    }, 0);
    const faithLanguage = Math.min(10, (faithCount / questions.length) * 2); // Normalize

    return {
      selfFocusRatio,
      questionDepth,
      faithLanguage
    };
  }
}
