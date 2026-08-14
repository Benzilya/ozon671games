import type { MetadataRoute } from "next";
import { siteUrl } from "./seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/ozon671games/", disallow: ["/ozon671games/admin.html", "/ozon671games/account.html"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
