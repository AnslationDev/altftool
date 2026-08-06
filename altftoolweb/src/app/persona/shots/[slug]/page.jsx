import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera, Video } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  SHOTS,
  castUsingShot,
  getShot,
  shotsInCategory,
} from "@altftool/core/persona";
import { DEFAULT_SPEC, buildPromptKit } from "@altftool/core/persona/compose";
import { NICHE_BY_SLUG, PILLAR_BY_ID } from "@altftool/core/persona/taxonomy";
import CopyBlock from "../../_components/CopyBlock";
import PersonaCard from "../../_components/PersonaCard";
import ShotCard from "../../_components/ShotCard";
import {
  NoteList,
  PersonaSection,
  RouteChip,
  SectionHeading,
  Stamp,
} from "../../_components/Shell";

export function generateStaticParams() {
  return SHOTS.map((shot) => ({ slug: shot.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const shot = getShot(slug);

  if (!shot) {
    return createPageMetadata({
      title: "Shot not found",
      path: `/persona/shots/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${shot.title} — AI ${shot.kind === "video" ? "video" : "photo"} shot recipe`,
    description: `${shot.framing}. ${shot.why}`,
    path: `/persona/shots/${shot.slug}`,
    keywords: [
      `${shot.title.toLowerCase()} prompt`,
      `ai ${shot.category_.label.toLowerCase()} prompt`,
      "ai influencer shot",
      "ai photo framing prompt",
    ],
  });
}

export default async function ShotDetailPage({ params }) {
  const { slug } = await params;
  const shot = getShot(slug);
  if (!shot) notFound();

  const Icon = shot.kind === "video" ? Video : Camera;
  const users = castUsingShot(shot.slug);
  const sample = users[0];
  const spec = sample ? sample.spec : DEFAULT_SPEC;
  const kits = ["midjourney", "flux", "seedream"]
    .map((model) => buildPromptKit(spec, model, { shot }))
    .filter(Boolean);
  const siblings = shotsInCategory(shot.category).filter(
    (candidate) => candidate.slug !== shot.slug,
  );

  const faqs = [
    {
      question: `What production route does the ${shot.title.toLowerCase()} shot need?`,
      answer: `At least ${shot.route_.label.toLowerCase()}. ${shot.route_.detail}`,
    },
    {
      question: `Why use this shot?`,
      answer: shot.why,
    },
  ];

  return (
    <main>
      <JsonLd
        id={`persona-shot-${shot.slug}-jsonld`}
        data={[
          createFaqJsonLd({ path: `/persona/shots/${shot.slug}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Shots", path: "/persona/shots" },
            { name: shot.title, path: `/persona/shots/${shot.slug}` },
          ]),
        ]}
      />

      <div
        className={`psn-card psn-stripe psn-route-${shot.minRoute} border-b border-border`}
      >
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp className="flex items-center gap-1.5">
            <Link href="/persona/shots" prefetch={false} className="hover:underline">
              Shots
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              href={`/persona/shots/category/${shot.category}`}
              prefetch={false}
              className="hover:underline"
            >
              {shot.category_.label}
            </Link>
          </Stamp>

          <div className="mt-3 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="flex items-center gap-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                <Icon
                  className={`h-7 w-7 shrink-0 psn-kind-${shot.kind}`}
                  aria-hidden="true"
                />
                {shot.title}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-foreground">
                {shot.why}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <RouteChip route={shot.route_} size="lg" />
                <span className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                  {shot.kind === "video" ? "Video" : "Still"}
                </span>
                {(shot.pillars || []).map((id) => (
                  <span
                    key={id}
                    className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground"
                  >
                    {PILLAR_BY_ID[id].label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------- The recipe -------------------------- */}
      <PersonaSection>
        <SectionHeading
          eyebrow="The recipe"
          title="Four fragments, composed around your locked line"
          lede="The shot never describes the person. It describes what is happening to them, which is what keeps the face out of the variables."
        />

        <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {[
            { label: "Opening", value: shot.opening, note: "Runs straight into the locked line" },
            { label: "Framing", value: shot.framing },
            { label: "Direction", value: shot.direction },
            { label: "Finish", value: shot.finish },
          ].map((row) => (
            <div key={row.label} className="grid gap-1 bg-background p-5 sm:grid-cols-[8rem_1fr]">
              <dt className="psn-stamp pt-1">{row.label}</dt>
              <dd className="text-[15px] leading-relaxed text-foreground">
                {row.value}
                {row.note ? (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {row.note}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <Stamp className="mb-3">Getting it right</Stamp>
          <NoteList items={shot.tips} />
        </div>

        {shot.niches?.length ? (
          <p className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            This shot is niche-bound: the planner only puts it in a calendar for{" "}
            {shot.niches.map((id, index) => (
              <span key={id}>
                {index > 0 ? (index === shot.niches.length - 1 ? " and " : ", ") : ""}
                <Link
                  href={`/persona/niche/${id}`}
                  prefetch={false}
                  className="font-medium text-foreground hover:underline"
                >
                  {NICHE_BY_SLUG[id]?.label || id}
                </Link>
              </span>
            ))}
            . A tape measure in a personal-finance calendar is the kind of
            plausible nonsense a generator produces when nobody models the
            constraint.
          </p>
        ) : null}
      </PersonaSection>

      {/* ------------------------------ Prompts --------------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="Composed"
          title={
            sample
              ? `This shot, composed against ${sample.name}`
              : "This shot, composed against the default spec"
          }
          lede="The locked line comes from the character sheet; everything after it comes from the recipe above. Swap in your own line and nothing else changes."
        />

        <div className="space-y-4">
          {kits.map((kit) => (
            <div key={kit.slug} className="psn-sheet rounded-xl p-5">
              <p className="mb-3 font-semibold text-foreground">{kit.label}</p>
              <CopyBlock text={kit.text} tone="tight" />
            </div>
          ))}
        </div>
      </PersonaSection>

      {/* ------------------------------ Users ----------------------------- */}
      {users.length ? (
        <PersonaSection>
          <SectionHeading
            eyebrow="Used by"
            title="Personas built around this frame"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((entry) => (
              <PersonaCard key={entry.slug} entry={entry} compact />
            ))}
          </div>
        </PersonaSection>
      ) : null}

      {/* ---------------------------- Siblings ---------------------------- */}
      {siblings.length ? (
        <PersonaSection tone="plate">
          <SectionHeading
            eyebrow={shot.category_.label}
            title="Other shots in this group"
            action={
              <Link
                href={`/persona/shots/category/${shot.category}`}
                prefetch={false}
                className="text-sm font-semibold"
                style={{ color: "var(--psn-accent-text)" }}
              >
                About this group →
              </Link>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {siblings.map((candidate) => (
              <ShotCard key={candidate.slug} shot={candidate} />
            ))}
          </div>
        </PersonaSection>
      ) : null}
    </main>
  );
}
