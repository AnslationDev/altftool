// src/app/tradeon/page.jsx
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import LandingClient from "./components/landing/LandingClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Tradeon — Financial Intelligence Platform",
    description:
      "An educational market workspace with public crypto pricing, interactive multi-asset charts and explainable model signals for stocks, forex, ETFs and indices.",
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
