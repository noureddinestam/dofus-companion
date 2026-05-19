# Dofus Companion — Website

Site vitrine + download pour l'overlay Windows Dofus Companion.

Next.js 16 (App Router) · TypeScript strict · Tailwind 4 · déployé sur Vercel.

## Stack

- Next.js 16 + React 19 (App Router, Turbopack)
- Tailwind CSS 4 (CSS-first, tokens dans `app/globals.css`)
- Radix UI primitives (Dialog, Dropdown, Tabs)
- `next-intl` (FR par défaut, EN couvert)
- Lucide icons, Framer Motion (hero uniquement)
- Resend (formulaire `/retours`) + Zod (validation)

Le site **n'héberge aucun binaire**. Il proxy l'API GitHub Releases du repo public `noureddinestam/dofus-companion-releases` avec ISR + fallback JSON statique. Le code source de l'overlay reste privé.

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

| Clé                    | Utilité                                           | Scope   |
| ---------------------- | ------------------------------------------------- | ------- |
| `NEXT_PUBLIC_SITE_URL` | Metadata, OG, canonical                           | Public  |
| `GITHUB_TOKEN`         | Rate-limit API GitHub (60→5000 req/h)             | Serveur |
| `VIRUSTOTAL_API_KEY`   | Badge scan antivirus                              | Serveur |
| `RESEND_API_KEY`       | Envoi du formulaire `/retours` via Resend         | Serveur |
| `FEEDBACK_TO_EMAIL`    | Destinataire (défaut: contact@dofuscompanion.com) | Serveur |
| `FEEDBACK_FROM_EMAIL`  | Expéditeur (défaut: noreply@dofuscompanion.com)   | Serveur |

## Licence

Le code source de **ce site web** est sous licence MIT.

L'**application Dofus Companion** (overlay Windows) est un logiciel propriétaire et n'est pas couverte par cette licence. Dofus Companion est une application **non-officielle** développée par Noureddine & Elhadi L. Dofus® est une marque déposée d'Ankama Games. Ce projet n'est ni approuvé ni affilié à Ankama.
