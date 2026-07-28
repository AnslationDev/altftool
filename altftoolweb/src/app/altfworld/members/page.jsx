import { MembersView } from "../components/community/Views";
import { buildAltfWorldMetadata } from "../seo";

export function generateMetadata() {
  return buildAltfWorldMetadata({
    title: "Member Directory — AltfWorld",
    description:
      "Meet AltfWorld members, creators, and independent builders exploring tools, workflows, discussions, and useful digital resources.",
    path: "/altfworld/members",
    keywords: ["member directory", "creators", "builders"],
  });
}

export default function MembersPage() {
  return <MembersView />;
}
