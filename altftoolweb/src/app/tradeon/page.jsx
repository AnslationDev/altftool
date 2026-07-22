// src/app/tradeon/page.jsx
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import LandingClient from "./components/landing/LandingClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Tradeon — Financial Intelligence Platform",
    description:
      "Tradeon is an educational market workspace with public crypto pricing, illustrative multi-asset data, interactive charts and explainable model signals across stocks, crypto, forex, commodities, ETFs and indices.",
    path: "/tradeon",
    keywords: [
      "stock predictions",
      "real-time market dashboard",
      "multi-chart trading workspace",
      "crypto forex commodities analytics",
      "financial intelligence platform",
      "buy sell hold signals",
      "trading terminal",
    ],
    type: "website",
  });
}

export default function TradeonPage() {
  return <LandingClient />;
}
