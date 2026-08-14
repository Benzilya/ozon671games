import type { Metadata } from "next";
import UniverseClient from "./UniverseClient";
import "./universe.css";

export const dynamic = "force-static";

const description = "Интерактивная карта произведений, персонажей, событий и локаций вселенной Ozon671Games.";

export const metadata: Metadata = {
  title: "Карта вселенной — Ozon 671 Stories",
  description,
  alternates: { canonical: "/universe.html" },
  openGraph: { title: "Карта вселенной — Ozon 671 Stories", description, url: "/universe.html" },
};

export default function UniversePage() {
  return <UniverseClient />;
}
