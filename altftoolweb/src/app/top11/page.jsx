import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import HomePage from "./components/home/HomePage";
import { isTop11Indexable } from "./data/indexPolicy";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Top 11 - The Global Ranking Index",
    description:
      "Browse Top 11 rankings across technology, sport, travel, science, education, and more. A more considered way to find the people, places, products, and ideas that define what is exceptional.",
    path: "/top11",
    // Kept in step with data/indexPolicy.js until the rankings carry real,
    // sourced data rather than illustrative figures.
    noindex: !isTop11Indexable("/top11"),
    follow: true,
  });
}

export default function Page() {
  return (
    <>
      <JsonLd
        id="top11-collection-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/top11",
            name: "Top 11 Rankings",
            description:
              "Top 11 rankings across technology, sport, travel, science, education, and more.",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top 11", path: "/top11" },
          ]),
        ]}
      />
      <HomePage />
    </>
  );
}
