import Link from "next/link";
import { RouteChip } from "./Shell";

/*
 * The cast card.
 *
 * Deliberately typographic rather than pictorial. Every competitor in this
 * category renders a face on the card, which is exactly the thing we are not
 * selling — and a face on a card is also a claim we would then have to
 * generate, store and defend. The card leads with the handle in monospace,
 * because the handle is what a reader recognises, and carries the route stripe
 * so the cost of the persona is legible before the copy is read.
 */
export default function PersonaCard({ entry, compact = false }) {
  return (
    <Link
      href={`/persona/cast/${entry.slug}`}
      prefetch={false}
      className={`psn-card psn-stripe psn-sheet psn-route-${entry.route.id} group flex flex-col gap-3 rounded-xl p-5 pl-6 transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="psn-seed truncate text-xs text-muted-foreground">
            @{entry.handle}
          </p>
          <h3 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-foreground">
            {entry.name}
          </h3>
        </div>
        <RouteChip route={entry.route.route} />
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {entry.tagline}
      </p>

      {!compact && (
        <p className="psn-seed text-[11px] leading-relaxed text-muted-foreground">
          {entry.seed.token}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{entry.niche_.label}</span>
        <span aria-hidden="true">·</span>
        <span>{entry.platform_.label}</span>
        <span aria-hidden="true">·</span>
        <span>{entry.archetype_.label}</span>
      </div>
    </Link>
  );
}
