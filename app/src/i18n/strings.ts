// Source de vérité typée pour toutes les chaînes UI.
// Le shape `UiStrings` impose la parité des clés entre fr et en :
// si une clé manque côté `en`, TypeScript erreur sur `satisfies`.

export interface UiStrings {
  search: {
    placeholder: string;
    empty: string;
    hintExamples: string;
  };
  dungeon: {
    back: string;
    monsters: string;
    monstersSubtitle: string;
    monstersCount: (n: number) => string;
    boss: string;
    strategy: string;
    phases: string;
    viewGuide: string;
    noStrategy: string;
    verified: string;
    strategyLabel: string;
    bossPrefix: string;
    strategyAvailable: string;
    backTitle: string;
    levelRange: (min: number, max: number) => string;
  };
  view: {
    detailed: string;
    actionable: string;
    toggleHint: string;
  };
  lang: {
    fr: string;
    en: string;
    toggleHint: string;
  };
  footer: {
    navigate: string;
    open: string;
    close: string;
    search: string;
    sections: string;
    switchView: string;
    switchLang: string;
  };
  titleBar: {
    dragHandle: string;
    hide: string;
  };
  update: {
    available: (v: string) => string;
    install: string;
  };
  element: {
    weakness: string;
    resistance: string;
    hp: string;
    levelShort: (n: number) => string;
    hpValue: (hp: number) => string;
  };
  source: {
    dofusdb: string;
    fandomEn: string;
    fandomFr: string;
  };
  provenance: {
    native: string;
    llmGrounded: (source: string) => string;
    community: (contributor: string) => string;
    viewOriginal: string;
    viewPr: string;
  };
  strategy: {
    noShort: string;
    noShortCta: string;
    fallbackLang: (availableLang: string) => string;
  };
}

export type Lang = 'fr' | 'en';

const fr: UiStrings = {
  search: {
    placeholder: 'Rechercher un donjon…',
    empty: 'Aucun donjon trouvé',
    hintExamples: 'Essayez « frigost », « bouf », « vlad »…',
  },
  dungeon: {
    back: 'Retour',
    monsters: 'MONSTRES',
    monstersSubtitle: 'niveau décroissant',
    monstersCount: (n) => `${n} monstres + boss`,
    boss: 'BOSS',
    strategy: 'STRATÉGIE',
    phases: 'PHASES',
    viewGuide: 'Voir guide',
    noStrategy:
      'Pas de stratégie documentée (aucune section vérifiée trouvée sur le wiki). Consultez le guide externe.',
    verified: 'Données vérifiées',
    strategyLabel: 'Stratégie',
    bossPrefix: 'Boss :',
    strategyAvailable: 'Stratégie Fandom disponible',
    backTitle: 'Retour (Backspace)',
    levelRange: (min, max) => `Nv. ${min}–${max}`,
  },
  view: {
    detailed: 'Détaillée',
    actionable: 'Actionnable',
    toggleHint: 'Changer de vue',
  },
  lang: {
    fr: 'FR',
    en: 'EN',
    toggleHint: 'Changer de langue',
  },
  footer: {
    navigate: 'Naviguer',
    open: 'Ouvrir',
    close: 'Fermer',
    search: 'Recherche',
    sections: 'Sections',
    switchView: 'Vue',
    switchLang: 'Langue',
  },
  titleBar: {
    dragHandle: 'Glisser pour déplacer',
    hide: 'Masquer (Esc)',
  },
  update: {
    available: (v) => `↑ v${v} disponible`,
    install: 'Installer',
  },
  element: {
    weakness: 'Faiblesse',
    resistance: 'Résistance',
    hp: 'PV',
    levelShort: (n) => `Nv.${n}`,
    hpValue: (hp) => `${hp.toLocaleString('fr-FR')} PV`,
  },
  source: {
    dofusdb: 'DofusDB',
    fandomEn: 'Wiki Fandom EN',
    fandomFr: 'Wiki Fandom FR',
  },
  provenance: {
    native: 'Source vérifiée',
    llmGrounded: (source) => `Synthèse IA · ancrée sur ${source}`,
    community: (contributor) => `Contribution communautaire · ${contributor}`,
    viewOriginal: 'Voir original',
    viewPr: 'Voir PR',
  },
  strategy: {
    noShort: 'Version actionnable pas encore disponible pour ce donjon.',
    noShortCta: 'Voir version détaillée',
    fallbackLang: (availableLang) =>
      `Disponible uniquement en ${availableLang} · traduction à venir`,
  },
};

const en: UiStrings = {
  search: {
    placeholder: 'Search a dungeon…',
    empty: 'No dungeon found',
    hintExamples: 'Try "frigost", "bouf", "vlad"…',
  },
  dungeon: {
    back: 'Back',
    monsters: 'MONSTERS',
    monstersSubtitle: 'by level descending',
    monstersCount: (n) => `${n} monsters + boss`,
    boss: 'BOSS',
    strategy: 'STRATEGY',
    phases: 'PHASES',
    viewGuide: 'View guide',
    noStrategy:
      'No documented strategy (no verified section found on the wiki). See external guide.',
    verified: 'Verified data',
    strategyLabel: 'Strategy',
    bossPrefix: 'Boss:',
    strategyAvailable: 'Fandom strategy available',
    backTitle: 'Back (Backspace)',
    levelRange: (min, max) => `Lv. ${min}–${max}`,
  },
  view: {
    detailed: 'Detailed',
    actionable: 'Actionable',
    toggleHint: 'Switch view',
  },
  lang: {
    fr: 'FR',
    en: 'EN',
    toggleHint: 'Change language',
  },
  footer: {
    navigate: 'Navigate',
    open: 'Open',
    close: 'Close',
    search: 'Search',
    sections: 'Sections',
    switchView: 'View',
    switchLang: 'Lang',
  },
  titleBar: {
    dragHandle: 'Drag to move',
    hide: 'Hide (Esc)',
  },
  update: {
    available: (v) => `↑ v${v} available`,
    install: 'Install',
  },
  element: {
    weakness: 'Weakness',
    resistance: 'Resistance',
    hp: 'HP',
    levelShort: (n) => `Lv.${n}`,
    hpValue: (hp) => `${hp.toLocaleString('en-US')} HP`,
  },
  source: {
    dofusdb: 'DofusDB',
    fandomEn: 'Fandom Wiki EN',
    fandomFr: 'Fandom Wiki FR',
  },
  provenance: {
    native: 'Verified source',
    llmGrounded: (source) => `AI summary · anchored on ${source}`,
    community: (contributor) => `Community · ${contributor}`,
    viewOriginal: 'Show original',
    viewPr: 'View PR',
  },
  strategy: {
    noShort: 'Actionable version not yet available for this dungeon.',
    noShortCta: 'Show detailed version',
    fallbackLang: (availableLang) =>
      `Available only in ${availableLang} · translation coming soon`,
  },
};

export const UI_STRINGS: Record<Lang, UiStrings> = { fr, en };
