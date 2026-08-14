import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function Home() {
  return <HomeClient />;
}
