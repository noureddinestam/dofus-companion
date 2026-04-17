// Heuristic extraction of strategic data from raw dungeon guide text

export interface MonsterPriorityHint {
  name: string;
  priority: 'critical' | 'danger' | 'caution' | 'manageable';
  reason: string;
}

export interface ScrapedStrategy {
  sourceUrl: string;
  bossStrategy: string | null;
  bossPhases: Array<{ trigger: string; behavior: string }>;
  instantKillConditions: string[];
  monsterHints: MonsterPriorityHint[];
  rawText: string;
}

// Keywords that suggest high priority targets
const CRITICAL_PATTERNS = [
  /tuer?\s+en\s+premier/i,
  /kill\s+first/i,
  /priorit[eé]\s+absolue/i,
  /\bfocus\b.*\bimmédiat/i,
  /commenc[ez]\s+par\s+tuer/i,
  /éliminer?\s+en\s+premier/i,
  /cible\s+prioritaire/i,
];

const DANGER_PATTERNS = [
  /tr[eè]s?\s+dangereux/i,
  /très?\s+puissant/i,
  /\bàoe\b/i,
  /zone\s+de\s+dégâts/i,
  /invoque/i,
  /buff\s+ses\s+alliés/i,
];

const CAUTION_PATTERNS = [
  /\battention\b/i,
  /\bprudence\b/i,
  /peut\s+être\s+dangereux/i,
  /\bdébuff\b/i,
  /vole\s+(des?\s+)?(pa|pm)/i,
];

const IGNORE_PATTERNS = [
  /\bignorable\b/i,
  /pas\s+dangereux/i,
  /\bfaible\b/i,
  /gérable\b/i,
  /peu\s+dangereux/i,
];

const INSTAKILL_PATTERNS = [
  /mort\s+instantanée?/i,
  /one.?shot/i,
  /tue\s+instantanément/i,
  /perd.*instantanément/i,
  /défaite\s+automatique/i,
];

function extractSentences(text: string): string[] {
  return text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.length < 300);
}

function detectPriority(
  sentence: string,
): 'critical' | 'danger' | 'caution' | 'manageable' | null {
  if (CRITICAL_PATTERNS.some((p) => p.test(sentence))) return 'critical';
  if (DANGER_PATTERNS.some((p) => p.test(sentence))) return 'danger';
  if (CAUTION_PATTERNS.some((p) => p.test(sentence))) return 'caution';
  if (IGNORE_PATTERNS.some((p) => p.test(sentence))) return 'manageable';
  return null;
}

function extractPhases(text: string): Array<{ trigger: string; behavior: string }> {
  const phases: Array<{ trigger: string; behavior: string }> = [];
  const phaseRegex =
    /(?:phase\s*\d+|quand?\s+(?:ses?\s+)?hp\s*[<>]\s*\d+%?|lorsqu[ei]\s+il\s+a\s+moins)/gi;

  const sentences = extractSentences(text);
  for (const s of sentences) {
    if (phaseRegex.test(s)) {
      phaseRegex.lastIndex = 0;
      // Try to extract a clean trigger + behavior pair
      const match = s.match(/^([^:]+):\s*(.+)$/) ?? s.match(/(.{10,50})\s+(.{10,})/);
      if (match) {
        phases.push({
          trigger: match[1].trim().slice(0, 80),
          behavior: match[2].trim().slice(0, 200),
        });
      }
    }
  }

  return phases.slice(0, 5);
}

export function extractStrategy(text: string, sourceUrl: string): ScrapedStrategy {
  const sentences = extractSentences(text);

  // Boss strategy: longest paragraph mentioning the boss or "stratégie"
  const strategyCandidate = sentences
    .filter(
      (s) => /stratégi|recommand|conseil|astuce|boss|tactique/i.test(s) && s.length > 40,
    )
    .sort((a, b) => b.length - a.length)[0] ?? null;

  // Instant kill conditions
  const instantKills = sentences
    .filter((s) => INSTAKILL_PATTERNS.some((p) => p.test(s)))
    .map((s) => s.slice(0, 200));

  // Monster priority hints: scan for monster names near priority keywords
  const monsterHints: MonsterPriorityHint[] = [];
  for (const sentence of sentences) {
    const priority = detectPriority(sentence);
    if (!priority) continue;

    // Try to extract a monster name (capitalized words near the priority keyword)
    const nameMatch = sentence.match(/([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ][a-zàâäéèêëîïôùûü]+(?:\s+[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ][a-zàâäéèêëîïôùûü]+)*)/);
    if (nameMatch && nameMatch[1].length > 2) {
      monsterHints.push({
        name: nameMatch[1],
        priority,
        reason: sentence.slice(0, 180),
      });
    }
  }

  return {
    sourceUrl,
    bossStrategy: strategyCandidate?.slice(0, 500) ?? null,
    bossPhases: extractPhases(text),
    instantKillConditions: instantKills.slice(0, 5),
    monsterHints: monsterHints.slice(0, 10),
    rawText: text.slice(0, 2000),
  };
}
