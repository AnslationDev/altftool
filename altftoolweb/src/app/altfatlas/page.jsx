import Link from "next/link";
import {
  ArrowRight,
  CircleSlash,
  Compass,
  Laptop,
  Search,
  Wrench,
} from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  ACCESS_LEVELS,
  CATEGORY_BY_SLUG,
  CATEGORY_GROUPS,
  COLLECTIONS,
  USE_CASES,
} from "@altftool/core/atlas/taxonomy";
import {
  entriesInCollection,
  getAtlasStats,
  getFacetCounts,
  getPopulatedCategories,
  LIVE_ENTRIES,
  RETIRED_ENTRIES,
} from "@altftool/core/atlas";
import SiteCard from "./_components/SiteCard";
import {
  AnswerBlock,
  AtlasSection,
  CategoryTile,
  FaqList,
  SectionHeading,
  StatStrip,
} from "./_components/Shell";

const description =
  "A curated directory of websites that do one useful thing in a browser tab. Every entry says what it costs you before it works, whether your files leave your device, and where the free version stops.";

const FAQS = [
  {
    question: "What is AltF Atlas?",
    answer:
      "AltF Atlas is a curated directory of websites and web apps that do a single useful job inside a browser tab — no installation and no server of your own. Every entry records three things most directories leave out: what it costs you before it does anything (open, free account, or freemium), whether your files are processed on your device or uploaded to theirs, and one honest sentence about where the free version stops.",
  },
  {
    question: "How is this different from the old '101 useful websites' lists?",
    answer:
      "Those lists were published once and never maintained, so roughly half of what they recommended is now a dead domain or a parked page. AltF Atlas treats link rot as a feature of the subject rather than an embarrassment: sites that shut down are not deleted, they move to the Archive with a working successor, so the question 'what replaced this?' has an answer instead of a 404.",
  },
  {
    question: "Does every site here really work without signing up?",
    answer:
      "No — and that is exactly why the access level is on every card. Entries marked Open do their main job with no account at all. Free account means it is free but there is a registration form in the way. Freemium means there is a genuinely usable free tier with a wall further in. You can filter by all three.",
  },
  {
    question: "What does 'runs on your device' mean?",
    answer:
      "It means the processing happens inside your browser using WebAssembly, Canvas or WebRTC, and the file is never uploaded anywhere. You can load the page, disconnect from the network, and it still works. For anything containing personal data — a scanned ID, a bank statement, a medical report — this is the difference that matters, so it is a filter rather than a footnote.",
  },
  {
    question: "Is AltF Atlas free, and are the listings paid placements?",
    answer:
      "Browsing is free with no account. Nothing in the Atlas is a paid placement — entries are included because they are the best or a distinctly different answer to a real question, and each one carries a stated limitation for the same reason.",
  },
  {
    question: "How do I suggest a site?",
    answer:
      "Use the Request a Tool form. The bar is that an entry has to be the best answer, or a meaningfully different answer, to a question someone actually asks — three near-identical PDF mergers is worse for a reader than one.",
  },
];

export async function generateMetadata() {
  const stats = getAtlasStats();
  return createPageMetadata({
    title: `AltF Atlas — ${stats.live} useful websites, checked and sorted`,
    description,
    path: "/altfatlas",
    keywords: [
      "useful websites",
      "best websites",
      "free online tools",
      "web apps no sign up",
      "useful web apps",
      "101 useful websites",
      "browser based tools",
      "websites directory",
    ],
  });
}

