"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";

import { auraFromPixels, auraFromSeed } from "../lib";

/** Longest edge the photo is scaled to before sampling. A hue histogram does
 * not get better past this, and small canvases keep the read instant. */
const SAMPLE_EDGE = 220;

const DEFAULT_SEED = "Alex";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const num = (value) => (Number.isFinite(value) ? NUM.format(value) : DASH);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value * 100)}%` : DASH);

export default function ToolHome() {
  const [seed, setSeed] = useState(DEFAULT_SEED);
  const [photoAura, setPhotoAura] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const seedAura = useMemo(() => auraFromSeed(seed), [seed]);
  const aura = photoAura || seedAura;
  const hasError = Boolean(aura.error);

  const onFile = useCallback((event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("That file is not an image. Choose a JPG, PNG or WebP photo.");
      return;
    }
    setFileError("");
    setBusy(true);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, SAMPLE_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          setFileError("This browser cannot read image pixels.");
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const { data } = ctx.getImageData(0, 0, width, height);
        const reading = auraFromPixels({ pixels: data });
        if (reading.error) {
          setFileError(reading.error);
          setPhotoAura(null);
          return;
        }
        setPhotoAura(reading);
        setPhotoUrl((previous) => {
          if (previous) URL.revokeObjectURL(previous);
          return url;
        });
        setFileName(file.name);
        setCopied(false);
      } catch {
        setFileError("That photo could not be read in this browser.");
      } finally {
        setBusy(false);
      }
    };
    img.onerror = () => {
      setFileError("That image could not be decoded. Try a different file.");
      setBusy(false);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Aura colour: ${aura.band.name}`,
      `Colour value: ${aura.css}`,
      `Hue: ${num(aura.hue)}° · intensity: ${aura.intensity.label}`,
      `Traits: ${aura.traits.join(", ")}`,
      aura.secondaryBand ? `Undertone: ${aura.secondaryBand.name}` : "",
      `Reading: ${aura.reading}`,
      `Palette: ${aura.palette.map((entry) => `${entry.role} ${entry.css}`).join(" | ")}`,
      `Read from: ${aura.source === "photo" ? "a photo" : `the name "${aura.seed}"`}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [aura, hasError]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSeed(DEFAULT_SEED);
    setPhotoAura(null);
    setPhotoUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return "";
    });
    setFileName("");
    setFileError("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Just for fun
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Aura Color Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Upload a photo and the tool finds its dominant hue with a saturation-weighted histogram,
          then hands you the matching aura colour and a straight-faced reading. No photo? A name
          works too — the same name always gives the same aura.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="aura-photo">
              Photo
            </label>
            <input
              id="aura-photo"
              type="file"
              accept="image/*"
              onChange={onFile}
              className="mt-2 block w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--background)] p-2.5 text-sm text-[var(--muted-foreground)] file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:text-sm file:font-semibold file:text-[var(--primary-foreground)]"
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              {busy ? "Reading colours…" : fileName || "Nothing uploaded — the name below is being used."}
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="aura-seed">
              Or a name
            </label>
            <input
              id="aura-seed"
              type="text"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
              placeholder="Type any name"
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              Hashed with FNV-1a, so it is repeatable rather than random.
            </p>
          </div>
        </div>
        {photoAura && (
          <button type="button" onClick={reset} className={`mt-4 ${GHOST_BTN}`}>
            Use the name instead
          </button>
        )}
      </section>

      {fileError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {fileError}
        </p>
      )}
      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {aura.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <span
              className="h-16 w-16 shrink-0 rounded-full ring-1 ring-[var(--border)]"
              style={hasError ? undefined : { backgroundColor: aura.css }}
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Your aura colour
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {hasError ? DASH : aura.band.name}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {hasError
                  ? "Add a photo or a name to get a reading."
                  : `${aura.intensity.label} · hue ${num(aura.hue)}°`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the aura reading to clipboard"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the generator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{aura.reading}</p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["CSS colour", hasError ? DASH : aura.css],
            [
              "RGB",
              hasError ? DASH : `${aura.rgb.r}, ${aura.rgb.g}, ${aura.rgb.b}`,
            ],
            ["Dominant hue", hasError ? DASH : `${num(aura.hue)}°`],
            ["Colour intensity", hasError ? DASH : `${aura.intensity.label} (${pct(aura.saturation)} saturation)`],
            ["Undertone", hasError || !aura.secondaryBand ? DASH : aura.secondaryBand.name],
            ["Traits", hasError ? DASH : aura.traits.join(" · ")],
            [
              "Read from",
              hasError ? DASH : aura.source === "photo" ? "Photo pixels" : `The name “${aura.seed}”`,
            ],
            [
              "Pixels sampled",
              hasError || !aura.stats ? DASH : `${aura.stats.opaque} of ${aura.stats.sampled}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && aura.palette.length > 0 && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Your aura palette</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Built from colour-wheel relationships: analogous neighbours at ±30°, a triad at +120° and
            the complement at +180°.
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {aura.palette.map((entry) => (
              <li key={entry.role} className="flex items-center gap-3">
                <span
                  className="h-11 w-11 shrink-0 rounded-md ring-1 ring-[var(--border)]"
                  style={{ backgroundColor: entry.css }}
                  aria-hidden="true"
                />
                <span>
                  <span className="block text-sm font-semibold">{entry.role}</span>
                  <span className="block font-mono text-xs text-[var(--muted-foreground)]">{entry.css}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {photoUrl && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">The photo it read</h2>
          <img
            src={photoUrl}
            alt="The photo the aura was read from"
            className="mt-3 max-h-64 w-full rounded-md object-contain ring-1 ring-[var(--border)]"
          />
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This is entertainment. The colour maths is real — sRGB to HSL conversion and a
        saturation-weighted hue histogram — but auras are not, and nothing here is a personality
        assessment. Your photo is read in the browser and never uploaded.
      </p>
    </main>
  );
}
