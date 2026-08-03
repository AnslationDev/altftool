// src/app/tradeon/outlook/page.jsx
// Weekly Outlook directory (index of /tradeon/outlook/[symbol] detail pages).
// Reached from the header "Weekly Outlook" nav item and the home "Stock outlook
// for the week" View All button.
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import WeeklyOutlookClient from "../components/outlook/WeeklyOutlookClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Weekly Stock Outlook — Support, Resistance & Trading Range | Tradeon",
    description:
      "Browse weekly outlooks across Indian stocks — pivot support & resistance, previous-week OHLC and the projected trading range for the week, on Tradeon.",
    path: "/tradeon/outlook",
    keywords: ["weekly stock outlook", "weekly outlook", "stock support resistance", "stock outlook for the week", "NSE weekly analysis"],
  });
}

export default function WeeklyOutlookPage() {
  return <WeeklyOutlookClient />;
}
