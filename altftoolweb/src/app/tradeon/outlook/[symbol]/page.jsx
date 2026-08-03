// src/app/tradeon/outlook/[symbol]/page.jsx
// Legacy symbol URL — redirects to the SEO-friendly weekly-outlook slug route.
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { outlookSlug } from "../../lib/slug";

export async function generateMetadata({ params }) {
  const { symbol } = await params;
  const decodedSymbol = decodeURIComponent(symbol || "");
  const slug = outlookSlug(decodedSymbol);

  return createPageMetadata({
    title: "Weekly Stock Outlook Redirect | Tradeon",
    description:
      "This legacy Tradeon outlook URL redirects to the current weekly stock outlook page.",
    path: `/tradeon/outlook/${encodeURIComponent(decodedSymbol)}`,
    canonical: slug ? `/tradeon/weekly-outlook/${slug}` : "/tradeon/outlook",
    noindex: true,
  });
}

export default async function TradeonOutlookRedirect({ params }) {
  const { symbol } = await params;
  redirect(`/tradeon/weekly-outlook/${outlookSlug(decodeURIComponent(symbol || ""))}`);
}
