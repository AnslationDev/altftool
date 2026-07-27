"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Coins,
  Cpu,
  Database,
  FileText,
  ShieldAlert,
  Zap,
} from "lucide-react";

function formatTokens(value) {
  return Number(value || 0).toLocaleString();
}

export default function MetricsGrid({
  result,
  costFormatter,
}) {
  if (!result) return null;

  const priceableRatio = result.requestCount
    ? Math.round((result.pricedRequestCount / result.requestCount) * 100)
    : 100;

  const cards = [
    {
      label: "Total Requests Analyzed",
      value: result.requestCount.toLocaleString(),
      subtext: `${result.modelCount} unique model(s)`,
      icon: FileText,
      color: "text-[var(--primary)]",
      bg: "bg-[var(--primary-soft)]",
    },
    {
      label: "Estimated Total Cost",
      value: costFormatter.format(result.estimatedCost),
      subtext: `${priceableRatio}% pricing coverage`,
      icon: Coins,
      color: "text-[var(--success)]",
      bg: "bg-[var(--success-soft)]",
    },
    {
      label: "Total Token Volume",
      value: formatTokens(result.totalTokens),
      subtext: `In: ${formatTokens(result.inputTokens)} | Out: ${formatTokens(result.outputTokens)}`,
      icon: Cpu,
      color: "text-[var(--primary)]",
      bg: "bg-[var(--primary-soft)]",
    },
    {
      label: "Input Prompt Tokens",
      value: formatTokens(result.inputTokens),
      subtext: `${Math.round((result.inputTokens / (result.totalTokens || 1)) * 100)}% of token volume`,
      icon: ArrowDownRight,
      color: "text-indigo-500",
      bg: "bg-[var(--surface-soft)]",
    },
    {
      label: "Output Completion Tokens",
      value: formatTokens(result.outputTokens),
      subtext: `${Math.round((result.outputTokens / (result.totalTokens || 1)) * 100)}% of token volume`,
      icon: ArrowUpRight,
      color: "text-emerald-500",
      bg: "bg-[var(--surface-soft)]",
    },
    {
      label: "Sensitive Data Signals",
      value: result.privacySignalCount.toLocaleString(),
      subtext: result.privacySignalCount > 0 ? "Potential credential / PII leakage" : "Zero signals detected",
      icon: ShieldAlert,
      color: result.privacySignalCount > 0 ? "text-[var(--danger)]" : "text-[var(--success)]",
      bg: result.privacySignalCount > 0 ? "bg-[var(--danger-soft)]" : "bg-[var(--success-soft)]",
    },
    {
      label: "Unallocated Token Records",
      value: result.unallocatedTokens.toLocaleString(),
      subtext: result.unallocatedTokens > 0 ? "Total-only token fields" : "100% split token precision",
      icon: Database,
      color: result.unallocatedTokens > 0 ? "text-[var(--warning)]" : "text-[var(--success)]",
      bg: result.unallocatedTokens > 0 ? "bg-[var(--warning-soft)]" : "bg-[var(--success-soft)]",
    },
    {
      label: "Pricing Coverage Rate",
      value: `${priceableRatio}%`,
      subtext: `${result.pricedRequestCount} of ${result.requestCount} requests priced`,
      icon: Activity,
      color: "text-[var(--primary)]",
      bg: "bg-[var(--primary-soft)]",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all hover:border-[var(--border-strong)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                {card.label}
              </span>
              <div className={`flex size-9 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                <Icon className="size-4.5" />
              </div>
            </div>

            <div className="mt-4">
              <span className="break-words text-2xl font-black text-[var(--foreground)] sm:text-3xl">
                {card.value}
              </span>
              <p className="mt-1 text-xs font-semibold text-[var(--muted-foreground)]">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
