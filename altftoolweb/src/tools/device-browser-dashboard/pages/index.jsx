"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Gauge, RotateCcw, ShieldCheck } from "lucide-react";

import { analyseSnapshot, formatReport } from "../lib";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const has = (test) => {
  try {
    return Boolean(test());
  } catch {
    return false;
  }
};

function readGpuRenderer() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return null;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    if (!info) return null;
    return gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || null;
  } catch {
    return null;
  }
}

function readThirdPartyCookies() {
  // The browser only tells us about first-party cookies directly. A missing
  // cookieStore / navigator.cookieEnabled false is the only reliable signal
  // available without a cross-site request, so anything else is reported as
  // unknown rather than guessed.
  if (typeof navigator === "undefined") return null;
  if (navigator.cookieEnabled === false) return false;
  return null;
}

function collectSnapshot() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return null;
  const nav = navigator;
  const screenInfo = window.screen || {};

  return {
    userAgent: nav.userAgent || "",
    platform: nav.platform || null,
    language: nav.language || null,
    languages: Array.isArray(nav.languages) ? nav.languages : null,
    hardwareConcurrency: typeof nav.hardwareConcurrency === "number" ? nav.hardwareConcurrency : null,
    deviceMemory: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
    maxTouchPoints: typeof nav.maxTouchPoints === "number" ? nav.maxTouchPoints : 0,
    doNotTrack: nav.doNotTrack || null,
    globalPrivacyControl: nav.globalPrivacyControl === true,
    thirdPartyCookies: readThirdPartyCookies(),
    hasBatteryApi: typeof nav.getBattery === "function",
    prefersReducedMotion: has(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    screenWidth: screenInfo.width || null,
    screenHeight: screenInfo.height || null,
    colorDepth: screenInfo.colorDepth || null,
    devicePixelRatio: window.devicePixelRatio || null,
    timeZone: has(() => Intl.DateTimeFormat().resolvedOptions().timeZone)
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : null,
    effectiveType: nav.connection ? nav.connection.effectiveType || null : null,
    downlinkMbps: nav.connection ? nav.connection.downlink ?? null : null,
    gpuRenderer: readGpuRenderer(),
    capabilities: {
      webgl: has(() => document.createElement("canvas").getContext("webgl")),
      webgl2: has(() => document.createElement("canvas").getContext("webgl2")),
      webgpu: has(() => nav.gpu),
      offscreenCanvas: has(() => window.OffscreenCanvas),
      webCodecs: has(() => window.VideoEncoder),
      mediaDevices: has(() => nav.mediaDevices && nav.mediaDevices.getUserMedia),
      localStorage: has(() => {
        window.localStorage.setItem("__altft_probe", "1");
        window.localStorage.removeItem("__altft_probe");
        return true;
      }),
      indexedDb: has(() => window.indexedDB),
      cacheStorage: has(() => window.caches),
      storageEstimate: has(() => nav.storage && nav.storage.estimate),
      cookiesEnabled: has(() => nav.cookieEnabled),
      serviceWorker: has(() => nav.serviceWorker),
      webAssembly: has(() => window.WebAssembly),
      sharedArrayBuffer: has(() => window.SharedArrayBuffer),
      webShare: has(() => nav.share),
      clipboard: has(() => nav.clipboard && nav.clipboard.writeText),
      notifications: has(() => window.Notification),
      touch: has(() => "ontouchstart" in window || nav.maxTouchPoints > 0),
      pointerEvents: has(() => window.PointerEvent),
      geolocation: has(() => nav.geolocation),
      deviceOrientation: has(() => window.DeviceOrientationEvent),
      vibrate: has(() => nav.vibrate),
      gamepad: has(() => nav.getGamepads),
    },
  };
}

