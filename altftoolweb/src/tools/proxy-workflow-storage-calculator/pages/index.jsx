"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HardDrive, RotateCcw } from "lucide-react";

import {
  CAMERA_RATE_PRESETS,
  PREVIEW_CODECS,
  PROXY_CODECS,
  PROXY_SCALES,
  RESOLUTION_PRESETS,
  formatSize,
  planProxyStorage,
} from "../lib";

const NUM0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

const DEFAULTS = {
  footageHours: "10",
  cameraMbps: "150",
  resolutionId: "4k",
  fps: "25",
  useProxies: true,
  proxyCodecId: "prores-proxy",
  proxyScaleId: "quarter",
  timelineMinutes: "30",
  previewCodecId: "prores-422",
  cachePercent: "5",
  copies: "3",
  headroomPercent: "20",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const toNumber = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [footageHours, setFootageHours] = useState(DEFAULTS.footageHours);
  const [cameraMbps, setCameraMbps] = useState(DEFAULTS.cameraMbps);
  const [resolutionId, setResolutionId] = useState(DEFAULTS.resolutionId);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [useProxies, setUseProxies] = useState(DEFAULTS.useProxies);
  const [proxyCodecId, setProxyCodecId] = useState(DEFAULTS.proxyCodecId);
  const [proxyScaleId, setProxyScaleId] = useState(DEFAULTS.proxyScaleId);
  const [timelineMinutes, setTimelineMinutes] = useState(DEFAULTS.timelineMinutes);
  const [previewCodecId, setPreviewCodecId] = useState(DEFAULTS.previewCodecId);
  const [cachePercent, setCachePercent] = useState(DEFAULTS.cachePercent);
  const [copies, setCopies] = useState(DEFAULTS.copies);
  const [headroomPercent, setHeadroomPercent] = useState(DEFAULTS.headroomPercent);
  const [copied, setCopied] = useState(false);

  const resolution =
    RESOLUTION_PRESETS.find((item) => item.id === resolutionId) || RESOLUTION_PRESETS[2];
  const proxyScale = PROXY_SCALES.find((item) => item.id === proxyScaleId) || PROXY_SCALES[1];

  const result = useMemo(
    () =>
      planProxyStorage({
        footageHours: toNumber(footageHours),
        cameraMbps: toNumber(cameraMbps),
        width: resolution.width,
        height: resolution.height,
        fps: toNumber(fps),
        useProxies,
        proxyCodecId,
        proxyScale: proxyScale.scale,
        timelineMinutes: toNumber(timelineMinutes),
        previewCodecId,
        cachePercent: toNumber(cachePercent),
        copies: toNumber(copies),
        headroomPercent: toNumber(headroomPercent),
      }),
    [
      footageHours,
      cameraMbps,
      resolution,
      fps,
      useProxies,
      proxyCodecId,
      proxyScale,
      timelineMinutes,
      previewCodecId,
      cachePercent,
      copies,
      headroomPercent,
    ],
  );

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      "Proxy Workflow Storage Calculator",
      `Footage: ${NUM1.format(result.footageHours)} hours at ${resolution.label}`,
      `Camera originals: ${formatSize(result.originalsGb)}`,
      `Proxies: ${formatSize(result.proxiesGb)}`,
      `Render previews: ${formatSize(result.previewsGb)}`,
      `Media cache: ${formatSize(result.cacheGb)}`,
      `Working drive needs: ${formatSize(result.workingDriveGb)}`,
      `Buy a working drive of at least: ${formatSize(result.recommendedWorkingDriveGb)}`,
      `Extra backup copies of originals: ${formatSize(result.archiveGb)}`,
      `Total storage across all copies: ${formatSize(result.totalGb)}`,
    ].join("\n");
  }, [result, resolution]);

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
    setFootageHours(DEFAULTS.footageHours);
    setCameraMbps(DEFAULTS.cameraMbps);
    setResolutionId(DEFAULTS.resolutionId);
    setFps(DEFAULTS.fps);
    setUseProxies(DEFAULTS.useProxies);
    setProxyCodecId(DEFAULTS.proxyCodecId);
    setProxyScaleId(DEFAULTS.proxyScaleId);
    setTimelineMinutes(DEFAULTS.timelineMinutes);
    setPreviewCodecId(DEFAULTS.previewCodecId);
    setCachePercent(DEFAULTS.cachePercent);
    setCopies(DEFAULTS.copies);
    setHeadroomPercent(DEFAULTS.headroomPercent);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <HardDrive className="h-4 w-4" aria-hidden="true" />
          Video production
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Proxy Workflow Storage Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Camera originals, proxies, render previews and media cache all grow at different rates.
          This sizes each one properly, then adds only the backup copies that actually need
          duplicating.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The footage</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="px-hours">
              Hours of footage
            </label>
            <input
              id="px-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={footageHours}
              onChange={(event) => setFootageHours(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="px-camera">
              Camera data rate (Mb/s)
            </label>
            <input
              id="px-camera"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={cameraMbps}
              onChange={(event) => setCameraMbps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="px-resolution">
              Recording resolution
            </label>
            <select
              id="px-resolution"
              className={`mt-2 ${INPUT_CLASS}`}
              value={resolutionId}
              onChange={(event) => setResolutionId(event.target.value)}
            >
              {RESOLUTION_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="px-fps">
              Frame rate (fps)
            </label>
            <input
              id="px-fps"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="1000"
              step="1"
              value={fps}
              onChange={(event) => setFps(event.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {CAMERA_RATE_PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCameraMbps(String(item.mbps))}
              className={CHIP_BTN}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Proxies, previews and cache</h2>
        <label
          htmlFor="px-use-proxies"
          className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold"
        >
          <input
            id="px-use-proxies"
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={useProxies}
            onChange={(event) => setUseProxies(event.target.checked)}
          />
          Generate proxies for this project
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {useProxies ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="px-proxy-codec">
                  Proxy codec
                </label>
                <select
                  id="px-proxy-codec"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={proxyCodecId}
                  onChange={(event) => setProxyCodecId(event.target.value)}
                >
                  {PROXY_CODECS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="px-proxy-scale">
                  Proxy resolution
                </label>
                <select
                  id="px-proxy-scale"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={proxyScaleId}
                  onChange={(event) => setProxyScaleId(event.target.value)}
                >
                  {PROXY_SCALES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="px-timeline">
              Finished timeline length (minutes)
            </label>
            <input
              id="px-timeline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={timelineMinutes}
              onChange={(event) => setTimelineMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="px-preview">
              Render preview codec
            </label>
            <select
              id="px-preview"
              className={`mt-2 ${INPUT_CLASS}`}
              value={previewCodecId}
              onChange={(event) => setPreviewCodecId(event.target.value)}
            >
              {PREVIEW_CODECS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="px-cache">
              Media cache allowance (% of originals)
            </label>
            <input
              id="px-cache"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={cachePercent}
              onChange={(event) => setCachePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="px-copies">
              Copies of the originals (3-2-1 means 3)
            </label>
            <input
              id="px-copies"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              step="1"
              value={copies}
              onChange={(event) => setCopies(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="px-headroom">
              Working drive headroom (%)
            </label>
            <input
              id="px-headroom"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="99"
              step="5"
              value={headroomPercent}
              onChange={(event) => setHeadroomPercent(event.target.value)}
            />
          </div>
        </div>
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
              Working drive to buy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {result.error ? DASH : formatSize(result.recommendedWorkingDriveGb)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.error
                ? DASH
                : `${formatSize(result.workingDriveGb)} of media plus ${NUM0.format(toNumber(headroomPercent))}% headroom`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the storage plan"
              className={GHOST_BTN}
              disabled={Boolean(result.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Camera originals", result.error ? DASH : formatSize(result.originalsGb)],
            ["Per hour of footage", result.error ? DASH : formatSize(result.gigabytesPerFootageHour)],
            [
              "Proxies",
              result.error
                ? DASH
                : result.proxiesGb > 0
                  ? `${formatSize(result.proxiesGb)} at ${result.proxyWidth} x ${result.proxyHeight}`
                  : "Not generated",
            ],
            [
              "Proxy saving versus originals",
              result.error || result.proxiesGb <= 0 ? DASH : PCT.format(result.proxySavingRatio),
            ],
            ["Render previews", result.error ? DASH : formatSize(result.previewsGb)],
            ["Media cache", result.error ? DASH : formatSize(result.cacheGb)],
            ["Working drive total", result.error ? DASH : formatSize(result.workingDriveGb)],
            ["Extra backup copies of originals", result.error ? DASH : formatSize(result.archiveGb)],
            ["Total across every copy", result.error ? DASH : formatSize(result.totalGb)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        {!result.error && result.breakdown.length > 0 ? (
          <div className="mt-5">
            <div
              className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={result.breakdown
                .map((row) => `${row.label} ${PCT.format(row.share)}`)
                .join(", ")}
            >
              {result.breakdown.map((row, index) => (
                <span
                  key={row.id}
                  className={`block h-full ${
                    index === 0
                      ? "bg-[var(--primary)]"
                      : index === 1
                        ? "bg-[var(--success)]"
                        : index === 2
                          ? "bg-[var(--warning)]"
                          : "bg-[var(--info)]"
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, row.share * 100))}%` }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {result.breakdown.map((row) => `${row.label} ${PCT.format(row.share)}`).join(" · ")}
            </p>
          </div>
        ) : null}
      </section>

      {!result.error && result.breakdown.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Where the space goes</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Item
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Data rate
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Size
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.label}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[var(--muted-foreground)]">
                      {row.mbps > 0 ? `${NUM1.format(row.mbps)} Mb/s` : DASH}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatSize(row.gigabytes)}</td>
                    <td className="py-2 text-right tabular-nums">{PCT.format(row.share)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Proxies, previews and cache are all regenerable from the originals, so only the originals are
        multiplied across backup copies here. Sizes are SI, matching how drives are sold — a drive
        labelled 1 TB holds 1,000 GB, which your operating system may report as about 931 GiB.
      </p>
    </main>
  );
}
