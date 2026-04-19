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
  titleBar: {
    dragHandle: string;
    hide: string;
    reposition: string;
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
  combat: {
    unlock: string;
    constraints: string;
    dangers: string;
    tips: string;
    legacyNotes: string;
    legacyNotesFrOnlyBadge: string;
    unlockContext: string;
    unlockActions: string;
    lambdaPlaceholder: string;
  };
  settings: {
    hideLambdas: string;
    hideLambdasHint: string;
    panel: {
      title: string;
      closeAria: string;
      openAria: string;
      sectionAppearance: string;
      sectionContent: string;
      sectionMonsters: string;
      sectionShortcuts: string;
      sectionNotifications: string;
      sectionAbout: string;
      langLabel: string;
      langFr: string;
      langEn: string;
      opacityLabel: string;
      opacityHint: string;
      densityLabel: string;
      densityComfortable: string;
      densityCompact: string;
      themeLabel: string;
      themeSystem: string;
      themeLight: string;
      themeDark: string;
      showUnlockBlock: string;
      showUnlockContext: string;
      showUnlockActions: string;
      showDangersBlock: string;
      showTipsBlock: string;
      showLambdaMonsters: string;
      showLambdaMonstersHint: string;
      showProvenanceBadge: string;
      showProvenanceBadgeHint: string;
      primaryShortcut: string;
      primaryShortcutHint: string;
      shortcutCustomizationSoon: string;
      showStartupToast: string;
      showStartupToastHint: string;
      aboutVersion: (v: string) => string;
      aboutChangelog: string;
      aboutWebsite: string;
      aboutCredits: string;
    };
  };
  monsterView: {
    title: string;
    searchPlaceholder: string;
    empty: string;
    emptyHint: string;
    encounteredIn: (count: number) => string;
    backToSearch: string;
    noResults: string;
  };
  welcome: {
    title: string;
    subtitle: string;
    bulletHotkey: string;
    bulletSearch: string;
    bulletLocal: string;
    cta: string;
    closeAria: string;
  };
  startupToast: {
    title: string;
    body: string;
  };
  footer: {
    navigate: string;
    open: string;
    close: string;
    search: string;
    sections: string;
    switchView: string;
    monsterView: string;
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
    monsterView: 'Monstres',
  },
  titleBar: {
    dragHandle: 'Glisser pour déplacer',
    hide: 'Masquer (Esc)',
    reposition: 'Repositionner en haut à droite',
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
  combat: {
    unlock: 'DÉLOCK',
    constraints: 'CONTRAINTES',
    dangers: 'DANGERS',
    tips: 'INFOS UTILES',
    legacyNotes: 'Notes legacy v0.4',
    legacyNotesFrOnlyBadge: 'FR uniquement',
    unlockContext: 'Contexte',
    unlockActions: 'Actions',
    lambdaPlaceholder: 'Pas de mécanique notable',
  },
  settings: {
    hideLambdas: 'Masquer lambdas',
    hideLambdasHint: 'Cacher les monstres sans mécanique',
    panel: {
      title: 'Paramètres',
      closeAria: 'Fermer les paramètres',
      openAria: 'Ouvrir les paramètres',
      sectionAppearance: 'Apparence',
      sectionContent: 'Contenu des fiches',
      sectionMonsters: 'Monstres',
      sectionShortcuts: 'Raccourcis',
      sectionNotifications: 'Notifications',
      sectionAbout: 'À propos',
      langLabel: 'Langue',
      langFr: 'Français',
      langEn: 'English',
      opacityLabel: 'Opacité',
      opacityHint: 'Transparence de la fenêtre au-dessus de Dofus',
      densityLabel: 'Densité',
      densityComfortable: 'Confortable',
      densityCompact: 'Compact',
      themeLabel: 'Thème',
      themeSystem: 'Système',
      themeLight: 'Clair',
      themeDark: 'Sombre',
      showUnlockBlock: 'Afficher le bloc 🔓 DÉLOCK',
      showUnlockContext: 'Sous-bloc « Contexte »',
      showUnlockActions: 'Sous-bloc « Actions »',
      showDangersBlock: 'Afficher le bloc ❌ DANGERS',
      showTipsBlock: 'Afficher le bloc 💡 INFOS UTILES',
      showLambdaMonsters: 'Afficher les monstres sans mécanique',
      showLambdaMonstersHint: 'Désactive la règle du silence',
      showProvenanceBadge: 'Afficher le badge de provenance',
      showProvenanceBadgeHint: 'Source Fandom, LLM, communauté',
      primaryShortcut: 'Raccourci principal',
      primaryShortcutHint: 'Afficher / masquer l\'overlay',
      shortcutCustomizationSoon: 'Personnalisation à venir',
      showStartupToast: 'Notification au démarrage',
      showStartupToastHint: 'Toast système · Alt+D pour afficher',
      aboutVersion: (v) => `Version ${v}`,
      aboutChangelog: 'Changelog',
      aboutWebsite: 'Site web',
      aboutCredits: 'Crédits',
    },
  },
  monsterView: {
    title: 'MONSTRES',
    searchPlaceholder: 'Rechercher un monstre…',
    empty: 'Aucun monstre sélectionné',
    emptyHint: 'Tapez pour filtrer, ↑↓ pour naviguer, Entrée pour voir la fiche',
    encounteredIn: (count) =>
      count === 1 ? 'Rencontré dans 1 donjon' : `Rencontré dans ${count} donjons`,
    backToSearch: 'Retour recherche',
    noResults: 'Aucun monstre ne correspond',
  },
  welcome: {
    title: '👋 Bienvenue dans Dofus Companion',
    subtitle: "L'overlay est déjà ouvert — il se masque quand tu en as besoin.",
    bulletHotkey: '⌨  Alt+D pour afficher/masquer (fonctionne même en combat)',
    bulletSearch: '🔍 Tape un nom de donjon ou de monstre pour chercher',
    bulletLocal: '⚡ Tout est local : aucun serveur, aucun tracker',
    cta: "J'ai compris — c'est parti",
    closeAria: 'Fermer',
  },
  startupToast: {
    title: 'Dofus Companion',
    body: 'Ouvert en arrière-plan · Alt+D pour afficher',
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
    monsterView: 'Monsters',
  },
  titleBar: {
    dragHandle: 'Drag to move',
    hide: 'Hide (Esc)',
    reposition: 'Reposition to top-right',
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
  combat: {
    unlock: 'UNLOCK',
    constraints: 'CONSTRAINTS',
    dangers: 'DANGERS',
    tips: 'TIPS',
    legacyNotes: 'v0.4 legacy notes',
    legacyNotesFrOnlyBadge: 'FR only',
    unlockContext: 'Context',
    unlockActions: 'Actions',
    lambdaPlaceholder: 'No notable mechanic',
  },
  settings: {
    hideLambdas: 'Hide lambdas',
    hideLambdasHint: 'Hide monsters without mechanics',
    panel: {
      title: 'Settings',
      closeAria: 'Close settings',
      openAria: 'Open settings',
      sectionAppearance: 'Appearance',
      sectionContent: 'Card content',
      sectionMonsters: 'Monsters',
      sectionShortcuts: 'Shortcuts',
      sectionNotifications: 'Notifications',
      sectionAbout: 'About',
      langLabel: 'Language',
      langFr: 'Français',
      langEn: 'English',
      opacityLabel: 'Opacity',
      opacityHint: 'Window transparency on top of Dofus',
      densityLabel: 'Density',
      densityComfortable: 'Comfortable',
      densityCompact: 'Compact',
      themeLabel: 'Theme',
      themeSystem: 'System',
      themeLight: 'Light',
      themeDark: 'Dark',
      showUnlockBlock: 'Show 🔓 UNLOCK block',
      showUnlockContext: '"Context" subsection',
      showUnlockActions: '"Actions" subsection',
      showDangersBlock: 'Show ❌ DANGERS block',
      showTipsBlock: 'Show 💡 TIPS block',
      showLambdaMonsters: 'Show monsters without mechanics',
      showLambdaMonstersHint: 'Turn off the silence rule',
      showProvenanceBadge: 'Show the provenance badge',
      showProvenanceBadgeHint: 'Fandom, LLM, or community source',
      primaryShortcut: 'Primary shortcut',
      primaryShortcutHint: 'Show / hide the overlay',
      shortcutCustomizationSoon: 'Custom shortcuts coming soon',
      showStartupToast: 'Startup notification',
      showStartupToastHint: 'System toast · Alt+D to show',
      aboutVersion: (v) => `Version ${v}`,
      aboutChangelog: 'Changelog',
      aboutWebsite: 'Website',
      aboutCredits: 'Credits',
    },
  },
  monsterView: {
    title: 'MONSTERS',
    searchPlaceholder: 'Search a monster…',
    empty: 'No monster selected',
    emptyHint: 'Type to filter, ↑↓ to navigate, Enter to open',
    encounteredIn: (count) =>
      count === 1 ? 'Encountered in 1 dungeon' : `Encountered in ${count} dungeons`,
    backToSearch: 'Back to search',
    noResults: 'No matching monster',
  },
  welcome: {
    title: '👋 Welcome to Dofus Companion',
    subtitle: 'The overlay is already open — hide it whenever you need.',
    bulletHotkey: '⌨  Alt+D to show/hide (works mid-fight)',
    bulletSearch: '🔍 Type a dungeon or monster name to search',
    bulletLocal: '⚡ Everything is local: no server, no tracker',
    cta: "Got it — let's go",
    closeAria: 'Close',
  },
  startupToast: {
    title: 'Dofus Companion',
    body: 'Running in background · Alt+D to show',
  },
};

export const UI_STRINGS: Record<Lang, UiStrings> = { fr, en };
