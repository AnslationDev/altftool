import Link from "next/link";
import { ArrowUpRight, BookOpen, Code2, HelpCircle, LayoutGrid, ListChecks, Plus, Sparkles } from "lucide-react";
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
 * Presentation uses the platform's semantic tokens so every tool page follows
 * the same light/dark product contract. No client JS — the FAQ uses native
 * <details>, and all content stays crawlable.
 *
 * Reading prose is 15px, not Tailwind's 14px `text-sm`. Almost all tool-page
 * traffic is phones, where this section gets 318px of usable width at 390px
 * viewport — every paragraph, step, benefit and FAQ answer was the smallest
 * type on the page. Eyebrow labels and the embed footnote stay small: they are
 * labels, not copy.
 */

const CARD_CLASS = "rounded-xl bg-card p-5 shadow-sm ring-1 ring-border sm:p-7";

function SectionHeading({ icon: Icon, children }) {
  return (
    <h2 className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-foreground">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-sm"
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
      { sections: ["blogs", "top9"], limit: 2 },
      { sections: ["calculators", "pdfTools", "imageTools", "deals"], limit: 2 },
      { sections: ["experiences", "games", "products"], limit: 2, minScore: 0 },
    ],
  });

  return (
    // No horizontal padding here: this renders inside ToolDetailChrome's
    // <main>, whose outer container already applies px-4 sm:px-6 lg:px-8.
    // Repeating it would inset the section twice and misalign it with the
    // widget above.
    <section
      aria-label={`About ${seo.name}`}
      className="mx-auto w-full max-w-6xl space-y-5 pb-14 pt-2 text-foreground"
    >
      {/* About */}
      <div className={CARD_CLASS}>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
          About this tool
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {seo.h1}
        </h1>
        {tool?.description ? (
          <p className="mt-2 max-w-3xl text-[15px] font-medium text-muted-foreground">
            {tool.description}
          </p>
        ) : null}
        <p className="mt-4 max-w-3xl text-[15px] font-medium leading-relaxed text-muted-foreground">
          {seo.intro}
        </p>
      </div>

      {/* How to use — numbered step cards */}
      <div className={CARD_CLASS}>
        <SectionHeading icon={ListChecks}>How to use {seo.name}</SectionHeading>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {seo.steps.map((step, index) => (
            <li key={step} className="rounded-xl bg-muted p-4">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                {index + 1}
              </span>
              <p className="mt-3 text-[15px] font-medium leading-relaxed text-muted-foreground">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Why use — benefit cards */}
      <div className={CARD_CLASS}>
        <SectionHeading icon={Sparkles}>Why use {seo.name}</SectionHeading>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {seo.examples.map((example) => (
            <li key={example.title} className="rounded-xl bg-muted p-4">
              <h3 className="text-[15px] font-extrabold text-foreground">
                {example.title}
              </h3>
              <p className="mt-1.5 text-[15px] font-medium leading-relaxed text-muted-foreground">
                {example.body}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Common use cases (only when curated content exists) */}
      {seo.useCases?.length > 0 && (
        <div className={CARD_CLASS}>
          <SectionHeading icon={BookOpen}>Common use cases</SectionHeading>
          <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {seo.useCases.map((useCase) => (
              <li
                key={useCase}
                className="flex gap-2.5 text-[15px] font-medium leading-relaxed text-muted-foreground"
              >
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FAQ — native <details>, no client JS, crawlable content */}
      <div className={CARD_CLASS}>
        <SectionHeading icon={HelpCircle}>Frequently asked questions</SectionHeading>
        {/*
          Padding sits on the <summary>, not on the <details>: only the summary
          toggles, so padding on the wrapper is dead space around the target.
          With it on the wrapper the tappable row measured 24px tall on a 390px
          phone (40px for a two-line question) — under the 44px minimum in
          master.md. min-h-11 plus the padding moved inward makes the whole
          visible row the target.
        */}
        <div className="mt-3 space-y-2">
          {seo.faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group rounded-xl bg-muted"
              open={index === 0}
            >
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-[15px] font-bold text-foreground transition-colors duration-150 hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 group-open:text-primary motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-card text-primary transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  <Plus className="h-3.5 w-3.5" />
                </span>
              </summary>
              <p className="max-w-3xl px-4 pb-4 text-[15px] font-medium leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Related tools */}
      {related.length > 0 && (
        <nav aria-label="Related tools" className={CARD_CLASS}>
          <SectionHeading icon={LayoutGrid}>Related tools</SectionHeading>
          {/*
            min-h-11: these pills measured 32px tall on a 390px phone, and tool
            names are long enough that they wrap to one pill per row there, so
            they are a stack of six under-sized targets rather than a dense row.
            44px is the master.md minimum.
          */}
          <ul className="mt-4 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/tools/all/${item.slug}`}
                  className="group inline-flex min-h-11 items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-[15px] font-bold text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:text-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {item.name}
                  <ArrowUpRight className="h-3.5 w-3.5 text-primary transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Embed-on-your-site snippet (allowlisted widget categories only) */}
      {isEmbeddable(slug) && (
        <section aria-label={`Embed ${tool?.name || seo.name}`} className={CARD_CLASS}>
          <SectionHeading icon={Code2}>Embed this tool on your site</SectionHeading>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-muted-foreground">
            Add the {tool?.name || seo.name} widget to your blog or website — free, responsive,
            no signup. Just keep the &ldquo;Widget by AltFTool&rdquo; credit link visible.
          </p>
          <div className="mt-4">
            <EmbedCodeCopy
              snippet={buildEmbedSnippet(slug, tool?.name || seo.name)}
              containerClassName="rounded-xl"
              preClassName="max-h-44 overflow-auto rounded-xl bg-muted p-3 text-xs leading-5 text-foreground"
              dividerClassName="pt-2"
              buttonClassName="inline-flex min-h-11 items-center gap-2 rounded-full bg-muted px-4 text-sm font-bold text-primary transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transform-none"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <Link
              href="/embed"
              className="rounded-sm font-semibold text-primary underline underline-offset-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transition-none"
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
