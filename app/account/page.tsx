import type { Metadata } from "next";
import AccountClient from "./AccountClient";
import "./account.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Личный кабинет — Ozon 671 Stories",
  description: "Локальный профиль, история прослушивания, избранное и демо-заказы Ozon671Games.",
};

export default function AccountPage() {
  return <AccountClient />;
}
