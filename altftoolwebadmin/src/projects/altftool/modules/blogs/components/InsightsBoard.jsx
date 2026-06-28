"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight, BarChart3, CalendarDays, Eye, Gauge, LineChart,
  Loader2, PlugZap, RefreshCw, TrendingDown, Trophy,
} from "lucide-react";
import { fetchAllBlogsCached, invalidateBlogsCache } from "../services/blogsService";
import { summarizeInsights } from "../lib/analytics";
import { isFeatureEnabled } from "@/lib/featureFlags";

function Kpi({ icon: Icon, label, value, tone = "text-foreground" }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}

const fmt = (n) => Number(n || 0).toLocaleString();

export default function InsightsBoard() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const searchAnalyticsOn = isFeatureEnabled("blog_search_analytics");

  const load = async ({ force = false } = {}) => {
    try {
      if (force) { invalidateBlogsCache(); setRefreshing(true); } else setLoading(true);
      setBlogs(await fetchAllBlogsCached({ force }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => { load(); }, []);

  const insights = useMemo(() => summarizeInsights(blogs), [blogs]);
  const maxCadence = useMemo(() => Math.max(1, ...insights.cadence.map((c) => c.count)), [insights]);
  const maxCatViews = useMemo(() => Math.max(1, ...insights.benchmarks.map((b) => b.totalViews)), [insights]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Computing insights…
      </div>
    );
  }

  const { kpis } = insights;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Insights</h2>
          <p className="text-sm text-muted">Engagement, publishing cadence, category benchmarks and decay risk.</p>
        </div>
        <button onClick={() => load({ force: true })} disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-soft">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi icon={BarChart3} label="Published" value={fmt(kpis.published)} />
        <Kpi icon={Eye} label="Total views" value={fmt(kpis.totalViews)} />
        <Kpi icon={Gauge} label="Median views" value={fmt(kpis.medianViews)} />
        <Kpi icon={CalendarDays} label="Posts this month" value={fmt(kpis.thisMonth)} />
        <Kpi icon={TrendingDown} label="At-risk (decay)" value={fmt(kpis.atRisk)} tone={kpis.atRisk ? "text-warning" : "text-success"} />
        <Kpi icon={Trophy} label="Top category" value={kpis.topCategory} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Publishing cadence */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><LineChart className="h-4 w-4 text-primary" /> Publishing cadence (6 mo)</h3>
          <div className="flex h-32 items-end gap-2">
            {insights.cadence.map((c) => (
              <div key={c.key} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${(c.count / maxCadence) * 100}%`, minHeight: c.count ? "4px" : "0" }} title={`${c.count} posts`} />
                </div>
                <span className="text-[11px] font-semibold text-muted">{c.label}</span>
                <span className="text-[10px] tabular-nums text-muted">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category benchmarks */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><BarChart3 className="h-4 w-4 text-primary" /> Category performance</h3>
          <ul className="space-y-2">
            {insights.benchmarks.slice(0, 6).map((b) => (
              <li key={b.category}>
                <button
                  onClick={() => router.push(`/altftool/blogs?category=${encodeURIComponent(b.category)}`)}
                  className="group flex w-full items-center gap-3 text-left"
                  title="Open in blog list"
                >
                  <span className="w-28 shrink-0 truncate text-xs font-semibold text-foreground group-hover:text-primary">{b.category}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-soft">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(b.totalViews / maxCatViews) * 100}%` }} />
                  </span>
                  <span className="w-20 shrink-0 text-right text-xs tabular-nums text-muted">{fmt(b.totalViews)} views</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Decay / at-risk queue */}
      <div className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border bg-surface-soft px-4 py-2.5">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground"><TrendingDown className="h-4 w-4 text-warning" /> Decaying content — refresh candidates</span>
          <span className="text-xs text-muted">{insights.atRisk.length} flagged</span>
        </div>
        {insights.atRisk.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">No decay risk detected (need enough aged posts to benchmark).</p>
        ) : (
          <ul className="divide-y divide-border">
            {insights.atRisk.slice(0, 8).map(({ blog, velocity: vel, ageDays }) => (
              <li key={blog.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <button onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}`)} className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-foreground hover:text-primary">
                  {blog.heading || "Untitled"}
                </button>
                <span className="text-xs text-muted">{fmt(blog.views)} views · {ageDays}d old · {vel.toFixed(2)}/day</span>
                <button
                  onClick={() => router.push(`/altftool/blogs/edit-blog/${blog.id}?refreshAction=seo`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                >
                  Refresh <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search Console seam (flag-gated, graceful empty state) */}
      {!searchAnalyticsOn && (
        <div className="flex flex-col items-start gap-2 rounded-2xl border border-dashed border-border bg-surface-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <PlugZap className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
            <div>
              <p className="text-sm font-semibold text-foreground">Connect Google Search Console for live search data</p>
              <p className="text-xs text-muted">Impressions, clicks, CTR and average position per post. Enable the <code className="rounded bg-surface px-1">blog_search_analytics</code> flag once credentials are configured.</p>
            </div>
          </div>
          <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted">Not connected</span>
        </div>
      )}
    </section>
  );
}
