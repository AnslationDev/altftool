import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  COST_LABELS,
  EFFORT_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@altftool/core/backlinks";
import ImpactBadge from "./ImpactBadge";

const COST_VAR = {
  free: "--bl-free",
  freemium: "--bl-freemium",
  paid: "--bl-paid",
  unknown: "--bl-unknown",
};

const EFFORT_VAR = {
  low: "--bl-effort-low",
  medium: "--bl-effort-medium",
  high: "--bl-effort-high",
};

function Chip({ children, hue }) {
  return (
    <span className="bl-chip" style={hue ? { "--bl-chip-hue": `var(${hue})` } : undefined}>
      {children}
    </span>
  );
}

/**
 * One submission opportunity, as a scannable row.
 *
 * Two competing jobs: the row has to be readable in a long list, and the
 * outbound submit link has to be the obvious thing to click. So the row title
 * links to our detail page (crawlable, keeps the visitor) while the loud button
 * goes straight out to the submit form — the actual reason someone is here.
 *
 * The external link carries rel="nofollow ugc" deliberately. This is a
 * directory of 661 third-party sites we do not vet editorially; passing link
 * equity to all of them is both a bad signal and not something we can stand
 * behind for every entry.
 */
export default function OpportunityRow({ item, showGroupLabel }) {
  return (
    <li className="bl-row">
      <ImpactBadge impact={item.impact} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="text-[0.9375rem] font-semibold tracking-tight text-foreground">
            <Link
              href={`/backlinks/${item.slug}`}
              className="rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {item.website}
            </Link>
          </h3>
          <span className="font-mono text-xs text-muted-foreground">{item.domain}</span>
        </div>

        {item.guidance ? (
          <p className="mt-1 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            {item.guidance}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Chip hue={COST_VAR[item.cost]}>{COST_LABELS[item.cost]}</Chip>
          <Chip hue={EFFORT_VAR[item.effort]}>{EFFORT_LABELS[item.effort]}</Chip>
          <Chip>{PRIORITY_LABELS[item.priority]}</Chip>
          <Chip>{STATUS_LABELS[item.status]}</Chip>
          {showGroupLabel && item.rawCategory ? <Chip>{item.rawCategory}</Chip> : null}
        </div>
      </div>

      <a
        className="bl-open mt-0.5 shrink-0"
        href={item.url}
        target="_blank"
        rel="noopener noreferrer nofollow ugc"
      >
        Submit
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">{item.website} (opens in a new tab)</span>
      </a>
    </li>
  );
}
