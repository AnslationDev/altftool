import { SearchView } from "../components/community/Views";
import { buildAltfWorldMetadata } from "../seo";

export function generateMetadata() {
  return buildAltfWorldMetadata({
    title: "Search Discussions — AltfWorld",
    description: "Search AltfWorld community discussions, guides, tools, and builder resources.",
    path: "/altfworld/search",
    keywords: ["community search", "discussion search", "AltfWorld search"],
  });
}

export default function SearchPage() {
  return <SearchView />;
}
