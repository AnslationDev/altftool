"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Link2,
  RefreshCw,
  Route,
  Sparkles,
  WandSparkles,
} from "lucide-react";

function scoreTone(score = 0) {
  if (score >= 85) return "border-success bg-success-soft text-success";
  if (score >= 65) return "border-warning bg-warning-soft text-warning";
  return "border-danger bg-danger-soft text-danger";
}

function statTone(count = 0, clearTone = "green") {
  if (count > 0) return "bg-warning-soft text-warning";
  return clearTone === "slate" ? "bg-surface-soft text-muted" : "bg-success-soft text-success";
}

function Stat({ label, value, tone }) {
  return (
    <div className={`rounded-xl px-2 py-2 text-center ${tone}`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function QueueButton({ children, tone = "gray" }) {
  const tones = {
    gray: "border-border bg-surface-soft hover:border-primary hover:bg-primary-soft",
    red: "border-danger bg-danger-soft hover:border-danger hover:bg-danger-soft",
    amber: "border-warning bg-warning-soft hover:border-warning hover:bg-warning-soft",
  };

  return (
    <div
      className={`group w-full rounded-xl border px-3 py-3 text-left transition ${tones[tone] || tones.gray}`}
    >
      {children}
    </div>
  );
}

function CleanupRow({ node, onApplySafeCleanup, onEdit }) {
  const fixes = node.cleanup?.fixes || [];

  return (
    <QueueButton tone={fixes.some((fix) => fix.kind === "self-link") ? "amber" : "gray"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black leading-5 text-foreground group-hover:text-primary">{node.blog.title}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {fixes.slice(0, 3).map((fix, index) => (
              <span key={`${node.blog.id}-${fix.kind}-${index}`} className="rounded-lg bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                {fix.label}
              </span>
            ))}
          </div>
        </div>
        <span className="rounded-lg bg-surface px-2 py-1 text-xs font-black text-foreground shadow-sm">{fixes.length}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onApplySafeCleanup?.({ blogIds: [node.blog.id], limit: 1 })}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white transition hover:bg-primary"
        >
          <WandSparkles className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(node.blog, "links")}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-xs font-bold text-primary shadow-sm transition hover:bg-primary-soft"
        >
          Edit details
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </QueueButton>
  );
}

