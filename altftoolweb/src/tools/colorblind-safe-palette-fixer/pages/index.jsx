"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  ExternalLink,
  Eye,
  Info,
  Palette,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  CVD_MATRICES,
  MAX_PALETTE_COLORS,
  PALETTE_ROLES,
  SCREENING_CUE_LIMITS,
  SIMULATION_MODES,
  analyzePalette,
  buildPrivacySafeCountsReport,
  normalizeHex,
  validatePaletteRows,
} from "../lib/paletteAnalysis.mjs";

const INITIAL_ROWS = [
  {
    id: "color-1",
    hex: "#C2413A",
    label: "Error",
    role: "status",
  },
  {
    id: "color-2",
    hex: "#3A7D44",
    label: "Success",
    role: "status",
  },
  {
    id: "color-3",
    hex: "#FFFFFF",
    label: "Canvas",
    role: "background",
  },
  {
    id: "color-4",
    hex: "#1F2937",
    label: "Body text",
    role: "text",
  },
];

const DEFAULT_HEXES = [
  "#2563EB",
  "#7C3AED",
  "#D97706",
  "#0F766E",
  "#BE123C",
  "#475569",
];

const ROLE_LABELS = {
  accent: "Accent",
  data: "Data series",
  status: "Status",
  text: "Text",
  background: "Background",
};

const MODE_LABELS = {
  normal: "Authored",
  protanopia: "Protan preview",
  deuteranopia: "Deutan preview",
  tritanopia: "Tritan preview",
};

const SOURCES = [
  {
    title: "W3C WAI — Understanding Use of Color",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color",
  },
  {
    title: "W3C WAI — Understanding Contrast (Minimum)",
    href: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum",
  },
  {
    title:
      "Machado, Oliveira & Fernandes — Physiologically-based CVD simulation model",
    href: "https://profs.ic.uff.br/~laffernandes/content/publications/journal/2009_tvcg_15%286%29/machado_oliveira_fernandes-tvcg-15%286%29-2009-corrected.pdf",
  },
  {
    title: "UFRGS — Model supplementary matrices",
    href: "https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html",
  },
];

function displayName(color) {
  return color.label || `Color ${color.sourceIndex + 1}`;
}

function formatRatio(value) {
  return `${value.toFixed(2)}:1`;
}

function cueLabel(cue) {
  if (cue === "very-close") return "Very close cue";
  if (cue === "close") return "Review cue";
  return "More separated";
}

function cueClasses(cue) {
  if (cue === "very-close") return "border-danger bg-danger-soft";
  if (cue === "close") return "border-warning bg-warning-soft";
  return "border-success bg-success-soft";
}

function downloadCounts(report) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  try {
    anchor.href = url;
    anchor.download = "palette-screening-counts.json";
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}

function Swatch({ color, label }) {
  return (
    <div>
      <div
        className="h-14 w-full rounded-lg border border-border"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <p className="mt-2 truncate text-xs font-semibold text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-xs text-foreground">{color}</p>
    </div>
  );
}

