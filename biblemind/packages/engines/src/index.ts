/**
 * BibleMind Engines
 *
 * 10-engine holographic reasoning system for biblical analysis
 */

// Export types
export * from './types';
export * from './branding';

// Export engines
export { BiblicalWisdomFilter } from './engines/engine0-wisdom-filter';
export { BiblicalOracle } from './engines/engine1-biblical-oracle';
export { PastoralRiskEngine } from './engines/engine4-pastoral-risk';
export { IntegratedDiscernmentSynthesis } from './engines/engine6-synthesis';
export { HeartConditionAnalysis } from './engines/engine9-heart-condition';

// TODO: Export remaining engines when implemented
// export { CovenantAnalysis } from './engines/engine2-covenant';
// export { TheologicalCouncil } from './engines/engine3-tribunal';
// export { CrossTestamentIntegration } from './engines/engine5-cross-testament';
// export { ScriptureMemory } from './engines/engine7-memory';
// export { DiscipleshipTracking } from './engines/engine8-discipleship';

/**
 * Engine Status
 */
export const ENGINE_STATUS = {
  engine0: 'implemented',  // Biblical Wisdom Filter
  engine1: 'implemented',  // Biblical Oracle (7 perspectives)
  engine2: 'pending',      // Covenant Analysis
  engine3: 'pending',      // Theological Council
  engine4: 'implemented',  // Pastoral Risk & Distress Analysis
  engine5: 'pending',      // Cross-Testament Integration
  engine6: 'implemented',  // Integrated Discernment Synthesis
  engine7: 'pending',      // Scripture Memory
  engine8: 'pending',      // Discipleship Tracking
  engine9: 'implemented'   // Heart Condition Analysis
} as const;

/**
 * Get implemented engines
 */
export function getImplementedEngines(): string[] {
  return Object.entries(ENGINE_STATUS)
    .filter(([_, status]) => status === 'implemented')
    .map(([engine, _]) => engine);
}

/**
 * Get pending engines
 */
export function getPendingEngines(): string[] {
  return Object.entries(ENGINE_STATUS)
    .filter(([_, status]) => status === 'pending')
    .map(([engine, _]) => engine);
}
