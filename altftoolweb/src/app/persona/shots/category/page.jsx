import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getPopulatedShotCategories } from "@altftool/core/persona";
import { ROUTE_BY_ID } from "@altftool/core/persona/taxonomy";
import {
  AnswerBlock,
  PersonaSection,
  RouteChip,
  SectionHeading,
  Stamp,
} from "../../_components/Shell";

/*
 * This page exists partly for the reader and partly because /persona/shots
 * uses a [slug] segment: without a real page here, "/persona/shots/category"
 * would fall through to the shot detail route and 404 on a URL a reader can
 * reasonably guess by truncating one they were already on.
 */

const description =
  "Ten kinds of frame an AI influencer account is built from, each with the production route it demands. Portraits and UGC are the expensive end; flat lays and demonstrations have no identity load at all.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Shot groups — ten kinds of AI influencer frame",
    description,
    path: "/persona/shots/category",
    keywords: [
      "ai influencer shot types",
      "ugc shot categories",
      "ai photo shot list",
    ],
  });
}

export default function ShotCategoryIndexPage() {
  const categories = getPopulatedShotCategories();

  return (
    <main>
      <JsonLd
        id="persona-shot-categories-jsonld"
        data={[
          createCollectionPageJsonLd({
            path: "/persona/shots/category",
            name: "AltF Persona shot groups",
            description,
          }),
          createItemListJsonLd({
            path: "/persona/shots/category",
            name: "Shot groups",
            items: categories.map((category) => ({
              name: category.label,
              path: `/persona/shots/category/${category.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Shots", path: "/persona/shots" },
            { name: "Groups", path: "/persona/shots/category" },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>
            <Link href="/persona/shots" prefetch={false} className="hover:underline">
              Shot library
            </Link>{" "}
            · Groups
          </Stamp>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Ten kinds of frame
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>
                The groups are ordered by how much of the identity they put at
                risk, not by how they look. A flat lay has no face in it and
                costs nothing to keep consistent; a UGC selfie is the register
                brands pay most for and the hardest thing in this library to
                produce honestly.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      <PersonaSection>
        <SectionHeading eyebrow={`${categories.length} groups`} title="Every group" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/persona/shots/category/${category.slug}`}
              prefetch={false}
              className={`psn-card psn-stripe psn-sheet psn-route-${category.minRoute} flex flex-col gap-3 rounded-xl p-5 pl-6 transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  {category.label}
                </h2>
                <RouteChip route={ROUTE_BY_ID[category.minRoute]} />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {category.blurb}
              </p>
              <p className="psn-stamp mt-auto pt-2">{category.count} recipes</p>
            </Link>
          ))}
        </div>
      </PersonaSection>
    </main>
  );
}
