// src/app/tradeon/outlook/[symbol]/page.jsx
// Legacy symbol URL — redirects to the SEO-friendly weekly-outlook slug route.
import { redirect } from "next/navigation";
import { outlookSlug } from "../../lib/slug";

export default async function TradeonOutlookRedirect({ params }) {
  const { symbol } = await params;
  redirect(`/tradeon/weekly-outlook/${outlookSlug(decodeURIComponent(symbol || ""))}`);
}
