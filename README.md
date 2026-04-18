# Dofus Companion — Website

Site vitrine + download pour l'overlay Windows [Dofus Companion](https://github.com/noureddinestam/dofus-companion).

Next.js 16 (App Router) · TypeScript strict · Tailwind 4 · déployé sur Vercel.

## Stack

- Next.js 16 + React 19 (App Router, Turbopack)
- Tailwind CSS 4 (CSS-first, tokens dans `app/globals.css`)
- Radix UI primitives (Dialog, Dropdown, Tabs)
- `next-intl` (FR par défaut, EN à venir en Phase 6)
- Lucide icons, Framer Motion (hero uniquement)

Le site **n'héberge aucun binaire**. Il proxy l'API GitHub Releases du repo parent avec ISR + fallback JSON statique.

## Scripts

```bash
npm run dev           # Dev server (Turbopack)
npm run build         # Build prod
npm run start         # Serve prod
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run format        # Prettier write
npm run format:check  # Prettier check
```

## Variables d'environnement

Copier `.env.example` → `.env.local`. Côté Vercel, définir par environnement (Preview + Production).

| Clé                    | Utilité                               | Scope   | Phase |
| ---------------------- | ------------------------------------- | ------- | ----- |
| `NEXT_PUBLIC_SITE_URL` | Metadata, OG, canonical               | Public  | 1     |
| `GITHUB_TOKEN`         | Rate-limit API GitHub (60→5000 req/h) | Serveur | 2     |
| `VIRUSTOTAL_API_KEY`   | Badge scan antivirus                  | Serveur | 4     |

## Phasage

Voir [`DOFUS_COMPANION_WEBSITE_BRIEF.md`](https://github.com/noureddinestam/dofus-companion/blob/main/DOFUS_COMPANION_WEBSITE_BRIEF.md) dans le repo parent.

- [x] Phase 1 — Bootstrap (layout, nav, footer, disclaimer, CI)
- [ ] Phase 2 — API + data layer (GitHub Releases)
- [ ] Phase 3 — Landing page
- [ ] Phase 4 — /download + /security
- [ ] Phase 5 — Pages secondaires
- [ ] Phase 6 — Polish + i18n EN
- [ ] Phase 7 — Launch

## Licence

MIT.

Dofus Companion est une application **non-officielle**. Dofus® est une marque déposée d'Ankama Games. Ce projet n'est ni approuvé ni affilié à Ankama.
