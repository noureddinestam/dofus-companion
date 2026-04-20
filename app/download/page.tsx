import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { messages } from "@/lib/messages";
import { env } from "@/lib/env";
import { detectOs } from "@/lib/os";
import { getLatestRelease } from "@/lib/release";
import { OsBanner } from "@/components/download/OsBanner";
import { AssetCard } from "@/components/download/AssetCard";
import { SmartScreenNotice } from "@/components/download/SmartScreenNotice";
import { VerifyBlock } from "@/components/download/VerifyBlock";
import { VirusTotalBadge } from "@/components/download/VirusTotalBadge";

export const revalidate = 600;

export const metadata: Metadata = {
  title: messages.download.title,
  description: messages.download.subtitle,
  alternates: { canonical: "/download" },
  openGraph: {
    title: messages.download.title,
    description: messages.download.subtitle,
    url: `${env.NEXT_PUBLIC_SITE_URL}/download`,
  },
};

export default async function DownloadPage() {
  const hdrs = await headers();
  const os = detectOs(hdrs.get("user-agent"));
  const { release } = await getLatestRelease();

  const nsis = release.assets.find((a) => a.kind === "nsis");
  const msi = release.assets.find((a) => a.kind === "msi");
  const verifyAsset = nsis ?? msi ?? release.assets[0];
  const t = messages.download;
  const primaryAsset = nsis ?? msi ?? release.assets[0];
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Installer Dofus Companion sur Windows 10 / 11",
    description:
      "Guide d'installation pas à pas de l'overlay Dofus Companion. Trois étapes, moins d'une minute.",
    totalTime: "PT1M",
    supply: [
      { "@type": "HowToSupply", name: "Windows 10 ou Windows 11" },
      {
        "@type": "HowToSupply",
        name: "Connexion internet pour le téléchargement initial",
      },
    ],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Télécharger l'installeur",
        text: "Téléchargez l'installeur NSIS (.exe) ou MSI depuis la page /download. Environ 3 Mo, signé Tauri, vérifié VirusTotal.",
        url: primaryAsset?.downloadUrl,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Lancer le setup",
        text: "Double-cliquez l'installeur. Si Windows SmartScreen affiche un avertissement (certificat EV non présent), cliquez « Informations complémentaires » puis « Exécuter quand même ». L'empreinte SHA256 est affichée sur la page de téléchargement pour vérification.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Ouvrir l'overlay avec Alt+D",
        text: "Lancez Dofus, pressez Alt+D. L'overlay s'ouvre au-dessus du jeu. Tapez un nom de donjon ou de monstre pour chercher. Pas de compte nécessaire, fonctionne hors-ligne.",
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <header className="mb-10 max-w-2xl">
        <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
          {t.eyebrow}
        </p>
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t.title}
        </h1>
        <p className="text-muted">{t.subtitle}</p>
        <p className="text-muted mt-3 font-mono text-xs">
          Release {release.version} ·{" "}
          {new Date(release.publishedAt).toISOString().slice(0, 10)}
        </p>
      </header>

      <div className="mb-8">
        <OsBanner os={os} />
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {nsis && <AssetCard asset={nsis} sha256={nsis.sha256} highlighted />}
        {msi && <AssetCard asset={msi} sha256={msi.sha256} />}
      </div>

      <div className="mb-12 flex flex-wrap items-center gap-3">
        <VirusTotalBadge sha256={nsis?.sha256} />
        <a
          href={release.notesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:text-gold-soft text-xs font-medium transition-colors"
        >
          {t.notes.read} →
        </a>
      </div>

      <div className="mb-12">
        <SmartScreenNotice />
      </div>

      {verifyAsset && (
        <div className="mb-16">
          <VerifyBlock assetName={verifyAsset.name} />
        </div>
      )}

      <section className="border-border/70 bg-card/30 rounded-lg border p-6">
        <h2 className="mb-2 text-lg font-semibold">{t.previous.title}</h2>
        <p className="text-muted mb-4 text-sm">{t.previous.body}</p>
        <Link
          href="https://github.com/noureddinestam/dofus-companion/releases"
          className="text-gold hover:text-gold-soft text-sm font-medium transition-colors"
        >
          {t.previous.link} →
        </Link>
      </section>
    </div>
  );
}
