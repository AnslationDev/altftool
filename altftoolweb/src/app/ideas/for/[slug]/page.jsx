import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { computeAos, formatUsd, EFFORT_PHRASES } from "@altftool/core/ideas";
import {
  PERSONAS,
  MODIFIERS,
  MIN_IDEAS_FOR_INDEX,
  findPersona,
  findModifier,
} from "@altftool/core/ideas/personas";
import { getAllPublished } from "@altftool/core/ideas/corpus";
import IdeaListing from "../../_components/IdeaListing";

const PER_PAGE = 24;
export const revalidate = 86400;

/*
 * One namespace for two page kinds that answer the same search intent
 * ("startup ideas for X"): persona hubs, which re-rank the corpus with their
 * own signal weighting, and modifier pages, which filter it.
 *
 * A persona page is not just a filtered list — the weights genuinely change
 * the order, so a solo founder and a VC-track founder see different ideas at
 * the top rather than the same list with a different heading.
 */

export function generateStaticParams() {
  return [...PERSONAS, ...MODIFIERS].map((entry) => ({ slug: entry.slug }));
}

function resolve(slug) {
  const persona = findPersona(slug);
  if (persona) return { kind: "persona", entry: persona };
  const modifier = findModifier(slug);
  if (modifier) return { kind: "modifier", entry: modifier };
  return null;
}

/** Compact-index shape the persona/modifier predicates expect. */
function toRow(idea) {
  return {
    a: idea.aos,
    v: idea.dna.verticalSlug,
    m: idea.dna.mechanismKey,
    e: idea.build.effort,
    mo: idea.dna.model.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  };
}

async function buildSet(slug) {
  const resolved = resolve(slug);
  if (!resolved) return null;

  const { kind, entry } = resolved;
  const all = await getAllPublished();

  let ideas = entry.filter ? all.filter((idea) => entry.filter(toRow(idea), idea)) : [...all];

  if (kind === "persona") {
    // Re-score under the persona's weighting, then re-rank. This is the whole
    // point of a persona hub — the ordering has to actually differ.
    ideas = ideas
      .map((idea) => ({ idea, aos: computeAos(idea.scores, entry.weights) }))
      .sort((a, b) => b.aos - a.aos)
      .map((x) => ({ ...x.idea, aos: x.aos }));
  } else {
    ideas = ideas.sort((a, b) => b.aos - a.aos);
  }

  return { kind, entry, ideas };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const built = await buildSet(slug);
  if (!built) return createPageMetadata({ title: "Not found", path: `/ideas/for/${slug}` });

  const { kind, entry, ideas } = built;
  const title =
    kind === "persona"
      ? `${entry.headline} — ${ideas.length.toLocaleString("en-US")} ranked for ${entry.intent}`
      : `Startup ideas ${entry.name} — ${ideas.length.toLocaleString("en-US")} scored`;

  return createPageMetadata({
    title,
    description: `${entry.lede} Every idea scored on demand, moat, monetisation, feasibility, timing and open field.`,
    path: `/ideas/for/${slug}`,
    keywords:
      kind === "persona"
        ? [entry.headline, `business ideas for ${entry.name.toLowerCase()}`, "startup ideas"]
        : [`startup ideas ${entry.name}`, `business ideas ${entry.name}`, "startup ideas"],
    // The anti-thin-content gate: a page with too few results is not worth
    // indexing. (Helper takes noindex/follow booleans, not a robots object.)
    noindex: ideas.length < MIN_IDEAS_FOR_INDEX,
    follow: true,
  });
}

