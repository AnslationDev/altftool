"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCode2,
  RotateCcw,
  SearchCheck,
  ShieldCheck,
  TextCursorInput,
  Upload,
} from "lucide-react";

import {
  auditFormLabels,
  buildFormLabelReport,
} from "../lib/auditFormLabels.mjs";

const MAX_FILE_SIZE = 500_000;
const SAMPLE_HTML = `<form>
  <fieldset>
    <legend>Contact preferences</legend>
    <label for="email">Email address</label>
    <input id="email" name="email" type="email" autocomplete="email" required>
    <label>
      <input type="checkbox" name="updates">
      Send product updates
    </label>
  </fieldset>
  <button type="submit">Save preferences</button>
</form>`;

const SOURCES = [
  {
    title: "WAI Forms Tutorial — Labeling Controls",
    href: "https://www.w3.org/WAI/tutorials/forms/labels/",
  },
  {
    title: "Understanding WCAG 3.3.2 — Labels or Instructions",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions",
  },
  {
    title: "Understanding WCAG 2.5.3 — Label in Name",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/label-in-name",
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
  anchor.download = "form-label-audit-summary.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function FormLabelAuditor() {
  const fileRef = useRef(null);
  const [source, setSource] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const report = useMemo(
    () => (result?.ok ? buildFormLabelReport(result) : null),
    [result],
  );

  const updateSource = (value) => {
    setSource(value.slice(0, MAX_FILE_SIZE));
    setResult(null);
    setError("");
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
    const next = auditFormLabels(source);
    if (!next.ok) {
      setError(next.errors.join(" "));
      setResult(null);
      return;
    }
    setError("");
    setResult(next);
  };

  const reset = () => {
    setSource("");
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <TextCursorInput className="h-4 w-4" aria-hidden="true" />
              Inert HTML form review
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Form Label Auditor
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Review common form naming, label association, group legend, duplicate ID, and ARIA
              reference issues without executing or rendering the supplied HTML.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">Quick structural audit only</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              A clean result does not establish WCAG conformance, label clarity, visual
              instructions, focus behavior, or real assistive-technology output.
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
                HTML source
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
            <span className="sr-only">HTML form source</span>
            <textarea
              className="input-field min-h-96 w-full resize-y font-mono text-xs"
              value={source}
              onChange={(event) => updateSource(event.target.value)}
              placeholder='<label for="email">Email</label><input id="email">'
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
            Official W3C/WAI material reviewed 24 July 2026. Understanding documents and
            techniques explain standards but are not themselves conformance certificates.
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
          Audit form labels
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
              ["Controls", result.counts.controls],
              ["Named", result.counts.namedControls],
              ["Unnamed", result.counts.unnamedControls],
              ["Required", result.counts.requiredControls],
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
              A local parsing limit was reached, so this audit is incomplete.
            </p>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Control inventory</h2>
              {result.controls.length ? (
                <div className="mt-4 max-h-screen space-y-3 overflow-y-auto">
                  {result.controls.map((control) => (
                    <article
                      key={control.index}
                      className={`rounded-lg border p-4 ${
                        control.cues.length
                          ? "border-[var(--warning)] bg-[var(--warning-soft)]"
                          : "border-[var(--success)] bg-[var(--success-soft)]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-[var(--foreground)]">
                          {control.tag} · {control.type}
                        </h3>
                        {control.cues.length ? (
                          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                        )}
                      </div>
                      <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">
                        Heuristic name: {control.accessibleName || "(none)"} · source:{" "}
                        {control.nameSource}
                      </p>
                      {control.cues.length ? (
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-[var(--muted-foreground)]">
                          {control.cues.map((cue) => (
                            <li key={cue.id}>{cue.message}</li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                  No supported visible form controls were found.
                </p>
              )}
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Cue summary</h2>
              {Object.keys(result.cueCounts).length ? (
                <ul className="mt-4 space-y-2">
                  {Object.entries(result.cueCounts).map(([id, count]) => (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 text-sm"
                    >
                      <span className="break-words text-[var(--foreground)]">
                        {id.replaceAll("-", " ")}
                      </span>
                      <span className="font-bold text-[var(--primary)]">{count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  No configured structural cue matched. Continue with rendered, keyboard, visual,
                  screen-reader, and user testing.
                </p>
              )}
            </section>
          </div>
        </section>
      ) : null}
    </main>
  );
}
