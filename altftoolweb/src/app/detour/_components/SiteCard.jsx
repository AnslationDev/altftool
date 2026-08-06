import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { getCategory, getTimeBand } from "@altftool/core/detour/taxonomy";
import FacetStrip from "./FacetStrip";

/*
 * One entry in the directory.
 *
 * The card links to our own detail page rather than straight out to the site.
 * That is not a traffic trick — the detail page is where the facets, the
 * related sites and the "what is this" context live, and a directory whose
 * cards only fire people off-site has no way to help them choose. The outbound
 * link is present and obvious as a separate control.
 *
 * `compact` drops the blurb for dense grids (related lists, category rails).
 */

export default function SiteCard({ site, compact = false, showCategory = true }) {
  const category = getCategory(site.category);
  const band = getTimeBand(site.timeToJoy);
  const isOriginal = site.origin === "altf";

  return (
    <li className="dtr-card relative flex flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug">
          <Link href={`/detour/site/${site.slug}`} className="dtr-card__link outline-none">
            {site.name}
          </Link>
        </h3>

        {isOriginal ? (
          <span
            className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{
              background: "var(--dtr-accent-soft)",
              color: "var(--dtr-accent-text)",
            }}
          >
            <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
            AltF
          </span>
        ) : null}
      </div>

      {!compact ? (
        <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {site.blurb}
        </p>
      ) : null}

      <div className="mt-3 space-y-2">
        <FacetStrip
          minutes={band?.minutes ?? 1}
          sfw={site.sfw}
          needsSound={site.needsSound}
          mobileOk={site.bestOn !== "desktop"}
        />

        {showCategory && category ? (
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/detour/category/${category.id}`}
              className="relative z-10 truncate text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {category.name}
            </Link>

            <a
              href={site.url}
              target={isOriginal ? undefined : "_blank"}
              rel={isOriginal ? undefined : "noopener noreferrer"}
              className="relative z-10 inline-flex flex-shrink-0 items-center gap-0.5 text-[11px] font-medium transition-colors hover:underline"
              style={{ color: "var(--dtr-accent-text)" }}
            >
              Visit
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
          </div>
        ) : null}
      </div>
    </li>
  );
}
