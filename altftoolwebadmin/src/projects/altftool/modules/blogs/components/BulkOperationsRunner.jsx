"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth } from "firebase/auth";
import {
  AlertTriangle, CheckCircle2, Loader2, Play, RotateCcw, Search, Zap,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { fetchAllBlogsCached, runBulkJob, rollbackBulkJob } from "../services/blogsService";
import { BULK_ACTIONS, isBulkAction, planBulkJob, progressPercent } from "../lib/bulkOps";
import { buildQuickRefreshPayload, appendRefreshBlocks } from "./blogRefreshKit";
import { parseBlogTags } from "./BlogSeoChecklist";
import { parseSourcesText } from "./BlogSourceEditor";

/* Shape a blog doc into the formData the refresh kit expects. */
function normalizeForm(blog = {}) {
  return {
    ...blog,
    tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "",
    sourcesText: "",
  };
}

/* Reuses the existing quick-refresh payload to build a Firestore patch. */
function buildPatch(blog, action) {
  const payload = buildQuickRefreshPayload(action, normalizeForm(blog));
  const fields = { ...payload.fields };
  const blockResult = appendRefreshBlocks(blog.description || blog.content || "", payload.blocks);

  if (fields.tags) fields.tags = parseBlogTags(fields.tags);
  if (fields.sourcesText) {
    fields.sources = parseSourcesText(fields.sourcesText);
    delete fields.sourcesText;
  }
  const patch = { ...fields };
  if (blockResult.changed) patch.description = blockResult.description;
  return patch;
}

export default function BulkOperationsRunner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("seo");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, failed: 0, total: 0 });
  const [log, setLog] = useState([]);
  const [lastJob, setLastJob] = useState(null);
  const [rollingBack, setRollingBack] = useState(false);
  const initialised = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchAllBlogsCached();
        setBlogs(data);
        if (!initialised.current) {
          const qAction = searchParams.get("action");
          if (qAction && isBulkAction(qAction)) setAction(qAction);
          const ids = (searchParams.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
          if (ids.length) setSelectedIds(new Set(ids));
          initialised.current = true;
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? blogs.filter((b) => (b.heading || b.title || "").toLowerCase().includes(q)) : blogs;
  }, [blogs, search]);

  const selectedBlogs = useMemo(() => blogs.filter((b) => selectedIds.has(b.id)), [blogs, selectedIds]);

  const plan = useMemo(
    () => planBulkJob(selectedBlogs, (b) => buildPatch(b, action)),
    [selectedBlogs, action],
  );

  const toggle = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const selectAllFiltered = () => setSelectedIds(new Set(filtered.map((b) => b.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const appendLog = (line) => setLog((prev) => [...prev, `${new Date().toLocaleTimeString()} · ${line}`]);

  const run = async () => {
    if (running || plan.summary.willChange === 0) return;
    setRunning(true);
    setLog([]);
    setLastJob(null);
    setProgress({ done: 0, failed: 0, total: plan.summary.willChange });
    appendLog(`Dry-run: ${plan.summary.willChange} of ${plan.summary.total} will change (${plan.summary.batches} batch${plan.summary.batches === 1 ? "" : "es"}).`);

    try {
      const actor = getAuth().currentUser?.email || "admin";
      const items = plan.changedItems.map((i) => ({ id: i.id, blog: i.blog, patch: i.patch }));
      const result = await runBulkJob({
        items,
        action,
        actor,
        onProgress: (p) => {
          setProgress(p);
          appendLog(`Committed ${p.done}/${p.total}${p.failed ? ` · ${p.failed} failed` : ""}`);
        },
      });
      setLastJob(result);
      appendLog(`Finished: ${result.done} updated, ${result.failed} failed (${result.status}).`);
      emitAlert({
        type: result.failed ? "warning" : "success",
        message: `Bulk ${action}: ${result.done} updated${result.failed ? `, ${result.failed} failed` : ""}.`,
      });
      logAuditEvent({
        module: "blogs",
        action: "BLOG_BULK_RUN",
        entityType: "blog",
        entityId: null,
        summary: `Bulk ${action} on ${result.done} blogs (job ${result.jobId})`,
        changes: { action, jobId: result.jobId, done: result.done, failed: result.failed },
        route: "/altftool/blogs/bulk-refresh",
      });
      setBlogs(await fetchAllBlogsCached({ force: true }));
    } catch (err) {
      console.error("[bulk-run]", err);
      appendLog(`Error: ${err?.message || err}`);
      emitAlert({ type: "error", message: "Bulk run failed." });
    } finally {
      setRunning(false);
    }
  };

  const rollback = async () => {
    if (!lastJob || rollingBack) return;
    setRollingBack(true);
    try {
      const { restored } = await rollbackBulkJob({ jobId: lastJob.jobId, results: lastJob.results });
      appendLog(`Rolled back ${restored} blogs to their pre-job state.`);
      emitAlert({ type: "success", message: `Rolled back ${restored} blogs.` });
      setLastJob(null);
      setBlogs(await fetchAllBlogsCached({ force: true }));
    } catch (err) {
      console.error("[bulk-rollback]", err);
      emitAlert({ type: "error", message: "Rollback failed." });
    } finally {
      setRollingBack(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading blogs…
      </div>
    );
  }

  const pct = progressPercent(progress);

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Bulk operations</h2>
        </div>
        <span className="text-xs font-medium text-muted">{selectedIds.size} selected</span>
      </div>

      {/* Action picker */}
      <div className="flex flex-wrap gap-2">
        {BULK_ACTIONS.map((a) => (
          <button
            key={a.key}
            onClick={() => setAction(a.key)}
            title={a.description}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              action === a.key ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-muted hover:bg-surface-soft"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Selection */}
      <div className="rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-soft px-3 py-2">
          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter posts…"
              className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button onClick={selectAllFiltered} className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-soft">
            Select all ({filtered.length})
          </button>
          {selectedIds.size > 0 && (
            <button onClick={clearSelection} className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-muted hover:bg-surface-soft">
              Clear
            </button>
          )}
        </div>
        <ul className="max-h-56 overflow-auto divide-y divide-border">
          {filtered.slice(0, 300).map((b) => (
            <li key={b.id}>
              <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-surface-soft">
                <input
                  type="checkbox"
                  checked={selectedIds.has(b.id)}
                  onChange={() => toggle(b.id)}
                  className="h-4 w-4 rounded border-border accent-[var(--primary)]"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{b.heading || "Untitled"}</span>
                <span className={`text-[11px] font-semibold ${b.status === "published" ? "text-success" : "text-muted"}`}>
                  {b.status === "published" ? "Published" : "Draft"}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Dry-run summary + run */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-soft px-4 py-3">
        <div className="text-sm text-foreground">
          <span className="font-bold">{plan.summary.willChange}</span> of {plan.summary.total} selected will change
          <span className="text-muted"> · {plan.summary.unchanged} unchanged · {plan.summary.batches} batch{plan.summary.batches === 1 ? "" : "es"}</span>
        </div>
        <button
          onClick={run}
          disabled={running || plan.summary.willChange === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {running ? "Running…" : `Run ${action}`}
        </button>
      </div>

      {/* Progress */}
      {(running || lastJob) && (
        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{progress.done}/{progress.total} committed{progress.failed ? ` · ${progress.failed} failed` : ""}</span>
            {lastJob && (
              <button
                onClick={rollback}
                disabled={rollingBack}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 font-semibold text-foreground hover:bg-surface-soft disabled:opacity-50"
              >
                {rollingBack ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                Roll back this job
              </button>
            )}
          </div>
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="max-h-40 overflow-auto rounded-xl border border-border bg-surface-soft p-3 font-mono text-[11px] leading-relaxed text-muted">
          {log.map((line, i) => (
            <div key={i} className="flex items-start gap-1.5">
              {line.includes("failed") || line.startsWith("Error")
                ? <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-danger" />
                : <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />}
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
