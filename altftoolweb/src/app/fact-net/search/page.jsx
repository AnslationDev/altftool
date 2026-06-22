import Search from "../pages/Search";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";

  return {
    title: query ? `Fact Hub Search - ${query}` : "Fact Hub Search",
    description: "Search original Fact Hub titles, descriptions, categories, and topic records.",
    alternates: {
      canonical: "/fact-net/search",
    },
  };
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <Search searchParams={resolvedSearchParams} />;
}
