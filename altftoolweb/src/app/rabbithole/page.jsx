import Link from "next/link";
import { ArrowRight, Compass, Search } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { EXPERIENCE_CATALOG } from "@altftool/core/experiences";
import {
  ALTF_MATCHES,
  SITES,
  STATS,
  countByCategory,
  countByTimeBand,
  getCollectionSites,
  pickRotating,
} from "@altftool/core/rabbithole";
import {
  BRAND,
  CATEGORIES,
  COLLECTIONS,
  TIME_BANDS,
} from "@altftool/core/rabbithole/taxonomy";
import CategoryTile from "./_components/CategoryTile";
import PageHeader from "./_components/PageHeader";
import SectionHeading from "./_components/SectionHeading";
import SiteCard from "./_components/SiteCard";
import SiteMark from "./_components/SiteMark";
import SurpriseButton from "./_components/SurpriseButton";

const description = `${STATS.total} genuinely interesting websites, checked by hand and sorted by how long each one takes to be worth it. No listicle, no ads pretending to be entries — a directory you can filter.`;

const FAQS = [
  {
    question: "What is AltF Rabbithole?",
    answer: `A directory of ${STATS.total} websites that are strange, beautiful, useful or quietly brilliant, organised into ${CATEGORIES.length} categories. Every entry has its own page explaining what the site does and why it is worth opening, so you can decide before you click rather than after.`,
  },
  {
    question: "How is this different from a list of cool websites?",
    answer:
      "An article gives you thirty links in a fixed order and goes stale. This is a directory: you can filter by category, by how long a site takes to pay off, by the mood you are in, and by whether it works on a phone. Entries get corrected and added rather than republished with a new year in the title.",
  },
  {
    question: "Do I need an account to use any of these?",
    answer: `Mostly not. ${STATS.free} of the ${STATS.total} sites listed are free and ask for nothing before you can use them, and you can filter the directory down to only those.`,
  },
  {
    question: "How do sites get added?",
    answer:
      "Every entry is opened, used and written up by hand. Nothing is scraped, nobody pays to be listed, and links are checked so that dead sites come out rather than sitting in the list forever.",
  },
  {
    question: "What is the best website to visit when bored?",
    answer:
      "It depends how long you have. For under a minute, the Beautifully Useless and Generative Toys categories pay off immediately. For a proper evening, Wiki Dives and Explain Everything are the ones that swallow the most time. If you cannot choose, use the Surprise me button.",
  },
  {
    question: "Are the links safe to open?",
    answer:
      "Every site here was opened and used before being written up. They are ordinary public websites — no downloads, no installs, and nothing that needs a payment to see what it does.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: `${STATS.total} interesting websites, sorted properly`,
    description,
    path: "/rabbithole",
    keywords: [
      "interesting websites",
      "cool websites",
      "websites to visit when bored",
      "useless websites",
      "fun websites",
      "websites to kill time",
      "best websites on the internet",
    ],
  });
}

