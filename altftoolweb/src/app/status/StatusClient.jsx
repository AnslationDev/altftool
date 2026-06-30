"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  FileSearch,
  Globe2,
  RefreshCw,
  Rss,
  SearchCheck,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";

const STATUS_HISTORY_KEY = "altftool:status-history:v1";
const STATUS_HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000;
const STATUS_HISTORY_LIMIT = 96;

function formatDate(value) {
  if (!value) return "Not checked yet";

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatTime(value) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function formatStatus(value = "unknown") {
  const label = String(value).replace(/-/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function scoreTone(score = 0) {
  if (score >= 90) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (score >= 75) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function statusTone(status = "") {
  if (["healthy", "ready", "live"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (["watch", "degraded"].includes(status)) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function readStatusHistory() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STATUS_HISTORY_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - STATUS_HISTORY_WINDOW_MS;
    return parsed
      .filter((entry) => Number(new Date(entry.checkedAt)) >= cutoff)
      .slice(-STATUS_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function writeStatusHistory(history) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(history.slice(-STATUS_HISTORY_LIMIT)));
  } catch {
    // Local history is a progressive enhancement.
  }
}

function createHistoryEntry({ snapshot, ok, error }) {
  return {
    checkedAt: new Date().toISOString(),
    ok: Boolean(ok),
    status: snapshot?.overall?.status || (ok ? "healthy" : "attention"),
    score: Number(snapshot?.overall?.score || 0),
    tools: Number(snapshot?.tools?.total || 0),
    firebaseScore: Number(snapshot?.firebase?.score || 0),
    error: error || "",
  };
}

function ScoreBar({ score = 0 }) {
  const width = Math.max(0, Math.min(100, Number(score || 0)));
  const barColor =
    width >= 90 ? "bg-emerald-500" : width >= 75 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-(--muted)">
      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function UptimeHistoryPanel({ history }) {
  const total = history.length;
  const passed = history.filter((entry) => entry.ok).length;
  const uptime = total ? Math.round((passed / total) * 1000) / 10 : null;
  const latest = history.at(-1);
  const incidents = history.filter((entry) => !entry.ok).length;
  const visibleEntries = history.slice(-24);

  return (
    <section className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[var(--anslation-ds-radius)] bg-(--muted) text-(--primary)">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-(--foreground)">24h browser history</h2>
            <p className="mt-1 text-xs leading-5 text-(--muted-foreground)">
              Local observations from this browser. Refresh the status page to add a new check.
            </p>
          </div>
        </div>
        <span className={`inline-flex w-fit rounded border px-2.5 py-1 text-xs font-bold ${uptime === null ? "border-(--border) bg-(--muted) text-(--muted-foreground)" : scoreTone(uptime)}`}>
          {uptime === null ? "No history" : `${uptime}% uptime`}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Checks</p>
          <p className="mt-2 text-xl font-bold text-(--foreground)">{formatNumber(total)}</p>
        </div>
        <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Incidents</p>
          <p className="mt-2 text-xl font-bold text-(--foreground)">{formatNumber(incidents)}</p>
        </div>
        <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Last check</p>
          <p className="mt-2 text-sm font-bold text-(--foreground)">{formatDate(latest?.checkedAt)}</p>
        </div>
      </div>

      <div className="mt-4 flex h-12 items-end gap-1 overflow-hidden rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-2">
        {visibleEntries.length ? (
          visibleEntries.map((entry, index) => (
            <span
              key={`${entry.checkedAt}-${entry.status}-${index}`}
              className={`min-w-2 flex-1 rounded-sm ${entry.ok ? "bg-emerald-500" : "bg-rose-500"}`}
              style={{ height: `${Math.max(18, Math.min(100, Number(entry.score || 0)))}%` }}
              title={`${formatTime(entry.checkedAt)} - ${formatStatus(entry.status)} (${entry.score}/100)${entry.error ? ` - ${entry.error}` : ""}`}
            />
          ))
        ) : (
          <span className="self-center text-xs font-semibold text-(--muted-foreground)">
            No local checks saved yet.
          </span>
        )}
      </div>
    </section>
  );
}

function MetricCard({ title, value, helper, score, icon: Icon }) {
  return (
    <article className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            {title}
          </p>
          <p className="mt-2 break-words text-2xl font-bold text-(--foreground)">{value}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--anslation-ds-radius)] bg-(--muted) text-(--primary)">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 min-h-12 text-sm leading-6 text-(--muted-foreground)">{helper}</p>
      <span className={`mt-3 inline-flex rounded border px-2.5 py-1 text-xs font-bold ${scoreTone(score)}`}>
        {formatNumber(score)}/100
      </span>
      <ScoreBar score={score} />
    </article>
  );
}

function CheckRow({ item }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-(--border) py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-(--foreground)">{item.label}</p>
        {item.detail ? (
          <p className="mt-1 break-words text-xs leading-5 text-(--muted-foreground)">
            {item.detail}
          </p>
        ) : null}
      </div>
      {item.ok ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
      )}
    </div>
  );
}

function CheckPanel({ title, icon: Icon, items = [] }) {
  return (
    <section className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-[var(--anslation-ds-radius)] bg-(--muted) text-(--primary)">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-bold text-(--foreground)">{title}</h2>
      </div>
      <div className="mt-4">
        {items.length ? (
          items.map((item) => <CheckRow key={item.key} item={item} />)
        ) : (
          <p className="text-sm text-(--muted-foreground)">No checks reported.</p>
        )}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-(--foreground)">Loading live status</p>
          <p className="mt-1 text-sm text-(--muted-foreground)">Checking tools, Firebase, content, and SEO signals.</p>
        </div>
        <RefreshCw className="h-5 w-5 animate-spin text-(--primary)" />
      </div>
    </div>
  );
}

export default function StatusClient() {
  const [snapshot, setSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const appendHistory = useCallback((entry) => {
    setHistory((currentHistory) => {
      const source = currentHistory.length ? currentHistory : readStatusHistory();
      const cutoff = Date.now() - STATUS_HISTORY_WINDOW_MS;
      const nextHistory = [...source, entry]
        .filter((item) => Number(new Date(item.checkedAt)) >= cutoff)
        .slice(-STATUS_HISTORY_LIMIT);

      writeStatusHistory(nextHistory);
      return nextHistory;
    });
  }, []);

  const loadStatus = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError("");
      const response = await fetch("/api/health", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Status could not be loaded.");
      setSnapshot(payload);
      appendHistory(createHistoryEntry({ snapshot: payload, ok: true }));
    } catch (err) {
      const message = err?.message || "Status could not be loaded.";
      setError(message);
      appendHistory(createHistoryEntry({ ok: false, error: message }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [appendHistory]);

  useEffect(() => {
    setHistory(readStatusHistory());
    loadStatus();
  }, [loadStatus]);

  const metrics = useMemo(() => {
    if (!snapshot) return [];

    return [
      {
        title: "Tool Registry",
        value: formatNumber(snapshot.tools?.total),
        helper: `${formatNumber(snapshot.tools?.priorityRegistered)}/${formatNumber(snapshot.tools?.priorityTotal)} priority tools registered.`,
        score: snapshot.tools?.score || 0,
        icon: Wrench,
      },
      {
        title: "Firebase Reads",
        value: formatStatus(snapshot.firebase?.configured ? "ready" : "needs config"),
        helper: `${formatNumber(snapshot.firebase?.liveBlogs)} live blog sample returned from Firebase.`,
        score: snapshot.firebase?.score || 0,
        icon: Database,
      },
      {
        title: "Content Fallback",
        value: `${formatNumber(snapshot.content?.localBlogs)} blogs`,
        helper: `${formatNumber(snapshot.content?.buySmartStores)} BuySmart fallback stores available.`,
        score: snapshot.content?.score || 0,
        icon: ShieldCheck,
      },
      {
        title: "SEO Surface",
        value: `${formatNumber(snapshot.seo?.score)}%`,
        helper: "Sitemap, robots, and RSS endpoints are exposed for crawlers.",
        score: snapshot.seo?.score || 0,
        icon: SearchCheck,
      },
    ];
  }, [snapshot]);

  return (
    <main className="bg-(--background) text-(--foreground)">
      <section className="section py-8 sm:py-10 lg:py-12">
        <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--anslation-ds-radius)] bg-(--foreground) text-(--background)">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                  Live operations
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-normal text-(--foreground) sm:text-3xl">
                  AltFTool Status
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted-foreground)">
                  Public web readiness across tools, Firebase reads, fallback content, and SEO endpoints.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {snapshot?.overall ? (
                <span className={`inline-flex rounded border px-3 py-2 text-sm font-bold ${statusTone(snapshot.overall.status)}`}>
                  {snapshot.overall.label || formatStatus(snapshot.overall.status)}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => loadStatus({ refresh: true })}
                disabled={loading || refreshing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 text-sm font-semibold text-(--foreground) transition hover:bg-(--muted) disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {snapshot ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Score</p>
                <p className="mt-2 text-2xl font-bold text-(--foreground)">{formatNumber(snapshot.overall?.score)}</p>
              </div>
              <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Generated</p>
                <p className="mt-2 text-sm font-bold text-(--foreground)">{formatDate(snapshot.generatedAt)}</p>
              </div>
              <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Environment</p>
                <p className="mt-2 text-sm font-bold capitalize text-(--foreground)">{snapshot.release?.environment || "unknown"}</p>
              </div>
              <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Commit</p>
                <p className="mt-2 break-all font-mono text-sm font-bold text-(--foreground)">
                  {snapshot.release?.commitSha?.slice(0, 8) || "not exposed"}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mt-5 flex items-start gap-3 rounded-[var(--anslation-ds-radius)] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {loading && !snapshot ? (
          <div className="mt-5">
            <LoadingState />
          </div>
        ) : snapshot ? (
          <>
            <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
              ))}
            </section>

            <div className="mt-5">
              <UptimeHistoryPanel history={history} />
            </div>

            <section className="mt-5 grid gap-4 lg:grid-cols-2">
              <CheckPanel title="Firebase" icon={Database} items={snapshot.firebase?.checks || []} />
              <CheckPanel title="Tools" icon={Wrench} items={snapshot.tools?.checks || []} />
              <CheckPanel title="Content" icon={FileSearch} items={snapshot.content?.checks || []} />
              <CheckPanel title="SEO" icon={Globe2} items={snapshot.seo?.checks || []} />
            </section>

            <section className="mt-5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-bold text-(--foreground)">Public endpoints</h2>
                  <p className="mt-1 text-sm text-(--muted-foreground)">Crawler and release-readiness surfaces.</p>
                </div>
                <span className="inline-flex w-fit rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  Open
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Sitemap", href: "/sitemap.xml", icon: SearchCheck },
                  { label: "Robots", href: "/robots.txt", icon: ShieldCheck },
                  { label: "RSS", href: "/rss.xml", icon: Rss },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
