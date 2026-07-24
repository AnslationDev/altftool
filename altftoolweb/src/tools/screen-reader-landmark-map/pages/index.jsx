"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileCode2,
  Flag,
  Heading,
  Map,
  PanelsTopLeft,
  RotateCcw,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  buildLandmarkReport,
  mapLandmarks,
} from "../lib/mapLandmarks.mjs";

const MAX_FILE_SIZE = 500_000;
const SAMPLE_HTML = `<!doctype html>
<html lang="en">
  <body>
    <header><h1>Example service</h1></header>
    <nav aria-label="Primary"><a href="/">Home</a></nav>
    <main>
      <h2>Account</h2>
      <section aria-labelledby="security-heading">
        <h3 id="security-heading">Security settings</h3>
      </section>
    </main>
    <footer>Example footer</footer>
  </body>
</html>`;

function downloadReport(report) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "screen-reader-landmark-summary.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ScreenReaderLandmarkMap() {
  const fileRef = useRef(null);
  const [source, setSource] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const report = useMemo(
    () => (result?.ok ? buildLandmarkReport(result) : null),
    [result],
  );

  const updateSource = (value) => {
    setSource(value.slice(0, MAX_FILE_SIZE));
    setResult(null);
    setError("");
  };

  const readFile = async (file) => {
    if (!file) return;
    setResult(null);
    setError("");
    if (file.size > MAX_FILE_SIZE) {
      setError("Choose an HTML or text file no larger than 500 KB.");
      return;
    }
    try {
      updateSource(await file.text());
    } catch {
      setError("The selected file could not be read as text.");
    }
  };

  const inspect = () => {
    const next = mapLandmarks(source);
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
              <PanelsTopLeft className="h-4 w-4" aria-hidden="true" />
              Inert HTML structure review
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Screen-Reader Landmark Map
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted-foreground)]">
              Turn pasted HTML into a linear landmark and heading outline. The source stays in this
              tab and is parsed as text rather than executed or rendered.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="font-bold text-[var(--foreground)]">Not a screen-reader test</p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              CSS, dynamic DOM changes, computed names, browser accessibility trees, and real
              assistive-technology behavior require separate testing.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
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
            <span className="sr-only">HTML source to map</span>
            <textarea
              className="input-field min-h-96 w-full resize-y font-mono text-xs"
              value={source}
              onChange={(event) => updateSource(event.target.value)}
              placeholder="<main><h1>Page title</h1></main>"
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

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
            <ShieldCheck className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            Scope and handling
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
            <li className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
              Script, style, template, comments, and markup are never inserted into the page.
            </li>
            <li className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
              Heading text and landmark labels appear locally for review but are omitted from the
              downloadable summary.
            </li>
            <li className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
              Review cues are structural heuristics, not WCAG findings or conformance proof.
            </li>
          </ul>
        </section>
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
          <Map className="h-4 w-4" aria-hidden="true" />
          Build landmark map
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Nodes parsed", result.counts.nodesParsed],
              ["Landmarks", result.counts.landmarks],
              ["Headings", result.counts.headings],
              ["Main landmarks", result.counts.mainLandmarks],
              ["Review cues", result.counts.reviewCues],
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
              A local parsing limit was reached, so this map is incomplete.
            </p>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
                <Flag className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                Landmarks
              </h2>
              {result.landmarks.length ? (
                <ol className="mt-4 space-y-3">
                  {result.landmarks.map((landmark) => (
                    <li
                      key={landmark.index}
                      className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold capitalize text-[var(--foreground)]">
                          {landmark.role}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          &lt;{landmark.tag}&gt; · depth {landmark.depth}
                        </span>
                      </div>
                      <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">
                        {landmark.label
                          ? `Name: ${landmark.label}`
                          : "No accessible name resolved by this parser."}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {landmark.headingCount} mapped headings
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                  No supported landmarks were found.
                </p>
              )}
            </section>

            <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
                <Heading className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                Heading outline
              </h2>
              {result.headings.length ? (
                <ol className="mt-4 space-y-2">
                  {result.headings.map((heading) => (
                    <li
                      key={heading.index}
                      className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3"
                    >
                      <span className="rounded-full bg-[var(--primary-soft)] px-2 py-1 text-xs font-bold text-[var(--primary)]">
                        H{heading.level}
                      </span>
                      <span className="min-w-0 break-words text-sm text-[var(--foreground)]">
                        {heading.text || "(empty heading)"}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                  No supported headings were found.
                </p>
              )}
            </section>
          </div>

          {result.cues.length ? (
            <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                Structural review cues
              </h2>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.cues.map((cue) => (
                  <li
                    key={`${cue.id}-${cue.message}`}
                    className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
                  >
                    {cue.message}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
