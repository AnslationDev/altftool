"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  Cpu,
  Flame,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";

export default function SmartInsightsPanel({
  result,
  costFormatter,
}) {
  if (!result) return null;

  const topModel = result.models[0] || null;
  const unpricedCount = result.requestCount - result.pricedRequestCount;
  const totalCost = result.estimatedCost || 0;

  const insights = [];

  if (topModel) {
    const costPercent = Math.round((topModel.estimatedCost / (totalCost || 1)) * 100);
    insights.push({
      title: `Top Cost Driver: ${topModel.model}`,
      description: `${topModel.model} accounts for ${costPercent}% of your total estimated spend (${costFormatter.format(topModel.estimatedCost)} across ${topModel.requestCount} requests). Consider routing light tasks to a mini or fast model.`,
      icon: Coins,
      type: "cost",
    });
  }

  if (result.privacySignalCount > 0) {
    insights.push({
      title: `${result.privacySignalCount} Sensitive Data Signals Detected`,
      description: `Scanned prompts contain pattern matches for personal identifiers or credentials. Audit your application logging pipeline to strip API keys, Bearer tokens, or PII before storing usage logs.`,
      icon: ShieldAlert,
      type: "privacy",
    });
  } else {
    insights.push({
      title: "Clean Data Audit",
      description: "No common API key or personal data pattern matches were detected in prompt fields.",
      icon: CheckCircle2,
      type: "success",
    });
  }

  if (unpricedCount > 0) {
    insights.push({
      title: `${unpricedCount} Unpriced Requests`,
      description: `${unpricedCount} request records could not be accurately priced due to missing model rate rules or total-only token fields. Add wildcard "*" fallback rates or model rate rules.`,
      icon: AlertTriangle,
      type: "warning",
    });
  }

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
          <Lightbulb className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
            Smart Insights &amp; Optimization Advisory
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Automated efficiency evaluation and privacy recommendations
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          const isDanger = insight.type === "privacy";
          const isWarning = insight.type === "warning";
          const isSuccess = insight.type === "success";

          return (
            <div
              key={`insight-${idx}`}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                isDanger
                  ? "border-[var(--danger)]/30 bg-[var(--danger-soft)]/20"
                  : isWarning
                  ? "border-[var(--warning)]/30 bg-[var(--warning-soft)]/20"
                  : isSuccess
                  ? "border-[var(--success)]/30 bg-[var(--success-soft)]/20"
                  : "border-[var(--border)] bg-[var(--surface-soft)]"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Icon
                    className={`size-4.5 ${
                      isDanger
                        ? "text-[var(--danger)]"
                        : isWarning
                        ? "text-[var(--warning)]"
                        : isSuccess
                        ? "text-[var(--success)]"
                        : "text-[var(--primary)]"
                    }`}
                  />
                  <h3 className="text-xs font-extrabold text-[var(--foreground)]">
                    {insight.title}
                  </h3>
                </div>

                <p className="mt-2 text-xs font-medium leading-relaxed text-[var(--muted-foreground)]">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
