import type { Metadata } from "next";
import AdminClient from "./AdminClient";
import "./admin.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "CMS Model — Ozon 671 Stories",
  description: "Read-only prototype of the Ozon671Games content administration model.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
