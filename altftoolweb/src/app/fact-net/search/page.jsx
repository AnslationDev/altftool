import Search from "../pages/Search";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";

  return createPageMetadata({
    title: query ? `Fact Hub Search - ${query}` : "Fact Hub Search",
    description: "Search original Fact Hub titles, descriptions, categories, and topic records.",
    path: "/fact-net/search",
    noindex: true,
    follow: true,
  });
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <Search searchParams={resolvedSearchParams} />;
}
