"use client";



import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";

export function UniquenessEstimator({ uniqueness, loading }) {
  return (
    <Card variant="highlight" hoverable={false}>
      <SectionHeader
        icon="🌍"
        title="Global Uniqueness"
        description="How rare is your browser fingerprint among all web users?"
      />

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-14 bg-[var(--muted)] rounded-xl animate-pulse" />
          <div className="h-8 bg-[var(--muted)] rounded-full w-1/2 mx-auto animate-pulse" />
          <div className="h-3 bg-[var(--muted)] rounded animate-pulse" />
          <div className="h-2.5 bg-[var(--muted)] rounded animate-pulse" />
        </div>

      ) : uniqueness ? (
        <div className="text-center">

          {/* "1 in X" big display */}
          <div className="">
            <p className="text-sm text-[var(--muted-foreground)] font-secondary mb-1.5">
              Your fingerprint is unique among
            </p>
            <p className="font-primary font-black text-4xl text-gradient-hero leading-none">
              1 in {uniqueness.oneInFormatted}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] font-secondary mt-1">
              users worldwide
            </p>
          </div>

          {/* Uniqueness label badge */}
          <Badge
            variant={uniqueness.isUnique ? "high" : "medium"}
            size="md"
            className="mb-4"
          >
            {uniqueness.label}
          </Badge>

          {/* Percentile bar */}
          <div className="text-left mt-2">
            <p className="text-[10px] text-[var(--muted-foreground)] font-secondary mb-2 text-center">
              More unique than{" "}
              <span className="text-[var(--foreground)] font-medium">
                {uniqueness.percentile}%
              </span>{" "}
              of all web users
            </p>
            <ProgressBar
              value={parseFloat(uniqueness.percentile)}
              max={100}
              height="md"
              colorMode="risk"
              animated
            />
          </div>

          {/* Context note */}
          <div className="mt-4 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-left">
            <p className="text-[11px] text-[var(--muted-foreground)] font-secondary leading-relaxed">
              📊 Based on research from EFF Panopticlick and AmIUnique studies.
              Even without cookies, this fingerprint can track you across websites.
            </p>
          </div>
        </div>

      ) : null}
    </Card>
  );
}