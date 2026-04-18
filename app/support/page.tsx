import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { messages } from "@/lib/messages";

export const metadata: Metadata = {
  title: messages.comingSoon.pages.support.title,
};

export default function SupportPage() {
  return <ComingSoon pageKey="support" />;
}
