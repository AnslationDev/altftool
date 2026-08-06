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
import { getPopulatedShotCategories, shotsInCategory } from "@altftool/core/persona";
import {
  ROUTE_BY_ID,
  SHOT_CATEGORY_BY_SLUG,
  SHOT_CATEGORY_SLUGS,
} from "@altftool/core/persona/taxonomy";
import ShotCard from "../../../_components/ShotCard";
import {
  AnswerBlock,
  PersonaSection,
  RouteChip,
  SectionHeading,
  Stamp,
  StatStrip,
} from "../../../_components/Shell";

export const dynamicParams = false;

export function generateStaticParams() {
  return SHOT_CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = SHOT_CATEGORY_BY_SLUG[slug];

  if (!category) {
    return createPageMetadata({
      title: "Shot group not found",
      path: `/persona/shots/category/${slug}`,
      noindex: true,
    });
  }

  const shots = shotsInCategory(slug);
  const route = ROUTE_BY_ID[category.minRoute];

  return createPageMetadata({
    title: `${category.label} shots for AI influencer content`,
    description: `${category.blurb} ${shots.length} recipes, each with a framing, a direction and a finish that composes with any character sheet. This group needs at least the ${route.label.toLowerCase()} production route.`,
    path: `/persona/shots/category/${slug}`,
    keywords: [
      `ai ${category.label.toLowerCase()} prompt`,
      `${category.label.toLowerCase()} shot ideas`,
      "ai influencer shot list",
      "ai photo framing prompt",
    ],
  });
}

export default async function ShotCategoryPage({ params }) {
  const { slug } = await params;
  const category = SHOT_CATEGORY_BY_SLUG[slug];
  if (!category) notFound();

  const shots = shotsInCategory(slug);
  const route = ROUTE_BY_ID[category.minRoute];
  const others = getPopulatedShotCategories().filter((entry) => entry.slug !== slug);
  const videos = shots.filter((shot) => shot.kind === "video").length;
  const universal = shots.filter((shot) => !shot.niches?.length).length;

  const faqs = [
    {
      question: `What are ${category.label.toLowerCase()} shots for?`,
      answer: category.intro,
    },
    {
      question: `What does a ${category.label.toLowerCase()} shot need to work?`,
      answer: `At least the ${route.label.toLowerCase()} route. ${route.detail}`,
    },
  ];

  return (
    <main>
      <JsonLd
        id={`persona-shot-category-${slug}-jsonld`}
        data={[
          createCollectionPageJsonLd({
            path: `/persona/shots/category/${slug}`,
            name: `${category.label} shots`,
            description: category.blurb,
          }),
          createItemListJsonLd({
            path: `/persona/shots/category/${slug}`,
            name: `${category.label} shot recipes`,
            items: shots.map((shot) => ({
              name: shot.title,
              path: `/persona/shots/${shot.slug}`,
            })),
          }),
          createFaqJsonLd({
            path: `/persona/shots/category/${slug}`,
            questions: faqs,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Shots", path: "/persona/shots" },
            { name: category.label, path: `/persona/shots/category/${slug}` },
          ]),
        ]}
      />

      <div
        className={`psn-card psn-stripe psn-route-${category.minRoute} border-b border-border`}
      >
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>
            <Link href="/persona/shots" prefetch={false} className="hover:underline">
              Shot library
            </Link>{" "}
            · Group
          </Stamp>

          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {category.label}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground">
            {category.blurb}
          </p>

          <div className="mt-5">
            <RouteChip route={route} size="lg" />
          </div>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>{category.intro}</p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      <PersonaSection className="!py-8">
        <StatStrip
          items={[
            { label: "Recipes", value: shots.length },
            { label: "Video", value: videos, note: `${shots.length - videos} stills` },
            { label: "Any niche", value: universal, note: `${shots.length - universal} niche-bound` },
            {
              label: "Weakest route",
              value: route.short,
              note: route.setupMinutes ? `${route.setupMinutes} min setup` : "no setup",
            },
          ]}
        />
      </PersonaSection>

      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow={`${shots.length} recipes`}
          title={`Every ${category.label.toLowerCase()} frame`}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shots.map((shot) => (
            <ShotCard key={shot.slug} shot={shot} />
          ))}
        </div>
      </PersonaSection>

      <PersonaSection>
        <SectionHeading eyebrow="Other groups" title="Browse somewhere else" />
        <div className="flex flex-wrap gap-2">
          {others.map((entry) => (
            <Link
              key={entry.slug}
              href={`/persona/shots/category/${entry.slug}`}
              prefetch={false}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:border-[var(--psn-accent)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {entry.label} · {entry.count}
            </Link>
          ))}
        </div>
      </PersonaSection>
    </main>
  );
}
