import { getMessages } from "@/lib/messages";
import { CodeBlock } from "@/components/ui/CodeBlock";

interface VerifyBlockProps {
  assetName: string;
}

export async function VerifyBlock({ assetName }: VerifyBlockProps) {
  const m = await getMessages();
  const t = m.download.verify;
  const tCopy = m.download.sha256;
  const intro = m.download.verifyMicroIntro;
  const command = t.commandTemplate.replace("{asset}", assetName);
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t.title}</h2>
        <p className="text-muted mt-2 max-w-2xl text-sm leading-relaxed">
          {t.body}
        </p>
        <p className="text-muted mt-2 text-xs italic">{intro}</p>
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
