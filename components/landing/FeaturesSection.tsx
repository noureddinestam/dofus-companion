import Link from "next/link";
import { getMessages } from "@/lib/messages";
import {
  ArrowRightIcon,
  CogIcon,
  KeyboardIcon,
  LayersIcon,
  SearchIcon,
  ShieldIcon,
  TargetIcon,
} from "@/components/icons/InlineIcons";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  search: SearchIcon,
  target: TargetIcon,
  shield: ShieldIcon,
  cog: CogIcon,
  layers: LayersIcon,
  keyboard: KeyboardIcon,
};

export async function FeaturesSection() {
  const m = await getMessages();
  const t = m.features;
  return (
    <section id="features" className="border-border/60 border-b py-20">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-14 max-w-2xl">
          <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
            {t.sectionEyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t.sectionTitle}
          </h2>
        </header>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item) => {
            const Icon = ICONS[item.icon] ?? TargetIcon;
            return (
              <li key={item.title}>
                <Link
                  href={`/decouvre#${item.anchor}`}
                  className="group border-border/70 bg-card/30 hover:border-gold/50 hover:bg-card/50 relative flex h-full flex-col gap-3 overflow-hidden rounded-lg border p-6 transition-colors"
                >
                  <span className="text-gold bg-gold/10 inline-flex h-9 w-9 items-center justify-center rounded-lg">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="text-muted flex-1 text-sm leading-relaxed">
                    {item.body}
                  </p>
                  <span className="text-muted group-hover:text-gold inline-flex items-center gap-1 pt-1 font-mono text-[11px] tracking-wide transition-colors">
                    <span aria-hidden>→</span>
                    <span className="sr-only">{t.cta}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex justify-center">
          <Link
            href="/decouvre"
            className="group border-border text-foreground/90 hover:border-gold/60 hover:text-gold inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
          >
            {t.cta}
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
