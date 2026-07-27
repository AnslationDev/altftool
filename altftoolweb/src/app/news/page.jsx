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
import { createPageMetadata } from "@/platform/seo/generateMetadata";
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
      <h1 className="sr-only">Latest technology, tools and trends news</h1>
      <NewsHome initialNewsData={newsData} />
    </>
  );
}
