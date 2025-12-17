/**
 * BRANDING CONFIGURATION
 *
 * Maps internal engine names to public-facing labels
 *
 * Philosophy: Same engine, same code, different labels for different contexts.
 * This is prudence, not compromise.
 */

export interface EngineBranding {
  internalName: string;
  publicLabel: string;
  publicDescription: string;
  icon?: string;
}

export const ENGINE_BRANDING: Record<string, EngineBranding> = {
  engine0: {
    internalName: 'Biblical Wisdom Filter',
    publicLabel: 'Biblical Wisdom Filter',
    publicDescription: 'Ensures questions align with biblical principles of wisdom',
    icon: '🛡️'
  },
  engine1: {
    internalName: 'Biblical Oracle',
    publicLabel: 'Multi-Perspective Analysis',
    publicDescription: 'Explores questions from seven theological perspectives',
    icon: '🔮'
  },
  engine2: {
    internalName: 'Covenant Analysis',
    publicLabel: 'Covenant Analysis',
    publicDescription: 'Examines how biblical covenants apply to your question',
    icon: '📜'
  },
  engine3: {
    internalName: 'Council of Voices',
    publicLabel: 'Theological Council',
    publicDescription: 'Weighs perspectives from different Christian traditions',
    icon: '⚖️'
  },
  engine4: {
    internalName: 'Spiritual Warfare Check',
    publicLabel: 'Pastoral Risk & Distress Analysis',
    publicDescription: 'Identifies spiritual/emotional distress and provides biblical comfort',
    icon: '🛟'
  },
  engine5: {
    internalName: 'Cross-Testament Integration',
    publicLabel: 'Cross-Testament Integration',
    publicDescription: 'Connects Old and New Testament wisdom',
    icon: '🔗'
  },
  engine6: {
    internalName: 'Holy Spirit Synthesis',
    publicLabel: 'Integrated Discernment Synthesis',
    publicDescription: 'Synthesizes all perspectives into unified biblical guidance',
    icon: '🕊️'
  },
  engine7: {
    internalName: 'Scripture Memory',
    publicLabel: 'Scripture Memory & Context',
    publicDescription: 'Recalls your history and relevant patterns',
    icon: '🧠'
  },
  engine8: {
    internalName: 'Discipleship Tracking',
    publicLabel: 'Discipleship Growth Tracking',
    publicDescription: 'Tracks your spiritual growth over time',
    icon: '📈'
  },
  engine9: {
    internalName: 'Heart Condition Analysis',
    publicLabel: 'Heart Condition Analysis',
    publicDescription: 'Understands the emotional/spiritual context of your question',
    icon: '💓'
  }
};

/**
 * Get public-facing label for an engine
 */
export function getPublicLabel(engineKey: string): string {
  return ENGINE_BRANDING[engineKey]?.publicLabel || engineKey;
}

/**
 * Get public-facing description for an engine
 */
export function getPublicDescription(engineKey: string): string {
  return ENGINE_BRANDING[engineKey]?.publicDescription || '';
}

/**
 * Get icon for an engine
 */
export function getEngineIcon(engineKey: string): string {
  return ENGINE_BRANDING[engineKey]?.icon || '🔧';
}

/**
 * Convert internal reasoning output to public-facing format
 * (strips internal terminology, uses public labels)
 */
export function toPublicFormat(reasoning: any): any {
  // Clone the object
  const publicReasoning = JSON.parse(JSON.stringify(reasoning));

  // Add public labels to each engine's output
  Object.keys(publicReasoning).forEach(engineKey => {
    if (ENGINE_BRANDING[engineKey]) {
      publicReasoning[engineKey]._label = ENGINE_BRANDING[engineKey].publicLabel;
      publicReasoning[engineKey]._description = ENGINE_BRANDING[engineKey].publicDescription;
    }
  });

  return publicReasoning;
}

// ============================================================================
// MARKETING COPY (for website, docs, etc.)
// ============================================================================

export const MARKETING_COPY = {
  tagline: 'Biblical wisdom through multi-perspective AI reasoning',

  description: `BibleMind provides deep biblical guidance by analyzing your questions from multiple theological perspectives simultaneously. Our 10-engine system synthesizes insights from Torah, Prophets, Gospels, Church tradition, and systematic theology to give you comprehensive, Scripture-grounded wisdom.`,

  howItWorks: `When you ask a question, BibleMind:
1. Filters for biblical wisdom and safety
2. Explores 7 theological perspectives in parallel
3. Analyzes covenant promises and obligations
4. Weighs evidence from different traditions
5. Identifies potential risks and provides comfort
6. Integrates Old and New Testament wisdom
7. Synthesizes everything into clear guidance
8. Remembers your context for continuity
9. Tracks your spiritual growth over time
10. Understands the heart behind your question`,

  notClaiming: `**What BibleMind IS NOT:**
- We are NOT claiming to replace the Holy Spirit
- We are NOT claiming to replace your pastor or spiritual community
- We are NOT claiming infallibility or perfect theological interpretation
- We are NOT a substitute for personal Bible study and prayer

**What BibleMind IS:**
- A tool to help you explore Scripture from multiple angles
- A way to see how different Christian traditions approach your question
- A system to identify relevant passages you might have missed
- A companion for your personal discipleship journey
- A starting point for deeper study and conversation with your community`,

  theological_foundation: `BibleMind is built on:
- **Sola Scriptura**: Scripture is our final authority
- **Historical Christianity**: We honor 2,000 years of faithful interpretation
- **Multi-perspective wisdom**: Different traditions see different truths
- **Humility**: We acknowledge uncertainty and limitations
- **Pastoral care**: We prioritize spiritual health over cold analysis`
};

// ============================================================================
// CONTEXT-SPECIFIC BRANDING
// ============================================================================

export type BrandingContext = 'website' | 'app' | 'academic' | 'pastoral' | 'internal';

/**
 * Get engine name for specific context
 */
export function getContextualName(engineKey: string, context: BrandingContext): string {
  const branding = ENGINE_BRANDING[engineKey];
  if (!branding) return engineKey;

  switch (context) {
    case 'internal':
      return branding.internalName;
    case 'academic':
    case 'pastoral':
    case 'website':
    case 'app':
    default:
      return branding.publicLabel;
  }
}

/**
 * Example: Display engine results with appropriate labeling
 */
export function formatEngineOutput(
  engineKey: string,
  output: any,
  context: BrandingContext = 'app'
): { label: string; description: string; icon: string; output: any } {
  const branding = ENGINE_BRANDING[engineKey];

  return {
    label: getContextualName(engineKey, context),
    description: branding?.publicDescription || '',
    icon: branding?.icon || '🔧',
    output
  };
}
