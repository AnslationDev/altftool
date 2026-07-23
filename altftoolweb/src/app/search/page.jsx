import SearchContent from "./SearchContent";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { searchAltFTool } from "./searchIndex";

export const revalidate = 3600;

export async function generateMetadata() {
  return {
    ...(await createPageMetadata({
      title: "Search AltFTool",
      description:
        "Search AltFTool tools, extensions, guides, deals, academy resources, and digital workflows from one focused route.",
      path: "/search",
    })),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const query = String(params?.q || "").trim().slice(0, 100);
  const searchResult = query.length >= 2 ? await searchAltFTool(query) : null;

  return <SearchContent query={query} searchResult={searchResult} />;
}
