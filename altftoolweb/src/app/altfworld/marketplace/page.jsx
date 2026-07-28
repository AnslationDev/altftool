import { MarketplaceView } from "../components/community/Views";
import { buildAltfWorldMetadata } from "../seo";

export function generateMetadata() {
  return buildAltfWorldMetadata({
    title: "Marketplace — AltfWorld",
    description: "Browse AltfWorld tools, templates, and services from independent builders.",
    path: "/altfworld/marketplace",
    keywords: ["builder marketplace", "templates", "creator tools"],
  });
}

export default function MarketplacePage() {
  return <MarketplaceView />;
}
