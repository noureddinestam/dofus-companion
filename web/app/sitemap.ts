import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

const ROUTES = [
  "/",
  "/download",
  "/security",
  "/changelog",
  "/faq",
  "/retours",
  "/contribute",
  "/support",
  "/legal/privacy",
  "/legal/terms",
  "/legal/licenses",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const now = new Date();
  return ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/changelog" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/download" ? 0.9 : 0.6,
  }));
}
