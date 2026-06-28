"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, ArrowUpRight, CheckCircle2, Image as ImageIcon,
  Link2, Loader2, RefreshCw, Search, ShieldCheck, Unlink, Copy as CopyIcon,
} from "lucide-react";
import { fetchAllBlogsCached, invalidateBlogsCache } from "../services/blogsService";
import { summarizeSeoHealth, ISSUE_GROUPS, matchesGroup } from "../lib/seoAudit";

const SEVERITY_TONE = {
  blocker: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

function readinessTone(score) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-danger";
}

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

/**
 * Actionable SEO Health board. Self-fetches the cached blog set, runs the
 * pure SEO audit, and renders a prioritised work queue with one-click fixes
 * (deep-link to the editor quick-fix) and bulk selection.
 */
export default function SeoHealthBoard() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [group, setGroup] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

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

  const { items, kpis } = useMemo(() => summarizeSeoHealth(blogs), [blogs]);

  const queue = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((it) => it.issues.length > 0)
      .filter((it) => matchesGroup(it, group))
      .filter((it) => !q || (it.blog.heading || it.blog.title || "").toLowerCase().includes(q));
  }, [items, group, search]);

  const openFix = (blog, action) => {
    const suffix = action ? `?refreshAction=${encodeURIComponent(action)}` : "";
    router.push(`/altftool/blogs/edit-blog/${blog.id}${suffix}`);
  };

  const toggle = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const allOnPage = queue.length > 0 && queue.every((it) => selected.includes(it.blog.id));
  const toggleAll = () => setSelected(allOnPage ? [] : queue.map((it) => it.blog.id));

  /* Bulk = route the selected posts into the operations queue with a shared
     fix intent (the heavy batch engine lands in Phase 3). */
  const bulkFix = (action) => {
    if (!selected.length) return;
    const ids = selected.join(",");
    router.push(`/altftool/blogs/bulk-refresh?ids=${encodeURIComponent(ids)}&action=${action}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Analysing SEO health…
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">SEO Health</h2>
          <p className="text-sm text-muted">Prioritised by impact (severity × reach). Fix the top items first.</p>
        </div>
        <button
          onClick={() => load({ force: true })}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-soft"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Re-scan
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi icon={ShieldCheck} label="Avg index readiness" value={`${kpis.avgReadiness}%`} tone={readinessTone(kpis.avgReadiness)} />
        <Kpi icon={AlertTriangle} label="With blockers" value={kpis.blockers} tone={kpis.blockers ? "text-danger" : "text-success"} />
        <Kpi icon={CheckCircle2} label="Needs work" value={kpis.withIssues} />
        <Kpi icon={Unlink} label="Orphan pages" value={kpis.orphans} tone={kpis.orphans ? "text-warning" : "text-success"} />
        <Kpi icon={CopyIcon} label="Duplicates" value={kpis.duplicates} tone={kpis.duplicates ? "text-warning" : "text-success"} />
        <Kpi icon={ImageIcon} label="Missing alt" value={kpis.missingAlt} tone={kpis.missingAlt ? "text-warning" : "text-success"} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ISSUE_GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setGroup(g.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                group === g.key ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-muted hover:bg-surface-soft"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs font-medium text-muted">{queue.length} need attention</span>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-primary-soft px-4 py-2.5">
          <span className="text-sm font-semibold text-primary">{selected.length} selected</span>
          <div className="flex flex-wrap gap-2">
            {[["seo", "Fix SEO"], ["links", "Fix links"], ["review", "Mark reviewed"]].map(([a, label]) => (
              <button key={a} onClick={() => bulkFix(a)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90">
                {label}
              </button>
            ))}
            <button onClick={() => setSelected([])} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-soft">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Queue */}
      {queue.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-16 text-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <p className="text-sm font-semibold text-foreground">No SEO issues in this view</p>
          <p className="text-xs text-muted">Everything here is publish-ready.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-3 border-b border-border bg-surface-soft px-4 py-2.5">
            <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select all" className="h-4 w-4 rounded border-border accent-[var(--primary)]" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Post</span>
          </div>
          <ul className="divide-y divide-border">
            {queue.map(({ blog, issues, readiness }) => (
              <li key={blog.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                <input
                  type="checkbox"
                  checked={selected.includes(blog.id)}
                  onChange={() => toggle(blog.id)}
                  aria-label={`Select ${blog.heading || "blog"}`}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-[var(--primary)]"
                />
                <div className="min-w-0 flex-1">
                  <button onClick={() => openFix(blog, "seo")} className="block max-w-full truncate text-left text-sm font-semibold text-foreground hover:text-primary">
                    {blog.heading || "Untitled"}
                  </button>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {issues.slice(0, 4).map((issue, i) => (
                      <span key={i} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${SEVERITY_TONE[issue.severity]}`}>
                        {issue.type === "orphan" ? <Unlink className="h-3 w-3" /> : issue.type.startsWith("og") ? <Link2 className="h-3 w-3" /> : null}
                        {issue.label}
                      </span>
                    ))}
                    {issues.length > 4 && <span className="text-[11px] font-medium text-muted">+{issues.length - 4} more</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`text-xs font-bold tabular-nums ${readinessTone(readiness.score)}`}>{readiness.score}%</span>
                  <button
                    onClick={() => openFix(blog, issues[0]?.fixAction || "seo")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition hover:opacity-90"
                  >
                    Fix <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
