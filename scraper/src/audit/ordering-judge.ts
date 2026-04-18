import { judgeOrdering, estimateJudgeTokens } from '../llm/ordering-judge.ts';
import type { LlmCallOptions } from '../llm/client.ts';
import type { Bullet, CombatCard, Dungeon, Lang } from '../validate.ts';
import type { CardFlag } from './types.ts';

const SCORE_FLAG_THRESHOLD = 0.7;
const MIN_ACTIONS_FOR_JUDGE = 3;

interface JudgeCandidate {
  entity: CardFlag['entity'];
  card: CombatCard;
  /** The indices we consider "actions" — v0.5 has no kind field so we heuristically
   *  treat every unlock bullet as an action. In v0.5.1 this will read card.unlock
   *  bullets with kind='action'. */
  actionBullets: Array<{ index: number; bullet: Bullet }>;
  lang: Lang;
}

function pickLang(b: Bullet): Lang {
  // Prefer the bullet provenance lang when available; fallback to fr.
  if (b.provenance.kind === 'llm-grounded') return b.provenance.baseLang;
  if (b.provenance.kind === 'native') return b.provenance.lang;
  return 'fr';
}

function collectCandidates(dungeons: Dungeon[]): JudgeCandidate[] {
  const out: JudgeCandidate[] = [];
  const pushIfEligible = (card: CombatCard, entity: CardFlag['entity']) => {
    const actions = card.unlock.map((bullet, index) => ({ index, bullet }));
    if (actions.length < MIN_ACTIONS_FOR_JUDGE) return;
    const lang = pickLang(actions[0].bullet);
    out.push({ entity, card, actionBullets: actions, lang });
  };
  for (const d of dungeons) {
    if (d.boss.combat) {
      pushIfEligible(d.boss.combat, {
        kind: 'boss',
        id: d.boss.id,
        name: d.boss.name,
        dungeonId: d.id,
        dungeonName: d.name,
      });
    }
    for (const m of d.monsters) {
      if (m.id === d.boss.id) continue;
      if (!m.combat) continue;
      pushIfEligible(m.combat, {
        kind: 'monster',
        id: m.id,
        name: m.name,
        dungeonId: d.id,
        dungeonName: d.name,
      });
    }
  }
  return out;
}

export function estimateOrderingJudgeCost(dungeons: Dungeon[]): {
  candidates: number;
  tokensInputTotal: number;
  tokensOutputTotal: number;
} {
  const candidates = collectCandidates(dungeons);
  let tokensInputTotal = 0;
  let tokensOutputTotal = 0;
  for (const c of candidates) {
    const est = estimateJudgeTokens(c.actionBullets.map((a) => ({ text: a.bullet.text[c.lang] })));
    tokensInputTotal += est.input;
    tokensOutputTotal += est.output;
  }
  return { candidates: candidates.length, tokensInputTotal, tokensOutputTotal };
}

function scoreToSeverity(score: number): CardFlag['severity'] {
  if (score < 0.4) return 'high';
  if (score < 0.55) return 'medium';
  return 'low';
}

export interface OrderingJudgeOrchestratorOptions extends LlmCallOptions {
  onProgress?: (done: number, total: number, label: string) => void;
}

export async function detectOrderingFlags(
  dungeons: Dungeon[],
  options: OrderingJudgeOrchestratorOptions = {},
): Promise<CardFlag[]> {
  const candidates = collectCandidates(dungeons);
  const flags: CardFlag[] = [];
  const total = candidates.length;
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    options.onProgress?.(i + 1, total, c.entity.name);
    const result = await judgeOrdering(
      {
        actions: c.actionBullets.map((a) => ({ index: a.index, text: a.bullet.text[c.lang] })),
        lang: c.lang,
      },
      { dryRun: options.dryRun, model: options.model },
    );
    if (!result) continue;
    if (result.score >= SCORE_FLAG_THRESHOLD) continue;

    // Build the flag — we pin it to unlock[0] since the flag targets the whole
    // unlock block. The `details` payload carries the full suggested order so
    // Phase 4 can apply it deterministically.
    flags.push({
      bug: 'ordering',
      severity: scoreToSeverity(result.score),
      entity: c.entity,
      bullet: {
        location: { block: 'unlock', index: 0 },
        textFr: c.actionBullets[0].bullet.text.fr,
        textEn: c.actionBullets[0].bullet.text.en,
        anchorQuote: null,
      },
      signal: result.score,
      explanation: `Action ordering judge scored ${result.score.toFixed(2)}: ${result.reason}`,
      suggestion: `Reorder unlock bullets to match optimalOrder in details.`,
      details: {
        score: result.score,
        optimalOrder: result.optimalOrder,
        reason: result.reason,
        currentOrder: c.actionBullets.map((a) => a.index),
      },
    });
  }
  return flags;
}
