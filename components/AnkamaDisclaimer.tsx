import { getMessages } from "@/lib/messages";

interface AnkamaDisclaimerProps {
  className?: string;
}

export async function AnkamaDisclaimer({ className }: AnkamaDisclaimerProps) {
  const m = await getMessages();
  return (
    <p
      className={`text-muted text-xs leading-relaxed ${className ?? ""}`.trim()}
      dangerouslySetInnerHTML={{ __html: m.disclaimer.body }}
    />
  );
}