export default function ToolHome() {
  const [snapshot, setSnapshot] = useState(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => {
    setSnapshot(collectSnapshot());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const result = useMemo(() => (ready ? analyseSnapshot(snapshot) : null), [ready, snapshot]);

  const copyResult = async () => {
    if (!result || result.error) return;
    try {
      await navigator.clipboard.writeText(formatReport(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const failed = Boolean(result && result.error);
  const data = result && !result.error ? result : null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          <Gauge className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
          Device &amp; Browser Dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Everything this page can tell about your browser, device, privacy signals and supported
          web APIs. Nothing is sent anywhere — it is all read locally and thrown away when you
          leave.
        </p>
      </header>

      {failed && (
        <p
          role="alert"
          className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Browser detected</p>
            <p className="text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              {data ? `${data.browser.name} ${data.browser.major}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {data ? `${data.engine} engine · ${data.os.name} ${data.os.version}` : ready ? DASH : "Reading your browser…"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the device and browser report"
              className={GHOST_BTN}
              disabled={!data}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy report"}
            </button>
            <button type="button" onClick={refresh} aria-label="Read the browser data again" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Re-scan
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Full version", data ? data.browser.version || DASH : DASH],
            ["Device type", data ? data.deviceType : DASH],
            [
              "Viewport",
              data ? `${data.viewport}${data.breakpoint ? ` · ${data.breakpoint.key}` : ""}` : DASH,
            ],
            ["Screen", data ? data.screen : DASH],
            ["Pixel ratio", snapshot && snapshot.devicePixelRatio ? String(snapshot.devicePixelRatio) : DASH],
            ["CPU cores reported", snapshot && snapshot.hardwareConcurrency ? String(snapshot.hardwareConcurrency) : DASH],
            ["Device memory reported", snapshot && snapshot.deviceMemory ? `${snapshot.deviceMemory} GB` : DASH],
            ["Time zone", snapshot && snapshot.timeZone ? snapshot.timeZone : DASH],
            ["Connection", snapshot && snapshot.effectiveType ? snapshot.effectiveType : DASH],
            ["GPU renderer", snapshot && snapshot.gpuRenderer ? snapshot.gpuRenderer : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[60%] break-words text-right font-semibold text-[var(--foreground)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {data && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--foreground)]">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Privacy signals
          </h2>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
            {data.privacy.score}
            <span className="text-base font-semibold text-[var(--muted-foreground)]">/100</span>
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {data.privacy.band} · {data.privacy.passed} of {data.privacy.total} checks passed
          </p>
          <ul className="mt-4 grid gap-3">
            {data.privacy.checks.map((check) => (
              <li key={check.key} className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                <p className="flex items-center justify-between gap-3 text-sm font-semibold">
                  <span className="text-[var(--foreground)]">{check.label}</span>
                  <span className={check.passed ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}>
                    {check.passed ? "Pass" : "No"}
                  </span>
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{check.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Identifying attributes exposed
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {data.fingerprint.exposedCount} of {data.fingerprint.totalChecked} attributes a script
            could read on this page load. Nothing here is hashed or stored.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-4 font-semibold">Attribute</th>
                  <th scope="col" className="py-2 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.fingerprint.exposed.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--border)]">
                    <th scope="row" className="py-2.5 pr-4 font-semibold whitespace-nowrap text-[var(--foreground)]">
                      {row.label}
                    </th>
                    <td className="py-2.5 break-all text-[var(--muted-foreground)]">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {data && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Web API support ({data.supportedCount} of {data.capabilityCount} · {data.supportPercent}%)
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {data.groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">{group.title}</h3>
                <ul className="mt-2 grid gap-1.5 text-sm">
                  {group.items.map((item) => (
                    <li key={item.key} className="flex items-center justify-between gap-3">
                      <span className="text-[var(--muted-foreground)]">{item.label}</span>
                      <span
                        className={
                          item.supported
                            ? "font-semibold text-[var(--success)]"
                            : "font-semibold text-[var(--danger)]"
                        }
                      >
                        {item.supported ? "Supported" : "No"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        User-agent strings are self-reported and can be changed, so treat browser detection as a
        hint rather than a fact — feature detection, which is what the support table above uses, is
        the reliable approach in production code.
      </p>
    </main>
  );
}
