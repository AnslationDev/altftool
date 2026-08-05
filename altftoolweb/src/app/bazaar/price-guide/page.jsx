import Link from "next/link";
import { Info } from "lucide-react";

import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

import "../bazaar.css";
import BazaarShell from "../components/BazaarShell";
import GeoFaq from "../components/GeoFaq";
import { getCategoryIcon } from "../components/categoryIcons";
import { Breadcrumbs, LinkCloud, Note, SectionHead } from "../components/primitives";
import { CATEGORY_COUNT, getAllCategories } from "../data/categories";
import { LISTING_COUNT, formatPrice, getCategoryCounts, getPriceStats } from "../data/listings";

/**
 * /bazaar/price-guide — index of the per-category guides.
 *
 * The guides are the most quoted pages in a classifieds vertical, so the
 * methodology is stated up front and repeated on every child page: these are
 * ASKING prices from live ads, not transaction prices. Overstating that is how
 * a price guide turns into misinformation.
 */

export const dynamic = "force-dynamic";

const PATH = "/bazaar/price-guide";

const FAQS = [
  {
    question: "What is an AltF Bazaar price guide?",
    answer:
      "Each guide summarises the asking prices of every live ad in one category — the median, the 25th to 75th percentile range, and the cheapest and dearest ad — broken down by city and by subcategory. It exists so you can tell whether the ad in front of you is priced normally before you start negotiating.",
  },
  {
    question: "Are these the prices things actually sell for?",
    answer:
      "No, and that distinction matters. Bazaar can see what sellers ask; it cannot see what buyers finally pay, because the deal happens off-platform in cash or a bank transfer. Most ads are marked negotiable, so real sale prices tend to land below the medians shown here. Treat a guide as the ceiling of a fair range, not the price.",
  },
  {
    question: "How is the median calculated?",
    answer:
      "Ads with a price above zero are sorted from cheapest to dearest and the middle value is taken. The median is used instead of the average because one mispriced luxury listing drags an average badly, while the median barely moves. The 25th and 75th percentiles are read off the same sorted list.",
  },
  {
    question: "Why do some cities show no price at all?",
    answer:
      "Because they have no priced ads in that category. A city with zero ads gets no row rather than an invented number, and any row built from fewer than five ads is flagged so you read it as a single data point instead of a market rate.",
  },
  {
    question: "How often do the numbers change?",
    answer:
      "They are recomputed from the live corpus whenever a guide page is rebuilt, which happens at least daily. There is no manual editing step, so a guide can never quietly drift away from what is actually listed.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "Bazaar Price Guides — What Used Items Actually List For",
    description: `Median asking prices for all ${CATEGORY_COUNT} Bazaar categories, broken down by city and subcategory, from ${LISTING_COUNT} live classified ads. Know the range before you negotiate.`,
    path: PATH,
    keywords: [
      "used item price guide india",
      "second hand price list",
      "resale value india",
      "used car price guide",
      "used mobile price india",
    ],
  });
}

export default async function BazaarPriceGuideIndexPage() {
  const counts = getCategoryCounts();
  const rows = getAllCategories()
    .map((category) => ({
      category,
      count: counts.get(category.slug) || 0,
      stats: getPriceStats(category.slug),
    }))
    .sort((a, b) => b.count - a.count || a.category.name.localeCompare(b.category.name));

  const priced = rows.filter((row) => row.stats);
  const unpriced = rows.filter((row) => !row.stats);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Bazaar", path: "/bazaar" },
    { name: "Price guides", path: PATH },
  ];

  return (
    <BazaarShell>
      <JsonLd
        id="bazaar-price-guide-index"
        data={[
          createBreadcrumbJsonLd(crumbs),
          createCollectionPageJsonLd({
            path: PATH,
            name: "AltF Bazaar price guides",
            description: `Asking-price statistics for all ${CATEGORY_COUNT} AltF Bazaar categories.`,
          }),
          createFaqJsonLd({ path: PATH, questions: FAQS }),
        ]}
      />

      <div className="section-container px-4 pb-16 sm:px-6">
        <Breadcrumbs items={crumbs} />

        <header className="max-w-3xl pt-2">
          <h1 className="bzr-section-title text-2xl sm:text-3xl">Bazaar price guides</h1>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            Before you agree a price it helps to know what everyone else is asking. Each guide takes
            every priced ad in a category — {LISTING_COUNT.toLocaleString("en-IN")} ads across the
            whole marketplace — and reports the median, the range most ads fall into, and the
            extremes, split by city and by subcategory.
          </p>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            One caveat, stated once and repeated on every guide: these are asking prices from live
            listings. They are not confirmed sale prices, they are not valuations, and they are not
            advice on what to pay.
          </p>
        </header>

        <section className="bzr-section" aria-label="Price guides by category">
          <SectionHead
            title={`All ${CATEGORY_COUNT} category guides`}
            href="/bazaar/categories"
            linkLabel="Category directory"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {priced.map(({ category, count, stats }) => {
              const Icon = getCategoryIcon(category.icon);
              return (
                <Link
                  key={category.slug}
                  href={`/bazaar/price-guide/${category.slug}`}
                  className="rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card) p-4 hover:border-(--primary)"
                >
                  <span className="flex items-center gap-2">
                    <span className="bzr-cat-icon shrink-0">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold text-(--foreground)">{category.name}</span>
                  </span>
                  <span className="mt-3 block text-lg font-bold text-(--foreground)">
                    {formatPrice(stats.median)}
                  </span>
                  <span className="block text-xs text-(--muted-foreground)">
                    median ask · {formatPrice(stats.p25)} to {formatPrice(stats.p75)} typical
                  </span>
                  <span className="mt-2 block text-xs text-(--muted-foreground)">
                    from {stats.count} priced ads of {count.toLocaleString("en-IN")} live
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {unpriced.length > 0 ? (
          <section className="bzr-section" aria-label="Categories without price data">
            <SectionHead title="Categories with nothing to price" as="h2" />
            <p className="-mt-3 mb-3 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
              These categories carry ads, but none of them quote a price above zero — a giveaway
              listing has no market rate to report. Their guides exist and say exactly that.
            </p>
            <LinkCloud
              title="Still browsable"
              links={unpriced.map(({ category, count }) => ({
                href: `/bazaar/price-guide/${category.slug}`,
                label: `${category.name} (${count})`,
              }))}
            />
          </section>
        ) : null}

        <GeoFaq
          title="How these guides are built"
          items={FAQS}
          headingId="price-guide-faq"
          intro="Short answers to the questions the numbers on this page raise."
        />

        <Note icon={Info}>
          Looking for a local figure instead of a national one? Every city page carries a price
          snapshot for its busiest categories — start at the{" "}
          <Link href="/bazaar/cities">city directory</Link>.
        </Note>

        <section className="bzr-section">
          <LinkCloud
            title="Keep browsing"
            links={[
              { href: "/bazaar", label: "Bazaar home" },
              { href: "/bazaar/categories", label: "All categories" },
              { href: "/bazaar/cities", label: "All cities" },
              { href: "/bazaar/safety", label: "Safety guide" },
              { href: "/bazaar/help", label: "Help centre" },
            ]}
          />
        </section>
      </div>
    </BazaarShell>
  );
}
