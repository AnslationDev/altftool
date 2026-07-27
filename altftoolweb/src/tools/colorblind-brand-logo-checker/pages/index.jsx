"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, EyeOff, RotateCcw } from "lucide-react";

import { CVD_TYPES, analyseLogoColors, dominantColors, simulateImageData } from "../lib";

const CANVAS_SIZE = 240;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";

const LEVEL_CLASS = {
  critical: "text-[var(--danger)]",
  fail: "text-[var(--danger)]",
  warn: "text-[var(--foreground)]",
  pass: "text-[var(--success)]",
};

export default function ToolHome() {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [severity, setSeverity] = useState(1);
  const [focusType, setFocusType] = useState("deuteranopia");
  const [palette, setPalette] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [copied, setCopied] = useState(false);

  const originalRef = useRef(null);
  const simRefs = useRef({});

  const registerRef = useCallback((key) => (node) => {
    simRefs.current[key] = node;
  }, []);

  useEffect(() => {
    const canvas = originalRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (!image) {
      setPalette([]);
      return;
    }

    const scale = Math.min(CANVAS_SIZE / image.width, CANVAS_SIZE / image.height);
    const drawWidth = Math.max(1, Math.round(image.width * scale));
    const drawHeight = Math.max(1, Math.round(image.height * scale));
    const dx = Math.round((CANVAS_SIZE - drawWidth) / 2);
    const dy = Math.round((CANVAS_SIZE - drawHeight) / 2);
    ctx.drawImage(image.element, dx, dy, drawWidth, drawHeight);

    const source = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    setPalette(dominantColors(source.data, { maxColors: 6, step: 2 }));

    CVD_TYPES.forEach((type) => {
      const target = simRefs.current[type.key];
      if (!target) return;
      const targetCtx = target.getContext("2d");
      if (!targetCtx) return;
      const simulated = simulateImageData(source.data, type.key, severity);
      targetCtx.putImageData(new ImageData(simulated, CANVAS_SIZE, CANVAS_SIZE), 0, 0);
    });
  }, [image, severity]);

  const report = useMemo(
    () => analyseLogoColors({ colors: palette, type: focusType, severity }),
    [palette, focusType, severity],
  );

  const hasError = Boolean(loadError) || Boolean(report.error);
  const errorMessage = loadError || report.error;
  const dash = "—";

  const onFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLoadError("That file is not an image. Use a PNG, JPEG, WebP or SVG.");
      return;
    }
    const url = URL.createObjectURL(file);
    const element = new Image();
    element.onload = () => {
      setImage({ element, width: element.naturalWidth, height: element.naturalHeight });
      setFileName(file.name);
      setLoadError("");
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      setLoadError("The browser could not decode that image.");
    };
    element.src = url;
  }, []);

  const copyResult = async () => {
    if (hasError) return;
    const text = [
      `Colourblind logo check — ${report.typeLabel} at ${Math.round(report.severity * 100)}% severity`,
      `Artwork: ${fileName || "untitled"}`,
      report.summary,
      "",
      ...report.swatches.map(
        (swatch) =>
          `${swatch.hex} -> ${swatch.simulatedHex} (${(swatch.share * 100).toFixed(1)}% of pixels, shift ${swatch.shift.toFixed(1)} deltaE)`,
      ),
      "",
      "Pairs, most merged first:",
      ...report.pairs.map(
        (pair) =>
          `${pair.a.hex} / ${pair.b.hex}: deltaE ${pair.before.toFixed(1)} -> ${pair.after.toFixed(1)} — ${pair.verdict}`,
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSeverity(1);
    setFocusType("deuteranopia");
    setCopied(false);
    setLoadError("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <EyeOff className="h-4 w-4" aria-hidden="true" />
          Colour vision
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Colourblind Logo Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Load a logo and see it under protanopia, deuteranopia, tritanopia and achromatopsia at
          once, with CIELAB colour-difference scoring on the artwork&apos;s own colours. The image
          never leaves your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="logo-file">
          Logo file
        </label>
        <input
          id="logo-file"
          className={`mt-2 ${INPUT_CLASS} py-2`}
          type="file"
          accept="image/*"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {image ? `${fileName} · ${image.width} × ${image.height} px` : "Nothing loaded yet."}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="logo-severity">
              Severity ({Math.round(severity * 100)}%)
            </label>
            <input
              id="logo-severity"
              className="mt-3 h-11 w-full cursor-pointer accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={severity}
              onChange={(event) => setSeverity(Number(event.target.value))}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              100% is full dichromacy. Lower values approximate the anomalous forms by blending.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="logo-focus">
              Score the palette for
            </label>
            <select
              id="logo-focus"
              className={`mt-2 ${INPUT_CLASS}`}
              value={focusType}
              onChange={(event) => setFocusType(event.target.value)}
            >
              {CVD_TYPES.map((type) => (
                <option key={type.key} value={type.key}>
                  {type.label} ({type.family})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {CVD_TYPES.find((type) => type.key === focusType)?.prevalence}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Side by side</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <figure className="m-0">
            <canvas
              ref={originalRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              aria-label="Original logo"
              className="h-auto w-full rounded-md bg-[var(--muted)] ring-1 ring-[var(--border)]"
            />
            <figcaption className="mt-2 text-sm font-semibold">Original</figcaption>
          </figure>
          {CVD_TYPES.map((type) => (
            <figure key={type.key} className="m-0">
              <canvas
                ref={registerRef(type.key)}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                aria-label={`Logo simulated under ${type.label}`}
                className="h-auto w-full rounded-md bg-[var(--muted)] ring-1 ring-[var(--border)]"
              />
              <figcaption className="mt-2 text-sm font-semibold">
                {type.label}
                <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                  {type.family}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorMessage}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Colour pairs that merge
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? dash : `${report.merged}/${report.pairCount}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? dash : report.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the colour vision report"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the settings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError
            ? [
                ["Simulation", dash],
                ["Colours found in artwork", dash],
                ["Pairs weakened by half or more", dash],
                ["Largest single-colour shift", dash],
              ]
            : [
                ["Simulation", `${report.typeLabel} at ${Math.round(report.severity * 100)}%`],
                ["Colours found in artwork", `${report.swatches.length}`],
                ["Pairs weakened by half or more", `${report.weakened} of ${report.pairCount}`],
                ["Largest single-colour shift", `${report.maxShift.toFixed(1)} delta-E`],
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Colours in the artwork</h2>
            <ul className="mt-3 space-y-2">
              {report.swatches.map((swatch) => (
                <li key={swatch.hex} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-11 w-11 shrink-0 rounded-md ring-1 ring-[var(--border)]"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span
                    aria-hidden="true"
                    className="h-11 w-11 shrink-0 rounded-md ring-1 ring-[var(--border)]"
                    style={{ backgroundColor: swatch.simulatedHex }}
                  />
                  <span className="min-w-0 text-sm">
                    <span className="block font-semibold">
                      {swatch.hex} → {swatch.simulatedHex}
                    </span>
                    <span className="block text-xs text-[var(--muted-foreground)]">
                      {(swatch.share * 100).toFixed(1)}% of visible pixels · shifts{" "}
                      {swatch.shift.toFixed(1)} delta-E
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Pairs, most merged first</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Pair
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Before
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      After
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      Verdict
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.pairs.map((pair) => (
                    <tr
                      key={`${pair.a.hex}-${pair.b.hex}`}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="py-2 pr-3 font-mono text-xs">
                        {pair.a.hex} / {pair.b.hex}
                      </td>
                      <td className="py-2 pr-3 text-right">{pair.before.toFixed(1)}</td>
                      <td className="py-2 pr-3 text-right">{pair.after.toFixed(1)}</td>
                      <td className={`py-2 ${LEVEL_CLASS[pair.level]}`}>{pair.verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dichromacy is simulated with the Viénot, Brettel and Mollon LMS method; the severity slider
        blends towards it as an approximation of the anomalous forms. A simulation is a design check,
        not a description of what any individual actually perceives.
      </p>
    </main>
  );
}
