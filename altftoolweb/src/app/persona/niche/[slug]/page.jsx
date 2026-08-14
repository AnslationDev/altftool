import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, TriangleAlert } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  castInNiche,
  getPopulatedNiches,
  shotsForNiche,
} from "@altftool/core/persona";
import {
  NICHE_BY_SLUG,
  PILLAR_BY_ID,
  PRODUCTION_ROUTES,
} from "@altftool/core/persona/taxonomy";
import PersonaCard from "../../_components/PersonaCard";
import ShotCard from "../../_components/ShotCard";
import {
  AnswerBlock,
  Disclaimer,
  PersonaSection,
  RouteChip,
  SectionHeading,
  Stamp,
  StatStrip,
} from "../../_components/Shell";

/*
 * The niche page.
 *
 * This is the route the landing page's niche chips point at, and the reason the
 * cast explorer can keep its filters in component state: every niche worth
 * indexing has a real server-rendered page with its own copy, rather than a
 * query-string variant of the browse grid competing with it.
 *
 * The copy is authored per niche in the taxonomy — `intro` is the honest
 * paragraph about whether a synthetic creator belongs in that vertical at all,
 * which is the thing a reader searching "ai influencer for fitness" actually
 * needs to read before anything else.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return getPopulatedNiches().map((niche) => ({ slug: niche.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const niche = NICHE_BY_SLUG[slug];

  if (!niche) {
    return createPageMetadata({
      title: "Niche not found",
      path: `/persona/niche/${slug}`,
      noindex: true,
    });
  }

  const cast = castInNiche(slug);
  const shots = shotsForNiche(slug);

  return createPageMetadata({
    title: `${niche.label} AI influencer — personas, shots and what to avoid`,
    description: `${niche.blurb} ${cast.length} ready-made ${niche.label.toLowerCase()} character sheets, ${shots.length} usable shot recipes, and an honest note on where a synthetic creator stops being honest in this niche.`,
    path: `/persona/niche/${slug}`,
    keywords: [
      `${niche.label.toLowerCase()} ai influencer`,
      `ai influencer for ${niche.label.toLowerCase()}`,
      `${niche.label.toLowerCase()} ugc creator ai`,
      `ai persona ${niche.label.toLowerCase()}`,
    ],
  });
}

export default async function NichePage({ params }) {
  const { slug } = await params;
  const niche = NICHE_BY_SLUG[slug];
  if (!niche) notFound();

  const cast = castInNiche(slug);
  const shots = shotsForNiche(slug);
  const freeShots = shots.filter((shot) => shot.minRoute === "prompt-only");
  const others = getPopulatedNiches().filter((entry) => entry.slug !== slug);

  const faqs = [
    {
      question: `Does an AI influencer work in ${niche.label.toLowerCase()}?`,
      answer: niche.intro,
    },
    {
      question: `What production route does a ${niche.label.toLowerCase()} persona need?`,
      answer: `It depends on how much of the frame the face occupies. ${
        cast.length
          ? `The ${cast.length} ready-made ${niche.label.toLowerCase()} personas here land on ${[
              ...new Set(cast.map((entry) => entry.route.route.label.toLowerCase())),
            ].join(" and ")}.`
          : ""
      } ${freeShots.length} of the ${shots.length} shots usable in this niche need no reference frame at all, which is the practical measure of how cheaply it can be run.`,
    },
    {
      question: `What should a ${niche.label.toLowerCase()} AI persona never do?`,
      answer:
        cast[0]?.avoid ||
        "Present an experience the persona did not have as a customer testimonial. That is a fabricated endorsement in every market this site covers, and no disclosure cures it.",
    },
  ];

  return (
    <main>
      <JsonLd
        id={`persona-niche-${slug}-jsonld`}
        data={[
          createCollectionPageJsonLd({
            path: `/persona/niche/${slug}`,
            name: `${niche.label} AI influencer personas`,
            description: niche.blurb,
          }),
          createItemListJsonLd({
            path: `/persona/niche/${slug}`,
            name: `${niche.label} personas`,
            items: cast.map((entry) => ({
              name: `${entry.name} — ${entry.tagline}`,
              path: `/persona/cast/${entry.slug}`,
            })),
          }),
          createFaqJsonLd({ path: `/persona/niche/${slug}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Cast", path: "/persona/cast" },
            { name: niche.label, path: `/persona/niche/${slug}` },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>
            <Link href="/persona/cast" prefetch={false} className="hover:underline">
              Cast
            </Link>{" "}
            · Niche
          </Stamp>

          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {niche.label} AI influencer
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground">
            {niche.blurb}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock title="Is this niche honest for a synthetic creator?">
              <p>{niche.intro}</p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      <PersonaSection className="!py-8">
        <StatStrip
          items={[
            { label: "Ready-made personas", value: cast.length },
            {
              label: "Usable shots",
              value: shots.length,
              note: `${freeShots.length} need no reference`,
            },
            {
              label: "Production routes",
              value: new Set(cast.map((entry) => entry.route.id)).size,
              note: "based on consistency needs",
            },
          ]}
        />
      </PersonaSection>

      {cast.length ? (
        <PersonaSection tone="plate">
          <SectionHeading
            eyebrow={`${cast.length} ${cast.length === 1 ? "persona" : "personas"}`}
            title={`Finished ${niche.label.toLowerCase()} character sheets`}
            lede="Open one and you get the identity seed, the locked line, prompt kits for ten generators and the trap that would get it caught."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cast.map((entry) => (
              <PersonaCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </PersonaSection>
      ) : null}

      {/* --------------------------- The warning -------------------------- */}
      {cast.length ? (
        <PersonaSection>
          <div className="psn-sheet rounded-xl p-6">
            <Stamp className="flex items-center gap-1.5">
              <TriangleAlert className="h-3 w-3" aria-hidden="true" />
              What gets a {niche.label.toLowerCase()} persona caught
            </Stamp>
            <ul className="mt-4 space-y-4">
              {cast.slice(0, 3).map((entry) => (
                <li key={entry.slug} className="text-[15px] leading-relaxed">
                  <Link
                    href={`/persona/cast/${entry.slug}`}
                    prefetch={false}
                    className="font-medium text-foreground hover:underline"
                  >
                    {entry.name}
                  </Link>
                  <span className="text-muted-foreground"> — {entry.avoid}</span>
                </li>
              ))}
            </ul>
          </div>
        </PersonaSection>
      ) : null}

      {/* ------------------------------ Pillars --------------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="Content"
          title={`What a ${niche.label.toLowerCase()} account actually posts`}
          lede="The default pillars for this niche, and the props and settings the studio suggests with them."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="psn-sheet rounded-xl p-5">
            <Stamp>Default pillars</Stamp>
            <ul className="mt-3 space-y-2">
              {niche.pillars.map((id) => (
                <li key={id} className="text-sm">
                  <span className="font-medium text-foreground">
                    {PILLAR_BY_ID[id]?.label || id}
                  </span>
                  {PILLAR_BY_ID[id] ? (
                    <span className="text-muted-foreground">
                      {" "}
                      — {PILLAR_BY_ID[id].blurb}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="psn-sheet rounded-xl p-5">
            <Stamp>Signature props</Stamp>
            <ul className="mt-3 space-y-1.5">
              {niche.props.map((prop) => (
                <li key={prop} className="text-sm text-muted-foreground">
                  {prop}
                </li>
              ))}
            </ul>
          </div>

          <div className="psn-sheet rounded-xl p-5">
            <Stamp>Settings that suit it</Stamp>
            <ul className="mt-3 space-y-1.5">
              {niche.settings.map((setting) => (
                <li key={setting} className="text-sm text-muted-foreground">
                  {setting}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PersonaSection>

      {/* ------------------------------- Shots ---------------------------- */}
      <PersonaSection>
        <SectionHeading
          eyebrow={`${shots.length} shots`}
          title={`Frames that work in ${niche.label.toLowerCase()}`}
          lede={`Niche-bound recipes plus every universal one. ${freeShots.length} of them need no reference frame, which is what makes a month affordable.`}
          action={
            <Link
              href="/persona/shots"
              prefetch={false}
              className="text-sm font-semibold"
              style={{ color: "var(--psn-accent-text)" }}
            >
              Full library →
            </Link>
          }
        />

        <div className="mb-6 flex flex-wrap gap-2">
          {PRODUCTION_ROUTES.map((route) => {
            const count = shots.filter((shot) => shot.minRoute === route.id).length;
            if (!count) return null;
            return (
              <span key={route.id} className="inline-flex items-center gap-1.5">
                <RouteChip route={route} />
                <span className="text-xs text-muted-foreground">{count}</span>
              </span>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shots
            .filter((shot) => shot.niches?.includes(slug))
            .concat(freeShots.filter((shot) => !shot.niches?.length))
            .slice(0, 8)
            .map((shot) => (
              <ShotCard key={shot.slug} shot={shot} />
            ))}
        </div>
      </PersonaSection>

      {/* ------------------------------ Budget ---------------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="Budget"
          title="Use numbers you can verify"
          lede="Provider prices, usage terms, and creator quotes change. The worksheet starts at zero and totals only the current numbers you enter."
        />

        <Link
          href="/persona/rates"
          prefetch={false}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--psn-accent-text)" }}
        >
          Open the quote and budget worksheet
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <Disclaimer>
          The worksheet does not provide market rates, convert currency, or
          replace a current provider quote or professional contract advice.
        </Disclaimer>
      </PersonaSection>

      {/* ------------------------------ Others ---------------------------- */}
      <PersonaSection>
        <SectionHeading eyebrow="Other niches" title="Browse somewhere else" />
        <div className="flex flex-wrap gap-2">
          {others.map((entry) => (
            <Link
              key={entry.slug}
              href={`/persona/niche/${entry.slug}`}
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
