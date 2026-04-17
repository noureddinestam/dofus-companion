import type { Dungeon, StrategyBundle } from '../../types/dungeon';

/**
 * Fixtures de développement — injectent un `strategies.short` mocké pour
 * quelques donjons emblématiques afin de valider visuellement la vue
 * Actionnable avant que le pipeline LLM (Phase F) ne génère les vraies
 * données.
 *
 * Appliqué UNIQUEMENT en mode dev (import.meta.env.DEV) via applyDevFixtures().
 * Ces bullets sont manuellement écrits et correspondent à des mécaniques
 * documentées sur Fandom EN — servent à tester la lisibilité et le rendu,
 * pas à être livrés en production.
 */

type SlugShortMap = Record<string, StrategyBundle['short']>;

const DEV_SHORTS: SlugShortMap = {
  // Kolosso (niveau 190) — boss avec invulnérabilité levée par invocations
  'cavernes-du-kolosso': {
    fr: {
      bullets: [
        {
          icon: 'priority',
          severity: 'critical',
          text: 'Professeur Xa : cible prioritaire, vulnérable dès le début.',
        },
        {
          icon: 'summon',
          severity: 'danger',
          text: 'Kolosso est invulnérable — une invocation doit le toucher chaque tour.',
        },
        {
          icon: 'avoid',
          severity: 'danger',
          text: 'Le Prof Xa lance Télépathie (-10 000 PV soins). Désactive les soins.',
        },
        {
          icon: 'position',
          severity: 'caution',
          text: 'Évite la ligne de vue directe avec le Kolosso au corps à corps.',
        },
        {
          icon: 'tip',
          severity: 'info',
          text: 'Invoqueur (Osa, Sram, Féca) rend le combat très confortable.',
        },
      ],
      provenance: {
        kind: 'llm-grounded',
        baseLang: 'en',
        baseSource: 'fandom-en',
        baseSourceUrl: 'https://dofuswiki.fandom.com/wiki/Kolosso',
        model: 'dev-fixture',
        promptVersion: 'fixture-v0',
        anchors: [
          {
            bulletIndex: 0,
            quote: 'Professor Xa, who is vulnerable from the start',
            similarity: 1,
          },
        ],
        generatedAt: '2026-04-18T00:00:00.000Z',
      },
    },
    en: {
      bullets: [
        {
          icon: 'priority',
          severity: 'critical',
          text: 'Professor Xa: priority target, vulnerable from the start.',
        },
        {
          icon: 'summon',
          severity: 'danger',
          text: 'Kolosso is invulnerable — a summon must hit him each turn.',
        },
        {
          icon: 'avoid',
          severity: 'danger',
          text: 'Prof Xa casts Telepathy (-10,000 HP to heals). Drop healing.',
        },
        {
          icon: 'position',
          severity: 'caution',
          text: 'Avoid direct line of sight with Kolosso in melee range.',
        },
        {
          icon: 'tip',
          severity: 'info',
          text: 'A summoner class (Osa, Sram, Feca) makes this fight much easier.',
        },
      ],
      provenance: {
        kind: 'native',
        lang: 'en',
        source: 'fandom-en',
        sourceUrl: 'https://dofuswiki.fandom.com/wiki/Kolosso',
      },
    },
  },

  // Château d'Harebourg (niveau 190) — boss givre/froid
  'chateau-d-harebourg': {
    fr: null,
    en: {
      bullets: [
        {
          icon: 'instakill',
          severity: 'critical',
          text: 'Frozen counter at 0 → instant kill. Watch ice stacks.',
        },
        {
          icon: 'phase',
          severity: 'danger',
          text: 'At 50% HP, Harebourg enters Frost Form. Ranged fight mandatory.',
        },
        {
          icon: 'element',
          severity: 'caution',
          text: 'Fire / Earth damage recommended. Air is resisted.',
        },
        {
          icon: 'position',
          severity: 'caution',
          text: 'Stay on warm tiles (glow). Frozen tiles tick damage and ice stacks.',
        },
      ],
      provenance: {
        kind: 'native',
        lang: 'en',
        source: 'fandom-en',
        sourceUrl: 'https://dofuswiki.fandom.com/wiki/Count_Harebourg',
      },
    },
  },

  // Dark Vlad (niveau 200) — boss vampirique
  'dark-vlad': {
    fr: {
      bullets: [
        {
          icon: 'instakill',
          severity: 'critical',
          text: 'Si Dark Vlad frappe 2 fois le même tour → résurrection d\'une ombre.',
        },
        {
          icon: 'avoid',
          severity: 'danger',
          text: 'Ne jamais se soigner après sa transformation (il réabsorbe).',
        },
        {
          icon: 'priority',
          severity: 'danger',
          text: 'Tuer les Ombres dès qu\'elles apparaissent — prolongent le combat.',
        },
        {
          icon: 'element',
          severity: 'caution',
          text: 'Faible aux dégâts Feu. Résiste à Eau.',
        },
      ],
      provenance: {
        kind: 'community',
        contributor: 'dev-fixture',
        prUrl: 'https://github.com/noureddinestam/dofus-companion/pulls',
      },
    },
    en: null,
  },
};

export function applyDevFixtures(dungeons: Dungeon[]): Dungeon[] {
  if (!import.meta.env.DEV) return dungeons;

  return dungeons.map((d) => {
    const shorts = DEV_SHORTS[d.slug];
    if (!shorts) return d;

    // Si strategies n'existe pas encore, on construit un bundle vide + short
    const currentLong = d.boss.strategies?.long ?? { fr: null, en: null };

    return {
      ...d,
      boss: {
        ...d.boss,
        strategies: {
          long: currentLong,
          short: shorts,
        },
      },
    };
  });
}
