import { messages } from "@/lib/messages";
import { CodeBlock } from "@/components/ui/CodeBlock";

interface VerifyBlockProps {
  assetName: string;
}

export function VerifyBlock({ assetName }: VerifyBlockProps) {
  const t = messages.download.verify;
  const tCopy = messages.download.sha256;
  const command = t.commandTemplate.replace("{asset}", assetName);
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t.title}</h2>
        <p className="text-muted mt-2 max-w-2xl text-sm leading-relaxed">
          {t.body}
        </p>
      </div>
      <CodeBlock
        code={command}
        label="PowerShell"
        copyLabel={tCopy.copy}
        copiedLabel={tCopy.copied}
      />
    </section>
  );
}
