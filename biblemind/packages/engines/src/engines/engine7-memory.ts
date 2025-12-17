/**
 * ENGINE 7: SCRIPTURE MEMORY & CONTEXT
 *
 * Purpose: Remember user's spiritual journey and provide continuity
 * Priority: CONTEXT (adds historical context to current analysis)
 *
 * This engine maintains:
 * 1. User's question history (what they've asked before)
 * 2. Spiritual patterns (recurring themes, growth areas)
 * 3. Scripture they've engaged with
 * 4. Lessons learned from past guidance
 *
 * Biblical Foundation:
 * - "Remember the days of old; consider the years of many generations" (Deuteronomy 32:7)
 * - "I will remember the deeds of the LORD" (Psalm 77:11)
 * - "These things happened to them as examples and were written down as warnings for us" (1 Corinthians 10:11)
 * - "Older men are to be sober-minded... older women likewise" (Titus 2:2-3)
 *
 * Unlike secular memory engines, this one remembers:
 * - Your spiritual journey with God
 * - How He's answered prayers before
 * - Patterns in your walk
 * - Scriptures that have ministered to you
 *
 * Based on holographic-thinking-chatgpt/engines/07-memory.md
 * Adapted for spiritual journey / biblical discipleship context
 */

import { MemoryRecall, UserContext } from '../types';

export class ScriptureMemory {
  /**
   * Recall relevant context from user's history
   */
  async recall(
    question: string,
    userId: string,
    userContext?: UserContext
  ): Promise<MemoryRecall> {
    try {
      // In full implementation, this would query Firestore for user's history
      // For now, we'll use what's available in UserContext

      const similarQuestions = this.findSimilarQuestions(
        question,
        userContext?.history?.recentQuestions || []
      );

      const relevantHistory = this.extractRelevantHistory(
        question,
        userContext
      );

      const patterns = this.identifyPatterns(
        question,
        userContext
      );

      const contextualNotes = this.generateContextualNotes(
        question,
        userContext,
        patterns
      );

      return {
        similarQuestions,
        relevantHistory,
        applicablePatterns: patterns,
        contextualNotes
      };

    } catch (error) {
      console.error('[ScriptureMemory] Error:', error);
      return {
        similarQuestions: [],
        relevantHistory: [],
        applicablePatterns: [],
        contextualNotes: []
      };
    }
  }

  /**
   * Find similar questions from history
   */
  private findSimilarQuestions(
    currentQuestion: string,
    recentQuestions: string[]
  ): string[] {
    if (!recentQuestions || recentQuestions.length === 0) {
      return [];
    }

    // Simple keyword matching for now
    // In full implementation, would use semantic similarity
    const currentLower = currentQuestion.toLowerCase();
    const keywords = this.extractKeywords(currentLower);

    const similar = recentQuestions.filter(q => {
      const qLower = q.toLowerCase();
      return keywords.some(keyword => qLower.includes(keyword));
    });

    return similar.slice(0, 3); // Return top 3
  }

  /**
   * Extract relevant historical context
   */
  private extractRelevantHistory(
    question: string,
    userContext?: UserContext
  ): Array<{
    question: string;
    date: Date;
    outcome: string;
  }> {
    // In full implementation, would fetch from Firestore
    // For now, return placeholder
    return [];
  }

  /**
   * Identify spiritual patterns in user's journey
   */
  private identifyPatterns(
    question: string,
    userContext?: UserContext
  ): string[] {
    const patterns: string[] = [];

    if (!userContext?.history) {
      return patterns;
    }

    // Check for recurring themes in question history
    const questions = userContext.history.recentQuestions || [];

    // Pattern detection (simple keyword-based for now)
    const themeKeywords = {
      fear: ['fear', 'afraid', 'anxious', 'worry', 'worried'],
      doubt: ['doubt', 'uncertain', 'unsure', 'question'],
      relationships: ['relationship', 'friend', 'family', 'spouse', 'marriage'],
      calling: ['calling', 'purpose', 'ministry', 'serve', 'mission'],
      sin: ['sin', 'temptation', 'struggle', 'failure', 'guilt'],
      faith: ['faith', 'trust', 'believe', 'hope']
    };

    const questionText = questions.join(' ').toLowerCase();

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const count = keywords.filter(keyword =>
        questionText.includes(keyword)
      ).length;

      if (count >= 2) { // Theme appears multiple times
        patterns.push(`Recurring theme: ${theme}`);
      }
    }