export default async function ForPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const built = await buildSet(slug);
  if (!built) notFound();

  const { kind, entry, ideas } = built;
  const page = Math.max(1, Number.parseInt(query?.page ?? "1", 10) || 1);
  const pageIdeas = ideas.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const avg = ideas.length
    ? Math.round(ideas.reduce((s, i) => s + i.aos, 0) / ideas.length)
    : 0;
  const cheapest = ideas.reduce(
    (min, i) => Math.min(min, i.money.startupCostLowUsd),
    Number.POSITIVE_INFINITY,
  );
  const weekend = ideas.filter((i) => i.build.effort === "weekend").length;

  const faqs = [
    {
      question:
        kind === "persona"
          ? `What are the best startup ideas for ${entry.name.toLowerCase()}?`
          : `What are the best startup ideas ${entry.name}?`,
      answer: `${ideas.length.toLocaleString("en-US")} ideas qualify, averaging ${avg}/100. The strongest is "${ideas[0]?.title}" at ${ideas[0]?.aos}/100${ideas[0] ? ` in ${ideas[0].dna.vertical.toLowerCase()}` : ""}.`,
    },
    {
      question: "How much does it cost to start one of these?",
      answer: `The cheapest starts at around ${formatUsd(cheapest)}. ${weekend.toLocaleString("en-US")} of them reach a first shippable version in ${EFFORT_PHRASES.weekend}.`,
    },
    kind === "persona"
      ? {
          question: `Why is this ranked differently from the main list?`,
          answer: `This page re-scores the corpus using a weighting tuned for ${entry.name.toLowerCase()}: ${Object.entries(
            entry.weights,
          )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k, v]) => `${k} ${v}%`)
            .join(", ")}. The same six signals, weighted for a different situation.`,
        }
      : {
          question: `How is "${entry.name}" defined?`,
          answer: `${entry.lede} Membership is computed from the underlying scores and figures, so the list updates whenever the corpus is rebuilt.`,
        },
  ];

  const related = [...PERSONAS, ...MODIFIERS]
    .filter((e) => e.slug !== slug)
    .slice(0, 18)
    .map((e) => ({ name: e.name ?? e.headline, path: `/ideas/for/${e.slug}` }));

  const heading =
    kind === "persona" ? entry.headline : `Startup ideas ${entry.name}`;

  return (
    <>
      <JsonLd
        id={`altf-ideas-for-${slug}`}
        data={[
          createCollectionPageJsonLd({
            path: `/ideas/for/${slug}`,
            name: heading,
            description: entry.lede,
          }),
          createItemListJsonLd({
            path: `/ideas/for/${slug}`,
            name: heading,
            items: pageIdeas.map((idea) => ({
              name: idea.title,
              path: `/ideas/idea/${idea.slug}`,
            })),
          }),
          createFaqJsonLd({ path: `/ideas/for/${slug}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "For", path: "/ideas/for" },
            { name: entry.name ?? entry.headline, path: `/ideas/for/${slug}` },
          ]),
        ]}
      />

      <IdeaListing
        breadcrumb={[
          { name: "Ideas", path: "/ideas" },
          { name: "For", path: "/ideas/for" },
          { name: entry.name ?? entry.headline },
        ]}
        eyebrow={kind === "persona" ? "Persona" : "Filtered"}
        title={heading}
        answer={`${ideas.length.toLocaleString("en-US")} ideas match, averaging ${avg}/100 on the opportunity score. ${entry.lede}`}
        stats={[
          { value: ideas.length.toLocaleString("en-US"), label: "Ideas matched" },
          { value: `${avg}/100`, label: "Average score" },
          { value: ideas[0] ? `${ideas[0].aos}/100` : "—", label: "Top score" },
          { value: formatUsd(cheapest), label: "Cheapest start" },
        ]}
        ideas={pageIdeas}
        total={ideas.length}
        page={page}
        perPage={PER_PAGE}
        basePath={`/ideas/for/${slug}`}
        relatedTitle="Other angles"
        related={related}
      >
        <section className="border-b border-border py-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Common questions
          </h2>
          <div className="max-w-3xl">
            {faqs.map((faq, i) => (
              <details key={faq.question} className="border-b border-border" open={i === 0}>
                <summary className="cursor-pointer list-none py-4 text-[0.9375rem] font-medium text-foreground marker:hidden hover:text-primary">
                  {faq.question}
                </summary>
                <div className="pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      </IdeaListing>
    </>
  );
}
