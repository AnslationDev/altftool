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
  if (score >= 85) return "border-green-100 bg-green-50 text-green-700";
  if (score >= 65) return "border-amber-100 bg-amber-50 text-amber-700";
  return "border-red-100 bg-red-50 text-red-600";
}

function statTone(count = 0, clearTone = "green") {
  if (count > 0) return "bg-amber-50 text-amber-700";
  return clearTone === "slate" ? "bg-slate-100 text-slate-600" : "bg-green-50 text-green-700";
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
    gray: "border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-blue-50",
    red: "border-red-100 bg-red-50 hover:border-red-200 hover:bg-red-100",
    amber: "border-amber-100 bg-amber-50 hover:border-amber-200 hover:bg-amber-100",
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
          <p className="line-clamp-2 text-sm font-black leading-5 text-gray-900 group-hover:text-blue-700">{node.blog.title}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {fixes.slice(0, 3).map((fix, index) => (
              <span key={`${node.blog.id}-${fix.kind}-${index}`} className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                {fix.label}
              </span>
            ))}
          </div>
        </div>
        <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-gray-700 shadow-sm">{fixes.length}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onApplySafeCleanup?.({ blogIds: [node.blog.id], limit: 1 })}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gray-900 px-2.5 text-xs font-semibold text-white transition hover:bg-gray-700"
        >
          <WandSparkles className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(node.blog, "links")}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
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
          <p className="line-clamp-1 text-sm font-black text-gray-900 group-hover:text-blue-700">{node.blog.title}</p>
          <p className="mt-1 truncate font-mono text-[10px] text-gray-400">{issue?.href || "internal link"}</p>
        </div>
        <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-gray-700 shadow-sm">{node.weakAnchors.length}</span>
      </div>
      <div className="mt-2 rounded-lg bg-white px-2 py-2 text-xs leading-5 text-gray-600">
        Replace <span className="font-black text-red-600">{issue?.text || "empty text"}</span>
        {issue?.suggestion ? (
          <>
            {" "}with <span className="font-black text-green-700">{issue.suggestion}</span>
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
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-700 px-2.5 text-xs font-semibold text-white transition hover:bg-blue-800"
          >
            <WandSparkles className="h-3.5 w-3.5" />
            Preview text fix
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => onEdit?.(node.blog, "links")}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
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
          <p className="line-clamp-1 text-sm font-black text-gray-900 group-hover:text-amber-800">{node.blog.title}</p>
          <p className="mt-1 truncate font-mono text-[10px] text-amber-700">{issue?.href}</p>
        </div>
        <Route className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      </div>
      <p className="mt-2 text-xs leading-5 text-amber-700">{issue?.detail}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onApplySafeCleanup?.({ blogIds: [node.blog.id], limit: 1 })}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-amber-700 px-2.5 text-xs font-semibold text-white transition hover:bg-amber-800"
        >
          <WandSparkles className="h-3.5 w-3.5" />
          Preview redirect
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(node.blog, "links")}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-xs font-bold text-amber-800 shadow-sm transition hover:bg-amber-50"
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
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-gray-500">Blog link health</p>
          <h2 className="mt-1 text-xl font-black text-gray-900">{summary.score ?? 100}% clean</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Preview safe URL cleanup and one-click weak-anchor text fixes before writing to Firebase.
          </p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-black ${scoreTone(summary.score || 100)}`}>
          {summary.brokenLinks ? <AlertTriangle className="h-5 w-5" /> : <Link2 className="h-5 w-5" />}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label="Broken" value={summary.brokenLinks || 0} tone={summary.brokenLinks ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"} />
        <Stat label="Safe fixes" value={summary.cleanupFixCount || 0} tone={statTone(summary.cleanupFixCount)} />
        <Stat label="Weak text" value={summary.weakAnchorCount || 0} tone={statTone(summary.weakAnchorCount, "slate")} />
        <Stat label="Redirects" value={summary.redirectCount || 0} tone={statTone(summary.redirectCount)} />
      </div>

      <button
        type="button"
        onClick={() => onApplyCombinedFixes?.({ limit: 10 })}
        disabled={applying || previewing || !hasCombinedFixes}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {applying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
        {applying ? "Applying..." : selectedCount ? `Preview ${selectedCount} selected link fixes` : "Preview all link fixes"}
      </button>

      <button
        type="button"
        onClick={() => onApplySafeCleanup?.({ limit: 10 })}
        disabled={applying || previewing || !hasCleanup}
        className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Link2 className="h-3.5 w-3.5" />
        Preview safe cleanup
      </button>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Safe cleanup queue</p>
          <span className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-black text-gray-500">{cleanupQueue.length}</span>
        </div>
        {cleanupQueue.length ? (
          cleanupQueue.slice(0, 4).map((node) => (
            <CleanupRow key={`cleanup-${node.blog.id}`} node={node} onApplySafeCleanup={onApplySafeCleanup} onEdit={onEdit} />
          ))
        ) : (
          <div className="rounded-xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-700">
            <CheckCircle2 className="mr-1 inline h-4 w-4" />
            No safe automatic link cleanup needed.
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Weak anchor suggestions</p>
          <button
            type="button"
            onClick={() => onApplyWeakAnchors?.({ limit: 10 })}
            disabled={applying || previewing || !hasWeakAnchorFixes}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-blue-50 px-2 text-[10px] font-black uppercase tracking-wide text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-45"
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
          <div className="rounded-xl bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-600">
            No weak anchor text found in current blog links.
          </div>
        )}
      </div>

      {redirectQueue.length ? (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Legacy redirect suggestions</p>
          {redirectQueue.slice(0, 3).map((node) => (
            <RedirectRow key={`redirect-${node.blog.id}`} node={node} onApplySafeCleanup={onApplySafeCleanup} onEdit={onEdit} />
          ))}
        </div>
      ) : null}

      {summary.brokenLinks ? (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-xs leading-5 text-red-700">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            Manual review needed
          </div>
          <p className="mt-1">Some links are still unknown or unsafe. Open the blog editor to choose the correct destination.</p>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-3 text-xs font-semibold leading-5 text-blue-700">
          <Sparkles className="h-4 w-4 shrink-0" />
          Release-safe mode: every automatic write opens a dry-run preview first.
        </div>
      )}
    </section>
  );
}
