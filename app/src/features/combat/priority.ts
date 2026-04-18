import type { CombatCard } from '../../types/combat-card';

export type CombatPriority = 'critical' | 'danger' | 'caution' | 'manageable';

export function derivePriority(card: CombatCard | null): CombatPriority {
  if (!card) return 'manageable';
  const bullets = [
    ...card.unlock,
    ...card.constraints,
    ...card.dangers,
    ...card.tips,
  ];
  if (bullets.length === 0) return 'manageable';
  const severities = bullets.map((b) => b.severity).filter((s): s is NonNullable<typeof s> => s !== null);
  if (severities.includes('critical')) return 'critical';
  if (severities.includes('danger')) return 'danger';
  if (severities.includes('caution')) return 'caution';
  return 'manageable';
}
