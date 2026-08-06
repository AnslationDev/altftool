import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, TriangleAlert } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { CAST, castInNiche, getPersona } from "@altftool/core/persona";
import {
  composeSheet,
  describeSpec,
  specToQuery,
} from "@altftool/core/persona/compose";
import { buildDisclosure } from "@altftool/core/persona/disclosure";
import { PILLAR_BY_ID } from "@altftool/core/persona/taxonomy";
import CopyBlock from "../../_components/CopyBlock";
import DownloadSheet from "../../_components/DownloadSheet";
import PromptBridge from "../../_components/PromptBridge";
import PersonaCard from "../../_components/PersonaCard";
import ShotCard from "../../_components/ShotCard";
import {
  Disclaimer,
  NoteList,
  PersonaSection,
  RouteChip,
  SectionHeading,
  SeedPlate,
  Stamp,
} from "../../_components/Shell";

export function generateStaticParams() {
  return CAST.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = getPersona(slug);

  if (!entry) {
    return createPageMetadata({
      title: "Persona not found",
      path: `/persona/cast/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${entry.name} — AI influencer character sheet`,
    description: `${entry.tagline}. A complete AltF Persona character sheet: identity seed ${entry.seed.token}, the locked descriptor line, prompt kits for ten generators and the ${entry.route.route.label.toLowerCase()} production route it needs.`,
    path: `/persona/cast/${entry.slug}`,
    keywords: [
      `${entry.niche_.label.toLowerCase()} ai influencer`,
      "ai persona example",
      "ai influencer character sheet",
      entry.archetype_.label.toLowerCase(),
    ],
  });
}

export default async function PersonaDetailPage({ params }) {
  const { slug } = await params;
  const entry = getPersona(slug);
  if (!entry) notFound();

  const sheet = composeSheet(entry.spec);
  const disclosure = buildDisclosure({ spec: entry.spec });
  const traits = describeSpec(entry.spec);
  const related = castInNiche(entry.niche).filter(
    (candidate) => candidate.slug !== entry.slug,
  );
  const studioHref = `/persona/studio?${specToQuery(entry.spec)}`;

  const faqs = [
    {
      question: `What production route does ${entry.name} need?`,
      answer: `${entry.route.route.label}. ${entry.route.route.detail}`,
    },
    {
      question: `What is the identity seed for ${entry.name}?`,
      answer: `${entry.seed.token}, with a numeric generation seed of ${entry.seed.numeric}. The token is derived from the facial and physical features only — change the wardrobe or the platform and it stays the same, change an eye shape and it becomes a different token.`,
    },
    {
      question: `What would get this persona caught?`,
      answer: entry.avoid,
    },
  ];

  return (
    <main>
      <JsonLd
        id={`persona-${entry.slug}-jsonld`}
        data={[
          createFaqJsonLd({ path: `/persona/cast/${entry.slug}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Cast", path: "/persona/cast" },
            { name: entry.name, path: `/persona/cast/${entry.slug}` },
          ]),
        ]}
      />

      {/* ------------------------------ Header ---------------------------- */}
      <div
        className={`psn-card psn-stripe psn-route-${entry.route.id} border-b border-border`}
      >
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>
            <Link href="/persona/cast" prefetch={false} className="hover:underline">
              Cast
            </Link>{" "}
            · {entry.niche_.label}
          </Stamp>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {entry.name}
              </h1>
              <p className="psn-seed mt-1 text-sm text-muted-foreground">
                @{entry.handle}
              </p>
              <p className="mt-4 text-lg leading-relaxed text-foreground">
                {entry.tagline}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {entry.bio}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <RouteChip route={entry.route.route} size="lg" />
                <span className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                  {entry.platform_.label}
                </span>
                <span className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                  {entry.archetype_.label}
                </span>
                <span className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                  {disclosure.language.label}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3">
              <SeedPlate seed={entry.seed.token} />
              <Link
                href={studioHref}
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{ background: "var(--psn-accent)" }}
              >
                Open in the studio
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <DownloadSheet spec={entry.spec} />
              <p className="max-w-[16rem] text-xs leading-relaxed text-muted-foreground">
                Loads this exact spec into the builder so you can change one
                thing and watch the seed move.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------- Works / avoid ------------------------ */}
      <PersonaSection tone="plate">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="psn-sheet rounded-xl p-6">
            <Stamp>Why it works</Stamp>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground">
              {entry.works}
            </p>
          </div>
          <div className="psn-sheet rounded-xl p-6">
            <Stamp className="flex items-center gap-1.5">
              <TriangleAlert className="h-3 w-3" aria-hidden="true" />
              What would get it caught
            </Stamp>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground">
              {entry.avoid}
            </p>
          </div>
        </div>
      </PersonaSection>

      {/* ------------------------------ Sheet ----------------------------- */}
      <PersonaSection>
        <SectionHeading
          eyebrow="Character sheet"
          title="The specification"
          lede="Paste the locked line verbatim into every prompt. Rewording it is the single most common cause of a face moving, and it never looks like the cause because the sentence still means the same thing to you."
        />

        <CopyBlock label="Locked line" text={sheet.lockedLine} />

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CopyBlock label="Styling line" text={sheet.styleLine} tone="tight" />
          <CopyBlock label="Negative prompt" text={sheet.negative} tone="tight" />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <Stamp>Trait ledger</Stamp>
            <dl className="mt-3 divide-y divide-border">
              {traits.map((row) => (
                <div key={row.key} className="flex justify-between gap-4 py-2 text-sm">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="text-right font-medium text-foreground">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <Stamp>Why this route</Stamp>
            <ul className="mt-3 space-y-2">
              {entry.route.reasons.map((reason) => (
                <li key={reason.text} className="flex gap-3 text-sm leading-relaxed">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background:
                        reason.weight === "up"
                          ? "var(--psn-video)"
                          : "var(--psn-still)",
                    }}
                  />
                  <span className="text-muted-foreground">{reason.text}</span>
                </li>
              ))}
            </ul>

            <Stamp className="mt-6">Content pillars</Stamp>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.pillars.map((id) => (
                <span
                  key={id}
                  className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {PILLAR_BY_ID[id].label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PersonaSection>

      {/* --------------------------- Prompt kits -------------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="Prompt kits"
          title={`${entry.name} in ten sets of syntax`}
          lede="Each generator holds a face by a different mechanism. Placeholders in square brackets are the things only you have."
        />

        <div className="space-y-4">
          {sheet.kits.map((kit) => (
            <div key={kit.slug} className="psn-sheet rounded-xl p-5">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{kit.label}</p>
                  <p className="text-xs text-muted-foreground">{kit.consistency}</p>
                </div>
                <Link
                  href={`/persona/models/${kit.slug}`}
                  prefetch={false}
                  className="text-xs font-medium"
                  style={{ color: "var(--psn-accent-text)" }}
                >
                  How this model holds a face →
                </Link>
              </div>
              <CopyBlock text={kit.text} tone="tight" />
            </div>
          ))}
        </div>

        <PromptBridge className="mt-10" />
      </PersonaSection>

      {/* ------------------------------ Shots ----------------------------- */}
      <PersonaSection>
        <SectionHeading
          eyebrow="Paired shots"
          title="The frames this persona is built around"
          action={
            <Link
              href="/persona/shots"
              prefetch={false}
              className="text-sm font-semibold"
              style={{ color: "var(--psn-accent-text)" }}
            >
              Full shot library →
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {entry.shots_.map((shot) => (
            <ShotCard key={shot.slug} shot={shot} />
          ))}
        </div>
      </PersonaSection>

      {/* --------------------------- Disclosure --------------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="Disclosure"
          title={`Publishing on ${disclosure.platform.label} in ${disclosure.market.label}`}
          lede={disclosure.placement}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <CopyBlock label="Profile bio line" text={disclosure.profileLine} tone="tight" />
          <CopyBlock label="Caption line" text={disclosure.captionLine} tone="tight" />
        </div>

        <div className="mt-6">
          <NoteList items={disclosure.obligations.map((item) => ({
            title: item.title,
            detail: item.detail,
          }))} />
        </div>

        <Disclaimer>{disclosure.disclaimer}</Disclaimer>
      </PersonaSection>

      {/* ------------------------------ Related --------------------------- */}
      {related.length ? (
        <PersonaSection>
          <SectionHeading
            eyebrow="Same niche"
            title={`Other ${entry.niche_.label.toLowerCase()} personas`}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((candidate) => (
              <PersonaCard key={candidate.slug} entry={candidate} compact />
            ))}
          </div>
        </PersonaSection>
      ) : null}
    </main>
  );
}
