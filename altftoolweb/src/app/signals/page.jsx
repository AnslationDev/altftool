import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { SIGNAL_CATALOG, SIGNAL_DATA_AS_OF } from "@altftool/core/signals";
import SignalsExplorer from "./SignalsExplorer";
import { getSignalCoverage, isSignalIndexable } from "./signalCoverage";

const description =
  "Worldwide product demand research with an honest coverage verdict on every category: what AltFTool has built, what is only partly covered, and what does not exist.";

// All counts are read from the catalogue and the coverage map at render time.
function countState(state) {
  return SIGNAL_CATALOG.filter((signal) => getSignalCoverage(signal.slug)?.state === state).length;
}

function buildAnswer() {
  const total = SIGNAL_CATALOG.length;
  return `AltF Signals is demand research on ${total} product categories, each with an AltFTool editorial opportunity score out of 100, a directional search-volume estimate and a live relative-interest chart from Google Trends. It also states the thing most opportunity lists leave out: AltFTool ships a working tool for ${countState("shipped")} of the ${total} categories, partly covers ${countState("partial")}, and has built nothing at all for ${countState("none")}.`;
}

function buildFaqs() {
  const total = SIGNAL_CATALOG.length;
  const missing = SIGNAL_CATALOG.filter((signal) => getSignalCoverage(signal.slug)?.state === "none");
  return [
    {
      question: "What is the AltF Signals opportunity score?",
      answer:
        "An AltFTool editorial judgement on a 0-100 scale, not a measured metric. It is not sourced from an SEO platform, it is not audited, and it is not a prediction of commercial success. Competition and momentum labels are editorial in the same way.",
    },
    {
      question: "Which numbers on AltF Signals are actually live?",
      answer: `One: the relative search-interest chart on each signal page, which is fetched from Google Trends when the page loads and is a 0-100 relative index rather than absolute volume. Everything else comes from a hand-reviewed snapshot last checked ${SIGNAL_DATA_AS_OF}.`,
    },
    {
      question: "Does AltFTool have a tool for every category it researches?",
      answer: `No. Of the ${total} tracked categories, ${countState("shipped")} have a working AltFTool tool and ${countState("partial")} are only partly covered. ${missing.length} have nothing behind them - ${missing.map((signal) => signal.name).join(", ")} - and those pages say so and are excluded from search indexing rather than competing for a query they cannot answer.`,
    },
    {
      question: "Can I get the AltF Signals data as JSON?",
      answer:
        "Yes. GET /api/signals returns the catalogue with a dataAsOf date, a count and a results array, and accepts q, category, momentum and sort parameters. It needs no API key and is rate limited to 60 requests per minute.",
    },
  ];
}

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltF Signals - Product & Search Opportunities",
    description,
    path: "/signals",
    keywords: ["product trends", "search demand", "startup opportunities", "market signals"],
  });
}

export default function SignalsPage() {
  const faqs = buildFaqs();

  return (
    <>
      <JsonLd
        id="altf-signals-schema"
        data={[
          createCollectionPageJsonLd({ path: "/signals", name: "AltF Signals", description }),
          createItemListJsonLd({
            path: "/signals",
            name: "AltF Signals opportunity research",
            // Signal pages with no product behind them are noindex, so they are
            // left out of the ItemList rather than advertised to crawlers.
            items: SIGNAL_CATALOG.filter((signal) => isSignalIndexable(signal.slug)).map((signal) => ({
              name: signal.name,
              path: `/signals/${signal.slug}`,
            })),
          }),
          createFaqJsonLd({ path: "/signals", questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Signals", path: "/signals" },
          ]),
        ]}
      />
      <SignalsExplorer answer={buildAnswer()} faqs={faqs} />
    </>
  );
}
