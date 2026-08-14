import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { STATS, getSitesByVibe } from "@altftool/core/rabbithole";
import {
  CATEGORIES,
  REVIEWED_ON,
  TIME_BANDS,
  VIBES,
  getVibe,
} from "@altftool/core/rabbithole/taxonomy";
import PageHeader from "../../_components/PageHeader";
import SectionHeading from "../../_components/SectionHeading";
import SiteCard from "../../_components/SiteCard";
import { tonedStyle } from "../../_lib/presentation";

export const dynamicParams = false;

/* Cards rendered per time band.
   The prerendered page must stay under the 1 MiB response budget that
   scripts/check-prerender-size.mjs enforces, and "brainy" carries 197 of the
   340 entries — uncapped it rendered 1.27 MiB and failed the build. At 28 only
   brainy and mesmerising truncate at all; every other vibe is untouched, and
   the overflow is linked rather than dropped. */
const CARDS_PER_BAND = 28;

export function generateStaticParams() {
  return VIBES.map((vibe) => ({ slug: vibe.id }));
}

/**
 * Vibe pages exist because "calming websites" and "weird websites" are things
 * people type, and no category name answers them. They cut across all 18
 * categories, so they are a genuinely different view of the same catalog
 * rather than a duplicate of a category page.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vibe = getVibe(slug);
  if (!vibe) {
    return createPageMetadata({
      title: "Vibe not found",
      path: `/rabbithole/vibe/${slug}`,
      noindex: true,
    });
  }

  const count = getSitesByVibe(vibe.id).length;

  return createPageMetadata({
    // The numeral goes in the title AND the H1 — dropped from the H1 it gets
    // stripped from the rendered SERP result a quarter of the time.
    title: `${count} ${vibe.heading.toLowerCase()}, hand-checked`,
    description: vibe.metaDescription,
    path: `/rabbithole/vibe/${vibe.id}`,
    keywords: [
      vibe.heading.toLowerCase(),
      `best ${vibe.heading.toLowerCase()}`,
      `${vibe.label.toLowerCase()} websites`,
      "interesting websites",
      "websites to visit when bored",
    ],
  });
}

export default async function VibePage({ params }) {
  const { slug } = await params;
  const vibe = getVibe(slug);
  if (!vibe) notFound();

  const sites = getSitesByVibe(vibe.id);
  const path = `/rabbithole/vibe/${vibe.id}`;
  const others = VIBES.filter((item) => item.id !== vibe.id);

  // Which categories this vibe actually spans, biggest first. This is the
  // useful cross-reference a vibe page can offer that a category page cannot.
  const spread = CATEGORIES.map((category) => ({
    category,
    count: sites.filter((site) => site.category === category.id).length,
  }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);

  const grouped = TIME_BANDS.map((band) => ({
    band,
    sites: sites.filter((site) => site.timeToJoy === band.id),
  })).filter((group) => group.sites.length > 0);

  const quickest = sites.filter(
    (site) => site.timeToJoy === "instant" || site.timeToJoy === "one-minute",
  ).length;

  const faqs = [
    {
      question: `What makes a website ${vibe.label.toLowerCase()}?`,
      answer: `${vibe.intro} We tag a site ${vibe.label.toLowerCase()} only when that is the main thing you would say about it, so the list stays short enough to be useful — ${sites.length} of ${STATS.total} entries carry the tag.`,
    },
    {
      question: `Are these ${vibe.label.toLowerCase()} websites free?`,
      answer: `${sites.filter((site) => site.free && !site.needsAccount).length} of the ${sites.length} are free and need no account. The rest either want a sign-up or charge for part of what they do, and each entry's page says which.`,
    },
    {
      question: `Which is the best one to start with?`,
      answer: `If you have a minute, start with the ${quickest} tagged instant or a minute — they pay off before you have finished reading this. ${spread[0] ? `Most of this list sits in ${spread[0].category.name}, so that category is the natural next stop.` : ""}`,
    },
  ];

  const crumbs = [
    { name: "Rabbithole", path: "/rabbithole" },
    { name: vibe.heading, path },
  ];

  return (
    <div className="rh-toned bg-background" style={tonedStyle(vibe.tone)}>
      <JsonLd
        id={`rabbithole-vibe-${vibe.id}`}
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs]),
          createCollectionPageJsonLd({
            path,
            name: `${sites.length} ${vibe.heading.toLowerCase()}`,
            description: vibe.metaDescription,
          }),
          createItemListJsonLd({
            path,
            name: vibe.heading,
            items: sites.map((site) => ({
              name: site.name,
              path: `/rabbithole/site/${site.slug}`,
            })),
          }),
          createFaqJsonLd({ path, questions: faqs }),
        ]}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow="Sorted by vibe"
        toned
        title={`${sites.length} ${vibe.heading.toLowerCase()}`}
        // Answer-first: the opening paragraph states what the page is and what
        // is on it, because that top slice is what gets quoted back by search
        // and answer engines.
        lede={`${vibe.intro} All ${sites.length} were opened and written up by hand, and last checked on ${REVIEWED_ON.label}.`}
      >
        {spread.length ? (
          <div className="mt-6">
            <p className="rh-eyebrow mb-2">Found across</p>
            <ul className="flex flex-wrap gap-1.5">
              {spread.slice(0, 8).map(({ category, count }) => (
                <li key={category.id}>
                  <Link
                    href={`/rabbithole/category/${category.id}`}
                    className="rh-chip rh-toned transition hover:opacity-80"
                    style={tonedStyle(category.tone)}
                  >
                    {category.name}
                    <span className="opacity-60">{count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {grouped.map((group) => {
          const shown = group.sites.slice(0, CARDS_PER_BAND);
          const hidden = group.sites.length - shown.length;
          return (
            <section key={group.band.id} className="mb-14 last:mb-0">
              <SectionHeading
                eyebrow={`${group.sites.length} ${group.sites.length === 1 ? "site" : "sites"}`}
                title={group.band.label}
                description={group.band.hint}
              />
              <div className="rh-grid">
                {shown.map((site) => (
                  <SiteCard key={site.slug} site={site} />
                ))}
              </div>
              {hidden > 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">
                  {hidden} more {hidden === 1 ? "site" : "sites"} in this band.{" "}
                  <Link href="/rabbithole/browse" className="text-primary hover:underline">
                    Browse the full directory
                  </Link>{" "}
                  to filter by mood and time together.
                </p>
              ) : null}
            </section>
          );
        })}

        <section className="mt-16 border-t border-border pt-10">
          <h2 className="text-lg font-semibold text-foreground">
            Common questions
          </h2>
          <dl className="mt-3 divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <dt className="text-sm font-semibold text-foreground">
                  {faq.question}
                </dt>
                <dd className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-14">
          <SectionHeading
            eyebrow="Different mood"
            title="Other vibes"
            href="/rabbithole/browse"
            linkLabel="Filter everything"
          />
          <ul className="flex flex-wrap gap-2">
            {others.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/rabbithole/vibe/${item.id}`}
                  className="rh-chip rh-chip--toned rh-toned transition hover:opacity-80"
                  style={tonedStyle(item.tone)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
