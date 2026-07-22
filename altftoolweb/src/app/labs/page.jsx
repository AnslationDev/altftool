import { createPageMetadata } from "@/platform/seo/generateMetadata";
import LabsClient from "./LabsClient";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Labs – Early Experiments in Tools, Play & Discovery",
    description:
      "AltFTool Labs is our home for experiments — try early ideas like SketchFlow, OpenAir Garden, Patatap and Pixel Thought, and help shape what becomes an everyday AltFTool product.",
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
