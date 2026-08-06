import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  Clapperboard,
  Code2,
  FileText,
  Globe2,
  GraduationCap,
  HeartPulse,
  Image as ImageIcon,
  Landmark,
  LayoutGrid,
  ListChecks,
  Mail,
  MapPin,
  Music4,
  Palette,
  PenLine,
  Repeat,
  Send,
  ShieldCheck,
  Sparkles,
  Table2,
  Tv,
  Users,
  Workflow,
} from "lucide-react";

/*
 * Explicit map rather than a namespace import.
 *
 * `import * as Icons` would pull the entire lucide-react surface into every
 * bundle that renders a tile, and an icon name that does not resolve renders
 * as nothing at all — a silent hole in the grid with no error anywhere. An
 * explicit map fails loudly at review time instead.
 */
const CATEGORY_ICONS = {
  BookOpen,
  BriefcaseBusiness,
  Clapperboard,
  Code2,
  FileText,
  Globe2,
  GraduationCap,
  HeartPulse,
  Image: ImageIcon,
  Landmark,
  ListChecks,
  Mail,
  MapPin,
  Music4,
  Palette,
  PenLine,
  Repeat,
  Send,
  ShieldCheck,
  Sparkles,
  Table2,
  Tv,
  Users,
  Workflow,
};

/** Page container. One place to change the rhythm of every Atlas page. */
export function AtlasSection({ children, className = "", ...rest }) {
  return (
    <section
      className={`mx-auto w-full max-w-[var(--anslation-ds-container)] px-4 sm:px-6 lg:px-8 ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description, action, id }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <p className="afa-eyebrow">{eyebrow}</p> : null}
        <h2
          id={id}
          className="mt-1.5 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          prefetch={false}
          className="inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-primary transition hover:gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {action.label}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Breadcrumb trail. Rendered as real links (not just JSON-LD) because the
 * Atlas is four levels deep in places and the browser back button is not a
 * navigation design.
 */
export function Breadcrumbs({ trail = [] }) {
  if (!trail.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={crumb.path} className="flex min-w-0 items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
              ) : null}
              {last ? (
                <span className="truncate font-medium text-foreground">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  prefetch={false}
                  className="truncate transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function StatStrip({ stats = [] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card px-4 py-3.5">
          <dt className="afa-eyebrow">{stat.label}</dt>
          <dd className="afa-figure mt-1.5 text-2xl font-semibold text-foreground">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function CategoryTile({ category }) {
  const Icon = CATEGORY_ICONS[category.icon] || LayoutGrid;

  return (
    <Link
      href={`/altfatlas/category/${category.slug}`}
      prefetch={false}
      className="afa-card group flex h-full items-start gap-3 rounded-lg border border-border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="min-w-0 text-sm font-semibold text-foreground">
            {category.name}
          </span>
          <span className="afa-figure ml-auto shrink-0 text-xs text-muted-foreground">
            {category.count}
          </span>
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {category.tagline}
        </span>
      </span>
    </Link>
  );
}

/**
 * Answer-first block.
 *
 * The first thing on most pages and the chunk AI answer engines lift
 * verbatim, so it has to be a self-contained answer with no "as mentioned
 * above" dependencies on surrounding copy.
 */
export function AnswerBlock({ question, children }) {
  return (
    <div className="afa-answer rounded-r-lg bg-muted/50 py-3 pl-4 pr-4">
      {question ? (
        <p className="text-sm font-semibold text-foreground">{question}</p>
      ) : null}
      <div className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export function FaqList({ faqs = [] }) {
  if (!faqs.length) return null;

  return (
    <div className="grid gap-3">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group rounded-lg border border-border bg-card px-4"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {faq.question}
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-90"
              aria-hidden="true"
            />
          </summary>
          <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
