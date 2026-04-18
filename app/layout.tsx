import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
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

export const metadata: Metadata = {
  title: {
    default: "Dofus Companion — l'overlay Dofus qui tient dans Alt+D",
    template: "%s · Dofus Companion",
  },
  description:
    "Overlay Windows open source pour Dofus : 185 donjons, stratégies bilingues FR/EN, lisible en 10 secondes. Pas d'Alt+Tab, pas de pub, pas de tracking.",
  applicationName: "Dofus Companion",
  authors: [{ name: "noureddinestam" }],
  creator: "noureddinestam",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0c0e12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
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
