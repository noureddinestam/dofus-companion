import { ReactNode } from "react";

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  sections: readonly LegalSection[];
  footer?: ReactNode;
}

export function LegalPage({
  eyebrow,
  title,
  sections,
  footer,
}: LegalPageProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <header className="mb-10">
        <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
      </header>
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 text-lg font-semibold">{section.heading}</h2>
            <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
              {section.body}
            </p>
          </section>
        ))}
      </div>
      {footer && <div className="mt-10">{footer}</div>}
    </div>
  );
}
