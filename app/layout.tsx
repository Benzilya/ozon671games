import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ozon 671 Stories — вселенная аудиокниг",
  description: "Аудиокниги, AI-фильмы и коллекционные издания вселенной Ozon671Games.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Ozon 671 Stories",
    description: "Истории, которые невозможно забыть",
    images: [{ url: "/og.png", width: 1536, height: 800 }],
    locale: "ru_RU",
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru"><body>{children}</body></html>;
}
