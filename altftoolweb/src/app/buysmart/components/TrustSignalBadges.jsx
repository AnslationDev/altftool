"use client";

import { CheckCircle2, MousePointerClick, ShieldAlert, UsersRound } from "lucide-react";

function trustClass(tone) {
  if (tone === "strong") return "border-(--primary) bg-(--muted) text-(--primary)";
  if (tone === "warning") return "border-(--secondary) bg-(--muted) text-(--primary)";
  return "border-(--border) bg-(--background) text-(--muted-foreground)";
}

export default function TrustSignalBadges({ signals, compact = false, showUsage = true }) {
  if (!signals) return null;

  const Icon = signals.needsRecheck ? ShieldAlert : CheckCircle2;
  const usedLabel = signals.shopperUsed > 0
    ? `${signals.shopperUsed} used`
    : signals.shopperActions > 0
      ? `${signals.shopperActions} actions`
      : "";

  return (
    <div className="flex flex-wrap gap-1.5">
      <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${trustClass(signals.tone)}`}>
        <Icon className="h-2.5 w-2.5" />
        {signals.label}
      </span>

      {showUsage && usedLabel ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--background) px-2 py-1 text-[11px] font-semibold text-(--muted-foreground)">
          <UsersRound className="h-3 w-3 text-(--primary)" />
          {usedLabel}
        </span>
      ) : null}

      {!compact && signals.hasLiveActivity ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--muted) px-2 py-1 text-[11px] font-semibold text-(--muted-foreground)">
          <MousePointerClick className="h-3 w-3 text-(--primary)" />
          Live signals
        </span>
      ) : null}
    </div>
  );
}
