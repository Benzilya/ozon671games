import type { Metadata } from "next";
import CharactersClient from "./CharactersClient";
import "./characters.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Персонажи — Ozon 671 Stories",
  description: "Архив подтверждённых персонажей и связей вселенной Ozon671Games.",
};

export default function CharactersPage() {
  return <CharactersClient />;
}
