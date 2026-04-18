import { messages } from "@/lib/messages";

interface AnkamaDisclaimerProps {
  className?: string;
}

export function AnkamaDisclaimer({ className }: AnkamaDisclaimerProps) {
  return (
    <p
      className={`text-muted text-xs leading-relaxed ${className ?? ""}`.trim()}
      dangerouslySetInnerHTML={{ __html: messages.disclaimer.body }}
    />
  );
}
