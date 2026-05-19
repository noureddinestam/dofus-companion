import { getMessages } from "@/lib/messages";
import {
  BoltIcon,
  TargetIcon,
  ShieldIcon,
} from "@/components/icons/InlineIcons";

const ICONS = {
  bolt: BoltIcon,
  target: TargetIcon,
  shield: ShieldIcon,
} as const;

type IconName = keyof typeof ICONS;

export async function ValueProps() {
  const m = await getMessages();
  const t = m.valueProps;
  return (
    <section className="border-border/60 border-b py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {t.sectionTitle}
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {t.items.map((item) => {
            const Icon = ICONS[item.icon as IconName];
            return (
              <li
                key={item.title}
                className="border-border/70 bg-card/40 hover:border-gold/40 rounded-lg border p-6 transition-colors"
              >
                <span
                  aria-hidden
                  className="bg-gold/10 text-gold ring-gold/30 mb-4 grid h-10 w-10 place-items-center rounded-md ring-1"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-muted text-sm leading-relaxed">
                  {item.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
