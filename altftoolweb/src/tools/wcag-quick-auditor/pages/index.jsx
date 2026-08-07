"use client";

import { useMemo, useRef, useState } from "react";
import {
  Accessibility,
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Code2,
  Download,
  EyeOff,
  FileCode2,
  FormInput,
  Heading,
  Image as ImageIcon,
  Info,
  Keyboard,
  Landmark,
  Languages,
  LockKeyhole,
  MousePointerClick,
  ScanSearch,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Table2,
  Trash2,
  Upload,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  auditHtmlStructure,
  auditorLimits,
  buildCountsOnlyWcagReport,
} from "../lib/auditHtmlStructure.mjs";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_FILE_PATTERN = /\.(?:html?|txt)$/iu;

const SAMPLE_HTML = `<!doctype html>
<html>
<head>
  <title>Marketplace account</title>
</head>
<body>
  <header>Example site</header>
  <h1>Account</h1>
  <h3>Contact details</h3>
  <img src="profile.png">
  <label>Email</label>
  <input id="email" name="email" placeholder="Email">
  <button aria-label=""></button>
  <a href="/next"><img alt=""></a>
  <div id="status"></div>
  <p id="status"></p>
  <iframe src="help.html"></iframe>
  <table><tr><td>Plan</td><td>Basic</td></tr></table>
  <button tabindex="4">Continue</button>
</body>
</html>`;

const ASSESSMENT_STYLE = {
  issues: {
    icon: AlertTriangle,
    box: "border-danger bg-danger-soft",
    iconBox: "bg-danger-soft text-danger",
  },
  review: {
    icon: Info,
    box: "border-warning bg-warning-soft",
    iconBox: "bg-warning-soft text-warning",
  },
  clear: {
    icon: CheckCircle2,
    box: "border-success bg-success-soft",
    iconBox: "bg-success-soft text-success",
  },
};

const SEVERITY_STYLE = {
  error: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-foreground",
};

const CHECK_AREAS = [
  { icon: Languages, label: "Title and language" },
  { icon: Heading, label: "Heading order" },
  { icon: ImageIcon, label: "Image alternatives" },
  { icon: FormInput, label: "Labels and autocomplete" },
  { icon: MousePointerClick, label: "Control names" },
  { icon: Table2, label: "Tables and iframes" },
  { icon: Landmark, label: "Landmarks" },
  { icon: Keyboard, label: "Positive tabindex" },
];

function downloadReport(content) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "html-accessibility-structure-counts-only.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function AssessmentCard({ result }) {
  const style = ASSESSMENT_STYLE[result.assessment.level];
  const Icon = style.icon;
  return (
    <section className={`rounded-xl border p-5 sm:p-6 ${style.box}`} aria-live="polite">
      <div className="flex items-start gap-4">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${style.iconBox}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Inert structural result
          </p>
          <h2 className="mt-1 text-xl font-black text-foreground">
            {result.assessment.label}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {result.assessment.description}
          </p>
        </div>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Error matches
          </dt>
          <dd className="mt-1 text-2xl font-black text-foreground">{result.counts.error}</dd>
          <p className="mt-1 text-xs text-muted-foreground">Missing or conflicting structure</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Review warnings
          </dt>
          <dd className="mt-1 text-2xl font-black text-foreground">{result.counts.warning}</dd>
          <p className="mt-1 text-xs text-muted-foreground">Context needs human judgment</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Elements reviewed
          </dt>
          <dd className="mt-1 text-2xl font-black text-foreground">{result.stats.elements}</dd>
          <p className="mt-1 text-xs text-muted-foreground">Visible structural candidates</p>
        </div>
      </dl>
    </section>
  );
}

function FindingCard({ finding }) {
  return (
    <article className="tool-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {finding.ruleId.replace(/-/gu, " ")}
          </p>
          <h3 className="mt-1 font-bold text-foreground">{finding.title}</h3>
        </div>
        <span className={`rounded-pill px-3 py-1 text-xs font-bold uppercase ${SEVERITY_STYLE[finding.severity]}`}>
          {finding.severity} · {finding.count}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {finding.explanation}
      </p>
      {finding.details ? (
        <p className="mt-3 text-sm font-semibold text-foreground">{finding.details}</p>
      ) : null}
      {finding.locations.length ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {finding.locations.map((location, index) => (
            <li
              key={`${location.line}-${location.target}-${index}`}
              className="rounded-pill bg-surface-soft px-3 py-1 text-xs font-semibold text-muted-foreground"
            >
              Line {location.line} · {location.target}
            </li>
          ))}
          {finding.count > finding.locations.length ? (
            <li className="rounded-pill bg-surface-soft px-3 py-1 text-xs font-semibold text-muted-foreground">
              +{finding.count - finding.locations.length} more
            </li>
          ) : null}
        </ul>
      ) : null}
    </article>
  );
}

