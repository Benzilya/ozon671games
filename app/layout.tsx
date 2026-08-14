import type { Metadata } from "next";
import MobileDock from "./MobileDock";
import "./globals.css";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

export const metadata: Metadata = {
  title: "Ozon 671 Stories — вселенная аудиокниг",
  description: "Аудиокниги, AI-фильмы и коллекционные издания вселенной Ozon671Games.",
  icons: { icon: `${publicBase}/favicon.svg` },
  openGraph: {
    title: "Ozon 671 Stories",
    description: "Истории, которые невозможно забыть",
    images: [{ url: `${publicBase}/og.png`, width: 1536, height: 800 }],
    locale: "ru_RU",
    type: "website",
  },
  twitter: { card: "summary_large_image", images: [`${publicBase}/og.png`] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        {children}
        <MobileDock />
      </body>
    </html>
  );
}
