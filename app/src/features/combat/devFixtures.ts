import type { Bullet, BulletKind, CombatCard } from '../../types/combat-card';

const FANDOM_FR_URL = 'https://dofus-fr.fandom.com/wiki/Dompteuse_Perturb%C3%A9e';
const FANDOM_EN_URL = 'https://dofuswiki.fandom.com/wiki/Sylargh';

function nativeFrBullet(
  fr: string,
  en: string,
  severity: Bullet['severity'],
  mechanicType: Bullet['mechanicType'] = null,
  kind: BulletKind = 'action',
): Bullet {
  return {
    text: { fr, en },
    kind,
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

function nativeEnBullet(
  fr: string,
  en: string,
  severity: Bullet['severity'],
  mechanicType: Bullet['mechanicType'] = null,
  kind: BulletKind = 'action',
): Bullet {
  return {
    text: { fr, en },
    kind,
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

/** Fixture 1 — Boss lourd, v0.5.1 shape (unlock context+action + dangers + tips). */
export const FIXTURE_BOSS_SYLARGH: CombatCard = {
  unlock: [
    nativeEnBullet(
      'Sylargh se ressuscite au centre — le sortir de cette zone coupe la mécanique',
      'Sylargh revives at the centre — pulling him out cuts the mechanic',
      'danger',
      'reviver',
      'context',
    ),
    nativeEnBullet(
      'Éloigner Sylargh du centre dès le tour 1',
      'Pull Sylargh away from centre at turn 1',
      'critical',
      'reviver',
    ),
    nativeEnBullet(
      "Tuer les 3 pions avant d'attaquer Sylargh",
      'Kill the 3 pawns before attacking Sylargh',
      'critical',
      'chain-summon',
    ),
    nativeEnBullet(
      'Garder 1 joueur en portée 6+ pour interrompre les invocations',
      'Keep 1 ally at range 6+ to interrupt summons',
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
    nativeEnBullet("Faible à l'air, résiste au feu", 'Weak to air, resists fire', null),
  ],
};

/** Fixture 2 — Monstre notable counter-damage, v0.5.1 shape (unlock context + dangers). */
export const FIXTURE_MONSTER_COUNTER: CombatCard = {
  unlock: [
    nativeFrBullet(
      'La Dompteuse punit les frappes répétées par un retour de dégâts',
      'The Tamer punishes repeated hits with a damage return',
      'danger',
      'counter-damage',
      'context',
    ),
  ],
  dangers: [
    nativeFrBullet(
      "3 tours d'inactivité + retour de dégâts si > 2 frappes/tour",
      '3 turns of inactivity + retaliation damage if > 2 hits/turn',
      'critical',
      'counter-damage',
    ),
  ],
  tips: [],
};

/** Fixture 3 — Monstre lambda (aucune mécanique) : card === null. */
export const FIXTURE_MONSTER_LAMBDA: CombatCard | null = null;
