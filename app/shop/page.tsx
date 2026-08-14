import type { Metadata } from "next";
import ShopClient from "./ShopClient";
import "./shop.css";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Магазин — Ozon 671 Stories",
  description: "Коллекционные издания, постеры, одежда, аксессуары и цифровые материалы вселенной Ozon671Games.",
};

export default function ShopPage() {
  return <ShopClient />;
}
