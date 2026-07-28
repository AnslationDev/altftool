import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import {
  absoluteUrl,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import TestGuides from "./components/TestGuides";
import { BENCHMARK_TESTS, BENCHMARK_TEST_FAQS } from "./data/tests";

const PATH = "/human-benchmark";

// "AltF Reflex Lab" is a name only this site uses, so it no longer leads the
// title. Eight separate test queries land on this one URL; the title carries
// the four biggest and `keywords` names all eight.
const TITLE = "Reaction Time, Memory, Typing and Aim Tests";
const DESCRIPTION =
  "Eight browser tests of reaction time, memory, typing speed and aim. Scores are saved in your own browser, with no account and nothing uploaded.";
const KEYWORDS = [
  "reaction time test",
  "memory test",
  "typing test",
  "human benchmark",
  ...BENCHMARK_TESTS.map((test) => {
    const label = test.name.toLowerCase();
    // "Typing Test" and "Chimp Test" already end in the word.
    return label.endsWith(" test") ? label : `${label} test`;
  }),
];

export async function generateMetadata() {
  return createPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: PATH,
    keywords: [...new Set(KEYWORDS)],
    pageType: "interactive-experience",
  });
}

/**
 * SoftwareApplication node.
 *
 * `featureList` is the list of tests the app actually ships, read from
 * data/tests.js. No aggregateRating, no play count and no percentile: scores
 * here are per-browser and never collected, so there is no population figure
 * this site could honestly publish.
 */
function createReflexLabJsonLd() {
  const url = absoluteUrl(PATH);

  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${url}#software`,
    name: "AltF Reflex Lab",
    description: DESCRIPTION,
    url,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    browserRequirements:
      "Requires a modern web browser with JavaScript enabled",
    isAccessibleForFree: true,
    inLanguage: "en",
    featureList: BENCHMARK_TESTS.map(
      (test) => `${test.name}: ${test.measures}, scored in ${test.unit}`,
    ),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export default function ReflexLabLayout({ children }) {
  const relatedItems = getRelatedContentForPreset(
    {
      href: PATH,
      title: TITLE,
      description: DESCRIPTION,
      tags: ["reaction time test", "memory test", "typing test", "human benchmark"],
      section: "experiences",
    },
    "utility",
  );
  return (
    <>
      <JsonLd
        id="human-benchmark-schema"
        data={[
          createReflexLabJsonLd(),
          // Each anchor is a real section id rendered by TestGuides.jsx.
          createItemListJsonLd({
            path: PATH,
            name: "Cognitive tests on AltF Reflex Lab",
            items: BENCHMARK_TESTS.map((test) => ({
              name: test.name,
              path: `${PATH}#${test.anchor}`,
            })),
          }),
          createFaqJsonLd({ path: PATH, questions: BENCHMARK_TEST_FAQS }),
        ]}
      />
      {children}
      <TestGuides />
      <RelatedContentSection title="Keep exploring AltFTool" items={relatedItems} />
    </>
  );
}
