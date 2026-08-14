import type { Metadata } from "next";
import AdminClient from "./AdminClient";
import "./admin.css";
import "./operator.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "CMS Operator — Ozon 671 Stories",
  description: "Protected operator console for the Ozon671Games backend and content administration API.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
