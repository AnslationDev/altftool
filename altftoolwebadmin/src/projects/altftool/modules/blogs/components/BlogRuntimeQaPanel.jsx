"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe2,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { runBlogRuntimeQa, summarizeBlogRuntimeQaResults } from "./blogRuntimeQaClient";

const PUBLIC_SITE_URL = "https://altftool.com";

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeSlug(value = "") {
  return String(value || "")
    .split(/[?#]/)[0]
    .replace(/^https?:\/\/[^/]+\/blogs\//i, "")
    .replace(/^\/?blogs\//i, "")
    .replace(/^\/+|\/+$/g, "")
    .trim();
}

function publicBlogUrl(slug = "") {
  return `${PUBLIC_SITE_URL}/blogs/${normalizeSlug(slug)}`;
}

function buildRuntimeQueue(blogs = []) {
  const seen = new Set();

  return [...blogs]
    .filter((blog) => normalizeSlug(blog.slug))
    .sort((a, b) => {
      const statusRankA = a.status === "published" ? 0 : 1;
      const statusRankB = b.status === "published" ? 0 : 1;
      return (
        statusRankA - statusRankB ||
        (a.refreshScore || 100) - (b.refreshScore || 100) ||
        cleanText(a.title || a.heading).localeCompare(cleanText(b.title || b.heading))
      );
    })
    .filter((blog) => {
      const slug = normalizeSlug(blog.slug);
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .slice(0, 5);
}

function stateTone(state = "queued") {
  if (state === "ok") return "border-green-100 bg-green-50 text-green-700";
  if (state === "broken") return "border-red-100 bg-red-50 text-red-600";
  if (state === "checking") return "border-blue-100 bg-blue-50 text-blue-700";
  return "border-amber-100 bg-amber-50 text-amber-700";
}

function StateIcon({ state }) {
  if (state === "ok") return <CheckCircle2 className="h-4 w-4" />;
  if (state === "broken") return <XCircle className="h-4 w-4" />;
  if (state === "checking") return <RefreshCw className="h-4 w-4 animate-spin" />;
  return <AlertTriangle className="h-4 w-4" />;
}

function RuntimeStat({ label, tone, value }) {
  return (
    <div className={`rounded-xl px-2 py-2 text-center ${tone}`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function RuntimeRow({ blog, checking, onEdit, result }) {
  const title = cleanText(blog.heading || blog.title) || "Untitled blog";
  const state = checking && !result ? "checking" : result?.state || "queued";
  const checks = result?.checks || [];
  const readyChecks = checks.filter((check) => check.done).length;

  return (
    <article className={`rounded-xl border px-3 py-3 ${stateTone(state)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black leading-5">{title}</p>
          <p className="mt-1 truncate text-[11px] font-semibold opacity-80">
            {result ? `${result.score}% live score - ${readyChecks}/${checks.length} checks` : normalizeSlug(blog.slug)}
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/80">
          <StateIcon state={state} />
        </span>
      </div>

      {checks.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {checks.slice(0, 5).map((check) => (
            <span
              key={`${blog.id || blog.slug}-${check.key}`}
              className={`rounded-lg bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                check.done ? "text-green-700" : check.required ? "text-red-600" : "text-amber-700"
              }`}
            >
              {check.label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href={result?.finalUrl || publicBlogUrl(blog.slug)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white px-2 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </a>
        <button
          type="button"
          onClick={() => onEdit?.(blog, "review")}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-2 text-xs font-semibold text-white transition hover:bg-gray-700"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Fix
        </button>
      </div>
    </article>
  );
}

export default function BlogRuntimeQaPanel({ blogs = [], onEdit }) {
  const [runtimeCheck, setRuntimeCheck] = useState({ error: "", results: [], status: "idle" });
  const queue = useMemo(() => buildRuntimeQueue(blogs), [blogs]);
  const summary = useMemo(
    () => runtimeCheck.summary || summarizeBlogRuntimeQaResults(runtimeCheck.results || []),
    [runtimeCheck.results, runtimeCheck.summary],
  );
  const resultMap = useMemo(
    () => new Map((runtimeCheck.results || []).map((item) => [normalizeSlug(item.slug), item])),
    [runtimeCheck.results],
  );
  const checking = runtimeCheck.status === "checking";

  const runQa = async () => {
    if (!queue.length || checking) return;

    setRuntimeCheck({ error: "", results: [], status: "checking" });
    try {
      const result = await runBlogRuntimeQa({ slugs: queue.map((blog) => blog.slug) });
      const nextSummary = result.summary || summarizeBlogRuntimeQaResults(result.results || []);
      setRuntimeCheck({
        checkedAt: result.checkedAt,
        error: "",
        results: result.results || [],
        status: "done",
        summary: nextSummary,
      });
      emitAlert({
        type: nextSummary.broken || nextSummary.warning ? "warning" : "success",
        message:
          nextSummary.broken || nextSummary.warning
            ? "Public runtime QA found blog page checks to review."
            : "Public runtime QA completed cleanly.",
      });
    } catch (err) {
      setRuntimeCheck({ error: err?.message || "Runtime QA failed.", results: [], status: "error" });
      emitAlert({ type: "error", message: err?.message || "Runtime QA failed." });
    }
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-gray-500">Public runtime QA</p>
          <h2 className="mt-1 text-xl font-black text-gray-900">
            {summary.total ? `${summary.ok}/${summary.total} clean` : `${queue.length} queued`}
          </h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Checks live blog pages for load status, JSON-LD, indexability, TOC, related tools, and FAQ blocks.
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Globe2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <RuntimeStat label="OK" value={summary.ok || 0} tone="bg-green-50 text-green-700" />
        <RuntimeStat label="Review" value={summary.warning || 0} tone={summary.warning ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"} />
        <RuntimeStat label="Broken" value={summary.broken || 0} tone={summary.broken ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"} />
      </div>

      <button
        type="button"
        onClick={runQa}
        disabled={checking || !queue.length}
        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {checking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
        {checking ? "Checking..." : "Run runtime QA"}
      </button>

      {runtimeCheck.error ? (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold leading-5 text-red-600">
          {runtimeCheck.error}
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Top live checks</p>
          <span className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-black text-gray-500">
            {runtimeCheck.checkedAt ? new Date(runtimeCheck.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Not run"}
          </span>
        </div>
        {queue.length ? (
          queue.map((blog) => (
            <RuntimeRow
              key={`runtime-qa-${blog.id || blog.slug}`}
              blog={blog}
              checking={checking}
              onEdit={onEdit}
              result={resultMap.get(normalizeSlug(blog.slug))}
            />
          ))
        ) : (
          <div className="rounded-xl bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-600">
            Add a blog slug before running public runtime QA.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-3 text-xs font-semibold leading-5 text-gray-600">
        <Globe2 className="h-4 w-4 shrink-0 text-gray-400" />
        Uses the public AltFTool blog URL by default; localhost is allowed only in development.
      </div>
    </section>
  );
}
