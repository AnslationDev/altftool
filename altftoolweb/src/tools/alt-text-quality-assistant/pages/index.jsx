"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Info,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  ALT_TEXT_LIMITS,
  buildAltTextCountsReport,
  reviewAltText,
} from "../lib/reviewAltText.mjs";

const INITIAL_DRAFT = {
  purpose: "informative",
  altState: "present",
  altText: "",
  essentialInformation: "",
  actionPurpose: "",
  nearbyText: "",
  longerAlternativeAvailable: false,
};

const PURPOSE_OPTIONS = [
  ["decorative", "Decorative only"],
  ["informative", "Informative image"],
  ["functional", "Link or button image"],
  ["complex", "Complex chart or diagram"],
  ["text-image", "Image containing relevant text"],
  ["unclear", "Purpose is unclear"],
];

const ALT_STATE_OPTIONS = [
  ["missing", "Attribute missing"],
  ["empty", 'Explicitly empty: alt=""'],
  ["present", "Text value present"],
];

const SOURCES = [
  {
    title: "W3C WAI Images Tutorial",
    href: "https://www.w3.org/WAI/tutorials/images/",
  },
  {
    title: "W3C WAI alt Decision Tree",
    href: "https://www.w3.org/WAI/tutorials/images/decision-tree/",
  },
  {
    title: "WCAG 2.2 — Non-text Content",
    href: "https://www.w3.org/TR/WCAG22/#non-text-content",
  },
];

function downloadJson(value) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "alt-text-quality-counts.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function FieldCount({ value, maximum }) {
  return (
    <span className="mt-1 block text-right text-xs text-muted-foreground">
      {[...value].length.toLocaleString("en-US")} /{" "}
      {maximum.toLocaleString("en-US")}
    </span>
  );
}

