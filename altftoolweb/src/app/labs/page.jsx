import { createPageMetadata } from "@/platform/seo/generateMetadata";
import LabsClient from "./LabsClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Labs - Interactive Experiments, Creativity & Discovery",
    description:
      "Explore every AltFTool interactive experiment from one organized hub, including SketchFlow, KeyCanvas, OpenAir Garden, Mockly, Pixel Thought, games, and discovery projects.",
    path: "/labs",
    keywords: [
      "altftool labs",
      "experiments",
      "beta tools",
      "early access",
      "web experiments",
    ],
  });
}

export default function LabsPage() {
  return <LabsClient />;
}
