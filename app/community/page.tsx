import type { Metadata } from "next";
import CommunityClient from "./CommunityClient";
import "./community.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Сообщество — Ozon 671 Stories",
  description: "Стримы, фан-работы, опросы и каналы сообщества Ozon671Games.",
};

export default function CommunityPage() {
  return <CommunityClient />;
}
