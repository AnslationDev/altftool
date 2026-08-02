"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Contrast, Copy, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import {
  LARGE_TEXT_AA_MIN_RATIO,
  NON_TEXT_MIN_RATIO,
  STANDARD_BACKGROUNDS,
  TEXT_AAA_MIN_RATIO,
  TEXT_AA_MIN_RATIO,
  hexToRgb,
  photoContrastProfile,
  rgbToHex,
  testLogoOnBackgrounds,
} from "../lib";

const RATIO = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULT_LOGO_RGB = [20, 184, 166];
const DEFAULT_CUSTOM_RGB = [30, 58, 95];
const PHOTO_SAMPLE_WIDTH = 200;

const TARGETS = [
  [String(NON_TEXT_MIN_RATIO), `${NON_TEXT_MIN_RATIO}:1 — graphics and large text (WCAG 1.4.11 / 1.4.3)`],
  [String(TEXT_AA_MIN_RATIO), `${TEXT_AA_MIN_RATIO}:1 — body text AA (WCAG 1.4.3)`],
  [String(TEXT_AAA_MIN_RATIO), `${TEXT_AAA_MIN_RATIO}:1 — body text AAA (WCAG 1.4.6)`],
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_CLASS = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [logoHex, setLogoHex] = useState(() => rgbToHex(DEFAULT_LOGO_RGB));
  const [customHex, setCustomHex] = useState(() => rgbToHex(DEFAULT_CUSTOM_RGB));
  const [useCustom, setUseCustom] = useState(true);
  const [target, setTarget] = useState(String(NON_TEXT_MIN_RATIO));
  const [fileUrl, setFileUrl] = useState("");
  const [photoPixels, setPhotoPixels] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  useEffect(() => {
    if (!fileUrl) return undefined;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      try {
        const scale = PHOTO_SAMPLE_WIDTH / Math.max(1, image.naturalWidth);
        const w = Math.max(1, Math.round(image.naturalWidth * Math.min(1, scale)));
        const h = Math.max(1, Math.round(image.naturalHeight * Math.min(1, scale)));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) throw new Error("no context");
        ctx.drawImage(image, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        setPhotoPixels({ data: imageData.data, width: w, height: h, preview: canvas.toDataURL("image/png") });
        setPhotoError("");
      } catch {
        setPhotoPixels(null);
        setPhotoError("This image could not be read in the browser. Try a PNG or JPEG.");
      }
    };
    image.onerror = () => {
      if (!cancelled) {
        setPhotoPixels(null);
        setPhotoError("That file could not be decoded as an image.");
      }
    };
    image.src = fileUrl;
    return () => {
      cancelled = true;
      URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const customRgb = useMemo(() => hexToRgb(customHex), [customHex]);
  const customHexInvalid = useCustom && customHex.trim() !== "" && !customRgb;

  const backgrounds = useMemo(() => {
    if (!useCustom || !customRgb) return STANDARD_BACKGROUNDS;
    return [...STANDARD_BACKGROUNDS, { id: "custom", name: "Your surface", rgb: customRgb }];
  }, [useCustom, customRgb]);

  const report = useMemo(
    () => testLogoOnBackgrounds({ logoHex, backgrounds, targetRatio: Number(target) }),
    [logoHex, backgrounds, target],
  );

  const photo = useMemo(() => {
    if (!photoPixels || report.error) return null;
    return photoContrastProfile({
      data: photoPixels.data,
      width: photoPixels.width,
      height: photoPixels.height,
      logoRgb: report.logoRgb,
      targetRatio: Number(target),
    });
  }, [photoPixels, report, target]);

  const summary = useMemo(() => {
    if (report.error) return "";
    const lines = [
      "Logo On Background Test",
      `Logo colour: ${report.logoHex}`,
      `Target: ${report.target}:1`,
      ...report.rows.map((row) => {
        const status = row.passes
          ? "pass"
          : row.scrimAchievable
            ? `fail — needs a ${row.scrimIsDark ? "black" : "white"} scrim at ${PCT.format(row.scrimOpacity * 100)}%`
            : "fail — no scrim of this colour can reach the target";
        return `${row.name} (${row.hex}): ${RATIO.format(row.ratio)}:1 ${status}`;
      }),
      `Worst case: ${RATIO.format(report.worstRatio)}:1`,
    ];
    if (photo && !photo.error) {
      lines.push(
        `Photo: ${PCT.format(photo.failingShare * 100)}% of pixels fail ${report.target}:1, worst ${RATIO.format(photo.worstRatio)}:1`,
      );
    }
    report.issues.forEach((issue) => lines.push(`- ${issue.message}`));
    return lines.join("\n");
  }, [report, photo]);

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("report", summary, { label: "Contrast report" });
  };

  const reset = () => {
    setLogoHex(rgbToHex(DEFAULT_LOGO_RGB));
    setCustomHex(rgbToHex(DEFAULT_CUSTOM_RGB));
    setUseCustom(true);
    setTarget(String(NON_TEXT_MIN_RATIO));
    setFileUrl("");
    setPhotoPixels(null);
    setPhotoError("");
    resetCopyState();
  };

  const pickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileUrl(URL.createObjectURL(file));
    resetCopyState();
  };

  const swatchHex = report.error ? rgbToHex(DEFAULT_LOGO_RGB) : report.logoHex;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Contrast className="h-4 w-4" aria-hidden="true" />
          Contrast testing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Logo On Background Tester</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Measure a logo colour against light, dark and custom surfaces with the WCAG 2.1 contrast
          ratio, then get the exact scrim opacity that rescues the failing ones. Drop in a photo and
          it reports what share of its pixels the mark disappears against.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lb-logo-hex">
              Logo colour (hex)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="lb-logo-color"
                type="color"
                aria-label="Pick the logo colour"
                className="h-11 w-14 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-1"
                value={report.error ? swatchHex : report.logoHex}
                onChange={(event) => setLogoHex(event.target.value)}
              />
              <input
                id="lb-logo-hex"
                className={INPUT_CLASS}
                type="text"
                spellCheck={false}
                value={logoHex}
                onChange={(event) => setLogoHex(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lb-target">
              Target contrast
            </label>
            <select
              id="lb-target"
              className={`mt-2 ${INPUT_CLASS}`}
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            >
              {TARGETS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lb-custom-hex">
              Your own surface colour
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="lb-custom-color"
                type="color"
                aria-label="Pick your own surface colour"
                className="h-11 w-14 shrink-0 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-1"
                value={customRgb ? rgbToHex(customRgb) : rgbToHex(DEFAULT_CUSTOM_RGB)}
                onChange={(event) => setCustomHex(event.target.value)}
              />
              <input
                id="lb-custom-hex"
                className={INPUT_CLASS}
                type="text"
                spellCheck={false}
                value={customHex}
                onChange={(event) => setCustomHex(event.target.value)}
                aria-invalid={customHexInvalid || undefined}
              />
            </div>
            {customHexInvalid && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-[var(--danger)]">
                That isn&rsquo;t a valid hex colour, so your surface has been left out of the test
                below.
              </p>
            )}
          </div>
          <div className="flex min-h-11 items-center gap-3 sm:mt-7">
            <input
              id="lb-use-custom"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              checked={useCustom}
              onChange={(event) => setUseCustom(event.target.checked)}
            />
            <label className="text-sm text-[var(--foreground)]" htmlFor="lb-use-custom">
              Include my surface in the test
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="lb-photo">
            Optional: test against a photo
          </label>
          <input
            id="lb-photo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={pickFile}
            className={`mt-2 ${INPUT_CLASS} py-2 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--muted)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--foreground)]`}
          />
        </div>

        {photoError ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {photoError}
          </p>
        ) : null}
      </section>

      {report.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Worst contrast across the surfaces
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {report.error ? DASH : `${RATIO.format(report.worstRatio)}:1`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.error
                ? "Enter a valid hex colour"
                : `${report.passCount} of ${report.rows.length} surfaces clear ${report.target}:1`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={isCopied("report") ? "Copied the contrast report to clipboard" : "Copy the contrast report"}
              className={GHOST_BTN}
            >
              {isCopied("report") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("report") ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the tool" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
          </div>
        </div>

        <div aria-live="polite">
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {report.error
              ? STANDARD_BACKGROUNDS.map((bg) => (
                  <div
                    key={bg.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                  >
                    <p className="font-semibold">{bg.name}</p>
                    <p className="mt-1 text-[var(--muted-foreground)]">{DASH}</p>
                  </div>
                ))
              : report.rows.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <div
                      className="flex h-16 items-center justify-center rounded-md border border-[var(--border)]"
                      style={{ backgroundColor: row.hex }}
                    >
                      <span className="text-lg font-bold" style={{ color: report.logoHex }}>
                        LOGO
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold">{row.name}</p>
                      <p
                        className={`text-sm font-semibold ${row.passes ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                      >
                        {RATIO.format(row.ratio)}:1
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {row.hex} · {row.grade}
                    </p>
                    {!row.passes && (
                      <p className="mt-1 text-xs font-medium text-[var(--warning)]">
                        {row.scrimAchievable
                          ? `Add a ${row.scrimIsDark ? "black" : "white"} scrim at ${PCT.format(row.scrimOpacity * 100)}% opacity`
                          : "No scrim of this colour can reach the target"}
                      </p>
                    )}
                  </div>
                ))}
          </div>

          {!report.error && report.issues.length > 0 && (
            <ul className="mt-5 space-y-2">
              {report.issues.map((issue) => (
                <li
                  key={issue.message}
                  role={issue.level === "error" ? "alert" : undefined}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${LEVEL_CLASS[issue.level]}`}
                >
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {photoPixels && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Against your photo</h2>
          {photo && photo.error ? (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {photo.error}
            </p>
          ) : photo ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,180px)_1fr] sm:items-start">
              <div className="relative overflow-hidden rounded-md border border-[var(--border)]">
                <img src={photoPixels.preview} alt="Sampled version of the uploaded photo" className="w-full" />
                <span
                  className="absolute inset-0 flex items-center justify-center text-xl font-bold"
                  style={{ color: report.logoHex }}
                >
                  LOGO
                </span>
              </div>
              <dl className="divide-y divide-[var(--border)] text-sm">
                {[
                  ["Pixels failing the target", `${PCT.format(photo.failingShare * 100)}%`],
                  ["Worst contrast in the photo", `${RATIO.format(photo.worstRatio)}:1`],
                  ["Contrast at the darkest 5%", `${RATIO.format(photo.ratioAtP05)}:1`],
                  ["Contrast at the brightest 5%", `${RATIO.format(photo.ratioAtP95)}:1`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        WCAG explicitly exempts logotypes from the text contrast rules, so a brand mark that falls
        below {TEXT_AA_MIN_RATIO}:1 is not a conformance failure. {NON_TEXT_MIN_RATIO}:1 is still the
        right working target for anything a viewer has to recognise, and {LARGE_TEXT_AA_MIN_RATIO}:1
        is the floor for large text sitting beside it. This is informational guidance, not an
        accessibility audit.
      </p>
    </main>
  );
}
