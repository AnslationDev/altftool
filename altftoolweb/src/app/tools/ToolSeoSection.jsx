import Link from "next/link";
import { ArrowUpRight, BookOpen, Code2, HelpCircle, Info, LayoutGrid, ListChecks, Plus, Sparkles } from "lucide-react";
import { buildToolSeoContent } from "./toolSeoContent";
import { getRelatedTools, getToolCategories } from "./toolRouteUtils";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import { buildEmbedSnippet, isEmbeddable } from "@/app/embed/embedRegistry";
import EmbedCodeCopy from "@/app/embed/EmbedCodeCopy";

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
 * GEO: the first prose after the H1 is `seo.answer` — one self-contained
 * sentence built from the tool's own registry fields that names the tool, says
 * what kind of tool it is and what it does. Answer engines quote sentences that
 * stand alone; the raw registry description used to sit there instead, and it
 * never names its own subject ("Merge tiles to reach 2048…"). Section headings
 * are entity-anchored and question-form so a retrieval chunk starting at any
 * heading identifies what it is about. `seo.headings.howTo` is also the name
 * any HowTo JSON-LD for this page must carry, so markup and visible heading
 * never disagree.
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
  const toolPath = `/tools/all/${slug}`;
  // Cross-site "keep exploring" links (tools deliberately excluded — the page
  // already has its own "Related tools" nav above).
  const crossSiteItems = getRelatedContent({
    source: {
      href: toolPath,
      title: tool?.name || seo.name,
      description: tool?.description || "",
      tags: [...getToolCategories(tool), ...(tool?.topics || [])],
      section: "tools",
    },
    slots: [
      { sections: ["blogs", "top9", "top11"], limit: 2 },
      { sections: ["calculators", "pdfTools", "imageTools", "deals"], limit: 2 },
      { sections: ["experiences", "games", "products"], limit: 2, minScore: 0 },
    ],
  });

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
        {/* Answer-first: one self-contained sentence, quotable without the rest
            of the page. Carries the tool's own description, so the raw
            description is no longer repeated as a separate paragraph. */}
        <p className="mt-3 max-w-3xl text-[15px] font-medium leading-relaxed sm:text-base" style={{ color: T.ink }}>
          {seo.answer}
        </p>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed" style={{ color: T.muted }}>
          {seo.intro}
        </p>
      </div>

      {/* At a glance — every row is registry metadata or a fact that holds for
          the whole corpus and is already asserted by the SoftwareApplication
          JSON-LD (free, browser-based, no account). Nothing inferred. */}
      <div className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <SectionHeading icon={Info}>{seo.headings.facts}</SectionHeading>
        {/* Real <table>: the most extractable shape for a fact block, and it
            stays readable down to ~280px because the cells wrap rather than
            forcing a min-width. overflow-x-auto is only a safety net. */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="sr-only">Key facts about {seo.name}</caption>
            <tbody>
              {seo.facts.map((fact, index) => (
                <tr
                  key={fact.label}
                  className={index > 0 ? "border-t border-(--sc-border)" : undefined}
                >
                  <th
                    scope="row"
                    className="w-28 py-2.5 pr-4 align-top font-bold sm:w-40"
                    style={{ color: T.ink }}
                  >
                    {fact.label}
                  </th>
                  <td className="py-2.5 align-top font-medium leading-relaxed" style={{ color: T.ink }}>
                    {fact.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to use — numbered step cards */}
      <div className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <SectionHeading icon={ListChecks}>{seo.headings.howTo}</SectionHeading>
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
        <SectionHeading icon={Sparkles}>{seo.headings.why}</SectionHeading>
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
          <SectionHeading icon={BookOpen}>{seo.headings.useCases}</SectionHeading>
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
        <SectionHeading icon={HelpCircle}>{seo.headings.faq}</SectionHeading>
        <div className="mt-3 space-y-2">
          {seo.faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group rounded-2xl px-4 py-3.5"
              style={{ backgroundColor: T.tile }}
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-sm font-bold text-(--sc-ink) transition-colors duration-150 hover:text-(--sc-indigo) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--sc-indigo)]/35 group-open:text-(--sc-indigo) motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
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
        <nav aria-label={seo.headings.related} className="rounded-[24px] p-5 sm:p-7" style={CARD}>
          <SectionHeading icon={LayoutGrid}>{seo.headings.related}</SectionHeading>
          <ul className="mt-4 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/tools/all/${item.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold text-(--sc-ink) transition-all duration-150 hover:-translate-y-0.5 hover:text-(--sc-indigo) hover:shadow-(--sc-shadow-lg) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--sc-indigo)]/35 motion-reduce:transform-none motion-reduce:transition-none"
                  style={{ backgroundColor: T.tile }}
                >
                  {item.name}
                  <ArrowUpRight className="h-3.5 w-3.5 text-(--sc-indigo) transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Embed-on-your-site snippet (allowlisted widget categories only) */}
      {isEmbeddable(slug) && (
        <section aria-label={seo.headings.embed} className="rounded-[24px] p-5 sm:p-7" style={CARD}>
          <SectionHeading icon={Code2}>{seo.headings.embed}</SectionHeading>
          <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: T.muted }}>
            Copy the snippet below into your blog or website to embed the{" "}
            {tool?.name || seo.name} widget — free, responsive, no signup. Just keep the
            &ldquo;Widget by AltFTool&rdquo; credit link visible.
          </p>
          <div className="mt-4">
            <EmbedCodeCopy
              snippet={buildEmbedSnippet(slug, tool?.name || seo.name)}
              containerClassName="rounded-xl"
              preClassName="max-h-44 overflow-auto rounded-xl p-3 text-xs leading-5 bg-[var(--sc-tile)] text-[var(--sc-ink)]"
              dividerClassName="pt-2"
              buttonClassName="inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-(--sc-shadow-lg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sc-indigo)] motion-reduce:transform-none"
              buttonStyle={{ backgroundColor: T.tile, color: T.indigo }}
            />
          </div>
          <p className="mt-3 text-xs" style={{ color: T.muted }}>
            <Link
              href="/embed"
              className="rounded-[4px] font-semibold underline underline-offset-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--sc-indigo)]/35 motion-reduce:transition-none"
              style={{ color: T.indigo }}
            >
              Browse all embeddable widgets →
            </Link>
          </p>
        </section>
      )}

      {/* Cross-site related content (guides, calculators, experiences, ...) */}
      <RelatedContentSection
        embedded
        title="Guides & more from AltFTool"
        items={crossSiteItems}
        path={toolPath}
        jsonLdName={`Content related to ${tool?.name || seo.name}`}
      />
    </section>
  );
}
