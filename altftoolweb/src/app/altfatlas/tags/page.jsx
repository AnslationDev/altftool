import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getIndexableTags, TAG_PAGE_MIN_ENTRIES } from "@altftool/core/atlas";
import { AtlasSection, Breadcrumbs } from "../_components/Shell";

const description =
  "Every tag in AltF Atlas with enough entries to be worth a page. Tags cut across the category tree — a PDF tool and a note app can share the same tag.";

export async function generateMetadata() {
  const tags = getIndexableTags();
  return createPageMetadata({
    title: `Browse ${tags.length} tags`,
    description,
    path: "/altfatlas/tags",
    keywords: ["website tags", "browse by tag", "useful websites by topic"],
  });
}

export default function AtlasTagsPage() {
  const tags = getIndexableTags();
  const max = tags[0]?.count || 1;

  return (
    <>
      <JsonLd
        id="altf-atlas-tags-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/altfatlas/tags",
            name: "AltF Atlas tags",
            description,
          }),
          createItemListJsonLd({
            path: "/altfatlas/tags",
            name: "AltF Atlas tags",
            items: tags.map((row) => ({
              name: row.tag,
              path: `/altfatlas/tag/${row.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Tags", path: "/altfatlas/tags" },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Tags", path: "/altfatlas/tags" },
          ]}
        />

        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {tags.length} tags
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Tags cut across the category tree, so a PDF tool and a note app can
          share one. Only tags with at least {TAG_PAGE_MIN_ENTRIES} entries get
          a page — below that a tag page tells you less than the category would,
          and competes with it for the same search.
        </p>

        {/* Sized by count rather than a plain list: the relative weight of a
            tag is genuinely useful information when choosing where to start. */}
        <ul className="mt-8 flex flex-wrap gap-2">
          {tags.map((row) => {
            const weight = row.count / max;
            return (
              <li key={row.slug}>
                <Link
                  href={`/altfatlas/tag/${row.slug}`}
                  prefetch={false}
                  className="afa-card inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  style={{
                    fontSize: `${0.8125 + weight * 0.25}rem`,
                  }}
                >
                  {row.tag}
                  <span className="afa-figure text-xs text-muted-foreground">
                    {row.count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </AtlasSection>
    </>
  );
}
