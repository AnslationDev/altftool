import { HomeView } from "./components/community/Views";
import { buildAltfWorldMetadata, ALTFWORLD_DESCRIPTION } from "./seo";

export function generateMetadata() {
  return buildAltfWorldMetadata({
    title: "AltfWorld — Community for Independent Thinkers",
    description: ALTFWORLD_DESCRIPTION,
    path: "/altfworld",
  });
}

export default function HomePage() {
  return <HomeView />;
}