export default function WcagQuickAuditor() {
  const fileInputRef = useRef(null);
  const [html, setHtml] = useState("");
  const [result, setResult] = useState(null);
  const [reading, setReading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    "Paste HTML or choose a local file. Remote URLs are intentionally unsupported.",
  );

  const report = useMemo(
    () => (result ? buildCountsOnlyWcagReport(result) : ""),
    [result],
  );

  const runAudit = (event) => {
    event.preventDefault();
    if (!html.trim()) return;
    const nextResult = auditHtmlStructure(html);
    setResult(nextResult);
    setCopied(false);
    setError("");
    setNotice(
      `Local structural audit complete: ${nextResult.counts.error} error-level and ${nextResult.counts.warning} review-warning matches.`,
    );
  };

  const loadSample = () => {
    setHtml(SAMPLE_HTML);
    setResult(null);
    setCopied(false);
    setError("");
    setNotice("Issue-rich inert sample loaded. Choose Run structural audit.");
  };

  const clearAll = () => {
    if (!html && !result) return;
    if (
      !window.confirm(
        "Clear the pasted HTML and audit result? This cannot be undone.",
      )
    ) {
      return;
    }
    setHtml("");
    setResult(null);
    setCopied(false);
    setError("");
    setNotice("Source and result discarded from this page.");
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    if (!ACCEPTED_FILE_PATTERN.test(file.name)) {
      setError("Choose an HTML, HTM, or TXT file.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("This file is larger than 2 MB. Choose a smaller HTML source file.");
      return;
    }
    setReading(true);
    try {
      const text = await file.text();
      setHtml(text.slice(0, auditorLimits.maxHtmlLength));
      setResult(null);
      setCopied(false);
      setNotice(
        text.length > auditorLimits.maxHtmlLength
          ? `File loaded as inert text. Only the first ${auditorLimits.maxHtmlLength.toLocaleString("en-US")} characters were kept.`
          : "File loaded as inert text. Choose Run structural audit.",
      );
    } catch {
      setError("The browser could not read this local file.");
    } finally {
      setReading(false);
    }
  };

  const copyReport = async () => {
    if (!report) return;
    const didCopy = await safeCopyText(report);
    setCopied(didCopy);
    if (didCopy) window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6">
      <header className="tool-card overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Accessibility className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Inert HTML structure review
                </p>
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  WCAG Quick Auditor
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Check common document-language, title, heading, image, form, control, ID, iframe,
              table, landmark, tabindex, and autocomplete markup signals without rendering the
              source.
            </p>
          </div>
          <div className="rounded-xl border border-success bg-success-soft p-4 text-sm text-foreground lg:max-w-sm">
            <div className="flex items-center gap-2 font-bold text-success">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
              No execution · No remote fetch
            </div>
            <p className="mt-2 leading-relaxed">
              A conservative local tokenizer reads the source as inert text. Scripts, links,
              images, stylesheets, and iframes are never run or loaded.
            </p>
          </div>
        </div>
      </header>

      <div
        className="rounded-xl border border-warning bg-warning-soft p-4 text-sm text-foreground"
        role="note"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <p className="leading-relaxed">
            <strong>This is not a WCAG conformance audit.</strong> It cannot evaluate rendered
            contrast, layout, zoom, reflow, focus visibility, keyboard behavior, dynamic states,
            media, timing, errors, screen-reader output, accessibility APIs, or real user tasks.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="tool-card p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <FileCode2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">HTML source</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Paste source or upload a local HTML/HTM/TXT file. There is no URL input by design.
              </p>
            </div>
          </div>

          <form className="mt-5" onSubmit={runAudit}>
            <label htmlFor="wcag-html-source" className="text-sm font-bold text-foreground">
              Source to inspect
            </label>
            <textarea
              id="wcag-html-source"
              value={html}
              onChange={(event) => {
                setHtml(event.target.value.slice(0, auditorLimits.maxHtmlLength));
                setResult(null);
                setCopied(false);
              }}
              rows={22}
              maxLength={auditorLimits.maxHtmlLength}
              placeholder="Paste a complete HTML document or fragment…"
              className="mt-2 w-full resize-y rounded-lg border border-border bg-surface p-4 font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              spellCheck={false}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Source is tokenized, never inserted into the page DOM.</span>
              <span>
                {html.length.toLocaleString("en-US")} /{" "}
                {auditorLimits.maxHtmlLength.toLocaleString("en-US")}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button type="submit" className="btn-primary" disabled={!html.trim()}>
                <ScanSearch className="h-4 w-4" aria-hidden="true" />
                Run structural audit
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={reading}
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                {reading ? "Reading locally…" : "Choose local file"}
              </button>
              <button type="button" className="btn-secondary" onClick={loadSample}>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Load issue sample
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={clearAll}
                disabled={!html && !result}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Clear
              </button>
            </div>
          </form>

          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.txt,text/html,text/plain"
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Choose a local HTML source file"
          />
        </section>

        <aside className="min-w-0 space-y-6">
          <section className="tool-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <SearchCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-bold text-foreground">Configured quick checks</h2>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {CHECK_AREAS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-lg bg-surface-soft p-3 text-sm font-semibold text-foreground"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </section>

          <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-foreground">Source stays local</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Nothing is uploaded or persisted. The exported report contains only counts and
                generic rule names—no source, snippets, attributes, IDs, URLs, or line locations.
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 text-sm ${
              error
                ? "border-danger bg-danger-soft text-foreground"
                : "border-border bg-surface-soft text-muted-foreground"
            }`}
            role={error ? "alert" : "status"}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {error ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
              ) : (
                <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              )}
              <p className="leading-relaxed">{error || notice}</p>
            </div>
          </div>
        </aside>
      </div>

      {result ? (
        <>
          <AssessmentCard result={result} />

          <section className="tool-card p-5">
            <h2 className="text-xl font-bold text-foreground">Structural inventory</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Headings", result.stats.headings],
                ["Images", result.stats.images],
                ["Decorative images", result.stats.decorativeImages],
                ["Form fields", result.stats.formFields],
                ["Control candidates", result.stats.namedControls],
                ["Tables", result.stats.tables],
                ["Iframes", result.stats.iframes],
                ["Landmarks", result.stats.landmarks],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-border bg-surface-soft p-3">
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 text-xl font-black text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="min-w-0 space-y-4 xl:col-span-2">
              <div className="tool-card p-5">
                <h2 className="text-xl font-bold text-foreground">Findings</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Generic element numbers and source line locations help local review. Source
                  snippets and attribute values are never copied into findings.
                </p>
              </div>
              {result.findings.length ? (
                result.findings.map((finding) => (
                  <FindingCard key={finding.ruleId} finding={finding} />
                ))
              ) : (
                <div className="rounded-xl border border-success bg-success-soft p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold text-foreground">
                        No configured structural issue found
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Continue with visual, responsive, keyboard, focus, screen-reader,
                        automated-browser, and real-user testing.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <aside className="min-w-0 space-y-6">
              <section className="tool-card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Clipboard className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-bold text-foreground">Counts-only report</h2>
                    <p className="text-sm text-muted-foreground">No source or locations</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <button type="button" className="btn-primary" onClick={copyReport}>
                    <Clipboard className="h-4 w-4" aria-hidden="true" />
                    {copied ? "Report copied" : "Copy counts-only report"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => downloadReport(report)}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download report
                  </button>
                </div>
              </section>

              <section className="tool-card p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <h2 className="font-bold text-foreground">Next audit layers</h2>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                      <li>Rendered contrast, text spacing, zoom, reflow, and responsive states</li>
                      <li>Keyboard order, traps, focus indication, dialogs, menus, and errors</li>
                      <li>Screen-reader names, roles, states, descriptions, and live updates</li>
                      <li>Real tasks with disabled users and relevant assistive technology</li>
                    </ul>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          <section className="rounded-xl border border-border bg-surface-soft p-4 text-sm leading-relaxed text-muted-foreground">
            <p className="font-bold text-foreground">Scope limitation</p>
            <p className="mt-1">{result.disclaimer}</p>
            {result.truncated ? (
              <p className="mt-2 font-semibold text-warning">
                Source exceeded the local limit, so only the first{" "}
                {auditorLimits.maxHtmlLength.toLocaleString("en-US")} characters were checked.
              </p>
            ) : null}
          </section>
        </>
      ) : null}
    </main>
  );
}
