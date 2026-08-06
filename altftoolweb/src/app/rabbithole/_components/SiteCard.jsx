import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import SiteMark from "./SiteMark";
import {
  accessLabel,
  categoryName,
  categoryStyle,
  timeLabel,
} from "../_lib/presentation";

/**
 * The directory card.
 *
 * The primary click goes to our own detail page rather than straight out to
 * the site: the detail page is the thing worth indexing, and it is where a
 * visitor finds out whether the link is worth opening. The outbound link is a
 * deliberate secondary affordance for people who already know what they want.
 */
export default function SiteCard({ site, showCategory = true }) {
  return (
    <article className="rh-card rh-toned p-4" style={categoryStyle(site.category)}>
      <div className="flex items-start gap-3">
        <SiteMark site={site} size="md" />

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[0.9375rem] font-semibold leading-tight text-foreground">
            <Link href={`/rabbithole/site/${site.slug}`} className="rh-card__link">
              {site.name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate font-mono text-[0.6875rem] text-muted-foreground">
            {site.host}
          </p>
        </div>

        <a
          href={site.url}
          target="_blank"
          rel="noopener"
          // z-10 lifts this above the stretched link covering the whole card.
          className="relative z-10 -m-1 rounded-md p-1 text-muted-foreground transition hover:text-[var(--rh-hue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rh-hue)]"
          aria-label={`Open ${site.name} in a new tab`}
        >
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <p className="rh-clamp-3 mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {site.blurb}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        {showCategory ? (
          <span className="rh-chip rh-chip--toned">{categoryName(site.category)}</span>
        ) : null}
        <span className="rh-chip">
          <Clock3 className="h-3 w-3" aria-hidden="true" />
          {timeLabel(site.timeToJoy)}
        </span>
        {site.free && !site.needsAccount ? (
          <span className="rh-chip">{accessLabel(site)}</span>
        ) : null}
      </div>
    </article>
  );
}
