import { AboutView } from "../components/community/Views";
import { buildAltfWorldMetadata } from "../seo";

export function generateMetadata() {
  return buildAltfWorldMetadata({
    title: "About AltfWorld",
    description:
      "Learn how AltfWorld brings AltFTool users, independent builders, creators, and privacy-minded digital explorers into one community space.",
    path: "/altfworld/about",
    keywords: ["community principles", "about AltfWorld"],
  });
}

export default function AboutPage() {
  return <AboutView />;
}
