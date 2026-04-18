import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { messages } from "@/lib/messages";

export const metadata: Metadata = {
  title: messages.comingSoon.pages.faq.title,
};

export default function FaqPage() {
  return <ComingSoon pageKey="faq" />;
}
