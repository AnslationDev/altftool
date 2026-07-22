"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";

const REGIONS = [
  { code: "", label: "Worldwide" },
  { code: "US", label: "United States" },
  { code: "IN", label: "India" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
];

function TrendBars({ values }) {
  const visibleValues = values.slice(-24);
  const max = Math.max(...visibleValues, 1);
  return (
    <div className="flex h-48 items-end gap-1 rounded-lg border border-border bg-surface-soft p-4" role="img" aria-label="Relative search interest over the latest available periods">
      {visibleValues.map((value, index) => (
        <span
          key={`${index}-${value}`}
          className="min-w-0 flex-1 rounded-sm bg-primary"
          style={{ height: `${Math.max(4, (value / max) * 100)}%` }}
          title={`Relative interest ${value}`}
        />
      ))}
    </div>
  );
}

export default function LiveTrendPanel({ query }) {
  const [region, setRegion] = useState("");
  const [state, setState] = useState({ status: "loading", data: null, error: "" });

  const load = useCallback(async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    setState((current) => ({ ...current, status: "loading", error: "" }));

    try {
      const params = new URLSearchParams({ skill: query });
      if (region) params.set("country", region);
      const response = await fetch(`/api/trends?${params}`, { signal: controller.signal });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(payload.values) || !payload.values.length) {
        throw new Error(payload.error || "Live interest is temporarily unavailable.");
      }
      setState({ status: "ready", data: payload, error: "" });
    } catch (error) {
      const message = error?.name === "AbortError" ? "The live trend request timed out." : error?.message;
      setState({ status: "error", data: null, error: message || "Live interest is temporarily unavailable." });
    } finally {
      window.clearTimeout(timeout);
    }
  }, [query, region]);

  useEffect(() => {
    load();
  }, [load]);

  const change = Number(state.data?.percentageChange || 0);
  const ChangeIcon = change >= 0 ? TrendingUp : TrendingDown;
  const average = useMemo(() => Math.round(Number(state.data?.averageInterest || 0)), [state.data]);

  return (
    <section className="rounded-lg border border-border bg-card p-5" aria-labelledby="live-interest-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">Live research layer</p>
          <h2 id="live-interest-title" className="mt-1 text-xl font-semibold">Relative search interest</h2>
          <p className="mt-1 text-sm text-muted-foreground">A 0-100 relative index, not absolute search volume.</p>
        </div>
        <label>
          <span className="sr-only">Trend region</span>
          <select value={region} onChange={(event) => setRegion(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            {REGIONS.map((item) => <option key={item.code || "global"} value={item.code}>{item.label}</option>)}
          </select>
        </label>
      </div>

      {state.status === "loading" && (
        <div className="mt-5 space-y-3" aria-live="polite" aria-label="Loading live trend">
          <div className="h-48 animate-pulse rounded-lg bg-surface-soft" />
          <div className="h-4 w-52 animate-pulse rounded bg-surface-soft" />
        </div>
      )}

      {state.status === "error" && (
        <div className="mt-5 rounded-lg border border-warning/30 bg-warning-soft p-4 text-warning" role="status">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Live trend unavailable</p>
              <p className="mt-1 text-sm">{state.error} The verified research snapshot below remains available.</p>
              <button type="button" onClick={load} className="mt-3 inline-flex items-center gap-2 rounded-md border border-current px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {state.status === "ready" && state.data && (
        <div className="mt-5">
          <TrendBars values={state.data.values} />
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-surface-soft px-3 py-2"><dt className="text-xs text-muted-foreground">12-month change</dt><dd className="mt-1 flex items-center gap-1 font-semibold tabular-nums"><ChangeIcon className="h-4 w-4 text-primary" aria-hidden="true" />{change > 0 ? "+" : ""}{change.toFixed(1)}%</dd></div>
            <div className="rounded-md bg-surface-soft px-3 py-2"><dt className="text-xs text-muted-foreground">Average interest</dt><dd className="mt-1 font-semibold tabular-nums">{average}/100</dd></div>
            <div className="rounded-md bg-surface-soft px-3 py-2"><dt className="text-xs text-muted-foreground">Region</dt><dd className="mt-1 font-semibold">{REGIONS.find((item) => item.code === region)?.label}</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
