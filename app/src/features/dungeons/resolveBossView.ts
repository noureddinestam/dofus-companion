import { isCombatCardEmpty } from '../../types/combat-card';
import type { Boss } from '../../types/dungeon';

export type BossView = 'combat' | 'legacy';

/**
 * Décide quel composant rendre pour un boss :
 * - `'combat'` si `boss.combat` a au moins un bullet dans un bloc → CombatCardView
 * - `'legacy'` sinon → BossPanel / StrategyShortView v0.4
 *
 * C'est le seul point de décision entre v0.4 et v0.5. Toute autre partie
 * de l'UI doit passer par ce helper, pas par un test inline sur boss.combat.
 */
export function resolveBossView(boss: Boss): BossView {
  return isCombatCardEmpty(boss.combat) ? 'legacy' : 'combat';
}
