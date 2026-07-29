import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import RelatedContentSection from "@/platform/linking/RelatedContentSection";
import { getRelatedContentForPreset } from "@/platform/linking/relatedContent";
import {
  ALTFTOOL_POSITION,
  INCUMBENTS,
  INCUMBENT_CATEGORIES,
  INCUMBENT_SLUGS,
  getIncumbentCheckedOnRange,
  getIncumbentsByCategory,
} from "./data/incumbents";
import CitationBlock from "./components/CitationBlock";

export const dynamic = "force-static";
export const revalidate = 86400;

const PATH = "/alternatives";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Free Alternatives to Popular Online Tools",
    description:
      "Honest comparisons between AltFTool and the tools people already pay for — iLovePDF, Smallpdf, Adobe Acrobat online, TinyPNG, remove.bg, CloudConvert and more. Real free-tier limits, real pricing, and what each one still does better.",
    path: PATH,
    canonical: PATH,
    keywords: [
      "free alternatives to online tools",
      "iLovePDF alternative",
      "Smallpdf alternative",
      "TinyPNG alternative",
      "CloudConvert alternative",
      "browser based tools no upload",
    ],
  });
}

export default function AlternativesIndexPage() {
  const items = INCUMBENT_SLUGS.map((slug) => INCUMBENTS[slug]);
  // Provenance for the citation block, all of it derived on this render: the
  // URL from the canonical helper and the window from the records' own check
  // dates. Nothing here is a literal that could drift out of step with the
  // corpus.
  const { from, to } = getIncumbentCheckedOnRange();
  const citationUrl = absoluteUrl(PATH);
  const checkedWindow = from && from !== to ? `${from} to ${to}` : to;
  const related = getRelatedContentForPreset(
    {
      href: PATH,
      title: "Free alternatives to popular online tools",
      description:
        "Comparisons between AltFTool and hosted PDF, image, converter and calculator services.",
      tags: ["pdf", "image", "converter", "calculator", "developer", "comparison"],
      section: "alternatives",
    },
    "editorial",
  );

  return (
    <main className="bg-(--page) text-(--foreground)">
      <JsonLd
        id="alternatives-index-schema"
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Alternatives", path: PATH },
          ]),
          createItemListJsonLd({
            path: PATH,
            name: "Free alternatives to popular online tools",
            items: items.map((entry) => ({
              name: `${entry.shortName || entry.name} alternative`,
              path: `/alternatives/${entry.slug}`,
            })),
          }),
        ]}
      />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 lg:px-8">
        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Free alternatives to the tools you already use
          </h1>
          <p className="mt-4 text-base leading-7 text-(--muted-foreground)">
            {`Every page below compares AltFTool with one specific product: what its free tier
            actually allows, what the paid plan costs, where your file goes, and — the part most
            comparison pages skip — what that product still does better than we do.`}
          </p>
          <p className="mt-3 text-base leading-7 text-(--muted-foreground)">
            {`The figures come from each vendor's own pricing, help and privacy pages, with the
            sources listed on the page and the date they were read. Several of these are excellent
            products that many of our readers pay for and should keep paying for. Where that is the
            case, the page says so.`}
          </p>
        </header>

        {/* Section ids on this page are part of its public surface: a citing
            article deep-links to one of them, so they are short, descriptive
            and must not be renamed casually. scroll-mt-24 clears the sticky
            header so the anchor lands on the heading rather than behind it. */}
        <section aria-labelledby="how-we-compare" className="mt-8 max-w-3xl scroll-mt-24">
          <h2 id="how-we-compare" className="text-lg font-semibold tracking-tight">
            The one structural difference
          </h2>
          {/* Scoped, never blanket. The processing sentence is quoted verbatim
              from ALTFTOOL_POSITION rather than re-worded here, because an
              unqualified "nothing is uploaded" is false for the tools that
              call a network API and is exactly the sentence an answer engine
              lifts out of a page like this one. */}
          <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            {`Most tools on this list upload your file to a server, process it there, and delete it some hours later. That is why they can OCR a scanned archive or encode a two-hour video, and it is also why they meter you — someone is paying for that compute. AltFTool made the opposite trade for the jobs these comparisons cover. ${ALTFTOOL_POSITION.processing} The cost of that trade is real: no OCR, no server-scale file sizes, no API, no saved work. Each page below states which of those matter for that specific product.`}
          </p>
        </section>

        {/* One wrapper section so the whole index has a single anchor to cite
            (#comparisons) and the category headings sit under it as h3s
            instead of competing with the page's other h2s. The count is read
            off the corpus, never written down. */}
        <section aria-labelledby="comparisons" className="mt-12 scroll-mt-24">
          <h2 id="comparisons" className="text-xl font-semibold tracking-tight sm:text-2xl">
            {`All ${items.length} comparisons`}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            {`Each card links to one full comparison. The date on a card is the day that vendor's pricing, help and privacy pages were last read.`}
          </p>

          {INCUMBENT_CATEGORIES.map((category) => {
            const entries = getIncumbentsByCategory(category.slug);
            if (!entries.length) return null;
            const headingId = `category-${category.slug}`;
            return (
              <section
                key={category.slug}
                aria-labelledby={headingId}
                className="mt-8 scroll-mt-24"
              >
                <h3 id={headingId} className="text-lg font-semibold tracking-tight">
                  {category.label}
                </h3>
                <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((entry) => (
                    <li key={entry.slug}>
                      <Link
                        href={`/alternatives/${entry.slug}`}
                        className="group flex h-full flex-col rounded-[12px] border border-(--border) bg-(--surface) p-4 transition hover:-translate-y-0.5 hover:border-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) motion-reduce:transform-none motion-reduce:transition-none"
                      >
                        <span className="text-sm font-semibold text-(--foreground)">
                          {`${entry.shortName || entry.name} alternative`}
                        </span>
                        <span className="mt-2 text-xs leading-5 text-(--muted-foreground)">
                          {entry.valueProp}
                        </span>
                        {entry.checkedOn ? (
                          <span className="mt-3 text-xs leading-5 text-(--muted-foreground)">
                            Sources checked{" "}
                            <time dateTime={entry.checkedOn}>{entry.checkedOn}</time>
                          </span>
                        ) : null}
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-(--primary-text)">
                          Read the comparison
                          <ArrowRight
                            className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </section>

        <CitationBlock
          url={citationUrl}
          checkedFrom={from}
          checkedTo={to}
          coverage={`${items.length} vendor comparisons, each with that vendor's free-tier limits and pricing transcribed from their own pages`}
          attribution={`AltFTool, "Free alternatives to popular online tools" — ${items.length} vendor comparisons checked ${checkedWindow}. ${citationUrl}`}
          anchors={[
            { label: "The comparison index", fragment: "comparisons" },
            { label: "The structural difference", fragment: "how-we-compare" },
          ]}
          note="Free-tier limits and prices are transcribed from each vendor's own pricing, help and privacy pages on the date shown, and are not converted between currencies — so quote the check date alongside any figure you take from here. Vendor links across these comparisons are plain links: no affiliate tracking, no referral IDs and no paid placement."
        />
      </div>

      <RelatedContentSection
        eyebrow="Keep exploring"
        title="Tools and guides to start with"
        items={related}
        path={PATH}
        jsonLdName="Related to the alternatives comparisons"
        id="alternatives-index-related-heading"
      />
    </main>
  );
}
