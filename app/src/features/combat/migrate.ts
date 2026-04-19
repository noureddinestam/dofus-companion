import type { Bullet, CombatCard } from '../../types/combat-card';

/**
 * Migrate a v0.5 CombatCard to the v0.5.1 shape:
 *
 *   v0.5: { unlock, constraints, dangers, tips }
 *   v0.5.1: { unlock: [context..., action...], dangers, tips, constraints?: optional }
 *
 * Concretely: every bullet that used to live in `constraints[]` becomes a
 * `kind: 'context'` bullet at the head of `unlock[]`. Bullets already in
 * `unlock[]` default to `kind: 'action'` (preserving their order). The
 * `constraints` field is dropped from the output so v0.5.1 consumers stop
 * seeing it, but the Zod schema still tolerates it on input for forward-
 * compatibility.
 *
 * Deterministic, pure, no LLM. Safe to run at dataset load time in the app.
 */
export function migrateCardV05ToV051(card: CombatCard): CombatCard {
  const legacy = card.constraints ?? [];
  const hasLegacy = legacy.length > 0;
  const unlockAlreadyTagged = card.unlock.every((b) => b.kind === 'context' || b.kind === 'action');

  // Fast path — nothing to migrate.
  if (!hasLegacy && unlockAlreadyTagged && card.constraints === undefined) {
    return card;
  }

  const contextBullets: Bullet[] = legacy.map((b) => ({ ...b, kind: 'context' }));
  const actionBullets: Bullet[] = card.unlock.map((b) =>
    b.kind === 'context' ? b : { ...b, kind: 'action' },
  );

  return {
    unlock: [...contextBullets, ...actionBullets],
    dangers: card.dangers,
    tips: card.tips,
  };
}

/**
 * Convenience: how many bullets the migration moved. Useful for reporting.
 */
export function countMigratedContextBullets(card: CombatCard): number {
  return card.constraints?.length ?? 0;
}
