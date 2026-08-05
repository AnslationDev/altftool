import Search from "../pages/Search";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";

  // Clamped for the same reason as /fact-net/listings — ?q= reaches <title>
  // verbatim. This page is already noindex, so only the length matters here.
  // Branded in the string: the /fact-net layout consumes the root layout's
  // "%s | AltFTool" template, so this shipped unbranded at 15 characters.
  const clamped =
    query.length > 30 ? `${String(query).slice(0, 29).trimEnd()}…` : query;

  return createPageMetadata({
    title: clamped
      ? `Fact Hub Search - ${clamped} | AltFTool`
      : "Fact Hub Search | AltFTool",
    description:
      "Search the original Fact Hub by title, description, category, or topic record, and open any matching guide straight from the results.",
    path: "/fact-net/search",
    noindex: true,
    follow: true,
  });
}

export default async function Page({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return <Search searchParams={resolvedSearchParams} />;
}
