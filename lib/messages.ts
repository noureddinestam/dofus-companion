import fr from "@/messages/fr.json";

// Phase 3: FR-only pinned at build time. Phase 6 will wire next-intl with
// FR/EN toggle (cookie persistence) and locale detection; until then, any
// import from this module returns FR. Keep new message keys mirrored in
// messages/en.json so Phase 6 is a swap, not a refactor.
export const messages = fr;

export type Messages = typeof fr;
