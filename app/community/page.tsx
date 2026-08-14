import type { Metadata } from "next";
import CommunityClient from "./CommunityClient";
import "./community.css";

export const dynamic = "force-static";

const description = "Стримы, фан-работы, опросы и каналы сообщества Ozon671Games.";

export const metadata: Metadata = {
  title: "Сообщество — Ozon 671 Stories",
  description,
  alternates: { canonical: "/community.html" },
  openGraph: { title: "Сообщество — Ozon 671 Stories", description, url: "/community.html" },
};

export default function CommunityPage() {
  return <CommunityClient />;
}
