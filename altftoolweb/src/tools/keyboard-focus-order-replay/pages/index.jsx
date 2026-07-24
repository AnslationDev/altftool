"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  FileCode2,
  Keyboard,
  RotateCcw,
  SearchCheck,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  buildFocusOrderReport,
  replayFocusOrder,
} from "../lib/replayFocusOrder.mjs";

const MAX_FILE_SIZE = 500_000;
const SAMPLE_HTML = `<header>
  <a href="/">Home</a>
</header>
<main>
  <h1>Account settings</h1>
  <label>Email <input type="email" aria-label="Email address"></label>
  <button type="button">Save changes</button>
</main>`;

const SOURCES = [
  {
    title: "Understanding WCAG 2.4.3 — Focus Order",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order",
  },
  {
    title: "Technique G59 — Sequential order and relationships",
    href: "https://www.w3.org/WAI/WCAG22/Techniques/general/G59",
  },
  {
    title: "WAI-ARIA APG — Developing a Keyboard Interface",
    href: "https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/",
  },
];

function downloadReport(report) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "keyboard-focus-order-summary.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function KeyboardFocusOrderReplay() {
  const fileRef = useRef(null);
  const [source, setSource] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const report = useMemo(
    () => (result?.ok ? buildFocusOrderReport(result) : null),
    [result],
  );
  const activeItem = result?.ok ? result.order[activeIndex] || null : null;

  const updateSource = (value) => {
    setSource(value.slice(0, MAX_FILE_SIZE));
    setResult(null);
    setError("");
    setActiveIndex(0);
  };

  const readFile = async (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("Choose an HTML or text file no larger than 500 KB.");
      setResult(null);
      return;
    }
    try {
      updateSource(await file.text());
    } catch {
      setError("The selected file could not be read as text.");
      setResult(null);
    }
  };

  const inspect = () => {
    const next = replayFocusOrder(source);
    if (!next.ok) {
      setError(next.errors.join(" "));
      setResult(null);
      return;
    }
    setError("");
    setResult(next);
    setActiveIndex(0);
  };

  const reset = () => {
    setSource("");
    setResult(null);
    setError("");
    setActiveIndex(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  const move = (direction) => {
    if (!result?.order.length) return;
    setActiveIndex((current) =>
      (current + direction + result.order.length) % result.order.length,
    );
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <Keyboard className="h-4 w-4" aria-hidden="true" />
              Static Tab-sequence estimate
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Keyboard Focus-Order Replay
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Estimate native and tabindex-based Tab order from pasted static HTML, then step
              forward or backward through the resulting local sequence.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">Not a rendered keyboard test</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              CSS, scripts, dialogs, shadow DOM, custom widgets, programmatic focus, and visual
              order can change the real experience.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
                <FileCode2 className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                Static HTML source
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Paste source or open an HTML/TXT file up to 500 KB.
              </p>
            </div>
            <label className="btn-secondary inline-flex min-h-10 cursor-pointer items-center gap-2 px-4">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Open file
              <input
                ref={fileRef}
                type="file"
                accept=".html,.htm,.txt,text/html,text/plain"
                className="sr-only"
                onChange={(event) => void readFile(event.target.files?.[0] || null)}
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="sr-only">HTML source for focus-order estimate</span>
            <textarea
              className="input-field min-h-96 w-full resize-y font-mono text-xs"
              value={source}
              onChange={(event) => updateSource(event.target.value)}
              placeholder='<a href="/">Home</a><button>Save</button>'
              spellCheck="false"
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted-foreground)]">
              {source.length.toLocaleString()} / {MAX_FILE_SIZE.toLocaleString()} characters
            </p>
            <button
              type="button"
              className="btn-secondary min-h-10 px-4"
              onClick={() => updateSource(SAMPLE_HTML)}
            >
              Load safe example
            </button>
          </div>
        </section>

        <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--foreground)]">
            <ShieldCheck className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            Official references
          </h2>
          <ul className="mt-4 space-y-3">
            {SOURCES.map((sourceItem) => (
              <li key={sourceItem.href}>
                <a
                  className="inline-flex items-start gap-2 text-sm font-semibold leading-6 text-[var(--primary)] underline-offset-4 hover:underline"
                  href={sourceItem.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {sourceItem.title}
                  <ExternalLink className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Official W3C/WAI material reviewed 24 July 2026. Logical meaning and operability still
            require rendered testing and human judgment.
          </p>
        </aside>
      </div>

      {error ? (
        <p
          className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-4 text-sm text-[var(--foreground)]"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary min-h-11 px-5"
          onClick={inspect}
          disabled={!source.trim()}
        >
          <SearchCheck className="h-4 w-4" aria-hidden="true" />
          Estimate focus order
        </button>
        <button type="button" className="btn-secondary min-h-11 px-5" onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        {report ? (
          <button
            type="button"
            className="btn-secondary min-h-11 px-5"
            onClick={() => downloadReport(report)}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download counts-only summary
          </button>
        ) : null}
      </div>

      {result?.ok ? (
        <section className="space-y-6" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Tab stops", result.counts.tabStops],
              ["Positive tabindex", result.counts.positiveTabIndex],
              ["Unnamed", result.counts.unnamedTabStops],
              ["Nested", result.counts.nestedTabStops],
              ["Error cues", result.counts.errorCues],
              ["Review cues", result.counts.reviewCues],
              ["Nodes parsed", result.counts.nodesParsed],
              ["Cue types", Object.keys(result.cueCounts).length],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-black text-[var(--foreground)]">{value}</p>
              </div>
            ))}
          </div>

          {result.truncated ? (
            <p className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm text-[var(--foreground)]">
              A local parsing limit was reached, so this sequence is incomplete.
            </p>
          ) : null}

          {activeItem ? (
            <section className="rounded-lg border border-[var(--primary)] bg-[var(--primary-soft)] p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Replay step {activeItem.sequence} of {result.order.length}
                  </p>
                  <h2 className="mt-2 break-words text-2xl font-black text-[var(--foreground)]">
                    {activeItem.name || "(unnamed tab stop)"}
                  </h2>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    &lt;{activeItem.tag}&gt; · tabindex {activeItem.effectiveTabIndex} · source{" "}
                    {activeItem.nameSource}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="btn-secondary min-h-11 px-4"
                    onClick={() => move(-1)}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Shift+Tab
                  </button>
                  <button
                    type="button"
                    className="btn-primary min-h-11 px-4"
                    onClick={() => move(1)}
                  >
                    Tab
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <p className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 text-sm text-[var(--muted-foreground)]">
              No supported sequential tab stops were estimated from the supplied static HTML.
            </p>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Estimated sequence</h2>
              <ol className="mt-4 max-h-screen space-y-2 overflow-y-auto">
                {result.order.map((item, index) => (
                  <li key={item.domIndex}>
                    <button
                      type="button"
                      className={`flex min-h-12 w-full items-start gap-3 rounded-lg border p-3 text-left ${
                        index === activeIndex
                          ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                          : "border-[var(--border)] bg-[var(--muted)]"
                      }`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                        {item.sequence}
                      </span>
                      <span className="min-w-0">
                        <span className="block break-words text-sm font-bold text-[var(--foreground)]">
                          {item.name || "(unnamed)"}
                        </span>
                        <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                          {item.tag} · tabindex {item.effectiveTabIndex}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Structural cues</h2>
              {Object.keys(result.cueCounts).length ? (
                <ul className="mt-4 space-y-2">
                  {Object.entries(result.cueCounts).map(([id, count]) => (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-3 text-sm"
                    >
                      <span className="flex items-center gap-2 break-words text-[var(--foreground)]">
                        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {id.replaceAll("-", " ")}
                      </span>
                      <span className="font-bold text-[var(--foreground)]">{count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  No configured structural cue matched. Continue with the rendered page and actual
                  keyboard interaction.
                </p>
              )}
            </section>
          </div>
        </section>
      ) : null}
    </main>
  );
}