export default function AltTextQualityAssistant() {
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const report = useMemo(
    () => (result ? buildAltTextCountsReport(result) : null),
    [result],
  );

  const update = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setResult(null);
    setCopied(false);
  };

  const runReview = (event) => {
    event.preventDefault();
    setResult(reviewAltText(draft));
    setCopied(false);
  };

  const reset = () => {
    setDraft(INITIAL_DRAFT);
    setResult(null);
    setCopied(false);
  };

  const copyDraft = async () => {
    if (!result?.suggestedDraft) return;
    const success = await safeCopyText(result.suggestedDraft);
    setCopied(success);
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="tool-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <ImageIcon className="h-4 w-4" aria-hidden="true" />
              Context-first writing review
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Alt-Text Quality Assistant
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Describe what an image does in its exact page context, then review
              the alt state and wording with bounded, explainable cues.
            </p>
          </div>
          <div className="rounded-lg border border-warning bg-warning-soft p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-foreground">
              <AlertTriangle
                className="h-5 w-5 text-warning"
                aria-hidden="true"
              />
              No pixel understanding
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This page never sees the image. It cannot verify factual accuracy,
              meaning, language quality, or WCAG conformance.
            </p>
          </div>
        </div>
      </header>

      <form className="grid gap-6 xl:grid-cols-3" onSubmit={runReview}>
        <section className="tool-card p-5 sm:p-6 xl:col-span-2">
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            Image purpose and wording
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Use the purpose this image has here—not what the same file might
            mean elsewhere.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                Purpose in this context
              </span>
              <select
                className="input-field mt-2 w-full"
                value={draft.purpose}
                onChange={(event) => update("purpose", event.target.value)}
              >
                {PURPOSE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-foreground">
                Current alt state
              </span>
              <select
                className="input-field mt-2 w-full"
                value={draft.altState}
                onChange={(event) => update("altState", event.target.value)}
              >
                {ALT_STATE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-bold text-foreground">
              Current alt text
            </span>
            <textarea
              className="input-field mt-2 min-h-28 w-full resize-y"
              value={draft.altText}
              onChange={(event) =>
                update(
                  "altText",
                  event.target.value.slice(0, ALT_TEXT_LIMITS.textCharacters),
                )
              }
              placeholder="Enter the exact alt value…"
              disabled={draft.altState !== "present"}
            />
            <FieldCount
              value={draft.altText}
              maximum={ALT_TEXT_LIMITS.textCharacters}
            />
          </label>

          {draft.purpose === "functional" ? (
            <label className="mt-5 block">
              <span className="text-sm font-bold text-foreground">
                What action occurs or destination opens?
              </span>
              <textarea
                className="input-field mt-2 min-h-24 w-full resize-y"
                value={draft.actionPurpose}
                onChange={(event) =>
                  update(
                    "actionPurpose",
                    event.target.value.slice(
                      0,
                      ALT_TEXT_LIMITS.contextCharacters,
                    ),
                  )
                }
                placeholder="Example: Search the product catalog"
              />
              <FieldCount
                value={draft.actionPurpose}
                maximum={ALT_TEXT_LIMITS.contextCharacters}
              />
            </label>
          ) : null}

          {["informative", "complex", "text-image"].includes(draft.purpose) ? (
            <label className="mt-5 block">
              <span className="text-sm font-bold text-foreground">
                Essential information users need
              </span>
              <textarea
                className="input-field mt-2 min-h-28 w-full resize-y"
                value={draft.essentialInformation}
                onChange={(event) =>
                  update(
                    "essentialInformation",
                    event.target.value.slice(
                      0,
                      ALT_TEXT_LIMITS.contextCharacters,
                    ),
                  )
                }
                placeholder="State the information or relevant visible text without adding guesses…"
              />
              <FieldCount
                value={draft.essentialInformation}
                maximum={ALT_TEXT_LIMITS.contextCharacters}
              />
            </label>
          ) : null}

          <label className="mt-5 block">
            <span className="text-sm font-bold text-foreground">
              Nearby visible text or caption
            </span>
            <textarea
              className="input-field mt-2 min-h-24 w-full resize-y"
              value={draft.nearbyText}
              onChange={(event) =>
                update(
                  "nearbyText",
                  event.target.value.slice(
                    0,
                    ALT_TEXT_LIMITS.contextCharacters,
                  ),
                )
              }
              placeholder="Optional: paste only the text relevant to deciding duplication…"
            />
            <FieldCount
              value={draft.nearbyText}
              maximum={ALT_TEXT_LIMITS.contextCharacters}
            />
          </label>

          {draft.purpose === "complex" ? (
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-soft p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-primary"
                checked={draft.longerAlternativeAvailable}
                onChange={(event) =>
                  update("longerAlternativeAvailable", event.target.checked)
                }
              />
              <span>
                <strong className="text-foreground">
                  A longer accessible equivalent is available
                </strong>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  For example, nearby prose, a data table, or a linked detailed
                  description that communicates the chart or diagram&apos;s
                  information.
                </span>
              </span>
            </label>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary min-h-11">
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              Review entered alt
            </button>
            <button
              type="button"
              className="btn-secondary min-h-11"
              onClick={reset}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="tool-card p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <ExternalLink
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              Official references
            </h2>
            <ul className="mt-4 space-y-3">
              {SOURCES.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-start gap-2 text-sm font-semibold leading-relaxed text-primary underline-offset-4 hover:underline"
                  >
                    {source.title}
                    <ExternalLink
                      className="mt-1 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              W3C/WAI sources accessed 24 July 2026. The tutorial and decision
              tree are guidance; the exact alternative still depends on context.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-surface-soft p-5">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck
                className="h-5 w-5 text-primary"
                aria-hidden="true"
              />
              Privacy boundary
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Everything is reviewed in this tab. The counts report excludes
              entered alt, context, nearby text, and the suggested draft.
            </p>
          </section>
        </aside>
      </form>

      {result ? (
        <section className="space-y-6" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Outcome", result.outcome.replaceAll("-", " ")],
              ["Errors", result.counts.errors],
              ["Review cues", result.counts.reviews],
              ["Words", result.counts.words],
            ].map(([label, value]) => (
              <div key={label} className="tool-card p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 break-words text-2xl font-black capitalize text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {result.suggestedDraft || result.purpose === "decorative" ? (
            <section className="rounded-lg border border-primary bg-primary-soft p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Sparkles
                      className="h-5 w-5 text-primary"
                      aria-hidden="true"
                    />
                    Draft from your own purpose notes
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    This is copied from what you entered; no missing detail is
                    invented.
                  </p>
                </div>
                {result.suggestedDraft ? (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => void copyDraft()}
                  >
                    <Clipboard className="h-4 w-4" aria-hidden="true" />
                    {copied ? "Copied" : "Copy draft"}
                  </button>
                ) : null}
              </div>
              <p className="mt-4 rounded-lg bg-surface p-4 font-mono text-sm text-foreground">
                {result.purpose === "decorative"
                  ? 'alt=""'
                  : result.suggestedDraft || "No draft available"}
              </p>
            </section>
          ) : (
            <p className="rounded-lg border border-warning bg-warning-soft p-4 text-sm text-foreground">
              No draft is available because the required purpose information was
              not entered.
            </p>
          )}

          <section className="tool-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Review findings
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Treat every cue as a prompt for contextual human review.
                </p>
              </div>
              {report ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => downloadJson(report)}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download counts-only report
                </button>
              ) : null}
            </div>
            {result.findings.length ? (
              <ul className="mt-5 space-y-3">
                {result.findings.map((finding) => (
                  <li
                    key={finding.id}
                    className={`rounded-lg border p-4 ${
                      finding.severity === "error"
                        ? "border-danger bg-danger-soft"
                        : "border-warning bg-warning-soft"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {finding.severity === "error" ? (
                        <AlertTriangle
                          className="mt-1 h-5 w-5 shrink-0 text-danger"
                          aria-hidden="true"
                        />
                      ) : (
                        <Info
                          className="mt-1 h-5 w-5 shrink-0 text-warning"
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-foreground">
                          {finding.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {finding.message}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 flex items-start gap-3 rounded-lg border border-success bg-success-soft p-4 text-sm text-foreground">
                <CheckCircle2
                  className="mt-1 h-5 w-5 shrink-0 text-success"
                  aria-hidden="true"
                />
                No configured cue matched. Continue with rendered-page,
                screen-reader, content, and user testing; this is not a
                conformance result.
              </p>
            )}
          </section>
        </section>
      ) : null}
    </main>
  );
}
