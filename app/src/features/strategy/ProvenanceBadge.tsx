import { openUrl } from '@tauri-apps/plugin-opener';
import type { Provenance } from '../../types/dungeon';
import { useI18n } from '../../i18n/useI18n';

const SOURCE_LABEL_KEYS: Record<
  'fandom-en' | 'fandom-fr' | 'gamosaurus' | 'manual',
  'fandomEn' | 'fandomFr' | 'dofusdb'
> = {
  'fandom-en': 'fandomEn',
  'fandom-fr': 'fandomFr',
  gamosaurus: 'dofusdb', // placeholder jusqu'à ce qu'on ajoute une clé dédiée
  manual: 'dofusdb',
};

export function ProvenanceBadge({ provenance }: { provenance: Provenance }) {
  const { t } = useI18n();

  if (provenance.kind === 'native') {
    const sourceLabel = t.source[SOURCE_LABEL_KEYS[provenance.source] ?? 'fandomEn'];
    return (
      <BadgeLink
        tone="neutral"
        onClick={() => openUrl(provenance.sourceUrl)}
        title={provenance.sourceUrl}
      >
        <span style={{ opacity: 0.7 }}>•</span> {t.provenance.native} — {sourceLabel} ↗
      </BadgeLink>
    );
  }

  if (provenance.kind === 'llm-grounded') {
    const sourceLabel = t.source[SOURCE_LABEL_KEYS[provenance.baseSource] ?? 'fandomEn'];
    return (
      <BadgeLink
        tone="warn"
        onClick={() => openUrl(provenance.baseSourceUrl)}
        title={`${provenance.model} / ${provenance.promptVersion} — ${provenance.baseSourceUrl}`}
      >
        ⓘ {t.provenance.llmGrounded(sourceLabel)} · {t.provenance.viewOriginal} ↗
      </BadgeLink>
    );
  }

  // community
  return (
    <BadgeLink
      tone="info"
      onClick={() => openUrl(provenance.prUrl)}
      title={provenance.prUrl}
    >
      ⓘ {t.provenance.community(`@${provenance.contributor}`)} · {t.provenance.viewPr} ↗
    </BadgeLink>
  );
}

function BadgeLink({
  tone,
  onClick,
  title,
  children,
}: {
  tone: 'neutral' | 'warn' | 'info';
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const color =
    tone === 'warn'
      ? 'var(--priority-caution)'
      : tone === 'info'
        ? 'var(--accent)'
        : 'var(--text-muted)';
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'transparent',
        border: 'none',
        padding: '2px 0',
        color,
        fontSize: 10,
        fontFamily: 'var(--font-ui)',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {children}
    </button>
  );
}
