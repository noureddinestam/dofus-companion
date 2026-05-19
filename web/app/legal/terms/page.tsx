import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { messages } from "@/lib/messages";

const t = messages.legal.terms;

export const metadata: Metadata = {
  title: t.title,
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow={t.eyebrow} title={t.title} sections={t.sections} />
  );
}