function WeakAnchorRow({ node, onApplyWeakAnchors, onEdit }) {
  const issue = node.weakAnchors[0];

  return (
    <QueueButton>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-black text-foreground group-hover:text-primary">{node.blog.title}</p>
          <p className="mt-1 truncate font-mono text-[10px] text-muted">{issue?.href || "internal link"}</p>
        </div>
        <span className="rounded-lg bg-surface px-2 py-1 text-xs font-black text-foreground shadow-sm">{node.weakAnchors.length}</span>
      </div>
      <div className="mt-2 rounded-lg bg-surface px-2 py-2 text-xs leading-5 text-muted">
        Replace <span className="font-black text-danger">{issue?.text || "empty text"}</span>
        {issue?.suggestion ? (
          <>
            {" "}with <span className="font-black text-success">{issue.suggestion}</span>
          </>
        ) : (
          " with destination-specific text"
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {issue?.suggestion ? (
          <button
            type="button"
            onClick={() => onApplyWeakAnchors?.({ blogIds: [node.blog.id], limit: 1 })}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white transition hover:bg-primary"
          >
            <WandSparkles className="h-3.5 w-3.5" />
            Preview text fix
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onEdit?.(node.blog, "links")}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-xs font-bold text-primary shadow-sm transition hover:bg-primary-soft"
        >
          Edit links
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </QueueButton>
  );
}

function RedirectRow({ node, onApplySafeCleanup, onEdit }) {
  const issue = node.redirects[0];

  return (
    <QueueButton tone="amber">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-black text-foreground group-hover:text-warning">{node.blog.title}</p>
          <p className="mt-1 truncate font-mono text-[10px] text-warning">{issue?.href}</p>
        </div>
        <Route className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      </div>
      <p className="mt-2 text-xs leading-5 text-warning">{issue?.detail}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onApplySafeCleanup?.({ blogIds: [node.blog.id], limit: 1 })}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-warning px-2.5 text-xs font-semibold text-white transition hover:bg-warning"
        >
          <WandSparkles className="h-3.5 w-3.5" />
          Preview redirect
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(node.blog, "links")}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-surface px-2.5 text-xs font-bold text-warning shadow-sm transition hover:bg-warning-soft"
        >
          Edit details
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </QueueButton>
  );
}

export default function BlogLinkHealthPanel({
  applying = false,
  onApplyCombinedFixes,
  onApplySafeCleanup,
  onApplyWeakAnchors,
  onEdit,
  previewing = false,
  report,
  selectedCount = 0,
}) {
  const summary = report?.summary || {};
  const combinedQueue = report?.combinedQueue || [];
  const cleanupQueue = report?.cleanupQueue || [];
  const weakAnchorQueue = report?.weakAnchorQueue || [];
  const redirectQueue = report?.redirectQueue || [];
  const hasCombinedFixes = combinedQueue.length > 0;
  const hasCleanup = cleanupQueue.length > 0;
  const hasWeakAnchorFixes = weakAnchorQueue.some((node) => node.weakAnchors?.some((issue) => issue.suggestion));

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-muted">Blog link health</p>
          <h2 className="mt-1 text-xl font-black text-foreground">{summary.score ?? 100}% clean</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Preview safe URL cleanup and one-click weak-anchor text fixes before writing to Firebase.
          </p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-black ${scoreTone(summary.score || 100)}`}>
          {summary.brokenLinks ? <AlertTriangle className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label="Broken" value={summary.brokenLinks || 0} tone={summary.brokenLinks ? "bg-danger-soft text-danger" : "bg-success-soft text-success"} />
        <Stat label="Safe fixes" value={summary.cleanupFixCount || 0} tone={statTone(summary.cleanupFixCount)} />
        <Stat label="Weak text" value={summary.weakAnchorCount || 0} tone={statTone(summary.weakAnchorCount, "slate")} />
        <Stat label="Redirects" value={summary.redirectCount || 0} tone={statTone(summary.redirectCount)} />
      </div>

      <button
        type="button"
        onClick={() => onApplyCombinedFixes?.({ limit: 10 })}
        disabled={applying || previewing || !hasCombinedFixes}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:bg-surface-soft"
      >
        {applying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
        {applying ? "Applying..." : selectedCount ? `Preview ${selectedCount} selected link fixes` : "Preview all link fixes"}
      </button>

      <button
        type="button"
        onClick={() => onApplySafeCleanup?.({ limit: 10 })}
        disabled={applying || previewing || !hasCleanup}
        className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-xs font-bold text-foreground transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Link2 className="h-3.5 w-3.5" />
        Preview safe cleanup
      </button>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Safe cleanup queue</p>
          <span className="rounded-lg bg-surface-soft px-2 py-1 text-[10px] font-black text-muted">{cleanupQueue.length}</span>
        </div>
        {cleanupQueue.length ? (
          cleanupQueue.slice(0, 4).map((node) => (
            <CleanupRow key={`cleanup-${node.blog.id}`} node={node} onApplySafeCleanup={onApplySafeCleanup} onEdit={onEdit} />
          ))
        ) : (
          <div className="rounded-xl bg-success-soft px-3 py-3 text-sm font-semibold text-success">
            <CheckCircle2 className="mr-1 inline h-4 w-4" />
            No safe automatic link cleanup needed.
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Weak anchor suggestions</p>
          <button
            type="button"
            onClick={() => onApplyWeakAnchors?.({ limit: 10 })}
            disabled={applying || previewing || !hasWeakAnchorFixes}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary-soft px-2 text-[10px] font-black uppercase tracking-wide text-primary transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-45"
          >
            <WandSparkles className="h-3 w-3" />
            Preview weak anchor fixes
          </button>
        </div>
        {weakAnchorQueue.length ? (
          weakAnchorQueue.slice(0, 3).map((node) => (
            <WeakAnchorRow key={`weak-${node.blog.id}`} node={node} onApplyWeakAnchors={onApplyWeakAnchors} onEdit={onEdit} />
          ))
        ) : (
          <div className="rounded-xl bg-surface-soft px-3 py-3 text-sm font-semibold text-muted">
            No weak anchor text found in current blog links.
          </div>
        )}
      </div>

      {redirectQueue.length ? (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Legacy redirect suggestions</p>
          {redirectQueue.slice(0, 3).map((node) => (
            <RedirectRow key={`redirect-${node.blog.id}`} node={node} onApplySafeCleanup={onApplySafeCleanup} onEdit={onEdit} />
          ))}
        </div>
      ) : null}

      {summary.brokenLinks ? (
        <div className="mt-4 rounded-xl border border-danger bg-danger-soft px-3 py-3 text-xs leading-5 text-danger">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            Manual review needed
          </div>
          <p className="mt-1">Some links are still unknown or unsafe. Open the blog editor to choose the correct destination.</p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-3 text-xs font-semibold leading-5 text-primary">
          <Sparkles className="h-4 w-4 shrink-0" />
          Release-safe mode: every automatic write opens a dry-run preview first.
        </div>
      )}
    </section>
  );
}
