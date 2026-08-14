import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  SHOTS,
  getPopulatedNiches,
  getPopulatedShotCategories,
  getStats,
  shotsForNiche,
} from "@altftool/core/persona";
import { PRODUCTION_ROUTES } from "@altftool/core/persona/taxonomy";
import ShotExplorer from "./ShotExplorer";
import {
  AnswerBlock,
  PersonaSection,
  RouteChip,
  SectionHeading,
  Stamp,
} from "../_components/Shell";

const description =
  "Fifty-four reusable shot recipes for AI influencer content. Each one is a framing, a direction and a finish that composes with any persona — and each carries the weakest production route it will survive on, so you know what you can afford before you generate it.";

export async function generateMetadata() {
  const stats = getStats();

  return createPageMetadata({
    title: `Shot library — ${stats.shots} AI influencer shot recipes`,
    description,
    path: "/persona/shots",
    keywords: [
      "ai influencer shot list",
      "ai photo prompt ideas",
      "ugc shot list",
      "ai content framing prompts",
      "ai video shot recipes",
    ],
  });
}

/*
 * The explorer receives a projection. A decorated shot carries its expanded
 * category and route objects plus the tips array, none of which a card renders.
 */
function toCardShape(shot) {
  return {
    slug: shot.slug,
    title: shot.title,
    framing: shot.framing,
    direction: shot.direction,
    kind: shot.kind,
    minRoute: shot.minRoute,
    category: shot.category,
    categoryLabel: shot.category_.label,
    niches: shot.niches || [],
    category_: { label: shot.category_.label },
    route_: shot.route_,
  };
}

export default function ShotsPage() {
  const stats = getStats();
  const categories = getPopulatedShotCategories();

  return (
    <main>
      <JsonLd
        id="persona-shots-jsonld"
        data={[
          createCollectionPageJsonLd({
            path: "/persona/shots",
            name: "AltF Persona shot library",
            description,
          }),
          createItemListJsonLd({
            path: "/persona/shots",
            name: "Shot recipes",
            items: SHOTS.map((shot) => ({
              name: shot.title,
              path: `/persona/shots/${shot.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Shots", path: "/persona/shots" },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>Shot library</Stamp>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {stats.shots} frames, sorted by what they cost you
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>
                A shot never describes the person. It describes what is happening
                to them — the framing, the direction, the light — and composes
                around the locked line from your character sheet. Describing the
                face a second time inside a shot prompt is the most reliable way
                to lose it.
              </p>
              <p>
                <strong>
                  {stats.freeShots} of the {stats.shots}
                </strong>{" "}
                need no reference frame at all, which is the practical answer to
                &ldquo;can I run this on the cheapest route&rdquo;. Most of them
                have no face in them.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      <PersonaSection className="!py-8" tone="plate">
        <div className="grid gap-4 sm:grid-cols-3">
          {PRODUCTION_ROUTES.map((route) => {
            const count = SHOTS.filter((shot) => shot.minRoute === route.id).length;
            return (
              <div
                key={route.id}
                className={`psn-card psn-stripe psn-sheet psn-route-${route.id} rounded-xl p-5 pl-6`}
              >
                <RouteChip route={route} />
                <p className="mt-3 text-2xl font-semibold text-foreground">
                  {count} shots
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  need at least {route.short.toLowerCase()}
                </p>
              </div>
            );
          })}
        </div>
      </PersonaSection>

      {/* ---------------------------- The groups -------------------------- */}
      <PersonaSection>
        <SectionHeading
          eyebrow={`${categories.length} groups`}
          title="Ten kinds of frame"
          lede="Each group has its own page explaining what it is for and what it demands of a production route."
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/persona/shots/category/${category.slug}`}
              prefetch={false}
              className="psn-sheet rounded-xl p-4 transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <p className="font-semibold text-foreground">{category.label}</p>
              <p className="psn-stamp mt-1">{category.count} shots</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {category.blurb}
              </p>
            </Link>
          ))}
        </div>
      </PersonaSection>

      {/* --------------------------- The explorer ------------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="Browse"
          title="Filter by what you can afford"
          lede="Route first: it is the only filter that tells you whether a frame is reachable at all on the setup you have."
        />

        <ShotExplorer
          shots={SHOTS.map(toCardShape)}
          categories={categories.map((category) => ({
            id: category.slug,
            label: category.label,
            count: category.count,
          }))}
          routes={PRODUCTION_ROUTES.map((route) => ({
            id: route.id,
            label: route.label,
            count: SHOTS.filter((shot) => shot.minRoute === route.id).length,
          }))}
          niches={getPopulatedNiches().map((niche) => ({
            id: niche.slug,
            label: niche.label,
            count: shotsForNiche(niche.slug).length,
          }))}
        />
      </PersonaSection>

      <PersonaSection>
        <SectionHeading
          title="Turn these into a month"
          lede="The planner picks from this library for you — filtered to your niche, capped at what your production route can afford, and batched by setup so a month is shot in one sitting rather than thirty."
          action={
            <Link
              href="/persona/playbook"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--psn-accent)" }}
            >
              Open the planner
            </Link>
          }
        />
      </PersonaSection>
    </main>
  );
}
