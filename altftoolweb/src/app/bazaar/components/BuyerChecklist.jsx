import { Check, Scale } from "lucide-react";

import GeoFaq from "./GeoFaq";
import { Note } from "./primitives";

/**
 * Pre-purchase buyer checklist for the high-stakes categories
 * (cars, bikes, mobiles, properties — see data/buyerGuides.js).
 *
 * Server component on purpose, and built on native <details>/<summary>
 * rather than the radix accordion for the same two reasons GeoFaq.jsx
 * documents:
 *
 *  - this is an SEO content surface, and radix unmounts closed panels —
 *    only the open group would exist in the prerendered HTML, which
 *    defeats the point and would leave the FAQPage JSON-LD describing
 *    text that is not on the page;
 *  - it costs zero client JavaScript on the vertical's heaviest pages.
 *
 * Keyboard support (Tab to the summary, Enter/Space to toggle) is native.
 *
 * Heading flow: the page's h1/h2 outline continues here — the block title
 * is an h2, group titles and the FAQ title are h3. Do not reintroduce a
 * heading skip; the a11y audit fixed those.
 *
 * @param {{
 *   guide: {
 *     heading: string,
 *     intro: string,
 *     sections: Array<{ title: string, items: string[] }>,
 *     faqs: Array<{ question: string, answer: string }>,
 *   } | null,
 * }} props
 */
export default function BuyerChecklist({ guide }) {
  if (!guide?.sections?.length) return null;

  return (
    <section aria-labelledby="buyer-guide-heading" className="mt-12 border-t border-(--border) pt-8">
      <h2 id="buyer-guide-heading" className="bzr-section-title">
        {guide.heading}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">{guide.intro}</p>

      <div className="mt-4 overflow-hidden rounded-[var(--anslation-ds-radius-lg,0.75rem)] border border-(--border) bg-(--card)">
        {guide.sections.map((group, index) => (
          <details
            key={group.title}
            open={index === 0}
            className="group border-b border-(--border) last:border-b-0"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 hover:bg-(--muted) focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-(--primary) [&::-webkit-details-marker]:hidden">
              <h3 className="text-sm font-semibold text-(--foreground)">{group.title}</h3>
              <span className="flex shrink-0 items-center gap-3">
                <span className="text-xs text-(--muted-foreground)">
                  {group.items.length} checks
                </span>
                <span
                  aria-hidden="true"
                  className="text-lg leading-none text-(--muted-foreground) transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <ul className="flex flex-col gap-2.5 px-4 pb-4">
              {group.items.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-6 text-(--muted-foreground)">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-(--primary)" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>

      {/* The exact same array feeds createFaqJsonLd() on the page, so the
          structured data always describes text that is genuinely here. */}
      <GeoFaq items={guide.faqs} headingId="buyer-guide-faq" headingAs="h3" />

      <Note icon={Scale}>
        These are verification pointers, not legal, tax or investment advice. Rules and forms
        change and vary by state — confirm current requirements on the official portals and with
        your own lawyer or CA before paying.
      </Note>
    </section>
  );
}
