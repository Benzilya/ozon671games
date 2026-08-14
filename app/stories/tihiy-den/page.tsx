import type { Metadata } from "next";
import StoryClient from "./StoryClient";
import "./story.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Тихий Дэн — Ozon 671 Stories",
  description: "История обычного мойщика полов, чья жизнь навсегда изменилась после цепочки загадочных событий.",
};

export default function QuietDanPage() {
  return <StoryClient />;
}
