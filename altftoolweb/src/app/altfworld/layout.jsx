import CommunityHeader from "./components/layout/CommunityHeader";
import CommunityFooter from "./components/layout/CommunityFooter";
import { CompactSubHero } from "./components/community/Views";
import "./altfworld.css";

export const metadata = {
  title: "AltfWorld — Community for Independent Thinkers",
  description: "A community space with mock discussions, marketplace, and resources.",
};

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
