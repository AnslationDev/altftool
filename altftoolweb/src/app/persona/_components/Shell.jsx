import Link from "next/link";

/*
 * Server-rendered shell primitives shared by every AltF Persona route.
 *
 * These are deliberately plain. The product's visual identity lives in
 * persona.css — the route stripe, the identity plate, the monospace locked
 * line — and these components exist only to place it consistently.
 */

export function PersonaSection({ children, className = "", tone = "default", id }) {
  const surface =
    tone === "plate"
      ? "bg-[var(--psn-plate)]"
      : tone === "graticule"
        ? "psn-graticule"
        : "";

  return (
    <section
      id={id}
      className={`border-b border-border ${surface} ${className}`}
    >
      <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, lede, action, as: Tag = "h2" }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="psn-stamp mb-2">{eyebrow}</p> : null}
        <Tag className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </Tag>
        {lede ? (
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {lede}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Stamp({ children, className = "", ...rest }) {
  return (
    <p className={`psn-stamp ${className}`} {...rest}>
      {children}
    </p>
  );
}

export function RouteChip({ route, size = "sm" }) {
  if (!route) return null;
  const padding = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`psn-route-chip psn-route-${route.id} inline-flex items-center gap-1.5 rounded-full font-medium ${padding}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "currentColor" }}
      />
      {route.label}
    </span>
  );
}

export function SeedPlate({ seed, label = "Identity seed", className = "" }) {
  return (
    <div
      className={`psn-plate inline-flex flex-col rounded-md px-3 py-2 ${className}`}
    >
      <span className="psn-stamp opacity-70">{label}</span>
      <span className="psn-seed text-sm font-semibold">{seed}</span>
    </div>
  );
}

/*
 * The self-contained answer that opens a page. Answer-engine crawlers cite the
 * first factual paragraph; burying it under three cards means being quoted from
 * somewhere else's page instead.
 */
export function AnswerBlock({ children, title }) {
  return (
    <div className="psn-accent-panel rounded-xl p-5 sm:p-6">
      {title ? (
        <p className="psn-stamp mb-2" style={{ color: "var(--psn-accent-text)" }}>
          {title}
        </p>
      ) : null}
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}

export function StatStrip({ items }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-background p-4">
          <dt className="psn-stamp">{item.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {item.value}
          </dd>
          {item.note ? (
            <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

export function FaqList({ items, headingLevel: Heading = "h3" }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {items.map((item) => (
        <details key={item.question} className="group bg-background p-5">
          <summary className="cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Heading className="inline text-base font-semibold text-foreground">
              {item.question}
            </Heading>
          </summary>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

export function TileLink({ href, title, blurb, icon: Icon, meta }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="psn-sheet group flex flex-col gap-2 rounded-xl p-5 transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon
            className="h-4 w-4"
            style={{ color: "var(--psn-accent)" }}
            aria-hidden="true"
          />
        ) : null}
        <span className="font-semibold text-foreground">{title}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{blurb}</p>
      {meta ? <p className="psn-stamp mt-auto pt-2">{meta}</p> : null}
    </Link>
  );
}

export function NoteList({ items, tone = "default" }) {
  const bullet =
    tone === "warn" ? "var(--psn-video)" : "var(--psn-accent)";

  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={typeof item === "string" ? item : item.title || index} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: bullet }}
          />
          {typeof item === "string" ? (
            <span className="text-[15px] leading-relaxed text-muted-foreground">
              {item}
            </span>
          ) : (
            <span className="text-[15px] leading-relaxed">
              <strong className="font-semibold text-foreground">
                {item.title}
              </strong>
              {item.detail ? (
                <span className="text-muted-foreground"> — {item.detail}</span>
              ) : null}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Disclaimer({ children }) {
  return (
    <p className="mt-6 rounded-lg border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}
