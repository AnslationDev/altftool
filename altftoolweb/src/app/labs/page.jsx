import {
  createPageMetadata,
  createCollectionPageJsonLd,
  createItemListJsonLd,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import LabsClient from "./LabsClient";
import { GRID_EXPERIMENTS, LAB_GRADUATES } from "./data/experiments";

// 172 characters, which trimMetaDescription cut to 153 ending "...games,
// and." — a dangling conjunction in the SERP. It also hardcoded six experiment
// names, so it would go stale the moment the catalog changed, and one of those
// names ("Pixel Thought") is still another product's brand.
//
// Both counts are read from the arrays LabsClient actually renders, so the
// sentence cannot drift from the page. The named capabilities each map to a
// real entry in the catalog: drawing → SketchFlow, ambient audio → Ambient
// Mixer, world radio → OpenAir Garden, quizzes → Quiz Studio and Personality
// Lab, arcade games → Games Arcade and AltF Games, reaction tests → Reflex Lab.
// No claim about accounts or pricing, because that is not verifiable per entry
// from here. 155 characters at the current 20 + 4, under the 158 ceiling.
const PAGE_DESCRIPTION = `Open ${GRID_EXPERIMENTS.length} AltFTool experiments from one hub — drawing, ambient audio, world radio, quizzes, arcade games and reaction tests — plus ${LAB_GRADUATES.length} that grew into products.`;

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
