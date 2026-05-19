import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";

const SITE_URL =
  process.env["NEXT_PUBLIC_SITE_URL"] ?? "https://dofuscompanion.com";
const LOGO_URL = `${SITE_URL}/brand/logo.png`;

export type FeedbackType = "bug" | "suggestion" | "strategy" | "other";

const TYPE_LABELS: Record<FeedbackType, string> = {
  bug: "Bug",
  suggestion: "Suggestion",
  strategy: "Stratégie",
  other: "Autre",
};

const TYPE_BADGE_COLORS: Record<
  FeedbackType,
  { bg: string; border: string; text: string }
> = {
  bug: { bg: "#3b1c1c", border: "#7d2929", text: "#fda4a4" },
  suggestion: { bg: "#1c2b3b", border: "#2e567a", text: "#a4c9fd" },
  strategy: { bg: "#3b2e1c", border: "#7d5e29", text: "#fdd8a4" },
  other: { bg: "#26221b", border: "#3a3528", text: "#c4b89c" },
};

export interface FeedbackReceivedEmailProps {
  type: FeedbackType;
  subject: string;
  email?: string;
  message: string;
  ip?: string;
  receivedAt?: string;
}

export default function FeedbackReceivedEmail({
  type,
  subject,
  email,
  message,
  ip,
  receivedAt,
}: FeedbackReceivedEmailProps) {
  const badge = TYPE_BADGE_COLORS[type];
  const formattedDate =
    receivedAt ??
    new Date().toLocaleString("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    });
  const previewText = `${TYPE_LABELS[type]} · ${subject}`;

  return (
    <Html lang="fr">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                gold: "#e8b547",
                "gold-soft": "#c4923a",
                background: "#0a0805",
                surface: "#13100a",
                border: "#26221b",
                cream: "#f2ead8",
                muted: "#8a7d68",
              },
              fontFamily: {
                sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
                mono: ['"JetBrains Mono"', '"Courier New"', "monospace"],
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-background m-0 p-0 font-sans">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto max-w-[600px] px-6 py-10">
            <Section className="mb-8">
              <table cellPadding={0} cellSpacing={0} border={0}>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: "12px" }}>
                    <Img
                      src={LOGO_URL}
                      alt="Dofus Companion"
                      width="40"
                      height="40"
                      className="block rounded"
                    />
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <Text className="text-gold m-0 font-mono text-xs font-semibold tracking-[0.22em] uppercase">
                      Dofus Companion
                    </Text>
                    <Text className="text-muted m-0 mt-1 text-[11px] tracking-wide">
                      dofuscompanion.com / retours
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            <Section
              className="rounded-xl border-solid p-8"
              style={{
                backgroundColor: "#13100a",
                borderColor: "#26221b",
                borderWidth: "1px",
              }}
            >
              <Text
                className="m-0 mb-3 inline-block rounded border-solid font-mono text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{
                  backgroundColor: badge.bg,
                  borderColor: badge.border,
                  borderWidth: "1px",
                  color: badge.text,
                  padding: "4px 10px",
                }}
              >
                {TYPE_LABELS[type]}
              </Text>
              <Heading
                as="h1"
                className="text-cream m-0 mb-6 text-2xl leading-tight font-semibold tracking-tight"
              >
                {subject}
              </Heading>

              <Hr className="border-border my-6 border-x-0 border-t-0 border-b border-solid" />

              <table cellPadding={0} cellSpacing={0} border={0} width="100%">
                <tr>
                  <td
                    width="120"
                    style={{ verticalAlign: "top", paddingBottom: "8px" }}
                  >
                    <Text className="text-muted m-0 font-mono text-[11px] tracking-[0.15em] uppercase">
                      Email
                    </Text>
                  </td>
                  <td style={{ verticalAlign: "top", paddingBottom: "8px" }}>
                    {email ? (
                      <Link
                        href={`mailto:${email}`}
                        className="text-gold text-sm no-underline"
                      >
                        {email}
                      </Link>
                    ) : (
                      <Text className="text-cream/60 m-0 text-sm italic">
                        non fourni
                      </Text>
                    )}
                  </td>
                </tr>
                <tr>
                  <td
                    width="120"
                    style={{ verticalAlign: "top", paddingBottom: "8px" }}
                  >
                    <Text className="text-muted m-0 font-mono text-[11px] tracking-[0.15em] uppercase">
                      Reçu le
                    </Text>
                  </td>
                  <td style={{ verticalAlign: "top", paddingBottom: "8px" }}>
                    <Text className="text-cream m-0 text-sm">
                      {formattedDate}
                    </Text>
                  </td>
                </tr>
                {ip && (
                  <tr>
                    <td
                      width="120"
                      style={{ verticalAlign: "top", paddingBottom: "8px" }}
                    >
                      <Text className="text-muted m-0 font-mono text-[11px] tracking-[0.15em] uppercase">
                        IP
                      </Text>
                    </td>
                    <td style={{ verticalAlign: "top", paddingBottom: "8px" }}>
                      <Text className="text-cream/70 m-0 font-mono text-xs">
                        {ip}
                      </Text>
                    </td>
                  </tr>
                )}
              </table>

              <Hr className="border-border my-6 border-x-0 border-t-0 border-b border-solid" />

              <Text className="text-muted m-0 mb-2 font-mono text-[11px] tracking-[0.15em] uppercase">
                Message
              </Text>
              <Text
                className="text-cream m-0 text-sm leading-relaxed"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {message}
              </Text>
            </Section>

            {email && (
              <Section className="mt-6 text-center">
                <Link
                  href={`mailto:${email}?subject=Re%3A%20${encodeURIComponent(subject)}`}
                  className="text-background bg-gold hover:bg-gold-soft box-border inline-block rounded-md px-6 py-3 text-sm font-semibold no-underline"
                  style={{ backgroundColor: "#e8b547", color: "#0a0805" }}
                >
                  Répondre à {email.split("@")[0]}
                </Link>
              </Section>
            )}

            <Section className="mt-10">
              <Text className="text-muted m-0 text-center font-mono text-[11px] tracking-[0.15em] uppercase">
                Notification de la page Retours
              </Text>
              <Text className="text-muted m-0 mt-2 text-center text-[11px] leading-relaxed">
                Envoyé via{" "}
                <Link href={SITE_URL} className="text-gold no-underline">
                  dofuscompanion.com
                </Link>
                . Cette boîte ne traite aucune donnée personnelle au-delà du
                message.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

FeedbackReceivedEmail.PreviewProps = {
  type: "bug",
  subject: "Klime: glyphe blanc en Bravoure ne s'affiche pas",
  email: "joueur@dofus.fr",
  message:
    "Hello, dans l'expédition Bravoure du Songe, le glyphe blanc de Klime ne s'affiche plus depuis le patch 3.2.\n\nReproductible à 100% sur 3 runs successives. J'ai vérifié sur 2 serveurs différents (Imagiro + Jiva).",
  ip: "82.66.xx.xx",
  receivedAt: "19 mai 2026 à 14:42",
} satisfies FeedbackReceivedEmailProps;