export default function AtlasHomePage() {
  const stats = getAtlasStats();
  const facets = getFacetCounts();
  const categories = getPopulatedCategories();

  const featured = entriesInCollection(
    "ten-tabs-instead-of-paid-software",
  ).slice(0, 6);
  // A thin collection must not produce an empty hero row, so fall back to the
  // on-device set and then to anything open-access.
  const spotlight = featured.length
    ? featured
    : LIVE_ENTRIES.filter((entry) => entry.runtime === "local").slice(0, 6);

  const topUseCases = USE_CASES.map((useCase) => ({
    ...useCase,
    count: facets.useCase[useCase.slug] || 0,
  }))
    .filter((useCase) => useCase.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topCollections = COLLECTIONS.map((collection) => ({
    ...collection,
    count: facets.collection[collection.slug] || 0,
  }))
    .filter((collection) => collection.count > 0)
    .slice(0, 6);

  const archiveSample = RETIRED_ENTRIES.slice(0, 3);

  return (
    <>
      <JsonLd
        id="altf-atlas-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/altfatlas",
            name: "AltF Atlas",
            description,
          }),
          createItemListJsonLd({
            path: "/altfatlas",
            name: "AltF Atlas categories",
            items: categories.map((category) => ({
              name: category.name,
              path: `/altfatlas/category/${category.slug}`,
            })),
          }),
          createFaqJsonLd({ path: "/altfatlas", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
          ]),
        ]}
      />

      {/* ------------------------------ Hero ------------------------------ */}
      <div className="afa-graticule relative border-b border-border">
        <AtlasSection className="py-12 sm:py-16">
          <p className="afa-eyebrow flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            AltF Atlas
          </p>

          <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {stats.live} websites that do one useful thing in a browser tab
          </h1>

          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            No installs, no server of your own, and no hunting through a pricing
            page to find out it needs a card. Every entry states what it costs
            you before it works, whether your files leave your device, and where
            the free version stops.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/altfatlas/browse"
              prefetch={false}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Browse everything
            </Link>
            <Link
              href="/altfatlas/collections/nothing-leaves-your-device"
              prefetch={false}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Laptop className="h-4 w-4" aria-hidden="true" />
              Nothing leaves your device
            </Link>
          </div>

          <div className="mt-9 max-w-3xl">
            <StatStrip
              stats={[
                { label: "Sites listed", value: stats.live },
                { label: "Need no sign-up", value: stats.open },
                { label: "Run on your device", value: stats.onDevice },
                { label: "Categories", value: stats.categories },
              ]}
            />
          </div>
        </AtlasSection>
      </div>

      {/* --------------------- Answer-first + the legend -------------------- */}
      <AtlasSection className="py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <AnswerBlock question="What is AltF Atlas?">
              AltF Atlas is a curated directory of {stats.live} websites that do
              a single useful job inside a browser tab — no installation, no
              server of your own. Every entry records what it costs you before
              it works, whether your files are processed on your device or
              uploaded, and one honest sentence about where the free version
              stops. Sites that shut down move to the{" "}
              <Link
                href="/altfatlas/archive"
                prefetch={false}
                className="font-medium text-primary underline underline-offset-2"
              >
                Archive
              </Link>{" "}
              with a working successor rather than being quietly deleted.
            </AnswerBlock>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Checked, not scraped",
                  body: "Every entry was opened and used. The classic viral lists are now roughly half link rot; this one records status as data instead of pretending it does not happen.",
                },
                {
                  title: "The limitation is the point",
                  body: "A directory where everything is described as excellent carries no information. Each entry names the wall you will hit — a size cap, a watermark, a missing export.",
                },
                {
                  title: "Privacy is a filter",
                  body: "Whether a tool processes your file in the browser or uploads it is the single most useful fact about it, so it is a filter you can apply rather than a footnote you have to hunt for.",
                },
              ].map((item) => (
                <div key={item.title} className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* The legend: teaches the access-stripe language once, up front. */}
          <aside className="min-w-0 rounded-lg border border-border bg-card p-5">
            <p className="afa-eyebrow">How to read a card</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The coloured rule down the left edge of every card is the access
              level. You only have to learn it once.
            </p>

            <ul className="mt-4 grid gap-3">
              {ACCESS_LEVELS.map((level) => (
                <li
                  key={level.id}
                  className={`afa-stripe afa-access-${level.id} rounded-r-md bg-muted/40 py-2 pl-3 pr-2`}
                >
                  <p className="text-[0.8125rem] font-semibold text-foreground">
                    {level.label}
                    <span className="afa-figure ml-2 text-xs font-normal text-muted-foreground">
                      {facets.access[level.id] || 0}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {level.blurb}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-4 grid gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
              <p className="flex items-start gap-2">
                <Laptop
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: "var(--afa-local)" }}
                  aria-hidden="true"
                />
                <span>
                  <strong className="font-semibold text-foreground">
                    On device
                  </strong>{" "}
                  — the file is processed in your browser and never uploaded.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <CircleSlash
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: "var(--afa-retired)" }}
                  aria-hidden="true"
                />
                <span>
                  <strong className="font-semibold text-foreground">
                    Retired
                  </strong>{" "}
                  — shut down, kept on record with a successor.
                </span>
              </p>
            </div>
          </aside>
        </div>
      </AtlasSection>

      {/* ---------------------------- Spotlight ---------------------------- */}
      {spotlight.length ? (
        <AtlasSection className="pb-12">
          <SectionHeading
            eyebrow="Start here"
            title="Ten tabs instead of paid software"
            description="Each of these does the part of a paid product that most people actually touch. None of them replace the professional tool at the top end, and every entry says where it stops."
            action={{
              href: "/altfatlas/collections/ten-tabs-instead-of-paid-software",
              label: "See the full stack",
            }}
          />
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {spotlight.map((entry) => (
              <li key={entry.slug} className="min-w-0">
                <SiteCard entry={entry} />
              </li>
            ))}
          </ul>
        </AtlasSection>
      ) : null}

      {/* ---------------------------- Categories --------------------------- */}
      <div className="border-y border-border bg-muted/30">
        <AtlasSection className="py-12">
          <SectionHeading
            eyebrow="The map"
            title="Every category in the Atlas"
            description="Twenty-four kinds of thing, from file conversion to the genuinely pointless corners of the web that people still send each other."
            action={{ href: "/altfatlas/categories", label: "Category index" }}
          />

          <div className="mt-8 grid gap-8">
            {CATEGORY_GROUPS.map((group) => {
              const groupCategories = group.slugs
                .map((slug) => categories.find((item) => item.slug === slug))
                .filter(Boolean);
              if (!groupCategories.length) return null;

              return (
                <div key={group.label}>
                  <p className="afa-eyebrow">{group.label}</p>
                  <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {groupCategories.map((category) => (
                      <li key={category.slug} className="min-w-0">
                        <CategoryTile category={category} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </AtlasSection>
      </div>

      {/* ----------------------------- By task ----------------------------- */}
      {topUseCases.length ? (
        <AtlasSection className="py-12">
          <SectionHeading
            eyebrow="By task"
            title="Start from the job, not the category"
            description="Most people do not want a category of software, they want a specific thing done in the next ten minutes."
            action={{ href: "/altfatlas/use-case", label: "All tasks" }}
          />
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topUseCases.map((useCase) => (
              <li key={useCase.slug} className="min-w-0">
                <Link
                  href={`/altfatlas/use-case/${useCase.slug}`}
                  prefetch={false}
                  className="afa-card group flex h-full flex-col rounded-lg border border-border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {useCase.name}
                  </span>
                  <span className="afa-figure mt-auto pt-3 text-xs text-muted-foreground">
                    {useCase.count} {useCase.count === 1 ? "site" : "sites"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </AtlasSection>
      ) : null}

      {/* --------------------------- Collections --------------------------- */}
      {topCollections.length ? (
        <AtlasSection className="pb-12">
          <SectionHeading
            eyebrow="Curated stacks"
            title="Collections"
            description="Opinionated, capped shortlists. The value of a shortlist is what it leaves out."
            action={{
              href: "/altfatlas/collections",
              label: "All collections",
            }}
          />
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topCollections.map((collection) => (
              <li key={collection.slug} className="min-w-0">
                <Link
                  href={`/altfatlas/collections/${collection.slug}`}
                  prefetch={false}
                  className="afa-card group flex h-full flex-col rounded-lg border border-border p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {collection.name}
                  </span>
                  <span className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    {collection.tagline}
                  </span>
                  <span className="afa-figure mt-auto pt-4 text-xs text-muted-foreground">
                    {collection.count} sites
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </AtlasSection>
      ) : null}

      {/* ----------------------------- Archive ----------------------------- */}
      {archiveSample.length ? (
        <div className="border-y border-border bg-muted/30">
          <AtlasSection className="py-12">
            <div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
              <div className="min-w-0">
                <p className="afa-eyebrow">The archive</p>
                <h2 className="mt-1.5 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {stats.retired} classics that did not survive
                </h2>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  The viral useful-website lists of the late 2000s recommended a
                  few hundred sites. Most of them are gone. Deleting them loses
                  the answer to a question people still ask — so every retired
                  entry keeps its record and names the site that does the job
                  now.
                </p>
                <Link
                  href="/altfatlas/archive"
                  prefetch={false}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-primary transition hover:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Open the archive
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {archiveSample.map((entry) => (
                  <li key={entry.slug} className="min-w-0">
                    <SiteCard entry={entry} />
                  </li>
                ))}
              </ul>
            </div>
          </AtlasSection>
        </div>
      ) : null}

      {/* -------------------------- AltFTool bridge ------------------------- */}
      <AtlasSection className="py-12">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 max-w-2xl">
              <p className="afa-eyebrow flex items-center gap-2">
                <Wrench
                  className="h-3.5 w-3.5 text-primary"
                  aria-hidden="true"
                />
                Built in
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-foreground">
                Where AltFTool does the job itself, the entry says so
              </h2>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                The Atlas points outward on purpose — a directory that only ever
                recommends its own products is an advert. But when one of
                AltFTool&apos;s own tools does the same job with no sign-up and
                no upload, the entry links to it alongside the external site so
                you can pick.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/all"
                prefetch={false}
                className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
              >
                Open the tools directory
              </Link>
              <Link
                href="/request-a-tool"
                prefetch={false}
                className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Suggest a site
              </Link>
            </div>
          </div>
        </div>
      </AtlasSection>

      {/* ------------------------------- FAQ ------------------------------- */}
      <AtlasSection className="pb-16">
        <SectionHeading eyebrow="Questions" title="About the Atlas" />
        <div className="mt-6 max-w-3xl">
          <FaqList faqs={FAQS} />
        </div>
      </AtlasSection>
    </>
  );
}
