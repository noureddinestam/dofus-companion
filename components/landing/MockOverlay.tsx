import heroDungeon from "@/data/hero-dungeon.json";
import { getLocale, getMessages } from "@/lib/messages";
import { SearchIcon } from "@/components/icons/InlineIcons";

type Severity = "critical" | "danger" | "caution" | "info";

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-rose-400",
  danger: "bg-gold",
  caution: "bg-amber-300",
  info: "bg-muted",
};

function formatMeta(template: string, min: number, max: number, count: number) {
  return template
    .replace("{min}", String(min))
    .replace("{max}", String(max))
    .replace("{count}", String(count));
}

export async function MockOverlay() {
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const t = m.mockOverlay;
  const short = heroDungeon.short[locale];
  const name = heroDungeon.name[locale];
  const levelMin = heroDungeon.levelRange[0] ?? 0;
  const levelMax = heroDungeon.levelRange[1] ?? 0;
  const meta = formatMeta(
    t.metaTemplate,
    levelMin,
    levelMax,
    heroDungeon.monsterCount,
  );
  const sourceHost = new URL(short.provenance.baseSourceUrl).host.replace(
    /^www\./,
    "",
  );

  return (
    <div
      aria-label="Dofus Companion overlay preview"
      role="img"
      className="relative mx-auto w-full max-w-xl"
    >
      <div className="bg-[radial-gradient(60%_60%_at_50%_0%,theme(colors.gold/15%),transparent_70%)] pointer-events-none absolute inset-0 -z-10" />
      <div className="border-border bg-card/90 overflow-hidden rounded-xl border shadow-[0_20px_80px_-30px_rgba(232,181,71,0.25)] backdrop-blur">
        <div className="border-border/60 flex items-center gap-3 border-b px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="bg-border h-2.5 w-2.5 rounded-full" />
            <span className="bg-border h-2.5 w-2.5 rounded-full" />
            <span className="bg-gold/70 h-2.5 w-2.5 rounded-full" />
          </span>
          <span className="text-muted font-mono text-[11px] tracking-[0.15em] uppercase">
            Dofus Companion
          </span>
          <span className="border-gold/30 bg-gold/10 text-gold ml-auto inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px]">
            {t.hotkey}
          </span>
        </div>
        <div className="space-y-4 px-4 py-4">
          <label className="border-border/70 bg-background/50 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <SearchIcon className="text-muted h-4 w-4" />
            <span className="text-foreground/90 flex-1 truncate font-mono">
              {t.searchValue}
            </span>
            <span
              aria-hidden
              className="text-muted font-mono text-[10px] tracking-[0.15em] uppercase"
            >
              {t.searchCounter}
            </span>
          </label>
          <div className="border-gold/25 bg-gold/[0.04] rounded-md border px-4 py-3">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <p className="text-foreground text-sm font-semibold">{name}</p>
              <p className="text-muted font-mono text-[11px]">{meta}</p>
            </div>
            <p className="text-gold mb-3 font-mono text-[10px] tracking-[0.15em] uppercase">
              {t.shortLabel}
            </p>
            <ul className="text-foreground/90 space-y-1.5 text-[13px] leading-relaxed">
              {short.bullets.map((bullet, i) => (
                <li key={i} className="flex gap-2">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      SEVERITY_DOT[bullet.severity as Severity] ??
                      SEVERITY_DOT.danger
                    }`}
                  />
                  {bullet.text}
                </li>
              ))}
            </ul>
            <p className="border-gold/15 text-muted mt-3 border-t pt-2 font-mono text-[10px]">
              {t.sourceLabel} ·{" "}
              <a
                href={short.provenance.baseSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold/80 hover:text-gold underline-offset-2 hover:underline"
              >
                {sourceHost}
              </a>
            </p>
          </div>
          <div className="text-muted flex items-center justify-between gap-3 pt-1 font-mono text-[10px] tracking-[0.15em] uppercase">
            <span>{t.keyhintBack}</span>
            <span>{t.keyhintView}</span>
            <span>{t.keyhintClose}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
