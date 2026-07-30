import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import LabsClient from "./LabsClient";
import { ALL_EXPERIMENTS } from "./data/experiments";

// Counts come from the shared experience catalog at render time so the copy,
// the metadata and the ItemList can never disagree with what is on the page.
const EXPERIMENT_COUNT = ALL_EXPERIMENTS.length;

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Labs - Interactive Experiments, Creativity & Discovery",
    description: `AltFTool Labs is ${EXPERIMENT_COUNT} free interactive experiments you can open in a browser without an account — SketchFlow, KeyCanvas, OpenAir Garden, Pixel Thought, quizzes, typing and reaction tests, and browser games.`,
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
  // ItemList mirrors the experiment grid rendered by LabsClient — every entry
  // below is a visible, linked card on the page.
  const jsonLd = [
    createCollectionPageJsonLd({
      path: "/labs",
      name: "AltFTool Labs",
      description: `A collection of ${EXPERIMENT_COUNT} free interactive experiments from AltFTool, each one a browser page that opens without an account.`,
    }),
    createItemListJsonLd({
      path: "/labs",
      name: "AltFTool Labs experiments",
      items: ALL_EXPERIMENTS.map((experience) => ({
        name: experience.name,
        path: experience.href,
      })),
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Labs", path: "/labs" },
    ]),
  ].filter(Boolean);

  return (
    <>
      <JsonLd id="altftool-labs-schema" data={jsonLd} />
      <LabsClient />
    </>
  );
}
