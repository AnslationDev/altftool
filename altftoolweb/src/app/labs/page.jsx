import {
  createPageMetadata,
  createCollectionPageJsonLd,
  createItemListJsonLd,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import LabsClient from "./LabsClient";
import { GRID_EXPERIMENTS, LAB_GRADUATES } from "./data/experiments";

const PAGE_DESCRIPTION =
  "Explore every AltFTool interactive experiment from one organized hub, including SketchFlow, KeyCanvas, OpenAir Garden, Mockly, Pixel Thought, games, and discovery projects.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Labs - Interactive Experiments & Discovery",
    description: PAGE_DESCRIPTION,
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
  // Both arrays are rendered as visible, server-rendered cards by LabsClient —
  // GRID_EXPERIMENTS in the "Experiments" grid and LAB_GRADUATES in "Beyond the
  // Lab" — so the ItemList mirrors the page in document order and cannot drift.
  const listItems = [...GRID_EXPERIMENTS, ...LAB_GRADUATES].map((entry) => ({
    name: entry.name,
    path: entry.href,
  }));

  const jsonLd = [
    createCollectionPageJsonLd({
      path: "/labs",
      name: "AltFTool Labs",
      description: PAGE_DESCRIPTION,
    }),
    createItemListJsonLd({
      path: "/labs",
      name: "AltFTool Labs experiments and graduated projects",
      items: listItems,
    }),
  ].filter(Boolean);

  return (
    <>
      <JsonLd id="labs-schema" data={jsonLd} />
      <LabsClient />
    </>
  );
}
