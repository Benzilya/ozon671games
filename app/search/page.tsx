import type { Metadata } from "next";
import SearchClient from "./SearchClient";
import "./search.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Поиск — Ozon 671 Stories",
  description: "Глобальный поиск по произведениям и публичным разделам вселенной Ozon671Games.",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return <SearchClient />;
}
