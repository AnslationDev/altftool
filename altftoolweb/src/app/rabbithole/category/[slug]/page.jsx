import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getSitesByCategory } from "@altftool/core/rabbithole";
import {
  CATEGORIES,
  REVIEWED_ON,
  TIME_BANDS,
  VIBES,
  getCategory,
} from "@altftool/core/rabbithole/taxonomy";
import CategoryIcon from "../../_components/CategoryIcon";
import PageHeader from "../../_components/PageHeader";
import SectionHeading from "../../_components/SectionHeading";
import SiteCard from "../../_components/SiteCard";
import { tonedStyle } from "../../_lib/presentation";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    return createPageMetadata({
      title: "Category not found",
      path: `/rabbithole/category/${slug}`,
      noindex: true,
    });
  }

  const count = getSitesByCategory(category.id).length;

  return createPageMetadata({
    // Leading with the count is what separates a directory result from the
    // "50 cool websites" articles it competes with in this SERP.
    title: `${count} ${category.name} sites worth your time`,
    description: category.metaDescription,
    path: `/rabbithole/category/${category.id}`,
    keywords: [
      category.name.toLowerCase(),
      `best ${category.name.toLowerCase()} websites`,
      "interesting websites",
      "cool websites",
      "websites to visit when bored",
    ],
  });
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const sites = getSitesByCategory(category.id);
  const path = `/rabbithole/category/${category.id}`;

  // Grouping by time band gives the page a real structure instead of one long
  // grid, and each heading is a question a visitor is actually asking.
  const grouped = TIME_BANDS.map((band) => ({
    band,
    sites: sites.filter((site) => site.timeToJoy === band.id),
  })).filter((group) => group.sites.length > 0);

  const siblings = CATEGORIES.filter((item) => item.id !== category.id);

  // Which vibes this category's sites actually carry, so the cross-links go
  // somewhere populated rather than listing all twelve regardless.
  const vibesHere = VIBES.map((vibe) => ({
    vibe,
    count: sites.filter((site) => site.vibes.includes(vibe.id)).length,
  }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);

  const crumbs = [
    { name: "Rabbithole", path: "/rabbithole" },
    { name: category.name, path },
  ];

  return (
    <div className="rh-toned bg-background" style={tonedStyle(category.tone)}>
      <JsonLd
        id={`rabbithole-category-${category.id}`}
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs]),
          createCollectionPageJsonLd({
            path,
            name: `${category.name} — ${sites.length} sites`,
            description: category.metaDescription,
          }),
          createItemListJsonLd({
            path,
            name: `${category.name} websites`,
            items: sites.map((site) => ({
              name: site.name,
              path: `/rabbithole/site/${site.slug}`,
            })),
          }),
        ]}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow="Category"
        toned
        // The count belongs in the H1, not only the title tag: when the numeral
        // is missing from the H1 it gets stripped from the rendered result a
        // meaningful share of the time.
        title={`${category.name}: ${sites.length} sites worth your time`}
        // Answer-first. The opening slice of a page is what gets quoted back by
        // search and answer engines, so it states what this is, how many, and
        // when it was last verified before anything else.
        lede={`${category.intro} All ${sites.length} were opened and written up by hand, and last checked on ${REVIEWED_ON.label}.`}
      >
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--anslation-ds-radius-lg)] text-[var(--rh-hue)]"
            style={{ background: "var(--rh-hue-soft-strong)" }}
          >
            <CategoryIcon name={category.icon} className="h-6 w-6" />
          </span>
          <Link
            href="/rabbithole/how-we-pick"
            className="text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
          >
            How these are chosen
          </Link>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {grouped.map((group) => (
          <section key={group.band.id} className="mb-14 last:mb-0">
            <SectionHeading
              eyebrow={`${group.sites.length} ${group.sites.length === 1 ? "site" : "sites"}`}
              title={group.band.label}
              description={group.band.hint}
            />
            <div className="rh-grid">
              {group.sites.map((site) => (
                <SiteCard key={site.slug} site={site} showCategory={false} />
              ))}
            </div>
          </section>
        ))}

        {vibesHere.length ? (
          <section className="mt-16 border-t border-border pt-10">
            <SectionHeading
              eyebrow="Cut across instead"
              title="Browse by vibe"
              description="Vibes ignore categories, so these lists mix this one with the other seventeen."
              as="h2"
            />
            <ul className="flex flex-wrap gap-2">
              {vibesHere.map(({ vibe, count }) => (
                <li key={vibe.id}>
                  <Link
                    href={`/rabbithole/vibe/${vibe.id}`}
                    className="rh-chip rh-chip--toned rh-toned transition hover:opacity-80"
                    style={tonedStyle(vibe.tone)}
                  >
                    {vibe.label}
                    <span className="opacity-60">{count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-16 border-t border-border pt-10">
          <SectionHeading
            eyebrow="Change direction"
            title="Other corners of the directory"
            href="/rabbithole"
            linkLabel="All categories"
          />
          <ul className="flex flex-wrap gap-2">
            {siblings.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/rabbithole/category/${item.id}`}
                  className="rh-chip rh-chip--toned rh-toned transition hover:opacity-80"
                  style={tonedStyle(item.tone)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
