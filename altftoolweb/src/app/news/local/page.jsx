import NewsListing from "../components/NewsListing";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getNewsDataServer } from "../lib/getNewsDataServer";

export const revalidate = 600;

export async function generateMetadata() {
  return createPageMetadata({
    title: "Local News & City Updates | AltFTool News",
    description: "Follow local headlines, community updates, and city news from AltFTool News.",
    path: "/news/local",
    keywords: ["local news", "city updates", "community news"],
    // Syndicated wire-service headlines the original publishers own — kept out
    // of the index (follow stays on so internal links still pass through).
    noindex: true,
  });
}

const DEFAULT_LOCATION = "India";

export default async function LocalPage({ searchParams }) {
  // Without a real geolocation flow, this page previously called
  // getNewsDataServer() with no location at all, making it byte-for-byte
  // identical to /news/headlines despite promising "local" coverage.
  // Support a ?city= param for a real per-city feed, and fall back to a
  // regional (not just global) feed by default instead of the plain global one.
  const params = (await searchParams) ?? {};
  const city = typeof params.city === "string" ? params.city.trim().slice(0, 80) : "";
  const location = city || DEFAULT_LOCATION;
  const newsData = await getNewsDataServer({ location });

  return (
    <>
      {/* No ItemList — the feed rotates on every request and /news/[slug] 404s
          (noindex) once an item drops out. See src/app/news/page.jsx. The name
          stays "Local News" because that is the heading the page renders for
          every ?city=; only the description tracks the resolved location. */}
      <JsonLd
        id="news-local-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/news/local",
            name: "Local News",
            description: `Local headlines and community updates for ${location}.`,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: "Local News", path: "/news/local" },
          ]),
        ]}
      />
      <NewsListing
        title="Local News"
        description={
          city
            ? `Local headlines and community updates for ${city}.`
            : `Local headlines and community updates for ${DEFAULT_LOCATION}. Add ?city=<your city> to the URL for a more specific feed.`
        }
        articles={newsData}
      />
    </>
  );
}
