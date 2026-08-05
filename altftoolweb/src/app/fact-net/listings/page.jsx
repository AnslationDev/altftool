import Listings from "../pages/Listings";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  // ?q= is reflected into <title> and <h1>, and this page shipped
  // "index, follow" for every value of it — so any URL of the form
  // /fact-net/listings?q=<anything> was an indexable AltFTool page titled with
  // whatever the linker chose. The canonical already points at the clean path;
  // noindex on the filtered view is what actually keeps it out of the index.
  // The clamp keeps a long query from blowing the title past 60 characters.
  const raw = String(params?.q || "").replace(/\s+/g, " ").trim();
  const query = raw.length > 28 ? `${raw.slice(0, 27).trimEnd()}…` : raw;
  // Branded in the string: the /fact-net layout consumes the root layout's
  // "%s | AltFTool" template, so this shipped unbranded at 19 characters.
  const title = query
    ? `Fact Hub results for ${query} | AltFTool`
    : "All Fact Hub Topics | AltFTool";

  return createPageMetadata({
    title,
    description:
      "Browse the complete original Fact Hub catalog — every topic guide with its category, its fact count, and title and category filters to narrow the list.",
    path: "/fact-net/listings",
    noindex: Boolean(raw),
  });
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <Listings searchParams={resolvedSearchParams} />;
}
