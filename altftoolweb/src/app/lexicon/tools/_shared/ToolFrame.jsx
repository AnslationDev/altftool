import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  Dices,
  Grid3x3,
  Music,
  Shuffle,
  WandSparkles,
} from "lucide-react";

import { TOOLS, otherTools, toolPath } from "./catalog.js";

/*
 * Page furniture shared by the six word tools. All server components — the
 * only thing on these pages that needs the browser is the tool itself, and a
 * heading does not become more useful for having been hydrated.
 */

/** Resolved here rather than by name at the call site: lucide renders an
    unknown icon as nothing, silently, so the mapping is kept explicit. */
const ICONS = { Shuffle, WandSparkles, AudioLines, Music, Grid3x3, Dices };

export function ToolIcon({ name, className = "h-5 w-5" }) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon className={className} aria-hidden="true" />;
}

export function ToolSection({ title, description, children, className = "" }) {
  return (
    <section className={`mt-12 ${className}`}>
      <h2 className="text-[clamp(1.25rem,2.2vw,1.5rem)] font-semibold tracking-[-0.02em] text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}

/** Body copy at a fixed measure. Long lines are the fastest way to make an
    explanation look like filler nobody is expected to read. */
export function Prose({ children, className = "" }) {
  return (
    <div
      className={`mt-4 max-w-[68ch] space-y-4 text-[0.9375rem] leading-relaxed text-muted-foreground ${className}`}
    >
      {children}
    </div>
  );
}

/** The steps, rendered from the same array that feeds the HowTo JSON-LD, so
    the page and the structured data can never drift apart. */
export function HowToSteps({ steps = [] }) {
  if (steps.length === 0) return null;
  return (
    <ol className="mt-5 space-y-3" style={{ listStyle: "none" }}>
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-xs font-semibold tabular-nums text-primary">
            {index + 1}
          </span>
          <span className="max-w-[64ch]">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function FaqBlock({ faqs = [], title = "Questions about this tool" }) {
  if (faqs.length === 0) return null;
  return (
    <ToolSection title={title}>
      <dl className="afl-divide mt-2">
        {faqs.map((faq) => (
          <div key={faq.question} className="py-4">
            <dt className="text-[0.9375rem] font-semibold text-foreground">{faq.question}</dt>
            <dd className="mt-1.5 max-w-[68ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    </ToolSection>
  );
}

export function SourcesNote({ children }) {
  return (
    <p className="mt-12 rounded-lg border border-border bg-surface-soft p-4 text-xs leading-relaxed text-muted-foreground">
      {children}{" "}
      <Link href="/lexicon/sources" className="text-primary hover:underline">
        Full sources and licences
      </Link>
      .
    </p>
  );
}

export function RelatedTools({ slug }) {
  const rest = slug ? otherTools(slug) : TOOLS;
  return (
    <ToolSection title="Other word tools">
      <ul
        className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        style={{ listStyle: "none" }}
      >
        {rest.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={toolPath(tool.slug)}
              className="afl-card flex h-full min-h-[2.75rem] flex-col gap-1.5 rounded-lg border border-border bg-surface p-4 no-underline"
            >
              <span className="flex items-center gap-2 text-[0.9375rem] font-semibold text-foreground">
                <ToolIcon name={tool.icon} className="h-4 w-4 text-primary" />
                {tool.name}
              </span>
              <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                {tool.tagline}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/lexicon/tools"
        className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary no-underline hover:underline"
      >
        All word tools <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </ToolSection>
  );
}
