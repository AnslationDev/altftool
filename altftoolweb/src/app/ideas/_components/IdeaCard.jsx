import Link from "next/link";
import { computeAos, derivedBadges, tierOf, EFFORT_LABELS, formatUsd } from "@altftool/core/ideas";
import ScoreRing from "./ScoreRing";
import { SignalBars } from "./SignalBars";

const BADGE_CLASS = {
  underserved: "border-primary/30 bg-primary-soft text-primary",
  weekend: "border-info/30 bg-info-soft text-info",
  cash: "border-success/30 bg-success-soft text-success",
  moat: "border-accent/30 bg-accent-soft text-accent",
  timing: "border-warning/30 bg-warning-soft text-warning",
  contrarian: "border-warning/30 bg-warning-soft text-warning",
};

/**
 * The atom of the whole product. Anatomy is fixed so that 117,000 cards read
 * as one system: rank, score ring, computed badges, title, the wedge in one
 * line, the six-signal fingerprint, then mono metadata.
 *
 * Server component — a browse grid renders 24 of these and none of them need
 * client JS.
 */
export default function IdeaCard({ idea, rank, weights }) {
  const aos = weights ? computeAos(idea.scores, weights) : (idea.aos ?? computeAos(idea.scores));
  const tier = tierOf(aos);
  const badges = derivedBadges(idea.scores, 2);

  return (
    <article
      className="afi-card flex min-h-full flex-col gap-4 rounded-lg border border-card-border bg-card p-5"
      style={{ "--afi-tier": `var(${tier.cssVar})` }}
    >
      <div className="flex items-start gap-3.5">
        {rank != null ? (
          <span className="min-w-7 pt-1.5 font-mono text-xs tabular-nums text-muted-foreground">
            #{rank}
          </span>
        ) : null}
        <ScoreRing scores={idea.scores} aos={aos} size="md" />
        <div className="ml-auto flex max-w-[60%] flex-wrap justify-end gap-1.5">
          {badges.map((badge) => (
            <span
              key={badge.id}
              className={`inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[0.6875rem] ${
                BADGE_CLASS[badge.id] ?? "border-border bg-surface-soft text-muted-foreground"
              }`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-tight text-foreground">
          <Link
            href={`/ideas/idea/${idea.slug}`}
            className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {idea.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {idea.oneLiner}
        </p>
      </div>

      <SignalBars scores={idea.scores} />

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3.5 font-mono text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{idea.dna.vertical}</span>
        <span aria-hidden="true" className="opacity-40">/</span>
        <span>{idea.money.pricingModel}</span>
        <span aria-hidden="true" className="opacity-40">/</span>
        <span>{formatUsd(idea.money.acvLowUsd)} ACV</span>
        <span aria-hidden="true" className="opacity-40">/</span>
        <span>{EFFORT_LABELS[idea.build.effort]}</span>
      </div>
    </article>
  );
}
