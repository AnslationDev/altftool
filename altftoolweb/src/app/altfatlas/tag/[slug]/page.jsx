import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { CATEGORY_BY_SLUG } from "@altftool/core/atlas/taxonomy";
import {
  entriesWithTagSlug,
  getIndexableTags,
  getTagBySlug,
} from "@altftool/core/atlas";
import { SiteGrid } from "../../_components/SiteCard";
import {
  AnswerBlock,
  AtlasSection,
  Breadcrumbs,
  SectionHeading,
} from "../../_components/Shell";

export const dynamicParams = false;

export function generateStaticParams() {
  return getIndexableTags().map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tag = getTagBySlug(slug);
  if (!tag) return createPageMetadata({ title: "Tag not found" });

  const entries = entriesWithTagSlug(slug);
  const open = entries.filter((entry) => entry.access === "open").length;

  return createPageMetadata({
    // Leads with the count rather than the tag: tags are authored lowercase
    // ("pdf", "css"), and title-casing them generically would produce "Pdf".
    // Putting the number first reads correctly whatever the tag looks like.
    title: `${entries.length} checked websites tagged ${tag.tag}`,
    description: `${entries.length} websites in AltF Atlas tagged ${tag.tag}, ${open} of them with no sign-up at all. Every entry states what it costs you before it works and where the free version stops.`,
    path: `/altfatlas/tag/${slug}`,
    keywords: [tag.tag, `${tag.tag} tools`, `free ${tag.tag} websites`],
  });
}

export default async function AtlasTagPage({ params }) {
  const { slug } = await params;
  const tag = getTagBySlug(slug);
  if (!tag) notFound();

  const entries = entriesWithTagSlug(slug);
  const open = entries.filter((entry) => entry.access === "open");
  const onDevice = entries.filter((entry) => entry.runtime === "local");

  // Which categories this tag cuts across — the whole point of a tag is that
  // it is orthogonal to the category tree.
  const categorySlugs = [...new Set(entries.map((entry) => entry.category))];
  const categories = categorySlugs
    .map((categorySlug) => CATEGORY_BY_SLUG[categorySlug])
    .filter(Boolean);

  const siblings = getIndexableTags()
    .filter((row) => row.slug !== slug)
    .slice(0, 20);

  return (
    <>
      <JsonLd
        id={`altf-atlas-tag-${slug}-schema`}
        data={[
          createCollectionPageJsonLd({
            path: `/altfatlas/tag/${slug}`,
            name: `${tag.tag} — AltF Atlas`,
            description: `Websites in AltF Atlas tagged ${tag.tag}.`,
          }),
          createItemListJsonLd({
            path: `/altfatlas/tag/${slug}`,
            name: `Websites tagged ${tag.tag}`,
            items: entries.map((entry) => ({
              name: entry.name,
              path: `/altfatlas/site/${entry.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Tags", path: "/altfatlas/tags" },
            { name: tag.tag, path: `/altfatlas/tag/${slug}` },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Tags", path: "/altfatlas/tags" },
            { name: tag.tag, path: `/altfatlas/tag/${slug}` },
          ]}
        />

        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Websites tagged &ldquo;{tag.tag}&rdquo;
        </h1>

        <div className="mt-4 max-w-3xl">
          <AnswerBlock>
            {entries.length} sites in AltF Atlas are tagged {tag.tag}, spanning{" "}
            {categories.length}{" "}
            {categories.length === 1 ? "category" : "categories"}. {open.length}{" "}
            of them work with no account at all
            {onDevice.length
              ? `, and ${onDevice.length} process your files in the browser without uploading them`
              : ""}
            . Every entry states where its free version stops.
          </AnswerBlock>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3">
          <span className="afa-figure text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground">
              {entries.length}
            </strong>{" "}
            sites
          </span>
          {open.length ? (
            <span className="afa-figure text-sm text-muted-foreground">
              <strong
                className="font-semibold"
                style={{ color: "var(--afa-open)" }}
              >
                {open.length}
              </strong>{" "}
              need no sign-up
            </span>
          ) : null}
          {onDevice.length ? (
            <span className="afa-figure text-sm text-muted-foreground">
              <strong
                className="font-semibold"
                style={{ color: "var(--afa-local)" }}
              >
                {onDevice.length}
              </strong>{" "}
              on device
            </span>
          ) : null}
        </div>

        <div className="mt-8">
          <SiteGrid entries={entries} />
        </div>

        {categories.length > 1 ? (
          <div className="mt-12">
            <SectionHeading
              eyebrow="Cuts across"
              title="Categories this tag spans"
              description="A tag is orthogonal to the category tree — that is what makes it worth having."
            />
            <ul className="mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/altfatlas/category/${category.slug}`}
                    prefetch={false}
                    className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {siblings.length ? (
          <div className="mt-12 border-t border-border pt-8">
            <p className="afa-eyebrow">Other tags</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siblings.map((row) => (
                <li key={row.slug}>
                  <Link
                    href={`/altfatlas/tag/${row.slug}`}
                    prefetch={false}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {row.tag}
                    <span className="afa-figure">{row.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </AtlasSection>
    </>
  );
}
