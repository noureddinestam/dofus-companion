import type { Bullet, CombatCard } from '../../types/combat-card';

const FANDOM_FR_URL = 'https://dofus-fr.fandom.com/wiki/Dompteuse_Perturb%C3%A9e';
const FANDOM_EN_URL = 'https://dofuswiki.fandom.com/wiki/Sylargh';

function nativeFrBullet(fr: string, en: string, severity: Bullet['severity'], mechanicType: Bullet['mechanicType'] = null): Bullet {
  return {
    text: { fr, en },
    mechanicType,
    severity,
    provenance: {
      kind: 'native',
      lang: 'fr',
      source: 'fandom-fr',
      sourceUrl: FANDOM_FR_URL,
    },
  };
}

function nativeEnBullet(fr: string, en: string, severity: Bullet['severity'], mechanicType: Bullet['mechanicType'] = null): Bullet {
  return {
    text: { fr, en },
    mechanicType,
    severity,
    provenance: {
      kind: 'native',
      lang: 'en',
      source: 'fandom-en',
      sourceUrl: FANDOM_EN_URL,
    },
  };
}

/** Fixture 1 — Boss lourd, 4 blocs remplis (Sylargh-like). */
export const FIXTURE_BOSS_SYLARGH: CombatCard = {
  unlock: [
    nativeEnBullet(
      'Tuer les 3 pions avant d\'attaquer Sylargh',
      'Kill the 3 pawns before attacking Sylargh',
      'critical',
      'chain-summon',
    ),
    nativeEnBullet(
      'Éloigner Sylargh du centre pour couper la résurrection',
      'Pull Sylargh away from center to cut the resurrection',
      'danger',
      'reviver',
    ),
  ],
  constraints: [
    nativeEnBullet(
      'Garder 1 joueur en portée 6+ pour interrompre',
      'Keep 1 ally at range 6+ to interrupt',
      'caution',
      'zone-control',
    ),
  ],
  dangers: [
    nativeEnBullet(
      'Ressuscite les pions tués à côté de lui',
      'Resurrects pawns killed adjacent to him',
      'danger',
      'reviver',
    ),
  ],
  tips: [
    nativeEnBullet('Faible à l\'air, résiste au feu', 'Weak to air, resists fire', null),
  ],
};

/** Fixture 2 — Monstre notable counter-damage (Dompteuse-like), 2 blocs. */
export const FIXTURE_MONSTER_COUNTER: CombatCard = {
  unlock: [],
  constraints: [
    nativeFrBullet(
      'Ne pas la frapper plus de 2× dans un même tour',
      'Do not hit her more than 2× per turn',
      'danger',
      'counter-damage',
    ),
  ],
  dangers: [
    nativeFrBullet(
      '3 tours d\'inactivité + retour de dégâts si > 2 frappes/tour',
      '3 turns of inactivity + retaliation damage if > 2 hits/turn',
      'critical',
      'counter-damage',
    ),
  ],
  tips: [],
};

/** Fixture 3 — Monstre lambda (aucune mécanique) : card === null. */
export const FIXTURE_MONSTER_LAMBDA: CombatCard | null = null;
