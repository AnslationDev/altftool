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
 * Presentation follows master.md: semantic tokens only, light + dark,
 * card-based layout, no client JS (the FAQ uses native <details>).
 */

function SectionHeading({ icon: Icon, children }) {
  return (
    <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-(--foreground)">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-(--primary)"
        style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      {children}
    </h2>
  );
}

const card = "rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm sm:p-7";

export default function ToolSeoSection({ slug, tool, category = "all" }) {
  const seo = buildToolSeoContent(slug, tool);
  const related = getRelatedTools(slug, 6);

  return (
    <section
      aria-label={`About ${seo.name}`}
      className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-14 pt-2 text-(--foreground) sm:px-6 lg:px-8"
    >
      {/* About */}
      <div className={card}>
        <p className="text-xs font-bold uppercase tracking-wide text-(--primary)">About this tool</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{seo.h1}</h1>
        {tool?.description ? (
          <p className="mt-2 max-w-3xl text-sm font-medium text-(--muted-foreground)">{tool.description}</p>
        ) : null}
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-(--muted-foreground)">{seo.intro}</p>
      </div>

      {/* How to use — numbered step cards */}
      <div className={card}>
        <SectionHeading icon={ListChecks}>How to use {seo.name}</SectionHeading>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {seo.steps.map((step, index) => (
            <li key={step} className="rounded-xl border border-(--border) bg-(--background) p-4">
              <span
                className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold text-(--primary)"
                style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
              >
                {index + 1}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-(--muted-foreground)">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Why use — benefit cards */}
      <div className={card}>
        <SectionHeading icon={Sparkles}>Why use {seo.name}</SectionHeading>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {seo.examples.map((example) => (
            <li key={example.title} className="rounded-xl border border-(--border) bg-(--background) p-4">
              <h3 className="text-sm font-bold text-(--foreground)">{example.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--muted-foreground)">{example.body}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Common use cases (only when curated content exists) */}
      {seo.useCases?.length > 0 && (
        <div className={card}>
          <SectionHeading icon={BookOpen}>Common use cases</SectionHeading>
          <ul className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {seo.useCases.map((useCase) => (
              <li key={useCase} className="flex gap-2.5 text-sm leading-relaxed text-(--muted-foreground)">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--primary)" aria-hidden="true" />
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FAQ — native <details>, no client JS, crawlable content */}
      <div className={card}>
        <SectionHeading icon={HelpCircle}>Frequently asked questions</SectionHeading>
        <div className="mt-3 divide-y divide-(--border)">
          {seo.faqs.map((faq, index) => (
            <details key={faq.question} className="group py-3.5" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-(--foreground) [&::-webkit-details-marker]:hidden">
                {faq.question}
                <Plus
                  className="h-4 w-4 shrink-0 text-(--muted-foreground) transition-transform duration-150 group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-3xl pt-2 text-sm leading-relaxed text-(--muted-foreground)">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related tools */}
      {related.length > 0 && (
        <nav aria-label="Related tools" className={card}>
          <SectionHeading icon={LayoutGrid}>Related tools</SectionHeading>
          <ul className="mt-4 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/tools/all/${item.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--background) px-3.5 py-1.5 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
                >
                  {item.name}
                  <ArrowUpRight className="h-3.5 w-3.5 text-(--muted-foreground) transition group-hover:text-(--primary)" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
