import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import { CALCULATORS } from "../toolsData";
import PageView from "./PageView";

// Length of the brand suffix this section's layout appends via its metadata
// title template ("%s | AltF Calculators"). Titles are built against it so the
// rendered <title> stays inside the ~60-character SERP budget.
const BRAND_SUFFIX_LENGTH = " | AltF Calculators".length;
const TITLE_BUDGET = 60;

// Names that already end in their own noun ("Percentage Calculator",
// "Currency Converter", "Quadratic Equation Solver") must not have "Calculator"
// appended a second time.
// Extended 2026-07-31: the original list covered only ten suffixes, so anything
// ending in another tool noun — "Dice Roller", "Base64 Encode / Decode" — had
// "Calculator" appended and the page asserted it was one. Measured across the
// section's names: 21 fell through, and the ones below are the shapes that did.
const SELF_NAMING =
  /(calculator|converter|solver|planner|checker|generator|timer|counter|tracker|analyzer|roller|encoder|decoder|formatter|validator|viewer|editor|finder|picker|tester|builder|maker|estimator|simulator|scanner|encode|decode|lookup|tool)$/i;

/**
 * "<name> — Free Online Calculator" put 59 of the 103 calculator pages over 60
 * characters once the layout's 19-character brand suffix landed — measured live,
 * e.g. "Percentage Calculator — Free Online Calculator | AltF Calculators" at 65.
 * Try the fullest form that fits and fall back, rather than shipping a title the
 * SERP truncates.
 */
function buildCalculatorTitle(name) {
  const candidates = [
    SELF_NAMING.test(name) ? `Free ${name}` : `Free ${name} Calculator`,
    `Free ${name}`,
    name,
  ];
  return (
    candidates.find(
      (candidate) => candidate.length + BRAND_SUFFIX_LENGTH <= TITLE_BUDGET,
    ) || name
  );
}

/**
 * Every one of the 103 `desc` strings in toolsData is a sentence fragment
 * between 18 and 58 characters — far under the ~70 a meta description needs to
 * be worth serving, so Google rewrote them all. The tail is keyed on category
 * so the 103 descriptions do not share one boilerplate ending, and it claims
 * only what this section already claims on the page itself.
 */
const DESCRIPTION_TAIL = {
  Finance: "Free to use, instant as you type, and worked out right in your browser.",
  Health: "Free to use, instant as you type, and worked out right in your browser.",
  Math: "Free, instant and worked out in your browser as you change the numbers.",
  "Date & Time": "Free and instant, with every date worked out right in your browser.",
  Education: "Free to use, instant, and worked out right in your browser — no sign-up.",
  Conversion: "Free and instant, with the conversion running right in your browser.",
  Developer: "Free and instant, and it runs right in your browser with no sign-up.",
  Construction: "Free and instant, with every measurement worked out in your browser.",
  Engineering: "Free and instant, with the whole calculation running in your browser.",
  Automobile: "Free and instant, with every figure worked out right in your browser.",
  Weather: "Free and instant, running right in your browser with nothing to install.",
  Fun: "Free and instant, and it runs right in your browser with no sign-up.",
};

export async function generateMetadata({ params }) {
  const { toolSlug } = await params;
  const tool = CALCULATORS.find((item) => item.slug === toolSlug);
  const path = `/altfcalculators/${toolSlug}`;

  // An unknown slug used to mint its own indexable page: formatToolName turned
  // the URL into a title, so /altfcalculators/not-a-real-calc served
  // "Not A Real Calc — Free Online Calculator" with robots index,follow, a
  // self-referencing canonical and an invented description ("Fast, accurate and
  // 100% private"), on a body that renders "Loading calculator…" and then
  // client-side redirects. That is an unbounded crawl trap — every typo or spam
  // link mints another indexable URL — and it is the same hole that was closed
  // on /tools/[category]. /altflovepdf/[toolSlug] already handles this correctly.
  //
  // The canonical stays self-referencing on purpose: noindex plus a canonical
  // pointing at a different URL is how a noindex travels to that URL.
  if (!tool) {
    return createPageMetadata({
      title: "Calculator Not Found",
      description:
        "This calculator does not exist. Browse the full AltFTool calculator suite for finance, health, maths, conversion and date and time tools.",
      path,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: buildCalculatorTitle(tool.name),
    description: `${tool.desc} ${DESCRIPTION_TAIL[tool.category] || DESCRIPTION_TAIL.Math}`,
    path,
  });
}

export default async function Page(props) {
  const { toolSlug } = await props.params;
  const tool = CALCULATORS.find((item) => item.slug === toolSlug);
  const relatedItems = tool
    ? getRelatedContent({
        source: {
          href: `/altfcalculators/${toolSlug}`,
          title: tool.name,
          description: tool.desc,
          tags: [tool.category, tool.sidebarCategory].filter(Boolean),
          section: "calculators",
        },
        slots: [
          { sections: ["blogs", "top9"], limit: 2 },
          { sections: ["tools", "pdfTools", "imageTools"], limit: 2 },
          { sections: ["experiences", "hubs"], limit: 2, minScore: 0 },
        ],
      })
    : [];

  return (
    <>
      {/* Without this the page carried only the layout's Organization and
          WebSite nodes, so it described no software at all. A /tools page
          ships a SoftwareApplication entity an answer engine can cite; a
          calculator is the same kind of thing and had nothing. */}
      {tool ? (
        <JsonLd
          id={`altfcalculators-schema-${toolSlug}`}
          data={[
            createToolJsonLd({
              slug: toolSlug,
              path: `/altfcalculators/${toolSlug}`,
              tool: {
                name: tool.name,
                description: tool.desc,
                category: tool.category,
              },
            }),
            createBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Calculators", path: "/altfcalculators" },
              { name: tool.name, path: `/altfcalculators/${toolSlug}` },
            ]),
          ]}
        />
      ) : null}
      <PageView {...props} />
      <RelatedContentSection
        title="Related tools & guides"
        items={relatedItems}
        path={`/altfcalculators/${toolSlug}`}
        jsonLdName="Related tools & guides"
      />
    </>
  );
}
