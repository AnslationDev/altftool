"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Monitor, RefreshCw, RotateCcw } from "lucide-react";

import { SAMPLE_PROFILES, analyseScreen, formatReport } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--muted)] text-[var(--foreground)]",
  success: "bg-[var(--muted)] text-[var(--success)]",
};

const DEFAULT_SIGNALS = SAMPLE_PROFILES[0].signals;

function readBrowserSignals() {
  if (typeof window === "undefined" || !window.screen) return null;
  const screen = window.screen;
  return {
    screenWidth: screen.width,
    screenHeight: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    orientation: screen.orientation?.type || (screen.width >= screen.height ? "landscape" : "portrait"),
  };
}

export default function ToolHome() {
  const [source, setSource] = useState("this-browser");
  const [measured, setMeasured] = useState(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => {
    const signals = readBrowserSignals();
    if (signals) setMeasured(signals);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("resize", refresh);
    return () => window.removeEventListener("resize", refresh);
  }, [refresh]);

  const active = useMemo(() => {
    if (source === "this-browser") return measured || DEFAULT_SIGNALS;
    const profile = SAMPLE_PROFILES.find((item) => item.id === source);
    return profile ? profile.signals : DEFAULT_SIGNALS;
  }, [source, measured]);

  const showingLive = source === "this-browser" && Boolean(measured);
  const result = useMemo(() => analyseScreen(active), [active]);
  const report = useMemo(() => formatReport(result), [result]);

  const copyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSource("this-browser");
    setCopied(false);
    refresh();
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Monitor className="h-4 w-4" aria-hidden="true" />
          Browser fingerprinting
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Screen and Display Fingerprint Viewer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Any page you open can read your screen size, pixel ratio and colour depth without asking.
          This shows exactly what those readings say about you, and which of them actually narrow you
          down.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="fp-source">
          Readings to analyse
        </label>
        <select
          id="fp-source"
          className={`mt-2 ${INPUT_CLASS}`}
          value={source}
          onChange={(event) => {
            setSource(event.target.value);
            setCopied(false);
          }}
        >
          <option value="this-browser">This browser (live)</option>
          {SAMPLE_PROFILES.map((profile) => (
            <option key={profile.id} value={profile.id}>
              Compare: {profile.label}
            </option>
          ))}
        </select>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          {showingLive
            ? "Live readings from this window. Resize the window and the viewport row updates immediately; the stable rows do not."
            : source === "this-browser"
              ? "Waiting for the browser reading — a typical laptop profile is shown meanwhile."
              : "Showing a reference profile so you can see how an ordinary machine reports itself."}
        </p>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Distinctive stable readings
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? dash : `${result.distinctive} of ${result.stableCount}`}
            </p>
            {!result.error && (
              <p className="mt-2 inline-flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASS[result.band.tone]}`}
                >
                  {result.band.label}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">{result.band.summary}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyReport}
              aria-label="Copy the display fingerprint report"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={refresh} aria-label="Re-read the browser" className={GHOST_BTN}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Re-read
            </button>
            <button type="button" onClick={reset} aria-label="Reset to live readings" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Combination id (FNV-1a of the stable readings)", result.error ? dash : result.id],
            [
              "Physical pixel grid",
              result.error ? dash : `${result.physicalWidth} x ${result.physicalHeight}`,
            ],
            [
              "Reserved by taskbar / dock / menu bar",
              result.error ? dash : `${result.chromeWidth} x ${result.chromeHeight} px`,
            ],
            [
              "Window covers",
              result.error ? dash : `${(result.viewportShare * 100).toFixed(1)}% of the screen`,
            ],
            [
              "Zoom or display scaling in play",
              result.error ? dash : result.zoomLikely ? "Likely" : "No sign of it",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!result.error && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Every reading, and what it leaks</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Signal
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Value
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Stability
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Crowd
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2.5 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2.5 pr-3">{row.value}</td>
                    <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{row.stability.label}</td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          row.common ? TONE_CLASS.success : TONE_CLASS.danger
                        }`}
                      >
                        {row.common ? "Common" : "Distinctive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.rows.map((row) => (
              <li key={`${row.id}-note`}>
                <span className="font-semibold text-[var(--foreground)]">{row.label}:</span> {row.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What actually reduces this</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Browsing at a maximised or default window size in a mainstream resolution keeps you in a
            larger crowd than a hand-sized custom window.
          </li>
          <li>
            Firefox&apos;s resist-fingerprinting mode and the Tor Browser round the reported window to
            fixed steps and report a colour depth of 24 regardless of the hardware.
          </li>
          <li>
            Browser zoom changes the device pixel ratio, so a page can tell that you are not at 100%
            — a distinctive value on its own.
          </li>
          <li>
            None of these readings are sent anywhere by this page. They stay in your browser tab.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        &quot;Distinctive&quot; here means a reading sits outside a widely shared bucket, not that you
        can be identified from it. Real fingerprinting combines display readings with fonts, canvas,
        audio and network signals.
      </p>
    </main>
  );
}