export default function ColorblindSafePaletteFixer() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [result, setResult] = useState(null);
  const [issues, setIssues] = useState([]);
  const [copied, setCopied] = useState("");
  const [nextId, setNextId] = useState(INITIAL_ROWS.length + 1);
  const errorSummaryRef = useRef(null);

  const report = useMemo(
    () => (result ? buildPrivacySafeCountsReport(result) : null),
    [result],
  );

  const formIssues = issues.filter((issue) => issue.rowIndex === undefined);

  // Move focus to the whole-form error summary the moment it appears so
  // screen-reader users are told a submission was rejected, instead of
  // focus silently staying on the just-clicked submit button.
  useEffect(() => {
    if (formIssues.length > 0) {
      errorSummaryRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issues]);

  const clearOutcome = () => {
    setResult(null);
    setIssues([]);
    setCopied("");
  };

  const updateRow = (id, key, value) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
    clearOutcome();
  };

  const addRow = () => {
    if (rows.length >= MAX_PALETTE_COLORS) return;
    const id = `color-${nextId}`;
    const hex = DEFAULT_HEXES[(nextId - 1) % DEFAULT_HEXES.length];
    setRows((current) => [...current, { id, hex, label: "", role: "accent" }]);
    setNextId((current) => current + 1);
    clearOutcome();
  };

  const removeRow = (id) => {
    setRows((current) => current.filter((row) => row.id !== id));
    clearOutcome();
  };

  const reset = () => {
    setRows(INITIAL_ROWS);
    setResult(null);
    setIssues([]);
    setCopied("");
    setNextId(INITIAL_ROWS.length + 1);
  };

  const runAnalysis = (event) => {
    event.preventDefault();
    const validation = validatePaletteRows(rows);
    if (!validation.valid) {
      setIssues(validation.issues);
      setResult(null);
      return;
    }
    setResult(analyzePalette(rows));
    setIssues([]);
    setCopied("");
  };

  const copyCandidate = async (hex) => {
    const success = await safeCopyText(hex);
    setCopied(success ? hex : "");
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="tool-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <Palette className="h-4 w-4" aria-hidden="true" />
              Local palette screening
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Colorblind-Safe Palette Fixer
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Compare authored colors through fixed previews, inspect the
              closest pairs, check role-based text contrast, and explore bounded
              alternatives without uploading a design.
            </p>
          </div>
          <div className="rounded-lg border border-warning bg-warning-soft p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-foreground">
              <AlertTriangle
                className="h-5 w-5 text-warning"
                aria-hidden="true"
              />
              Screening—not a guarantee
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A matrix preview cannot diagnose color vision or predict one
              person&apos;s perception. It does not certify a palette or a page
              as WCAG conformant.
            </p>
          </div>
        </div>
      </header>

      <form className="grid gap-6 xl:grid-cols-3" onSubmit={runAnalysis}>
        <section className="tool-card p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Eye className="h-5 w-5 text-primary" aria-hidden="true" />
                Palette roles
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Use exact opaque #RRGGBB values. Text contrast is calculated
                only between colors marked Text and Background.
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary min-h-11"
              onClick={addRow}
              disabled={rows.length >= MAX_PALETTE_COLORS}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add color
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {rows.map((row, index) => {
              const preview = normalizeHex(row.hex);
              const rowIssue = issues.find((issue) => issue.rowIndex === index);
              return (
                <fieldset
                  key={row.id}
                  className="rounded-lg border border-border bg-surface-soft p-4"
                >
                  <legend className="px-1 text-sm font-bold text-foreground">
                    Color {index + 1}
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] lg:items-end">
                    <label className="block">
                      <span className="text-sm font-bold text-foreground">
                        Hex value
                      </span>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="h-10 w-10 shrink-0 rounded-md border border-border bg-surface"
                          style={
                            preview ? { backgroundColor: preview } : undefined
                          }
                          aria-hidden="true"
                        />
                        <input
                          className="input-field min-w-0 flex-1 font-mono"
                          value={row.hex}
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "hex",
                              event.target.value.slice(0, 9),
                            )
                          }
                          placeholder="#RRGGBB"
                          spellCheck={false}
                          aria-invalid={Boolean(rowIssue)}
                          aria-describedby={
                            rowIssue ? `color-error-${row.id}` : undefined
                          }
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-sm font-bold text-foreground">
                        Optional label
                      </span>
                      <input
                        className="input-field mt-2 w-full"
                        value={row.label}
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "label",
                            event.target.value.slice(0, 60),
                          )
                        }
                        placeholder="Example: Error state"
                      />
                    </label>
                    <label className="block">
                      <span className="text-sm font-bold text-foreground">
                        Intended role
                      </span>
                      <select
                        className="input-field mt-2 w-full"
                        value={row.role}
                        onChange={(event) =>
                          updateRow(row.id, "role", event.target.value)
                        }
                      >
                        {PALETTE_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="btn-secondary min-h-11"
                      onClick={() => removeRow(row.id)}
                      aria-label={`Remove color ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="lg:sr-only">Remove</span>
                    </button>
                  </div>
                  {rowIssue ? (
                    <p
                      id={`color-error-${row.id}`}
                      className="mt-3 text-sm font-semibold text-danger"
                    >
                      {rowIssue.message}
                    </p>
                  ) : null}
                </fieldset>
              );
            })}
          </div>

          {formIssues.length ? (
            <ul
              ref={errorSummaryRef}
              tabIndex={-1}
              role="alert"
              className="mt-4 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-foreground"
            >
              {formIssues.map((issue) => (
                <li key={issue.id}>{issue.message}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary min-h-11">
              <Eye className="h-4 w-4" aria-hidden="true" />
              Screen palette
            </button>
            <button
              type="button"
              className="btn-secondary min-h-11"
              onClick={reset}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reset example
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
              Primary references
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
              Sources accessed 24 July 2026. W3C Understanding pages are
              informative guidance. The simulation paper is the primary model
              source.
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
              Colors and labels stay in this tab. There are no uploads, network
              requests, or saved history. The downloadable report contains
              counts and bands only—not labels, roles, hex values, pairs, or
              alternatives.
            </p>
          </section>

          <section className="rounded-lg border border-primary bg-primary-soft p-5">
            <h2 className="font-bold text-foreground">
              Do not rely on color alone
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Add visible text labels or values.</li>
              <li>Pair status color with icons or shapes.</li>
              <li>Use patterns, line styles, or direct chart labels.</li>
              <li>Keep keyboard focus and control states visible.</li>
              <li>Test the real interface with disabled users.</li>
            </ul>
          </section>
        </aside>
      </form>

      {result ? (
        <section className="space-y-6" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Colors", result.counts.colors],
              ["Pairs", result.counts.pairs],
              ["Very close cues", result.counts.veryClose],
              ["Role contrast checks", result.counts.contrastPairs],
            ].map(([label, value]) => (
              <div key={label} className="tool-card p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-black text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <section className="tool-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Fixed-matrix previews
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  These are full-severity Machado model endpoints applied in
                  linear-light sRGB. The protan and deutan endpoints approximate
                  dichromacy; the model&apos;s tritan endpoint is especially an
                  approximation—not a literal view through another person&apos;s
                  eyes.
                </p>
              </div>
              {report ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => downloadCounts(report)}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download counts only
                </button>
              ) : null}
            </div>

            <div className="mt-5 space-y-5">
              {result.colors.map((color) => (
                <article
                  key={`${color.id}-${color.sourceIndex}`}
                  className="rounded-lg border border-border bg-surface-soft p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-bold text-foreground">
                      {displayName(color)}
                    </h3>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {ROLE_LABELS[color.role]}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {SIMULATION_MODES.map((mode) => (
                      <Swatch
                        key={mode}
                        color={color.views[mode]}
                        label={MODE_LABELS[mode]}
                      />
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <details className="mt-5 rounded-lg border border-border bg-surface-soft p-4">
              <summary className="cursor-pointer font-bold text-foreground">
                Exact fixed matrices
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Rows multiply linear red, green, and blue. Values are fixed in
                this tool; there is no diagnosis or severity selector.
              </p>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {Object.entries(CVD_MATRICES).map(([mode, matrix]) => (
                  <div key={mode}>
                    <h3 className="font-semibold capitalize text-foreground">
                      {mode}
                    </h3>
                    <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-surface p-3 text-xs text-foreground">
                      {matrix
                        .map(
                          (row) =>
                            `[${row.map((value) => value.toFixed(6)).join(", ")}]`,
                        )
                        .join("\n")}
                    </pre>
                  </div>
                ))}
              </div>
            </details>
          </section>

          <section className="tool-card p-5 sm:p-6">
            <h2 className="text-xl font-bold text-foreground">
              Closest pair cues
            </h2>
            <p className="mt-1 max-w-4xl text-sm leading-relaxed text-muted-foreground">
              Lower OKLab distance means the pair is closer in this numerical
              screen. Bands below {SCREENING_CUE_LIMITS.veryClose} and{" "}
              {SCREENING_CUE_LIMITS.close} are editorial triage cues only—not
              perceptual thresholds or WCAG rules.
            </p>
            <ul className="mt-5 grid gap-3 lg:grid-cols-2">
              {result.pairs.map((pair) => {
                const left = result.colors.find(
                  (color) =>
                    color.id === pair.leftId &&
                    color.sourceIndex === pair.leftIndex,
                );
                const right = result.colors.find(
                  (color) =>
                    color.id === pair.rightId &&
                    color.sourceIndex === pair.rightIndex,
                );
                return (
                  <li
                    key={`${pair.leftId}-${pair.leftIndex}-${pair.rightId}-${pair.rightIndex}`}
                    className={`rounded-lg border p-4 ${cueClasses(pair.cue)}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-bold text-foreground">
                        {displayName(left)} ↔ {displayName(right)}
                      </h3>
                      <span className="rounded-pill bg-surface px-2 py-1 text-xs font-bold text-foreground">
                        {cueLabel(pair.cue)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Minimum {pair.minimumDistance.toFixed(2)} in{" "}
                      {MODE_LABELS[pair.minimumMode].toLocaleLowerCase("en-US")}
                      {pair.duplicate ? " · Exact authored duplicate" : ""}
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
                      {SIMULATION_MODES.map((mode) => (
                        <div
                          key={mode}
                          className="flex items-baseline justify-between gap-2"
                        >
                          <dt className="text-muted-foreground">
                            {MODE_LABELS[mode]}
                          </dt>
                          <dd className="font-mono font-bold text-foreground">
                            {pair.distances[mode].toFixed(2)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="tool-card p-5 sm:p-6">
            <h2 className="text-xl font-bold text-foreground">
              Authored text contrast
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Ratios use the WCAG relative-luminance formula on authored
              Text/Background pairs. A numerical pair result cannot establish
              page-level conformance, text sizing, state coverage, or what
              actually appears behind every glyph.
            </p>
            {result.contrastPairs.length ? (
              <ul className="mt-5 grid gap-3 lg:grid-cols-2">
                {result.contrastPairs.map((pair) => {
                  const textColor = result.colors.find(
                    (color) =>
                      color.id === pair.textId &&
                      color.sourceIndex === pair.textIndex,
                  );
                  const backgroundColor = result.colors.find(
                    (color) =>
                      color.id === pair.backgroundId &&
                      color.sourceIndex === pair.backgroundIndex,
                  );
                  return (
                    <li
                      key={`${pair.textId}-${pair.textIndex}-${pair.backgroundId}-${pair.backgroundIndex}`}
                      className={`rounded-lg border p-4 ${
                        pair.normalTextMeets45
                          ? "border-success bg-success-soft"
                          : "border-warning bg-warning-soft"
                      }`}
                    >
                      <h3 className="font-bold text-foreground">
                        {displayName(textColor)} on{" "}
                        {displayName(backgroundColor)}
                      </h3>
                      <p className="mt-2 text-2xl font-black text-foreground">
                        {formatRatio(pair.ratio)}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        4.5:1 normal-text threshold:{" "}
                        {pair.normalTextMeets45 ? "met" : "not met"} · 3:1
                        large-text threshold:{" "}
                        {pair.largeTextMeets3 ? "met" : "not met"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-5 rounded-lg border border-info bg-info-soft p-4 text-sm text-foreground">
                Mark at least one color as Text and another as Background to
                create an authored contrast pair.
              </p>
            )}
          </section>

          <section className="tool-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              Bounded alternatives
            </h2>
            <p className="mt-1 max-w-4xl text-sm leading-relaxed text-muted-foreground">
              Candidates come from a deterministic, bounded OKLCH
              hue/lightness/chroma search. A candidate must improve its weakest
              simulated pair-distance cue and must not lower any applicable
              authored Text/Background contrast ratio. Recheck brand meaning,
              states, gamut, the complete page, and user feedback before use.
              Evaluate one candidate at a time; the alternatives are not
              optimized as a combined replacement palette.
            </p>
            {result.suggestions.length ? (
              <ul className="mt-5 grid gap-4 lg:grid-cols-2">
                {result.suggestions.map((suggestion) => {
                  const source = result.colors.find(
                    (color) =>
                      color.id === suggestion.id &&
                      color.sourceIndex === suggestion.sourceIndex,
                  );
                  return (
                    <li
                      key={`${suggestion.id}-${suggestion.sourceIndex}`}
                      className="rounded-lg border border-primary bg-primary-soft p-4"
                    >
                      <h3 className="font-bold text-foreground">
                        {displayName(source)}
                      </h3>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Swatch
                          color={suggestion.originalHex}
                          label="Authored"
                        />
                        <Swatch
                          color={suggestion.candidateHex}
                          label="Candidate"
                        />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Weakest distance {suggestion.beforeDistance.toFixed(2)}{" "}
                        → {suggestion.afterDistance.toFixed(2)}
                        {suggestion.relevantContrastPairs
                          ? ` · ${suggestion.relevantContrastPairs} relevant contrast pair(s) preserved or improved`
                          : " · No Text/Background constraint applied"}
                      </p>
                      <button
                        type="button"
                        className="btn-secondary mt-4"
                        onClick={() =>
                          void copyCandidate(suggestion.candidateHex)
                        }
                      >
                        {copied === suggestion.candidateHex ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Clipboard className="h-4 w-4" aria-hidden="true" />
                        )}
                        {copied === suggestion.candidateHex
                          ? "Copied"
                          : "Copy candidate"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-5 flex items-start gap-3 rounded-lg border border-success bg-success-soft p-4 text-sm text-foreground">
                <CheckCircle2
                  className="mt-1 h-5 w-5 shrink-0 text-success"
                  aria-hidden="true"
                />
                No bounded candidate cleared the improvement and contrast
                constraints, or no pair entered the review bands. This is not a
                safety or conformance result.
              </p>
            )}
          </section>

          <p className="flex items-start gap-3 rounded-lg border border-info bg-info-soft p-4 text-sm leading-relaxed text-foreground">
            <Info
              className="mt-1 h-5 w-5 shrink-0 text-info"
              aria-hidden="true"
            />
            Final review belongs in the real component: include visible
            non-color cues, exercise every state, inspect light and dark themes,
            zoom, high-contrast settings, and test with users whose needs the
            interface must support.
          </p>
        </section>
      ) : null}
    </main>
  );
}
