"use client";

import { ArrowRight, Check } from "lucide-react";
import { formatMs } from "../utils/trace";
import { CARD } from "./ui.jsx";

const KIND_STYLES = {
  success: {
    backgroundColor: "var(--anslation-ds-success-soft)",
    color: "color-mix(in srgb, var(--anslation-ds-success) 72%, var(--foreground))",
  },
  warning: {
    backgroundColor: "var(--anslation-ds-warning-soft)",
    color: "color-mix(in srgb, var(--anslation-ds-warning) 72%, var(--foreground))",
  },
  danger: {
    backgroundColor: "var(--anslation-ds-danger-soft)",
    color: "color-mix(in srgb, var(--anslation-ds-danger) 75%, var(--foreground))",
  },
};

function shortUrl(url) {
  return String(url || "").replace(/^https?:\/\//, (match) => match);
}

export default function RedirectFlow({ chain }) {
  return (
    <section aria-label="Redirect flow" className={`${CARD} p-4 sm:p-5`}>
      <div className="mb-4 flex items-center gap-2.5">
        <h2 className="text-sm font-bold tracking-tight text-(--foreground)">Redirect Flow</h2>
        <span className="rounded-full bg-(--muted) px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-(--muted-foreground)">
          {chain.length} Steps
        </span>
      </div>

      <ol className="flex items-stretch gap-2 overflow-x-auto px-1 pb-2 pt-2.5">
        {chain.map((step, index) => {
          const isLast = index === chain.length - 1;
          const ok = isLast && step.kind === "success";
          return (
            <li key={`${step.url}-${index}`} className="flex min-w-0 flex-1 items-stretch gap-2">
              <div
                className={`relative flex w-full min-w-[150px] flex-col gap-1.5 rounded-[10px] border bg-(--background) p-3 ${
                  ok
                    ? "border-[color-mix(in_srgb,var(--anslation-ds-success)_55%,var(--border))]"
                    : "border-(--border)"
                }`}
              >
                {ok && (
                  <span
                    aria-hidden="true"
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-[var(--anslation-ds-shadow-sm)]"
                    style={{ backgroundColor: "var(--anslation-ds-success)" }}
                  >
                    <Check size={11} strokeWidth={3.5} />
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: "var(--anslation-ds-cta-gradient)" }}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span
                    className="truncate font-mono text-[11px] font-semibold text-(--foreground)"
                    title={step.url}
                  >
                    {shortUrl(step.url)}
                  </span>
                </div>
                <span
                  className="w-fit rounded-[6px] px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums"
                  style={KIND_STYLES[step.kind]}
                >
                  {step.status ?? "ERR"}
                </span>
                <span className="truncate text-[11px] font-medium text-(--muted-foreground)">
                  {step.statusText}
                </span>
                <span className="text-[11px] font-semibold tabular-nums text-(--muted-foreground)">
                  {formatMs(step.responseTime)}
                </span>
                {/* timeline dot */}
                <span
                  aria-hidden="true"
                  className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-(--border)"
                />
              </div>

              {!isLast && (
                <span className="flex items-center" aria-hidden="true">
                  <ArrowRight size={16} className="text-(--primary-hover) dark:text-(--primary)" />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
