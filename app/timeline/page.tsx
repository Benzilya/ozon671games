import type { Metadata } from "next";
import TimelineClient from "./TimelineClient";
import "./timeline.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Хронология — Ozon 671 Stories",
  description: "Редакционная хронология подтверждённых событий вселенной Ozon671Games.",
};

export default function TimelinePage() {
  return <TimelineClient />;
}
