import type { Metadata } from "next";
import MobileDock from "./MobileDock";
import { siteUrl } from "./seo";
import "./globals.css";
import "./navigation.css";
import "./accessibility.css";
import "./performance.css";
import "./loading-media.css";
import "./editorial-noir.css";
import "./home-editorial.css";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ozon 671 Stories — вселенная аудиокниг",
  description: "Аудиокниги, AI-фильмы и коллекционные издания вселенной Ozon671Games.",
  icons: { icon: `${publicBase}/favicon.svg` },
  openGraph: {
    title: "Ozon 671 Stories",
    description: "Истории, которые невозможно забыть",
    siteName: "Ozon 671 Stories",
    images: [{ url: `${publicBase}/og.png`, width: 1536, height: 800, alt: "Ozon 671 Stories — Вселенная аудиокниг" }],
    locale: "ru_RU",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Ozon 671 Stories", description: "Истории, которые невозможно забыть", images: [`${publicBase}/og.png`] },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ozon 671 Stories",
  alternateName: "Вселенная Ozon671Games",
  url: `${siteUrl}/`,
  description: "Аудиокниги, AI-фильмы и коллекционные издания вселенной Ozon671Games.",
  inLanguage: "ru",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <a className="skip-link" href="#main-content">Перейти к основному содержанию</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <div id="main-content" tabIndex={-1}>{children}</div>
        <MobileDock />
      </body>
    </html>
  );
}
