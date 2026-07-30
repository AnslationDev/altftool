"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RotateCcw, Type, Upload } from "lucide-react";

import {
  buildFontFaceCss,
  buildVariationSettings,
  clampAxisValue,
  defaultAxisValues,
  describeAxisPosition,
  formatAxisValue,
  matchNamedInstance,
  parseVariableFont,
} from "../lib";

const PREVIEW_FAMILY = "ALTFTVariablePreview";
const DASH = "—";

const DEFAULT_SAMPLE = "Handgloves quick 0123";
const DEFAULT_SIZE = 64;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" onClick={onCopy} aria-label={`${label} to clipboard`} className={GHOST_BTN}>
      {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

export default function ToolHome() {
  const [buffer, setBuffer] = useState(null);
  const [fileName, setFileName] = useState("");
  const [readError, setReadError] = useState("");
  const [values, setValues] = useState({});
  const [sample, setSample] = useState(DEFAULT_SAMPLE);
  const [size, setSize] = useState(String(DEFAULT_SIZE));
  const [fontReady, setFontReady] = useState(false);
  const inputRef = useRef(null);

  const parsed = useMemo(
    () => (buffer ? parseVariableFont(buffer, fileName || "font.ttf") : { error: "" }),
    [buffer, fileName],
  );
  const hasFont = Boolean(buffer) && !parsed.error;
  const parseError = buffer && parsed.error ? parsed.error : "";

  // Register the uploaded bytes as a real font face so the preview is the actual font.
  useEffect(() => {
    setFontReady(false);
    if (!hasFont || typeof document === "undefined" || typeof FontFace === "undefined") return undefined;
    let cancelled = false;
    let face;
    try {
      face = new FontFace(PREVIEW_FAMILY, buffer.slice(0));
    } catch {
      return undefined;
    }
    face
      .load()
      .then((loaded) => {
        if (cancelled) return;
        document.fonts.add(loaded);
        setFontReady(true);
      })
      .catch(() => {
        if (!cancelled) setFontReady(false);
      });
    return () => {
      cancelled = true;
      try {
        document.fonts.delete(face);
      } catch {
        /* the face was never added */
      }
    };
  }, [buffer, hasFont]);

  // Every new font starts on its own default coordinates.
  useEffect(() => {
    if (hasFont) setValues(defaultAxisValues(parsed.axes));
    else setValues({});
  }, [hasFont, parsed.axes]);

  const onFile = useCallback(async (file) => {
    if (!file) return;
    setReadError("");
    setFileName(file.name);
    try {
      const bytes = await file.arrayBuffer();
      setBuffer(bytes);
    } catch {
      setBuffer(null);
      setReadError("That file could not be read from disk.");
    }
  }, []);

  const setAxis = (axis, raw) => {
    const next = Number(raw);
    setValues((current) => ({
      ...current,
      [axis.tag]: clampAxisValue(axis, Number.isFinite(next) ? next : axis.defaultValue),
    }));
  };

  const applyInstance = (instance) => setValues({ ...instance.coordinates });

  const activeInstance = hasFont ? matchNamedInstance(parsed.instances, values, parsed.axes) : null;
  const variationSettings = hasFont ? buildVariationSettings(parsed.axes, values) : "normal";
  const cssBundle = useMemo(
    () =>
      hasFont
        ? buildFontFaceCss({
            familyName: parsed.familyName,
            fileName: fileName || "font.ttf",
            axes: parsed.axes,
            outlineFormat: parsed.outlineFormat,
            values,
          })
        : null,
    [hasFont, parsed.familyName, parsed.axes, parsed.outlineFormat, fileName, values],
  );

  const previewSize = useMemo(() => {
    const n = Number(size);
    if (!Number.isFinite(n)) return DEFAULT_SIZE;
    return Math.min(200, Math.max(12, n));
  }, [size]);

  const reset = () => {
    setBuffer(null);
    setFileName("");
    setReadError("");
    setValues({});
    setSample(DEFAULT_SAMPLE);
    setSize(String(DEFAULT_SIZE));
    if (inputRef.current) inputRef.current.value = "";
  };

  const summary = useMemo(() => {
    if (!hasFont) return "";
    return [
      `${parsed.familyName} — ${parsed.axisCount} axis${parsed.axisCount === 1 ? "" : "es"}, ${parsed.instanceCount} named instances`,
      `File: ${fileName} (${parsed.fileSize.toLocaleString()} bytes, ${parsed.outlineFormat})`,
      `Units per em: ${parsed.unitsPerEm ?? DASH}`,
      "",
      "Axes",
      ...parsed.axes.map(
        (axis) =>
          `  ${axis.tag}  ${axis.name}: ${formatAxisValue(axis.minValue)} … ${formatAxisValue(axis.defaultValue)} (default) … ${formatAxisValue(axis.maxValue)}${axis.unit ? ` ${axis.unit}` : ""}${axis.hidden ? "  [hidden]" : ""}`,
      ),
      "",
      "Named instances",
      ...parsed.instances.map(
        (instance) =>
          `  ${instance.name}: ${Object.entries(instance.coordinates)
            .map(([tag, value]) => `${tag} ${formatAxisValue(value)}`)
            .join(", ")}`,
      ),
      "",
      `Current: font-variation-settings: ${variationSettings};`,
      "",
      cssBundle ? cssBundle.css : "",
    ].join("\n");
  }, [hasFont, parsed, fileName, variationSettings, cssBundle]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Type className="h-4 w-4" aria-hidden="true" />
          The file never leaves your device
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Variable Font Axis Explorer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Reads the <code className="font-mono text-xs">fvar</code> table straight out of a .ttf or .otf: every
          design axis with its real minimum, default and maximum, every named instance and its coordinates, and
          the <code className="font-mono text-xs">name</code> table entries that label them. Drag the sliders to
          see the actual font render, then copy the <code className="font-mono text-xs">@font-face</code> rule
          with the weight and width ranges the font really declares.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL_CLASS} htmlFor="vf-file">
          Font file (.ttf or .otf)
        </label>
        <input
          ref={inputRef}
          id="vf-file"
          type="file"
          accept=".ttf,.otf,font/ttf,font/otf,application/font-sfnt"
          onChange={(event) => onFile(event.target.files?.[0])}
          className={`mt-2 ${INPUT_CLASS} file:mr-3 file:h-8 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:text-sm file:font-semibold file:text-[var(--primary-foreground)] py-2`}
        />
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          WOFF and WOFF2 are compressed containers (zlib and Brotli), and a page script cannot unpack them — use
          the original .ttf or .otf. Everything is parsed in this tab; nothing is uploaded anywhere.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={PRIMARY_BTN}
            aria-label="Choose a font file"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Choose font
          </button>
          <CopyButton value={summary} label="Copy report" />
          <button type="button" onClick={reset} aria-label="Reset the tool" className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {(readError || parseError) && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {readError || parseError}
        </p>
      )}

      {!buffer && !readError && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Nothing loaded yet</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Pick a variable .ttf or .otf above. Any font with an <code className="font-mono text-xs">fvar</code>{" "}
            table works — Inter, Roboto Flex, Source Sans 3, Recursive, or your own build. A static font is
            rejected with the list of tables it does contain, so you can tell at a glance which file you grabbed.
          </p>
        </section>
      )}

      {hasFont && (
        <>
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-base font-semibold">{parsed.familyName}</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                {parsed.axisCount} axis{parsed.axisCount === 1 ? "" : "es"} · {parsed.instanceCount} named
                instances · {parsed.outlineFormat}
              </p>
            </div>

            <div
              className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
              aria-live="polite"
            >
              <p
                className="whitespace-nowrap leading-tight"
                style={{
                  fontFamily: fontReady ? `"${PREVIEW_FAMILY}", serif` : "serif",
                  fontSize: `${previewSize}px`,
                  fontVariationSettings: variationSettings,
                }}
              >
                {sample || DEFAULT_SAMPLE}
              </p>
            </div>
            {!fontReady && (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                The preview falls back to a system serif until the browser accepts the file for rendering. The
                table data below is read directly from the bytes either way.
              </p>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="vf-sample">
                  Sample text
                </label>
                <input
                  id="vf-sample"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  value={sample}
                  onChange={(event) => setSample(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="vf-size">
                  Preview size (px)
                </label>
                <input
                  id="vf-size"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="12"
                  max="200"
                  step="2"
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Axes</h2>
            <div className="mt-4 space-y-6">
              {parsed.axes.map((axis) => {
                const position = describeAxisPosition(axis, values[axis.tag]);
                const step = axis.range > 20 ? 1 : axis.range > 2 ? 0.5 : 0.01;
                return (
                  <div key={axis.tag}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <label className={LABEL_CLASS} htmlFor={`vf-axis-${axis.tag}`}>
                        <span className="font-mono">{axis.tag}</span> · {axis.name}
                        {axis.hidden && (
                          <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">hidden</span>
                        )}
                      </label>
                      <span className="font-mono text-sm font-semibold text-[var(--primary)]">
                        {position ? position.formatted : DASH}
                        {position?.atDefault && (
                          <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)]">default</span>
                        )}
                      </span>
                    </div>
                    <input
                      id={`vf-axis-${axis.tag}`}
                      type="range"
                      min={axis.minValue}
                      max={axis.maxValue}
                      step={step}
                      value={values[axis.tag] ?? axis.defaultValue}
                      onChange={(event) => setAxis(axis, event.target.value)}
                      className="mt-3 h-11 w-full accent-[var(--primary)]"
                    />
                    <div className="flex justify-between font-mono text-xs text-[var(--muted-foreground)]">
                      <span>{formatAxisValue(axis.minValue)}</span>
                      <span>default {formatAxisValue(axis.defaultValue)}</span>
                      <span>{formatAxisValue(axis.maxValue)}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                      {axis.registered ? `Registered axis — CSS ${axis.cssProperty}. ` : "Custom axis. "}
                      {axis.summary}
                    </p>
                    {axis.warnings.length > 0 && (
                      <p
                        role="alert"
                        className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs font-medium text-[var(--danger)]"
                      >
                        {axis.warnings.join(" ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[460px] text-left text-sm">
                <caption className="sr-only">Every axis declared in the fvar table</caption>
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Tag</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Min</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Default</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Max</th>
                    <th scope="col" className="py-2 font-semibold">CSS</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.axes.map((axis) => (
                    <tr key={axis.tag} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-mono font-semibold">{axis.tag}</td>
                      <td className="py-2 pr-3">{axis.name}</td>
                      <td className="py-2 pr-3 text-right font-mono">{formatAxisValue(axis.minValue)}</td>
                      <td className="py-2 pr-3 text-right font-mono">{formatAxisValue(axis.defaultValue)}</td>
                      <td className="py-2 pr-3 text-right font-mono">{formatAxisValue(axis.maxValue)}</td>
                      <td className="py-2 text-xs text-[var(--muted-foreground)]">{axis.cssProperty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {parsed.instances.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Named instances</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                The coordinate sets the foundry shipped with names. Tap one to jump the sliders there.
                {activeInstance ? ` Currently on "${activeInstance.name}".` : " Currently between instances."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {parsed.instances.map((instance) => {
                  const active = activeInstance && activeInstance.index === instance.index;
                  return (
                    <button
                      key={instance.index}
                      type="button"
                      onClick={() => applyInstance(instance)}
                      aria-pressed={Boolean(active)}
                      className={
                        active
                          ? `${PRIMARY_BTN} text-xs`
                          : `${GHOST_BTN} text-xs`
                      }
                    >
                      {instance.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[380px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">Instance</th>
                      {parsed.axes.map((axis) => (
                        <th key={axis.tag} scope="col" className="py-2 pr-3 text-right font-mono font-semibold">
                          {axis.tag}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.instances.map((instance) => (
                      <tr key={instance.index} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3">{instance.name}</td>
                        {parsed.axes.map((axis) => (
                          <td key={axis.tag} className="py-2 pr-3 text-right font-mono">
                            {formatAxisValue(instance.coordinates[axis.tag])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">CSS for this font</h2>
              <CopyButton value={cssBundle?.css || ""} label="Copy CSS" />
            </div>
            <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]">
              {cssBundle?.css}
            </pre>
            {cssBundle && cssBundle.unmappedAxes.length > 0 && (
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                {cssBundle.unmappedAxes.join(", ")} {cssBundle.unmappedAxes.length === 1 ? "has" : "have"} no CSS
                property of its own — only <code className="font-mono">font-variation-settings</code> can drive
                it, and that shorthand disables the browser&rsquo;s own weight synthesis, so set every axis you
                care about explicitly.
              </p>
            )}
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Inside the file</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                ["File", `${fileName} · ${parsed.fileSize.toLocaleString()} bytes`],
                ["sfnt version", parsed.sfntVersion],
                ["Outlines", parsed.outlineFormat],
                ["Tables", `${parsed.numTables} — ${parsed.tableTags.join(", ")}`],
                ["Units per em", parsed.unitsPerEm === null ? DASH : String(parsed.unitsPerEm)],
                ["OS/2 usWeightClass", parsed.usWeightClass === null ? DASH : String(parsed.usWeightClass)],
                ["OS/2 usWidthClass", parsed.usWidthClass === null ? DASH : String(parsed.usWidthClass)],
                ...parsed.names.map((entry) => [entry.label, entry.value]),
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="break-all text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-5 text-sm font-semibold">Variation tables</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[380px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Table</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Present</th>
                    <th scope="col" className="py-2 font-semibold">What it does</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.variationTables.map((table) => (
                    <tr key={table.tag} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-mono font-semibold">{table.tag}</td>
                      <td
                        className={`py-2 pr-3 font-semibold ${
                          table.present ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {table.present ? "yes" : "no"}
                      </td>
                      <td className="py-2 text-xs text-[var(--muted-foreground)]">{table.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsed.notes.length > 0 && (
              <ul className="mt-4 space-y-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {parsed.notes.map((note) => (
                  <li key={note}>· {note}</li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
