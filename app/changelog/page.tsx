import type { Metadata } from "next";
import Link from "next/link";
import { messages } from "@/lib/messages";
import { fetchRecentReleases, type ReleaseSummary } from "@/lib/github";

export const revalidate = 600;

export const metadata: Metadata = {
  title: messages.changelog.title,
  description: messages.changelog.subtitle,
};

function formatDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function truncateBody(md: string, max = 400): string {
  const plain = md
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trimEnd()}…`;
}

async function loadReleases(): Promise<
  { releases: ReleaseSummary[]; available: true } | { available: false }
> {
  try {
    const releases = await fetchRecentReleases(15, 600);
    return { releases, available: true };
  } catch {
    return { available: false };
  }
}

export default async function ChangelogPage() {
  const t = messages.changelog;
  const result = await loadReleases();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <header className="mb-12 max-w-2xl">
        <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
          {t.eyebrow}
        </p>
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t.title}
        </h1>
        <p className="text-muted">{t.subtitle}</p>
      </header>

      {!result.available ? (
        <p className="border-border/70 bg-card/30 text-muted rounded-lg border p-6 text-sm">
          {t.unavailable}
        </p>
      ) : result.releases.length === 0 ? (
        <p className="border-border/70 bg-card/30 text-muted rounded-lg border p-6 text-sm">
          {t.empty}
        </p>
      ) : (
        <ul className="space-y-8">
          {result.releases.map((r) => (
            <li
              key={r.version}
              className="border-border/70 bg-card/30 rounded-lg border p-6"
            >
              <header className="mb-3 flex flex-wrap items-baseline gap-3">
                <h2 className="text-gold font-mono text-lg font-semibold">
                  {r.version}
                </h2>
                <span className="text-muted font-mono text-xs">
                  {formatDate(r.publishedAt)}
                </span>
                {r.isPrerelease && (
                  <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] tracking-[0.15em] text-amber-300 uppercase">
                    pre-release
                  </span>
                )}
              </header>
              <h3 className="text-foreground/90 mb-3 text-base font-semibold">
                {r.name}
              </h3>
              {r.bodyMarkdown && (
                <p className="text-muted mb-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {truncateBody(r.bodyMarkdown)}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <a
                  href={r.notesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-soft font-medium transition-colors"
                >
                  {t.viewNotes} →
                </a>
                <span className="text-muted font-mono">
                  {r.assetsCount} {t.downloads.toLowerCase()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10">
        <Link
          href="https://github.com/noureddinestam/dofus-companion/releases"
          className="text-gold hover:text-gold-soft text-sm font-medium transition-colors"
        >
          {t.fullHistory} →
        </Link>
      </p>
    </div>
  );
}
