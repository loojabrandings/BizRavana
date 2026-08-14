import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

/** Crawler policy — the public site is fully crawlable; authenticated and
 *  API areas are excluded (they aren't indexable content). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
