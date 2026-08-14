import type { Metadata } from "next";
import UniverseClient from "./UniverseClient";
import "./universe.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Карта вселенной — Ozon 671 Stories",
  description: "Интерактивная карта произведений, персонажей, событий и локаций вселенной Ozon671Games.",
};

export default function UniversePage() {
  return <UniverseClient />;
}
