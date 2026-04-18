import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// Phase 6 ships sitemap + canonical + hreflang, but indexing stays off
// until Phase 7 flips this rule and the layout-level `robots` metadata.
export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return {
    rules: { userAgent: "*", disallow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
