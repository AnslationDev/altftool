"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Spline, Trash2 } from "lucide-react";
import {
  ARC_FLAG_INDEXES,
  MAX_PRECISION,
  PARAMETER_LABELS,
  analyzePath,
  formatNumber,
  parsePath,
  removeCommand,
  serializePath,
  toAbsolute,
  toRelative,
  transformPath,
  updateCommandValue,
} from "../lib";

const DASH = "—";

const SAMPLE_PATH = "M 12 2 L 22 20 L 2 20 Z";

const numberFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });

function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="font-mono text-sm text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

export default function SvgPathEditorPage() {
  const [d, setD] = useState(SAMPLE_PATH);
  const [precision, setPrecision] = useState(3);
  const [moveX, setMoveX] = useState("0");
  const [moveY, setMoveY] = useState("0");
  const [scale, setScale] = useState("1");
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState("");

  const analysis = useMemo(() => analyzePath(d, { precision }), [d, precision]);
  const hasError = Boolean(analysis.error);

  function applyCommands(commands) {
    setD(serializePath(commands, { precision }));
    setCopied(false);
  }

  function handleConvert(mode) {
    const parsed = parsePath(d);
    if (parsed.error) return;
    const converted = mode === "absolute" ? toAbsolute(parsed.commands) : toRelative(parsed.commands);
    applyCommands(converted);
    setActionError("");
  }

  function handleMinify() {
    const parsed = parsePath(d);
    if (parsed.error) return;
    setD(serializePath(toRelative(parsed.commands), { precision, minify: true }));
    setActionError("");
    setCopied(false);
  }

  function handleTransform() {
    const parsed = parsePath(d);
    if (parsed.error) return;
    const moved = transformPath(parsed.commands, {
      dx: Number(moveX),
      dy: Number(moveY),
      scale: Number(scale),
    });
    if (moved.error) {
      setActionError(moved.error);
      return;
    }
    setActionError("");
    applyCommands(moved.commands);
    setMoveX("0");
    setMoveY("0");
    setScale("1");
  }

  function handleValueChange(commandIndex, valueIndex, raw) {
    const parsed = parsePath(d);
    if (parsed.error) return;
    const next = updateCommandValue(parsed.commands, commandIndex, valueIndex, raw);
    if (next.error) {
      setActionError(next.error);
      return;
    }
    setActionError("");
    applyCommands(next.commands);
  }

  function handleRemove(commandIndex) {
    const parsed = parsePath(d);
    if (parsed.error) return;
    const next = removeCommand(parsed.commands, commandIndex);
    if (next.error) {
      setActionError(next.error);
      return;
    }
    setActionError("");
    applyCommands(next.commands);
  }

  async function handleCopy() {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(d.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function handleReset() {
    setD(SAMPLE_PATH);
    setPrecision(3);
    setMoveX("0");
    setMoveY("0");
    setScale("1");
    setActionError("");
    setCopied(false);
  }

  const preview = hasError ? null : analysis.preview;
  const markerSize = preview ? preview.span / 60 : 1;
  const strokeWidth = preview ? preview.span / 120 : 1;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-start gap-3">
        <Spline className="mt-1 h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">SVG Path Editor</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Paste a path <code className="font-mono">d</code> attribute to see every command,
            edit its numbers, convert between absolute and relative form, and read the exact
            bounding box.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="path-d" className="text-sm font-medium text-[var(--foreground)]">
          Path data (d attribute)
        </label>
        <textarea
          id="path-d"
          rows={4}
          value={d}
          spellCheck={false}
          onChange={(e) => {
            setD(e.target.value);
            setActionError("");
            setCopied(false);
          }}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-col gap-1.5 sm:max-w-xs">
        <label htmlFor="precision" className="text-sm font-medium text-[var(--foreground)]">
          Precision ({precision} decimals)
        </label>
        <input
          id="precision"
          type="range"
          min={0}
          max={MAX_PRECISION}
          step={1}
          value={precision}
          onChange={(e) => setPrecision(Number(e.target.value))}
          className="h-11 w-full accent-[var(--primary)]"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleConvert("absolute")}
          disabled={hasError}
          aria-label="Rewrite every command with absolute coordinates"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          To absolute
        </button>
        <button
          type="button"
          onClick={() => handleConvert("relative")}
          disabled={hasError}
          aria-label="Rewrite every command with relative coordinates"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          To relative
        </button>
        <button
          type="button"
          onClick={handleMinify}
          disabled={hasError}
          aria-label="Rewrite the path in its shortest legal form"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          Minify
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={hasError}
          aria-label="Copy the path data to the clipboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Reset to the sample path"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-medium text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {hasError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {analysis.error}
        </p>
      ) : null}
      {!hasError && actionError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {actionError}
        </p>
      ) : null}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">Bounding box</p>
          <p className="mt-1 font-mono text-2xl leading-tight font-semibold text-[var(--foreground)]">
            {hasError
              ? DASH
              : `${numberFmt.format(analysis.bounds.width)} × ${numberFmt.format(
                  analysis.bounds.height,
                )}`}
          </p>
          <dl className="mt-4">
            <Row
              label="Top-left"
              value={
                hasError
                  ? DASH
                  : `${numberFmt.format(analysis.bounds.minX)}, ${numberFmt.format(
                      analysis.bounds.minY,
                    )}`
              }
            />
            <Row
              label="Bottom-right"
              value={
                hasError
                  ? DASH
                  : `${numberFmt.format(analysis.bounds.maxX)}, ${numberFmt.format(
                      analysis.bounds.maxY,
                    )}`
              }
            />
            <Row label="Commands" value={hasError ? DASH : String(analysis.commandCount)} />
            <Row label="Sub-paths" value={hasError ? DASH : String(analysis.subpathCount)} />
            <Row
              label="Minified length"
              value={hasError ? DASH : `${analysis.minified.length} chars`}
            />
          </dl>
        </div>

        <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <p className="mb-2 text-sm text-[var(--muted-foreground)]">Preview</p>
          <div className="flex min-h-48 items-center justify-center">
            {hasError || !preview || preview.error ? (
              <span className="text-[var(--muted-foreground)]">{DASH}</span>
            ) : (
              <svg
                viewBox={preview.viewBox}
                role="img"
                aria-label="Rendered preview of the path"
                className="h-48 w-full text-[var(--primary)]"
              >
                <path
                  d={analysis.absolute}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {analysis.points.map((p, i) => (
                  <circle
                    key={`${p.command}-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={markerSize}
                    fill="currentColor"
                  />
                ))}
              </svg>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Move and scale</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="move-x" className="text-sm font-medium text-[var(--foreground)]">
              Move X
            </label>
            <input
              id="move-x"
              type="number"
              step="any"
              value={moveX}
              onChange={(e) => setMoveX(e.target.value)}
              className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="move-y" className="text-sm font-medium text-[var(--foreground)]">
              Move Y
            </label>
            <input
              id="move-y"
              type="number"
              step="any"
              value={moveY}
              onChange={(e) => setMoveY(e.target.value)}
              className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="scale" className="text-sm font-medium text-[var(--foreground)]">
              Scale
            </label>
            <input
              id="scale"
              type="number"
              step="any"
              min="0"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleTransform}
          disabled={hasError}
          aria-label="Apply the move and scale to the path"
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none disabled:opacity-50"
        >
          Apply transform
        </button>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Commands</h2>
        <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-[var(--card)] text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  #
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Command
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Parameters
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {hasError ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : (
                analysis.commands.map((cmd, index) => (
                  <tr key={`${cmd.command}-${index}`} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 align-top text-[var(--muted-foreground)]">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 align-top font-mono font-semibold text-[var(--foreground)]">
                      {cmd.relative ? cmd.command.toLowerCase() : cmd.command}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {cmd.values.length === 0 ? (
                          <span className="text-[var(--muted-foreground)]">closepath</span>
                        ) : (
                          cmd.values.map((value, vi) => (
                            <div key={vi} className="flex flex-col gap-1">
                              <label
                                htmlFor={`cmd-${index}-${vi}`}
                                className="text-xs text-[var(--muted-foreground)]"
                              >
                                {PARAMETER_LABELS[cmd.command][vi]}
                              </label>
                              <input
                                id={`cmd-${index}-${vi}`}
                                type="number"
                                step={
                                  cmd.command === "A" && ARC_FLAG_INDEXES.includes(vi) ? 1 : "any"
                                }
                                value={formatNumber(value, precision)}
                                onChange={(e) => handleValueChange(index, vi, e.target.value)}
                                className="h-11 w-24 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 font-mono text-xs focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                              />
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        aria-label={`Remove command ${index + 1}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 grid gap-4">
        <div>
          <h2 className="mb-2 text-sm font-medium text-[var(--foreground)]">Minified</h2>
          <pre className="overflow-x-auto rounded-xl bg-[var(--card)] p-4 font-mono text-xs break-all whitespace-pre-wrap text-[var(--foreground)] ring-1 ring-[var(--border)]">
            {hasError ? DASH : analysis.minified}
          </pre>
        </div>
      </section>
    </div>
  );
}
