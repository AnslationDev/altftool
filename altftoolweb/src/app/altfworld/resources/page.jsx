import { ResourcesView } from "../components/community/Views";
import { buildAltfWorldMetadata } from "../seo";

export function generateMetadata() {
  return buildAltfWorldMetadata({
    title: "Resources & Guides — AltfWorld",
    description: "Reading room, community guides, and builder documentation for the AltfWorld community.",
    path: "/altfworld/resources",
    keywords: ["community resources", "builder guides", "documentation"],
  });
}

export default function ResourcesPage() {
  return <ResourcesView />;
}
