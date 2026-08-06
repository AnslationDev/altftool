import { Suspense } from "react";
import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { VERTICALS, JOBS, MECHANISMS, MODELS } from "@altftool/core/ideas/taxonomy";
import { slugify, rehydrate } from "@altftool/core/ideas/compose";
import {
  getFacets,
  getManifest,
  getTopIndex,
  getVerticalIndex,
} from "@altftool/core/ideas/corpus";
import IdeaCard from "../_components/IdeaCard";
import GenerateForm from "./GenerateForm";

export const revalidate = 86400;

const RESULTS = 9;

const description =
  "Generate startup ideas by choosing an industry, the job you want to replace, and how you want to build. Every result is a real scored idea with market evidence — not model output nobody has checked.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Startup idea generator — pick an industry, get scored ideas",
    description,
    path: "/ideas/generate",
    keywords: [
      "startup idea generator",
      "AI startup idea generator",
      "business idea generator",
      "SaaS idea generator",
    ],
  });
}

const EFFORTS = [
  { slug: "weekend", name: "A weekend" },
  { slug: "month", name: "About a month" },
  { slug: "quarter", name: "About a quarter" },
  { slug: "year", name: "Six to twelve months" },
];

const FAQS = [
  {
    question: "How does this startup idea generator work?",
    answer:
      "It navigates a corpus of 117,264 pre-scored ideas rather than calling a language model. You choose an industry, the job to be replaced, a mechanism, a revenue model, or a build effort, and it returns real records that already carry an opportunity score, market figures, named competitor archetypes and risks.",
  },
  {
    question: "Why not just use an AI to write me an idea?",
    answer:
      "A model will produce a fluent idea in seconds, but nothing about it has been checked and it carries no evidence you can argue with. Every result here shows six scored signals, a market size, a startup cost, and the hardest part of the build — so you can disagree with a specific number instead of a paragraph.",
  },
  {
    question: "Is the generator free?",
    answer: "Yes, with no account and no generation limit.",
  },
];

async function Results({ query }) {
  const [manifest, topIndex] = await Promise.all([getManifest(), getTopIndex()]);

  // Reading one vertical file beats scanning the corpus when an industry is
  // chosen; otherwise the published index is already the best starting set.
  let rows;
  if (query.v && VERTICALS.some((v) => v.slug === query.v)) {
    try {
      rows = await getVerticalIndex(query.v);
    } catch {
      rows = topIndex;
    }
  } else {
    rows = topIndex;
  }

  const filtered = rows.filter(
    (r) =>
      (!query.j || r.j === query.j) &&
      (!query.m || r.m === query.m) &&
      (!query.mo || r.mo === query.mo) &&
      (!query.e || r.e === query.e),
  );

  const ideas = filtered
    .slice(0, RESULTS)
    .map((row) => rehydrate(row))
    .filter(Boolean);

  const active = Object.values(query).filter(Boolean).length;

  if (ideas.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-canvas p-10 text-center">
        <p className="text-foreground">Nothing matches that combination.</p>
        <p className="mx-auto mt-2 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
          Some pairings genuinely do not occur — a coherence check keeps the corpus free of
          combinations like maritime dental admin. Drop a filter and try again.
        </p>
        <Link href="/ideas/generate" className="mt-3 inline-block text-sm text-primary hover:underline">
          Clear all filters →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-xs text-muted-foreground">
          {filtered.length.toLocaleString("en-US")} match
          {filtered.length === 1 ? "" : "es"}
          {active === 0 ? ` across the whole corpus of ${manifest.total.toLocaleString("en-US")}` : ""}
          {" · showing the strongest "}
          {ideas.length}
        </p>
        <Link
          href="/ideas/browse"
          className="font-mono text-xs text-primary hover:underline"
        >
          Browse everything →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea, i) => (
          <IdeaCard key={idea.slug} idea={idea} rank={i + 1} />
        ))}
      </div>
    </>
  );
}

export default async function GeneratePage({ searchParams }) {
  const params = await searchParams;
  const query = {
    v: params?.v ?? "",
    j: params?.j ?? "",
    m: params?.m ?? "",
    mo: params?.mo ?? "",
    e: params?.e ?? "",
  };

  const [facets, manifest] = await Promise.all([getFacets(), getManifest()]);

  const verticals = VERTICALS.map((v) => ({
    slug: v.slug,
    name: v.name,
    count: facets.vertical[v.slug] ?? 0,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const jobs = JOBS.map((j) => ({ slug: slugify(j.name), name: j.noun })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const mechanisms = Object.entries(MECHANISMS)
    .map(([key, m]) => ({ slug: key, name: m.label }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const models = MODELS.map((m) => ({ slug: slugify(m.name), name: m.name }));

  return (
    <>
      <JsonLd
        id="altf-ideas-generate"
        data={[
          createCollectionPageJsonLd({
            path: "/ideas/generate",
            name: "Startup idea generator",
            description,
          }),
          createFaqJsonLd({ path: "/ideas/generate", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Generate", path: "/ideas/generate" },
          ]),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">Generate</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Generator
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            Generate a startup idea worth checking
          </h1>
          <p className="mt-4 max-w-[62ch] text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            Pick an industry, the job you want to replace, or how long you are willing to build for.
            This does not call a language model — it navigates{" "}
            {manifest.total.toLocaleString("en-US")} pre-scored ideas, so every result arrives with
            six signals, a market size, named competitors, and the hardest part of the build already
            attached.
          </p>
        </header>

        <section className="py-8">
          <Suspense fallback={<div className="h-56 rounded-xl border border-border bg-canvas" />}>
            <GenerateForm
              verticals={verticals}
              jobs={jobs}
              mechanisms={mechanisms}
              models={models}
              efforts={EFFORTS}
            />
          </Suspense>
        </section>

        <section className="pb-8">
          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-64 rounded-lg border border-border bg-card" />
                ))}
              </div>
            }
          >
            <Results query={query} />
          </Suspense>
        </section>

        <section className="border-t border-border py-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
            Common questions
          </h2>
          <div className="max-w-3xl">
            {FAQS.map((faq, i) => (
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
      </div>
    </>
  );
}
