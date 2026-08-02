import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import LabsClient from "./LabsClient";
import { ALL_EXPERIMENTS, LAB_GRADUATES } from "./data/experiments";

// Counts come from the shared experience catalog at render time so the copy,
// the metadata and the ItemList can never disagree with what is on the page.
// Today that is 24 experiments (4 featured + 20 in the grid) and 4 graduates;
// nothing below hardcodes either number, so growth cannot make the copy lie.
const EXPERIMENT_COUNT = ALL_EXPERIMENTS.length;
const GRADUATE_COUNT = LAB_GRADUATES.length;

export async function generateMetadata() {
  return createPageMetadata({
    // 47 characters. The previous title was 63 and, because it opens with the
    // brand, createPageMetadata marks it absolute — so the root template does
    // not shorten it and it rendered at 63 in full. Mobile is 84% of this
    // site's search clicks and truncates titles hardest.
    title: `AltFTool Labs - ${EXPERIMENT_COUNT} Free Interactive Experiments`,
    // 156 characters, ends in a period, so trimMetaDescription passes it
    // through untouched. The previous string was 204 and was cut at 158,
    // losing everything after "Pixel Thought" — the reader never saw the
    // typing tests or the games. Every experiment named here is in
    // EXPERIENCE_CATALOG.
    description: `${EXPERIMENT_COUNT} free interactive experiments from AltFTool, open in a browser with no account: SketchFlow, KeyCanvas, OpenAir Garden, Pixel Thought, Reflex Lab and more.`,
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
  // ItemList mirrors every linked card rendered by LabsClient: the experiment
  // grid plus the products shown in the "graduated from Labs" section.
  const visibleItems = [...ALL_EXPERIMENTS, ...LAB_GRADUATES];
  const jsonLd = [
    createCollectionPageJsonLd({
      path: "/labs",
      name: "AltFTool Labs",
      // Both counts, because the ItemList below is the two lists concatenated
      // — describing only the experiments would under-count the entity.
      description: `${EXPERIMENT_COUNT} free interactive experiments from AltFTool, each a browser page that opens without an account, plus the ${GRADUATE_COUNT} products that graduated out of Labs.`,
    }),
    createItemListJsonLd({
      path: "/labs",
      name: "AltFTool Labs experiments and graduates",
      items: visibleItems.map((experience) => ({
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
