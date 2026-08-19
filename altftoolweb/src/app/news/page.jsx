// import NewsClient from "./NewsClient";
// import { createPageMetadata } from "@/platform/seo/generateMetadata";
// import { getNewsDataServer } from "./lib/getNewsDataServer";

// export const revalidate = 600; // Cache news feed for 10 minutes

// export async function generateMetadata() {
//   return createPageMetadata({
//     title: "Latest News & Updates – Tech, Tools and Trends",
//     description:
//       "Stay updated with the latest news on technology, digital tools, software updates, and online trends with AltFTool News.",
//     path: "/news",
//     keywords: ["technology news", "digital tools news", "software updates", "online trends"],
//   });
// }

// export default async function Page() {
//   const newsData = await getNewsDataServer();
//   return <NewsClient initialNewsData={newsData} />;
// }


import NewsHome from "./components/NewsHome";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getNewsDataServer } from "./lib/getNewsDataServer";

export const revalidate = 600;

export async function generateMetadata() {
  return createPageMetadata({
    title: "Latest News & Updates – Tech, Tools and Trends",
    description:
      "Stay updated with the latest news on technology, digital tools, software updates, and online trends with AltFTool News.",
    path: "/news",
    keywords: ["technology news", "digital tools news", "software updates", "online trends"],
    // Syndicated wire-service headlines the original publishers own — kept out
    // of the index (follow stays on so internal links still pass through).
    noindex: true,
  });
}

export default async function Page() {
  const newsData = await getNewsDataServer();
  return (
    <>
      {/* CollectionPage + BreadcrumbList only, matching /news/topics/[topic].
          No ItemList of headlines: the stories come from live RSS feeds that
          rotate every revalidation (and the surface renders an honest
          "temporarily unavailable" state when the fetch fails), and
          /news/[slug] serves a noindex 404 once an item leaves the feed — so
          naming today's articles in schema would point crawlers at URLs this
          app expects to stop existing. */}
      <JsonLd
        id="news-home-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/news",
            name: "AltFTool News",
            description:
              "Latest technology, digital tools, software, and online trends news on AltFTool News.",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
          ]),
        ]}
      />
      <h1 className="sr-only">Latest technology, tools and trends news</h1>
      <NewsHome initialNewsData={newsData} />
    </>
  );
}
