/**
 * Server-safe FAQ block for the SEO / GEO surfaces.
 *
 * Built on native <details>/<summary> rather than a client accordion for two
 * reasons that both matter on a geo page:
 *
 *  - the answers ship inside the prerendered HTML whether or not the panel is
 *    open, so the FAQPage JSON-LD on the same page is describing text that is
 *    genuinely there;
 *  - it costs zero client JavaScript on a page whose whole job is to be
 *    crawled and read.
 *
 * The `items` array passed here should be the exact same array handed to
 * `createFaqJsonLd()`. If the two ever drift, the structured data becomes a
 * claim about a page that does not exist.
 *
 * @param {{
 *   title?: string,
 *   intro?: string,
 *   items: Array<{ question: string, answer: string }>,
 *   headingId?: string,
 *   headingAs?: string,
 * }} props
 */
export default function GeoFaq({
  title = "Frequently asked questions",
  intro,
  items = [],
  headingId = "faq",
  headingAs: Heading = "h2",
}) {
  const questions = items.filter((item) => item?.question && item?.answer);
  if (questions.length === 0) return null;

  return (
    <section className="bzr-section" aria-labelledby={headingId}>
      <Heading id={headingId} className="bzr-section-title">
        {title}
      </Heading>
      {intro ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">{intro}</p>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card)">
        {questions.map((item, index) => (
          <details
            key={item.question}
            open={index === 0}
            className="group border-b border-(--border) last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-(--foreground) hover:bg-(--muted) focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--primary) [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-lg leading-none text-(--muted-foreground) transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-4 pb-4 text-sm leading-6 text-(--muted-foreground)">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
