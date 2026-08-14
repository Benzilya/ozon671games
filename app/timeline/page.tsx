import type { Metadata } from "next";
import TimelineClient from "./TimelineClient";
import "./timeline.css";

export const dynamic = "force-static";

const description = "Редакционная хронология подтверждённых событий вселенной Ozon671Games.";

export const metadata: Metadata = {
  title: "Хронология — Ozon 671 Stories",
  description,
  alternates: { canonical: "/timeline.html" },
  openGraph: { title: "Хронология — Ozon 671 Stories", description, url: "/timeline.html" },
};

export default function TimelinePage() {
  return <TimelineClient />;
}
