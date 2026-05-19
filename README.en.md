[🇫🇷 FR](README.md) · [🇬🇧 EN](README.en.md)

# Dofus Companion

> Open source · MIT. Project developed as part of the M2 student engagement initiative by Noureddine S. and Elhadi L.

A Windows overlay for Dofus covering 185 factual dungeons, with bilingual FR/EN **4-block Combat Cards** readable mid-fight.

Press **Alt+D** to show/hide. Search for a dungeon or a monster (**Ctrl+M**), read the card in under 3 seconds — without leaving the game.

Official website: [dofuscompanion.com](https://dofuscompanion.com).

## Features

- **185 dungeons** covered (endgame 160+ prioritised) with factual DofusDB stats
- **Combat Cards** with a fixed 4-block structure for **141 bosses + 129 notable monsters**:
  - UNLOCK: actionable steps to win
  - CONSTRAINTS: rules to follow at all times
  - DANGERS: concrete punishments if you make a mistake
  - USEFUL INFO: resistances and secondary tips
- **Silence rule**: a monster with no mechanic shows no card (zero visual noise)
- **Dedicated monster view** (**Ctrl+M**): filtered list + full-screen card
- **Search by monster**: typing "dompteuse" opens the dungeon with the card highlighted
- **Hide lambda toggle**: show only monsters with a mechanic within a dungeon
- **Bilingual FR/EN strategies** anchored to Fandom or LLM verbatim (zero hallucination)
- **Full traceability**: every bullet carries a source tag (native, anchored LLM)
- Transparent overlay always on top, draggable from the title bar
- Tray icon, global shortcut Alt+D, auto-update via the public release channel

## Installation

Download the official installer from [dofuscompanion.com/download](https://dofuscompanion.com/download).

> **Windows SmartScreen**: if the setup is blocked, click "More info" → "Run anyway". The installer is signed for the auto-updater (minisign Ed25519) but does not carry a Windows EV certificate.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| **Alt+D** | Show / Hide the overlay (global) |
| **Ctrl+M** | Toggle dedicated monster view (search + card) |
| ↑ ↓ | Navigate through results |
| Enter | Open the dungeon or monster |
| Backspace / Esc | Back / Close |
| `/` | Focus the search bar |
| **Ctrl+L** | Toggle language FR ⇄ EN |
| **V** or **Tab** | Toggle Actionable ⇄ Detailed view |

## Data

Merged factual sources:

| Source | Content | Coverage |
|--------|---------|----------|
| DofusDB | Stats: levels, HP, resistances, monsters | 185 dungeons (100%) |
| Fandom Wiki EN + FR | Boss strategies + monster pages | 143 bosses + 83 monsters |
| LLM | Anchored 4-block Combat Card extraction | 141 bosses + 129 monsters |
| Boss-mention fallback | Boss strategy paragraphs mentioning a monster | 58 additional monsters |

**Anti-hallucination**: every bullet in a Combat Card is anchored verbatim in the Fandom source text (similarity ≥ 0.75). Bullets whose anchor fails are automatically rejected. No bullet can appear in more than one block. Monsters with no usable source remain `combat: null`.

## Contributing

Issues, PRs, strategy corrections — the workflow is documented in [`docs/DATA-CONTRIBUTING.md`](docs/DATA-CONTRIBUTING.md) and [`docs/COMBAT-CARDS-CONTRIBUTING.md`](docs/COMBAT-CARDS-CONTRIBUTING.md). No CLA, no gatekeeping. Conventional Commits for commit messages.

For non-code feedback (suggestions, user-side bugs without a technical repro), you can also use the **[Feedback](https://dofuscompanion.com/retours)** page on the official website.

## License

[MIT](LICENSE). Copyright (c) 2026 Noureddine Stamboul & Elhadi Latreche.

Dofus Companion is an **unofficial** application. Dofus® is a registered trademark of Ankama Games. This project is neither endorsed by nor affiliated with Ankama.
