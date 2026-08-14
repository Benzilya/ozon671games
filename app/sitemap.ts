import type { MetadataRoute } from "next";
import { publicRoutes, siteUrl } from "./seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route, index) => ({
    url: `${siteUrl}${route || "/"}`,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : route.includes("tihiy-den") ? 0.9 : 0.7,
  }));
}