    // Check current question for continuation of patterns
    const currentLower = question.toLowerCase();
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(keyword => currentLower.includes(keyword))) {
        if (patterns.some(p => p.includes(theme))) {
          patterns.push(`This question continues the ${theme} theme from previous conversations`);
        }
      }
    }

    return patterns;
  }

  /**
   * Generate contextual notes based on user's journey
   */
  private generateContextualNotes(
    question: string,
    userContext?: UserContext,
    patterns?: string[]
  ): string[] {
    const notes: string[] = [];

    // Note about user preferences
    if (userContext?.preferences) {
      if (userContext.preferences.showHebrewGreek) {
        notes.push('User appreciates Hebrew/Greek word studies');
      }
      if (userContext.preferences.enableCrossReferences) {
        notes.push('User values seeing connections between passages');
      }
    }

    // Note about theological context
    if (userContext?.denomination) {
      notes.push(`User's background: ${userContext.denomination}`);
    }
    if (userContext?.theologicalLean) {
      notes.push(`Theological lean: ${userContext.theologicalLean}`);
    }

    // Note about patterns
    if (patterns && patterns.length > 0) {
      notes.push(`Spiritual journey patterns detected: ${patterns.length} recurring themes`);
    }

    // Note about first-time vs returning user
    if (userContext?.history?.recentQuestions?.length === 0) {
      notes.push('First question from this user - provide warm introduction');
    } else if (userContext?.history?.recentQuestions?.length > 10) {
      notes.push('Returning user with significant history - build on past conversations');
    }

    return notes;
  }

  /**
   * Extract keywords from question
   */
  private extractKeywords(text: string): string[] {
    // Remove common words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'what', 'how', 'why', 'does', 'do', 'should', 'can', 'will'];

    const words = text.toLowerCase().split(/\s+/);
    const keywords = words.filter(word =>
      word.length > 3 && !stopWords.includes(word)
    );

    return keywords;
  }

  /**
   * Helper: Get Scripture memory recommendations
   * (Scriptures the user should memorize based on their patterns)
   */
  static getMemorizationRecommendations(patterns: string[]): Array<{
    reference: string;
    text: string;
    why: string;
  }> {
    const recommendations: Array<{ reference: string; text: string; why: string }> = [];

    patterns.forEach(pattern => {
      if (pattern.includes('fear')) {
        recommendations.push({
          reference: '2 Timothy 1:7',
          text: 'For God gave us a spirit not of fear but of power and love and self-control',
          why: 'This verse speaks directly to your recurring fear concerns'
        });
      }
      if (pattern.includes('doubt')) {
        recommendations.push({
          reference: 'Hebrews 11:1',
          text: 'Now faith is the assurance of things hoped for, the conviction of things not seen',
          why: 'This verse can anchor you when doubt arises'
        });
      }
      if (pattern.includes('sin')) {
        recommendations.push({
          reference: '1 John 1:9',
          text: 'If we confess our sins, he is faithful and just to forgive us our sins',
          why: 'Remember God\'s promise of forgiveness in your struggle with sin'
        });
      }
      if (pattern.includes('calling')) {
        recommendations.push({
          reference: 'Jeremiah 29:11',
          text: 'For I know the plans I have for you, declares the LORD',
          why: 'God has a purpose for your life as you seek your calling'
        });
      }
    });

    // Default recommendation if no patterns
    if (recommendations.length === 0) {
      recommendations.push({
        reference: 'Psalm 119:11',
        text: 'I have stored up your word in my heart, that I might not sin against you',
        why: 'Scripture memory strengthens your walk with God'
      });
    }

    return recommendations;
  }

  /**
   * Helper: Generate "Remember when..." insights
   * (Remind user of God's past faithfulness)
   */
  static generateRememberWhen(
    userHistory: Array<{ question: string; date: Date; outcome: string }>
  ): string[] {
    const reminders: string[] = [];

    userHistory.forEach(episode => {
      // Extract positive outcomes
      if (episode.outcome.includes('answered') ||
          episode.outcome.includes('helped') ||
          episode.outcome.includes('peace')) {
        reminders.push(
          `Remember when you asked about "${episode.question}" and God ${episode.outcome}`
        );
      }
    });

    // Default reminder
    if (reminders.length === 0) {
      reminders.push(
        'God has been faithful in your past - trust Him with this present question'
      );
    }

    return reminders;
  }

  /**
   * Helper: Detect spiritual growth indicators
   */
  static detectGrowthIndicators(
    oldQuestions: string[],
    newQuestion: string
  ): Array<{ indicator: string; explanation: string }> {
    const indicators: Array<{ indicator: string; explanation: string }> = [];

    const oldText = oldQuestions.join(' ').toLowerCase();
    const newText = newQuestion.toLowerCase();

    // Growth: Moving from "me" to "others"
    const oldSelfFocus = (oldText.match(/\b(i|me|my|myself)\b/g) || []).length;
    const newSelfFocus = (newText.match(/\b(i|me|my|myself)\b/g) || []).length;
    const oldOthersFocus = (oldText.match(/\b(they|them|others|people)\b/g) || []).length;
    const newOthersFocus = (newText.match(/\b(they|them|others|people)\b/g) || []).length;

    if (newOthersFocus > oldOthersFocus / oldQuestions.length) {
      indicators.push({
        indicator: 'Outward focus increasing',
        explanation: 'Your questions are becoming more others-focused, showing spiritual maturity'
      });
    }

    // Growth: Asking "how" instead of "why"
    if (oldText.includes('why') && newText.includes('how')) {
      indicators.push({
        indicator: 'Moving from questioning to application',
        explanation: 'Shifting from "why?" to "how?" shows growing trust and desire to obey'
      });
    }

    return indicators;
  }
}
