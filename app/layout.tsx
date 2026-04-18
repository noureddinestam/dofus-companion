import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { env } from "@/lib/env";
import { getLocale } from "@/lib/messages";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const DESCRIPTION =
  "Overlay Windows open source pour Dofus : 185 donjons, stratégies bilingues FR/EN, lisible en 10 secondes. Pas d'Alt+Tab, pas de pub, pas de tracking.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dofus Companion — l'overlay Dofus qui tient dans Alt+D",
    template: "%s · Dofus Companion",
  },
  description: DESCRIPTION,
  applicationName: "Dofus Companion",
  authors: [{ name: "noureddinestam" }],
  creator: "noureddinestam",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Dofus Companion",
    title: "Dofus Companion — l'overlay Dofus qui tient dans Alt+D",
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dofus Companion — l'overlay Dofus qui tient dans Alt+D",
    description: DESCRIPTION,
  },
  alternates: {
    canonical: "/",
    languages: {
      fr: "/",
      en: "/",
      "x-default": "/",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0e12",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
