import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  MODELS,
  MODEL_BY_SLUG,
  MODEL_KINDS,
  PRODUCTION_ROUTES,
  ROUTE_BY_ID,
} from "@altftool/core/persona/taxonomy";
import { buildPromptKit } from "@altftool/core/persona/compose";
import { getFeaturedCast } from "@altftool/core/persona";
import CopyBlock from "../../_components/CopyBlock";
import PromptBridge from "../../_components/PromptBridge";
import {
  NoteList,
  PersonaSection,
  RouteChip,
  SectionHeading,
  Stamp,
} from "../../_components/Shell";

export function generateStaticParams() {
  return MODELS.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const model = MODEL_BY_SLUG[slug];

  if (!model) {
    return createPageMetadata({
      title: "Model not found",
      path: `/persona/models/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${model.name} character consistency — the mechanism and the syntax`,
    description: `${model.consistency}. ${model.mechanism}`,
    path: `/persona/models/${model.slug}`,
    keywords: [
      `${model.name.toLowerCase()} character consistency`,
      `${model.name.toLowerCase()} same face`,
      `${model.name.toLowerCase()} ai influencer`,
      "consistent ai character",
    ],
  });
}

export default async function ModelDetailPage({ params }) {
  const { slug } = await params;
  const model = MODEL_BY_SLUG[slug];
  if (!model) notFound();

  const sample = getFeaturedCast()[0];
  const kit = buildPromptKit(sample.spec, model.slug);
  const kind = MODEL_KINDS.find((entry) => entry.id === model.kind);
  const siblings = MODELS.filter(
    (entry) => entry.kind === model.kind && entry.slug !== model.slug,
  );

  const faqs = [
    {
      question: `How do you keep a consistent character in ${model.name}?`,
      answer: `${model.consistency}. ${model.mechanism}`,
    },
    {
      question: `Where does ${model.name} stop?`,
      answer: model.limits,
    },
  ];

  return (
    <main>
      <JsonLd
        id={`persona-model-${model.slug}-jsonld`}
        data={[
          createFaqJsonLd({ path: `/persona/models/${model.slug}`, questions: faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Models", path: "/persona/models" },
            { name: model.name, path: `/persona/models/${model.slug}` },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>
            <Link href="/persona/models" prefetch={false} className="hover:underline">
              Model guide
            </Link>{" "}
            · {kind?.label} · {model.vendor}
          </Stamp>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {model.name}
          </h1>
          <p
            className="mt-3 text-lg font-medium"
            style={{ color: "var(--psn-accent-text)" }}
          >
            {model.consistency}
          </p>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
            {model.mechanism}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {model.routes.map((routeId) => (
              <RouteChip key={routeId} route={ROUTE_BY_ID[routeId]} size="lg" />
            ))}
          </div>
        </div>
      </div>

      <PersonaSection>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Stamp className="mb-3">What it is good at</Stamp>
            <NoteList items={model.strengths} />
          </div>
          <div>
            <Stamp className="mb-3">Where it stops</Stamp>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {model.limits}
            </p>

            <Stamp className="mb-3 mt-8">Routes it can take you on</Stamp>
            <ul className="space-y-2 text-sm">
              {PRODUCTION_ROUTES.map((route) => (
                <li key={route.id} className="flex items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="psn-seed"
                    style={{
                      color: model.routes.includes(route.id)
                        ? `var(--psn-${route.id === "prompt-only" ? "prompt" : route.id})`
                        : "var(--psn-stamp)",
                    }}
                  >
                    {model.routes.includes(route.id) ? "●" : "—"}
                  </span>
                  <span
                    className={
                      model.routes.includes(route.id)
                        ? "text-foreground"
                        : "text-muted-foreground line-through opacity-60"
                    }
                  >
                    {route.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PersonaSection>

      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="The syntax"
          title={`${model.name}, composed against a real character sheet`}
          lede={`This is ${sample.name} from the cast, rendered into ${model.name}'s own syntax. Square brackets are the things only you have.`}
        />

        <CopyBlock text={kit.text} />

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Build your own in the{" "}
          <Link
            href="/persona/studio"
            prefetch={false}
            className="font-medium underline"
            style={{ color: "var(--psn-accent-text)" }}
          >
            studio
          </Link>{" "}
          and this same block comes back filled with your persona instead — same
          structure, your locked line, your seed.
        </p>

        <PromptBridge className="mt-10" />
      </PersonaSection>

      {siblings.length ? (
        <PersonaSection>
          <SectionHeading eyebrow="Alternatives" title={`Other ${kind?.label.toLowerCase()} models`} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {siblings.map((entry) => (
              <Link
                key={entry.slug}
                href={`/persona/models/${entry.slug}`}
                prefetch={false}
                className="psn-sheet rounded-xl p-5 transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <p className="font-semibold text-foreground">{entry.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {entry.consistency}
                </p>
              </Link>
            ))}
          </div>
        </PersonaSection>
      ) : null}
    </main>
  );
}
