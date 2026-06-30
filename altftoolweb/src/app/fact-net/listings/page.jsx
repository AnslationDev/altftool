import Listings from "../pages/Listings";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";
  const title = query ? `Fact Hub results for ${query}` : "All Fact Hub Topics";

  return createPageMetadata({
    title,
    description: "Browse the complete original Fact Hub catalog with category, count, and title filters.",
    path: "/fact-net/listings",
  });
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <Listings searchParams={resolvedSearchParams} />;
}
