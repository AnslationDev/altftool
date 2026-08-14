import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { CATEGORY_GROUPS } from "@altftool/core/atlas/taxonomy";
import { getAtlasStats, getPopulatedCategories } from "@altftool/core/atlas";
import { AtlasSection, Breadcrumbs, CategoryTile } from "../_components/Shell";

const description =
  "Every category in AltF Atlas — file conversion, PDF, images, video, design, writing, AI, developer tools, data, diagrams, productivity, privacy, learning, travel, music and the genuinely pointless corners of the web.";

export async function generateMetadata() {
  const stats = getAtlasStats();
  return createPageMetadata({
    title: `All ${stats.categories} categories of useful website`,
    description,
    path: "/altfatlas/categories",
    keywords: [
      "website categories",
      "types of online tools",
      "useful website directory categories",
    ],
  });
}

export default function AtlasCategoriesPage() {
  const categories = getPopulatedCategories();
  const stats = getAtlasStats();

  return (
    <>
      <JsonLd
        id="altf-atlas-categories-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/altfatlas/categories",
            name: "AltF Atlas categories",
            description,
          }),
          createItemListJsonLd({
            path: "/altfatlas/categories",
            name: "AltF Atlas categories",
            items: categories.map((category) => ({
              name: category.name,
              path: `/altfatlas/category/${category.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Categories", path: "/altfatlas/categories" },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Categories", path: "/altfatlas/categories" },
          ]}
        />

        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {stats.categories} categories, {stats.live} sites
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          A category answers &ldquo;what kind of thing is this&rdquo;. If you
          already know the job you need done, the{" "}
          <Link
            href="/altfatlas/use-case"
            prefetch={false}
            className="font-medium text-primary underline underline-offset-2"
          >
            task index
          </Link>{" "}
          is a faster way in.
        </p>

        <div className="mt-10 grid gap-10">
          {CATEGORY_GROUPS.map((group) => {
            const groupCategories = group.slugs
              .map((slug) => categories.find((item) => item.slug === slug))
              .filter(Boolean);
            if (!groupCategories.length) return null;

            return (
              <section
                key={group.label}
                aria-labelledby={`group-${group.label}`}
              >
                <h2
                  id={`group-${group.label}`}
                  className="afa-eyebrow border-b border-border pb-2"
                >
                  {group.label}
                </h2>
                <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {groupCategories.map((category) => (
                    <li key={category.slug} className="min-w-0">
                      <CategoryTile category={category} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </AtlasSection>
    </>
  );
}
