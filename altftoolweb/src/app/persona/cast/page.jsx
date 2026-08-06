import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { CAST, getPopulatedNiches, getStats } from "@altftool/core/persona";
import { PLATFORMS, PRODUCTION_ROUTES } from "@altftool/core/persona/taxonomy";
import CastExplorer from "./CastExplorer";
import { toSearchParams } from "../_components/searchParams";
import { AnswerBlock, PersonaSection, SectionHeading, Stamp } from "../_components/Shell";

const description =
  "Twenty-four complete AI influencer character sheets across sixteen niches. Every one carries its identity seed, its locked descriptor line, the production route it needs, and a note on what will get it caught.";

export async function generateMetadata() {
  const stats = getStats();

  return createPageMetadata({
    title: `The Cast — ${stats.personas} ready-made AI influencer personas`,
    description,
    path: "/persona/cast",
    keywords: [
      "ai influencer examples",
      "ai persona templates",
      "virtual influencer characters",
      "ai ugc creator persona",
      "ready made ai influencer",
    ],
  });
}

/*
 * The client explorer receives a projection rather than the full rows. A cast
 * entry carries its bio, its spec, its locked line and its expanded shot
 * objects — none of which a card renders, and all of which would otherwise be
 * serialised into the page for twenty-four personas.
 */
function toCardShape(entry) {
  return {
    slug: entry.slug,
    name: entry.name,
    handle: entry.handle,
    tagline: entry.tagline,
    niche: entry.niche,
    platform: entry.platform,
    routeId: entry.route.id,
    nicheLabel: entry.niche_.label,
    seed: { token: entry.seed.token },
    route: { id: entry.route.id, route: entry.route.route },
    niche_: { label: entry.niche_.label },
    platform_: { label: entry.platform_.label },
    archetype_: { label: entry.archetype_.label },
  };
}

export default async function CastPage({ searchParams }) {
  const requestedNiche = toSearchParams(await searchParams).get("niche");
  const stats = getStats();
  const niches = getPopulatedNiches().map((niche) => ({
    slug: niche.slug,
    label: niche.label,
    count: niche.count,
  }));

  const platforms = PLATFORMS.filter((platform) =>
    CAST.some((entry) => entry.platform === platform.id),
  ).map((platform) => ({ id: platform.id, label: platform.label }));

  const routes = PRODUCTION_ROUTES.map((route) => ({
    id: route.id,
    label: route.label,
    count: stats.routes[route.id],
  }));

  return (
    <main>
      <JsonLd
        id="persona-cast-jsonld"
        data={[
          createCollectionPageJsonLd({
            path: "/persona/cast",
            name: "AltF Persona — the Cast",
            description,
          }),
          createItemListJsonLd({
            path: "/persona/cast",
            name: "Ready-made AI influencer personas",
            items: CAST.map((entry) => ({
              name: `${entry.name} — ${entry.tagline}`,
              path: `/persona/cast/${entry.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Cast", path: "/persona/cast" },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>The cast</Stamp>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {stats.personas} finished character sheets you can open, copy and
            adapt
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>
                Each of these is a specification, not a render — no image was
                generated to make this page. Open one and you get the same
                artefacts the studio produces for a persona you build yourself:
                the seed, the locked line, a prompt kit for every generator, the
                production route and the shots it pairs with.
              </p>
              <p>
                Every entry also carries an <strong>avoid</strong> note, because
                a cast where everything works is a brochure. If a persona would
                be dishonest to run in a particular format, that sentence says
                so.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      <PersonaSection>
        <SectionHeading
          eyebrow="Browse"
          title="Filter by niche, platform or production route"
          lede="Route is the filter most people want and nobody else offers: it tells you what a persona costs to run before you fall in love with it."
        />
        <CastExplorer
          entries={CAST.map(toCardShape)}
          niches={niches}
          platforms={platforms}
          routes={routes}
          initialNiche={
            niches.some((entry) => entry.slug === requestedNiche)
              ? requestedNiche
              : undefined
          }
        />
      </PersonaSection>
    </main>
  );
}
