// src/app/tradeon/dashboard/page.jsx
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import DashboardClient from "../components/dashboard/DashboardClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Dashboard — Tradeon Command Center",
    description:
      "Your customizable Tradeon workspace: live market overview, watchlists, predictions, heatmaps, movers and news — all updating in real time.",
    path: "/tradeon/dashboard",
    keywords: ["trading dashboard", "market command center", "predictions dashboard", "live watchlist"],
    type: "website",
  });
}

export default function TradeonDashboardPage() {
  return <DashboardClient />;
}
