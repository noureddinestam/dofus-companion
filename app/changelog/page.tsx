import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { messages } from "@/lib/messages";

export const metadata: Metadata = {
  title: messages.comingSoon.pages.changelog.title,
};

export default function ChangelogPage() {
  return <ComingSoon pageKey="changelog" />;
}
