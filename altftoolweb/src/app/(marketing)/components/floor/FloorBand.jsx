import Link from "next/link";
import AltFFloor from "./AltFFloor";

/*
 * A floor scene placed on a product page.
 *
 * WHY A BAND AND NOT A HERO REPLACEMENT
 * Every product page already has a hero, and on most of them the second column
 * is doing real work — AltF Ideas puts the top-scoring idea and its six-signal
 * fingerprint there. Dropping a decorative scene on top of that would trade
 * information for atmosphere, which is a bad trade above the fold.
 *
 * So the scene gets its own band underneath: it shows how the thing in front of
 * you gets made, next to a sentence saying so. Additive, not displacing.
 */

export default function FloorBand({ scene, kicker, title, body, href, cta, className = "" }) {
  return (
    <section className={`border-y border-border bg-surface/40 ${className}`}>
      {/* Copy above, room below — not side by side. The scene is 16/9 now, and a
          half-width column turns a widescreen room back into a letterbox. */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="max-w-3xl">
          {kicker ? (
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
              {kicker}
            </p>
          ) : null}
          <h2 className="mt-3 text-[clamp(1.5rem,2.6vw,2.125rem)] font-semibold leading-tight tracking-[-0.02em] text-foreground">
            {title}
          </h2>
          <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            {body}
          </p>
          {href && cta ? (
            <Link
              href={href}
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-md text-[0.9375rem] font-medium text-primary-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
            >
              {cta}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>

        <div className="mt-8">
          <AltFFloor scene={scene} />
        </div>
      </div>
    </section>
  );
}
