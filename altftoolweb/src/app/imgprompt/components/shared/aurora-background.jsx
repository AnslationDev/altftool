import { cn } from "../../lib/utils";

/**
 * Subtle workspace grid. Absolutely positioned within the page's own
 * relative container (not viewport-fixed) so it stays contained inside
 * /imgprompt and never bleeds over the site's global header/footer.
 */
export function AuroraBackground({ className }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-background", className)}
    >
      <div className="absolute inset-0 bg-grid-glow [background-size:36px_36px] opacity-40 mask-fade-b" />
      <div className="absolute inset-x-0 top-0 h-px bg-primary/30" />
    </div>
  );
}
