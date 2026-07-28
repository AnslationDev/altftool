import CommunityHeader from "./components/layout/CommunityHeader";
import CommunityFooter from "./components/layout/CommunityFooter";
import { CompactSubHero } from "./components/community/Views";
import "./altfworld.css";
import { buildAltfWorldMetadata, ALTFWORLD_DESCRIPTION } from "./seo";

export function generateMetadata() {
  return buildAltfWorldMetadata({
    title: "AltfWorld — Community for Independent Thinkers",
    description: ALTFWORLD_DESCRIPTION,
    path: "/altfworld",
  });
}

export default function AltfWorldLayout({ children }) {
  return (
    <div className="altfworld-app-shell">
      <CompactSubHero />
      <CommunityHeader />
      {children}
      <CommunityFooter />
    </div>
  );
}
