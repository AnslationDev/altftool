import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import RelatedContentSection from "@/platform/linking/RelatedContentSection";
import { getRelatedContentForPreset } from "@/platform/linking/relatedContent";
import {
  INCUMBENTS,
  INCUMBENT_CATEGORIES,
  INCUMBENT_SLUGS,
  getIncumbentsByCategory,
} from "./data/incumbents";

export const dynamic = "force-static";
export const revalidate = 86400;

const PATH = "/alternatives";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Free Alternatives to Popular Online Tools",
    description:
      "Honest comparisons of AltFTool with iLovePDF, Smallpdf, TinyPNG, CloudConvert and Adobe Acrobat online: free-tier limits, pricing and what each does best.",
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

        <section aria-labelledby="how-heading" className="mt-8 max-w-3xl">
          <h2 id="how-heading" className="text-lg font-semibold tracking-tight">
            The one structural difference
          </h2>
          <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            {`Most tools on this list upload your file to a server, process it there, and delete it
            some hours later. That is why they can OCR a scanned archive or encode a two-hour video,
            and it is also why they meter you — someone is paying for that compute. AltFTool's tools
            are JavaScript and WebAssembly that your browser downloads and runs locally, so nothing
            is uploaded and nothing needs counting. The cost is real: no OCR, no server-scale file
            sizes, no API, no saved work. Each page below states which of those matter for that
            specific product.`}
          </p>
        </section>

        {INCUMBENT_CATEGORIES.map((category) => {
          const entries = getIncumbentsByCategory(category.slug);
          if (!entries.length) return null;
          const headingId = `category-${category.slug}-heading`;
          return (
            <section key={category.slug} aria-labelledby={headingId} className="mt-10">
              <h2 id={headingId} className="text-xl font-semibold tracking-tight">
                {category.label}
              </h2>
              <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      href={`/alternatives/${entry.slug}`}
                      className="group flex h-full flex-col rounded-[12px] border border-(--border) bg-(--surface) p-4 transition hover:-translate-y-0.5 hover:border-(--primary) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) motion-reduce:transform-none"
                    >
                      <span className="text-sm font-semibold text-(--foreground)">
                        {`${entry.shortName || entry.name} alternative`}
                      </span>
                      <span className="mt-2 text-xs leading-5 text-(--muted-foreground)">
                        {entry.valueProp}
                      </span>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-(--primary-text)">
                        Read the comparison
                        <ArrowRight
                          className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 motion-reduce:transform-none"
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
