import Link from "next/link";
import { ArrowUpRight, Code2, HelpCircle, ListChecks, Plus, Table2 } from "lucide-react";
import { buildEmbedSnippet, isEmbeddable } from "@/app/embed/embedRegistry";
import EmbedCodeCopy from "@/app/embed/EmbedCodeCopy";
import { buildTransformSeoContent } from "../_lib/transformSeoContent";

/**
 * Server-rendered GEO content for a converter page.
 *
 * The workspace above it is a client component, so this is the part of the
 * page that is unambiguously present in the raw HTML for crawlers and answer
 * engines. Every claim is generated from the manifest by
 * buildTransformSeoContent(), and everything rendered here — steps, FAQs — is
 * exactly what the page's JSON-LD describes. The crawlable content needs no
 * client JS: the FAQ uses native <details>, so the answers stay in the source.
 * (The embed block's copy button is the one client island, and the snippet it
 * copies is server-rendered text either way.)
 *
 * Styling follows master.md: semantic tokens only (light + dark), AA contrast,
 * visible focus, reduced-motion safe.
 *
 * @param {{ tool: import("../_lib/manifest.js").ToolMeta }} props
 */
export default function TransformSeoSection({ tool }) {
  const seo = buildTransformSeoContent(tool);
  // Widget ids are namespaced by family: `xml-to-json` is both a /tools/all tool
  // and a converter here, and they are two different widgets.
  const widgetId = `transform/${tool.slug}`;

  return (
    <section
      aria-label={`About ${seo.title}`}
      className="mt-6 space-y-4 text-(--foreground) [font-family:var(--font-ibm-plex-sans,inherit)]"
    >
      {/* What this converter does — answer-first, then the spec table. */}
      <div className="rounded-[16px] border border-(--border) bg-(--card) p-5 sm:p-7">
        <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight sm:text-xl">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] bg-(--muted) text-(--primary)"
            aria-hidden="true"
          >
            <Table2 className="h-4 w-4" />
          </span>
          What {seo.title} does
        </h2>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-(--muted-foreground)">{seo.answer}</p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-(--muted-foreground)">{seo.detail}</p>
        {seo.categoryNote ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
            {seo.categoryNote}
          </p>
        ) : null}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              {seo.title} converter specification: input and output formats, where it runs, and the
              library it uses.
            </caption>
            <tbody>
              {seo.spec.map((row) => (
                <tr key={row.label} className="border-b border-(--border) last:border-b-0">
                  <th
                    scope="row"
                    className="w-44 py-2.5 pr-4 align-top font-semibold text-(--foreground)"
                  >
                    {row.label}
                  </th>
                  <td className="py-2.5 align-top leading-6 text-(--muted-foreground)">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to convert X to Y — mirrored exactly by the HowTo JSON-LD. */}
      <div className="rounded-[16px] border border-(--border) bg-(--card) p-5 sm:p-7">
        <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight sm:text-xl">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] bg-(--muted) text-(--primary)"
            aria-hidden="true"
          >
            <ListChecks className="h-4 w-4" />
          </span>
          {seo.howToName}
        </h2>
        <ol className="mt-5 space-y-3">
          {seo.steps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-(--muted) text-xs font-bold text-(--primary-text)">
                {index + 1}
              </span>
              <p className="max-w-3xl text-sm leading-6 text-(--muted-foreground)">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* FAQ — rendered visibly, and the only Q&As the FAQPage schema names. */}
      <div className="rounded-[16px] border border-(--border) bg-(--card) p-5 sm:p-7">
        <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight sm:text-xl">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] bg-(--muted) text-(--primary)"
            aria-hidden="true"
          >
            <HelpCircle className="h-4 w-4" />
          </span>
          {seo.title} — frequently asked questions
        </h2>
        <div className="mt-4 space-y-2">
          {seo.faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="group rounded-[8px] border border-(--border) bg-(--background) px-4 py-3"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[6px] text-sm font-semibold text-(--foreground) transition-colors hover:text-(--primary-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35 group-open:text-(--primary-text) motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
                <h3 className="text-sm font-semibold">{faq.question}</h3>
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-(--muted) text-(--primary) transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  <Plus className="h-3.5 w-3.5" />
                </span>
              </summary>
              <p className="max-w-3xl pt-2.5 text-sm leading-6 text-(--muted-foreground)">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* Embed-on-your-site snippet. Every embed carries a followable credit
          link back to this converter — that is the whole deal of the programme,
          so the copy says so plainly rather than burying it. */}
      {isEmbeddable(widgetId) ? (
        <div className="rounded-[16px] border border-(--border) bg-(--card) p-5 sm:p-7">
          <h2 className="flex items-center gap-2.5 text-lg font-bold tracking-tight sm:text-xl">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] bg-(--muted) text-(--primary)"
              aria-hidden="true"
            >
              <Code2 className="h-4 w-4" />
            </span>
            Embed this converter
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
            Drop the live {seo.title} workspace into your own docs page, tutorial or blog post with
            one snippet. Free, responsive, light and dark — just keep the &ldquo;Widget by
            AltFTool&rdquo; credit link visible.
          </p>
          <div className="mt-4">
            <EmbedCodeCopy snippet={buildEmbedSnippet(widgetId)} />
          </div>
          <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
            <Link
              href="/embed"
              className="rounded-[4px] font-semibold text-(--primary-text) underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
            >
              Browse every embeddable AltFTool widget →
            </Link>
          </p>
        </div>
      ) : null}

      {/* Nearest siblings, with real descriptive anchor text. */}
      {seo.siblings.length > 0 ? (
        <nav
          aria-label={`Other ${tool.category} converters`}
          className="rounded-[16px] border border-(--border) bg-(--card) p-5 sm:p-7"
        >
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">
            Other {tool.category} converters
          </h2>
          <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
            {seo.siblings.map((sibling) => (
              <li key={sibling.slug}>
                <Link
                  href={`/transform/${sibling.slug}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--background) px-3.5 py-1.5 text-sm font-semibold text-(--foreground) transition hover:-translate-y-0.5 hover:border-(--primary) hover:text-(--primary-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  {sibling.title}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-(--primary) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </section>
  );
}
