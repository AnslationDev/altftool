import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";

// One description for the metadata, the related-content preset and the JSON-LD.
const DESCRIPTION =
  "Practice reaction time, memory, typing, aim, and visual sequence challenges with private local score history.";
const TAGS = ["reaction time test", "memory test", "typing test", "human benchmark"];

export const metadata = createPageMetadata({
  title: "AltF Reflex Lab | Reaction, Memory & Typing",
  description: DESCRIPTION,
  path: "/human-benchmark",
  keywords: TAGS,
  pageType: "interactive-experience",
});

export default function ReflexLabLayout({ children }) {
  const relatedItems = getRelatedContentForPreset(
    {
      href: "/human-benchmark",
      title: "AltF Reflex Lab | Reaction, Memory and Typing Tests",
      description: DESCRIPTION,
      tags: TAGS,
      section: "experiences",
    },
    "utility",
  );
  // The JSON-LD lives here rather than in page.jsx because page.jsx is
  // "use client" and this layout wraps exactly one URL — /human-benchmark has
  // no subroutes — so the nodes below cannot leak onto a page they do not
  // describe.
  //
  // SoftwareApplication/WebApplication + BreadcrumbList.
  //
  // Deliberately NOT emitted:
  //   * ItemList of the eight tests — components/HumanBenchmark.jsx opens each
  //     one with onClick/openTest(), in place. None of them has a URL, so every
  //     ListItem would carry /human-benchmark (the case /top10 documents).
  //   * HowTo from FEATURE_STEPS — those three cards render as a feature grid
  //     with no ordinal and no procedure heading; calling them a HowTo would be
  //     asserting a shape the page does not present.
  //   * Any score, attempt or "best" figure — useScores() reads localStorage,
  //     so the "Attempts"/"Completed" tiles are one visitor's own numbers and
  //     are zero in the server-rendered HTML.
  return (
    <>
      <JsonLd
        id="human-benchmark-schema"
        data={[
          createToolJsonLd({
            slug: "human-benchmark",
            path: "/human-benchmark",
            tool: {
              name: "AltF Reflex Lab",
              description: DESCRIPTION,
              category: ["Cognitive Tests", "Practice"],
              topics: TAGS,
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "AltF Reflex Lab", path: "/human-benchmark" },
          ]),
        ]}
      />
      {children}
      <RelatedContentSection title="Keep exploring AltFTool" items={relatedItems} />
    </>
  );
}