export default function RabbitholeHomePage() {
  const counts = countByCategory();
  const timeCounts = countByTimeBand();

  // Rotation seeds are constants rather than dates: the same build must always
  // produce the same HTML, and a build-time timestamp would silently make the
  // static output non-reproducible.
  const featured = pickRotating(
    SITES.filter((site) => site.timeToJoy !== "rabbit-hole"),
    8,
    "featured-v1",
  );
  const deepDives = pickRotating(
    SITES.filter((site) => site.timeToJoy === "rabbit-hole"),
    4,
    "deep-v1",
  );

  const altfSlugs = new Set(ALTF_MATCHES.map((site) => site.altfAlternative));
  const altfExperiences = EXPERIENCE_CATALOG.filter((experience) =>
    altfSlugs.has(experience.slug),
  ).slice(0, 6);

  const crumbs = [{ name: "Rabbithole", path: "/rabbithole" }];

  return (
    <div className="bg-background">
      <JsonLd
        id="rabbithole-home"
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs]),
          createCollectionPageJsonLd({
            path: "/rabbithole",
            name: `${BRAND.name} — ${STATS.total} interesting websites`,
            description,
          }),
          createItemListJsonLd({
            path: "/rabbithole",
            name: "Categories of interesting websites",
            items: CATEGORIES.map((category) => ({
              name: category.name,
              path: `/rabbithole/category/${category.id}`,
            })),
          }),
          createFaqJsonLd({ path: "/rabbithole", questions: FAQS }),
        ]}
      />

      <PageHeader
        eyebrow={BRAND.tagline}
        title={`${STATS.total} interesting websites, sorted properly`}
        lede={description}
      >
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="/rabbithole/browse"
            className="inline-flex h-11 items-center gap-2 rounded-[var(--anslation-ds-radius-pill)] bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search the directory
          </Link>
          <SurpriseButton
            slugs={SITES.map((site) => site.slug)}
            className="inline-flex h-11 items-center gap-2 rounded-[var(--anslation-ds-radius-pill)] border border-border px-5 text-sm font-medium text-foreground transition hover:border-primary"
          />
        </div>

        <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {[
            { value: STATS.total, label: "Sites listed" },
            { value: STATS.categories, label: "Categories" },
            { value: STATS.free, label: "Free, no sign-up" },
            // Not "we built 49 things" — 49 is how many listed sites have an
            // AltF counterpart, and several of them share one.
            { value: STATS.altfBuilds, label: "Have an AltF version" },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <section>
          <SectionHeading
            eyebrow="Start here"
            title="Eight that land immediately"
            description="A rotating cut of the directory, weighted towards sites that are worth it inside a minute."
            href="/rabbithole/browse"
            linkLabel="Browse all"
          />
          <div className="rh-grid">
            {featured.map((site) => (
              <SiteCard key={site.slug} site={site} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow={`${CATEGORIES.length} categories`}
            title="Pick a direction"
            description="Each category is its own page, with the sites grouped by how much time they ask for."
            as="h2"
          />
          <div className="rh-grid rh-grid--tight">
            {CATEGORIES.map((category) => (
              <CategoryTile
                key={category.id}
                category={category}
                count={counts[category.id]}
              />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Be honest"
            title="How long have you actually got?"
            description="The most useful filter in the directory, and the one no listicle gives you."
            as="h2"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TIME_BANDS.map((band) => (
              <Link
                key={band.id}
                href="/rabbithole/browse"
                className="rh-card group p-5"
              >
                <span className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                  {timeCounts[band.id]}
                </span>
                <span className="mt-1 block text-base font-medium text-foreground">
                  {band.label}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {band.hint}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow={`${COLLECTIONS.length} collections`}
            title="Sorted by mood, not topic"
            description="Cross-sections that cut across every category — for when you know how you want to feel, not what you want to read."
            href="/rabbithole/collections"
            linkLabel="All collections"
          />
          <div className="rh-grid rh-grid--tight">
            {COLLECTIONS.map((collection) => {
              const sites = getCollectionSites(collection.id);
              return (
                <article key={collection.id} className="rh-card p-4">
                  <h3 className="text-base font-semibold leading-tight text-foreground">
                    <Link
                      href={`/rabbithole/collections/${collection.id}`}
                      className="rh-card__link"
                    >
                      {collection.name}
                    </Link>
                  </h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {collection.blurb}
                  </p>
                  <div className="mt-3 flex -space-x-2" aria-hidden="true">
                    {sites.slice(0, 5).map((site) => (
                      <SiteMark
                        key={site.slug}
                        site={site}
                        size="sm"
                        className="ring-2 ring-[var(--card)]"
                      />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {deepDives.length ? (
          <section className="mt-16">
            <SectionHeading
              eyebrow="Clear your evening"
              title="The ones that take the whole night"
              description="Sites with enough depth that you will look up and find two hours gone."
              as="h2"
            />
            <div className="rh-grid">
              {deepDives.map((site) => (
                <SiteCard key={site.slug} site={site} />
              ))}
            </div>
          </section>
        ) : null}

        {altfExperiences.length ? (
          <section className="mt-16 rounded-[var(--anslation-ds-radius-2xl)] border border-border p-6 sm:p-8">
            <SectionHeading
              eyebrow="Built by AltF"
              title="Some of these we liked enough to build ourselves"
              description={`${STATS.altfBuilds} entries in the directory have an AltF equivalent — free, no account, and built to work on a phone.`}
              href="/rabbithole/built-by-altf"
              linkLabel="See all"
            />
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {altfExperiences.map((experience) => (
                <li key={experience.slug}>
                  <Link
                    href={experience.href}
                    className="group flex items-center gap-2 rounded-[var(--anslation-ds-radius-lg)] border border-border px-3.5 py-3 transition hover:border-primary"
                  >
                    <Compass
                      className="h-4 w-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {experience.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {experience.tagline || experience.description}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-16">
          <SectionHeading eyebrow="Questions" title="About this directory" as="h2" />
          <dl className="divide-y divide-border border-y border-border">
            {FAQS.map((faq) => (
              <div key={faq.question} className="py-5">
                <dt className="text-base font-semibold text-foreground">
                  {faq.question}
                </dt>
                <dd className="mt-2 max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
