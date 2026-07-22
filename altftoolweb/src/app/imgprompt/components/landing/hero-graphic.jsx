/**
 * Hero background — a real photo (public/imgprompt/hero-bg.jpg), not a
 * generated graphic: a soft purple/blue gradient sourced from Unsplash
 * (Unsplash License — free for commercial use, no attribution required),
 * downloaded and self-hosted rather than hotlinked.
 *
 * The source photo itself gradients from light lavender (its left edge)
 * to a much darker navy/green corner (its right edge) — shown at full
 * width that made the hero read as two different colors left vs right.
 * Mirroring the same (lighter) left portion onto both halves keeps the
 * far-left and far-right edges visually matched, meeting seamlessly at
 * the center. A light cream wash keeps it readable behind the dark
 * headline text, and a bottom fade blends it into the page below.
 */
export function HeroGraphic() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 w-1/2 bg-cover"
        style={{ backgroundImage: "url(/imgprompt/hero-bg.jpg)", backgroundPosition: "left top" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/2 bg-cover"
        style={{ backgroundImage: "url(/imgprompt/hero-bg.jpg)", backgroundPosition: "left top", transform: "scaleX(-1)" }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "color-mix(in srgb, var(--imgprompt-background) 72%, transparent)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{ backgroundImage: "linear-gradient(to bottom, transparent, var(--imgprompt-background))" }}
      />
    </div>
  );
}
