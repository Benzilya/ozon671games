import type { Metadata } from "next";
import FilmsClient from "./FilmsClient";
import "./films.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI-фильмы — Ozon 671 Stories",
  description: "Визуальный архив AI-концептов, фанатских адаптаций и материалов вселенной Ozon671Games.",
};

export default function FilmsPage() {
  return <FilmsClient />;
}
