import { Hero } from "@/components/landing/Hero";
import { ValueProps } from "@/components/landing/ValueProps";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { RoadmapTeaser } from "@/components/landing/RoadmapTeaser";
import { Credits } from "@/components/landing/Credits";
import { SupportBlock } from "@/components/landing/SupportBlock";
import { getLatestRelease, pickPrimaryAsset } from "@/lib/release";
import { env } from "@/lib/env";

export default async function HomePage() {
  const { release } = await getLatestRelease();
  const asset = pickPrimaryAsset(release);
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Dofus Companion",
    applicationCategory: "GameApplication",
    operatingSystem: "Windows 10, Windows 11",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    softwareVersion: release.version.replace(/^v/, ""),
    downloadUrl: asset?.downloadUrl,
    url: siteUrl,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <Hero />
      <ValueProps />
      <FeaturesSection />
      <HowItWorks />
      <RoadmapTeaser />
      <Credits />
      <SupportBlock />
    </>
  );
}
