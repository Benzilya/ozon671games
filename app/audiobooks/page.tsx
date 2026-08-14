import type { Metadata } from "next";
import AudiobooksClient from "./AudiobooksClient";
import "./audiobooks.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Аудиокниги — Ozon 671 Stories",
  description: "Каталог историй вселенной Ozon671Games с поиском и фильтрами.",
  alternates: { canonical: "/audiobooks.html" },
  openGraph: { title: "Аудиокниги — Ozon 671 Stories", description: "Каталог историй вселенной Ozon671Games.", url: "/audiobooks.html" },
};

export default function AudiobooksPage() {
  return <AudiobooksClient />;
}
