import type { Metadata } from "next";
import CharactersClient from "./CharactersClient";
import "./characters.css";

export const dynamic = "force-static";

const description = "Архив подтверждённых персонажей и связей вселенной Ozon671Games.";

export const metadata: Metadata = {
  title: "Персонажи — Ozon 671 Stories",
  description,
  alternates: { canonical: "/characters.html" },
  openGraph: { title: "Персонажи — Ozon 671 Stories", description, url: "/characters.html" },
};

export default function CharactersPage() {
  return <CharactersClient />;
}
