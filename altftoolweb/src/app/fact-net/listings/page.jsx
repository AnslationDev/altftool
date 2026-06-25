import Listings from "../pages/Listings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const title = query ? `Fact Hub results for ${query}` : "All Fact Hub Topics";

  return {
    title,
    description: "Browse the complete original Fact Hub catalog with category, count, and title filters.",
    alternates: {
      canonical: "/fact-net/listings",
    },
  };
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <Listings searchParams={resolvedSearchParams} />;
}
