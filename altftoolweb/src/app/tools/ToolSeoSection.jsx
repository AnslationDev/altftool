import Link from "next/link";
import { ArrowUpRight, BookOpen, HelpCircle, LayoutGrid, ListChecks, Plus, Sparkles } from "lucide-react";
import { buildToolSeoContent } from "./toolSeoContent";
import { getRelatedTools } from "./toolRouteUtils";

/**
 * Server-rendered SEO content for tool pages.
 *
 * The interactive widget (<ToolClient>) is a client component, so before
 * hydration Google only saw a skeleton ("Preparing workspace"). That thin
 * first-load HTML is why tool pages landed in "Discovered/Crawled – currently
 * not indexed". This component renders the unique per-tool content
 * (heading, intro, how-to, benefits, FAQ, related tools) on the SERVER so the
 * raw page source contains real, indexable content.
 *
 * Presentation: the premium "app theme" (intentionally hardcoded product
 * decision — indigo/violet gradient accents, white cards, soft lavender
 * tiles; the same palette as the Step Counter app UI, see
 * src/tools/step-counter/components/StepApp.jsx). Applied to EVERY tool page
 * so all "About this tool" sections read as one designed product. No client
 * JS — the FAQ uses native <details>, all content stays crawlable.
 */

// Backed by the "--sc-*" tokens in globals.css (light + dark variants,
// switched by the site's [data-theme="dark"] attribute) so this section is
// fully readable in both site themes.
const T = {
  card: "var(--sc-card)",
  tile: "var(--sc-tile)",
  ink: "var(--sc-ink)",
  muted: "var(--sc-muted)",
  indigo: "var(--sc-indigo)",
  grad: "linear-gradient(135deg, #6D7BF7 0%, #8B5CF6 100%)",
  shadow: "var(--sc-shadow)",
};

const CARD = { backgroundColor: T.card, boxShadow: T.shadow };

function SectionHeading({ icon: Icon, children }) {
  return (
    <h2
      className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"
      style={{ color: T.ink }}
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
        style={{ background: T.grad, boxShadow: "0 4px 10px rgba(99,102,241,0.30)" }}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      {children}
    </h2>
  );
}

export default function ToolSeoSection({ slug, tool, category = "all" }) {
  const seo = buildToolSeoContent(slug, tool);
  const related = getRelatedTools(slug, 6);

  return (
    <section
      aria-label={`About ${seo.name}`}
      className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-14 pt-2 sm:px-6 lg:px-8"
      style={{ color: T.ink }}
    >
      {/* About */}
      <div className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <p
          className="text-xs font-bold uppercase tracking-[0.16em]"
          style={{ color: T.indigo }}
        >
          About this tool
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: T.ink }}>
          {seo.h1}
        </h1>
        {tool?.description ? (
          <p className="mt-2 max-w-3xl text-sm font-medium" style={{ color: T.muted }}>
            {tool.description}
          </p>
        ) : null}
        <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed" style={{ color: T.muted }}>
          {seo.intro}
        </p>
      </div>

      {/* How to use — numbered step cards */}
      <div className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <SectionHeading icon={ListChecks}>How to use {seo.name}</SectionHeading>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {seo.steps.map((step, index) => (
            <li key={step} className="rounded-2xl p-4" style={{ backgroundColor: T.tile }}>
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-white"
                style={{ background: T.grad, boxShadow: "0 4px 10px rgba(99,102,241,0.30)" }}
              >
                {index + 1}
              </span>
              <p className="mt-3 text-sm font-medium leading-relaxed" style={{ color: T.muted }}>
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Why use — benefit cards */}
      <div className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <SectionHeading icon={Sparkles}>Why use {seo.name}</SectionHeading>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {seo.examples.map((example) => (
            <li key={example.title} className="rounded-2xl p-4" style={{ backgroundColor: T.tile }}>
              <h3 className="text-sm font-extrabold" style={{ color: T.ink }}>
                {example.title}
              </h3>
              <p className="mt-1.5 text-sm font-medium leading-relaxed" style={{ color: T.muted }}>
                {example.body}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Common use cases (only when curated content exists) */}
      {seo.useCases?.length > 0 && (
        <div className="rounded-[24px] p-5 sm:p-7" style={CARD}>
          <SectionHeading icon={BookOpen}>Common use cases</SectionHeading>
          <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {seo.useCases.map((useCase) => (
              <li
                key={useCase}
                className="flex gap-2.5 text-sm font-medium leading-relaxed"
                style={{ color: T.muted }}
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: T.indigo }}
                  aria-hidden="true"
                />
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FAQ — native <details>, no client JS, crawlable content */}
      <div className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <SectionHeading icon={HelpCircle}>Frequently asked questions</SectionHeading>
        <div className="mt-3 space-y-2">
          {seo.faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: T.tile }}
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-(--sc-ink) transition-colors hover:text-(--sc-indigo) group-open:text-(--sc-indigo) [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full transition-transform duration-150 group-open:rotate-45"
                  style={{ backgroundColor: T.card, color: T.indigo }}
                  aria-hidden="true"
                >
                  <Plus className="h-3.5 w-3.5" />
                </span>
              </summary>
              <p className="max-w-3xl pt-2 text-sm font-medium leading-relaxed" style={{ color: T.muted }}>
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Related tools */}
      {related.length > 0 && (
        <nav aria-label="Related tools" className="rounded-[24px] p-5 sm:p-7" style={CARD}>
          <SectionHeading icon={LayoutGrid}>Related tools</SectionHeading>
          <ul className="mt-4 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/tools/all/${item.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold text-(--sc-ink) transition-all duration-150 hover:-translate-y-0.5 hover:text-(--sc-indigo) hover:shadow-(--sc-shadow-lg)"
                  style={{ backgroundColor: T.tile }}
                >
                  {item.name}
                  <ArrowUpRight className="h-3.5 w-3.5 text-(--sc-indigo) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
