"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Palette, RotateCcw } from "lucide-react";

import {
  ASSIGN_VS_CONVERT,
  PROFILES,
  RENDERING_INTENTS,
  explainMismatch,
  profileReport,
} from "../lib";

const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DEC4 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
const DEC0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const d2 = (value) => DEC2.format(Number.isFinite(value) ? value : 0);
const d4 = (value) => DEC4.format(Number.isFinite(value) ? value : 0);
const d0 = (value) => DEC0.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = { profileId: "adobergb", bitDepth: "8", actualId: "adobergb", assumedId: "srgb" };
const BIT_DEPTHS = [8, 16, 32];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [profileId, setProfileId] = useState(DEFAULTS.profileId);
  const [bitDepth, setBitDepth] = useState(DEFAULTS.bitDepth);
  const [actualId, setActualId] = useState(DEFAULTS.actualId);
  const [assumedId, setAssumedId] = useState(DEFAULTS.assumedId);
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => profileReport({ profileId, bitDepth: Number(bitDepth) }),
    [profileId, bitDepth],
  );
  const mismatch = useMemo(() => explainMismatch({ actualId, assumedId }), [actualId, assumedId]);

  const failed = Boolean(report.error);
  const mismatchFailed = Boolean(mismatch.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `ICC working space: ${report.profile.name}`,
      `White point: ${report.profile.whitePoint.name} · Transfer: ${report.profile.transfer}`,
      `Chromaticity area: ${d4(report.area)} (${d2(report.ratioVsSrgb)}x sRGB)`,
      `Editing at ${report.bitDepth}-bit: ${report.advice}`,
      "",
      mismatchFailed
        ? ""
        : `If a ${mismatch.actual.name} file is read as ${mismatch.assumed.name}: ${mismatch.verdict} ${mismatch.fix}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [report, mismatch, failed, mismatchFailed]);

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
    setProfileId(DEFAULTS.profileId);
    setBitDepth(DEFAULTS.bitDepth);
    setActualId(DEFAULTS.actualId);
    setAssumedId(DEFAULTS.assumedId);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Palette className="h-4 w-4" aria-hidden="true" />
          Colour management
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">ICC Profile Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A profile is a label saying what a file&apos;s numbers mean. Compare how much colour each
          working space can describe, see what happens when the label is wrong, and learn when to
          assign rather than convert.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="icc-profile">
              Working space
            </label>
            <select
              id="icc-profile"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profileId}
              onChange={(event) => setProfileId(event.target.value)}
            >
              {PROFILES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icc-bits">
              Editing bit depth
            </label>
            <select
              id="icc-bits"
              className={`mt-2 ${INPUT_CLASS}`}
              value={bitDepth}
              onChange={(event) => setBitDepth(event.target.value)}
            >
              {BIT_DEPTHS.map((bits) => (
                <option key={bits} value={bits}>
                  {bits}-bit per channel
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Chromaticity area against sRGB
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${d2(report.ratioVsSrgb)}×`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Pick a working space and bit depth."
                : `${report.profile.name} covers ${d0(report.percentLargerThanSrgb)}% more xy area than sRGB`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the profile summary"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Chromaticity triangle area", failed ? DASH : d4(report.area)],
            ["sRGB area for comparison", failed ? DASH : d4(report.srgbArea)],
            ["White point", failed ? DASH : report.profile.whitePoint.name],
            ["Transfer function", failed ? DASH : report.profile.transfer],
            ["Recommended editing depth", failed ? DASH : `${report.profile.safeBits}-bit`],
            ["Banding risk at this depth", failed ? DASH : report.bandingRisk ? "Yes" : "No"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              report.bandingRisk
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {report.advice}
          </p>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Working spaces side by side</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Space</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">xy area</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">vs sRGB</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">White</th>
                  <th scope="col" className="py-2 text-right font-semibold">Edit at</th>
                </tr>
              </thead>
              <tbody>
                {report.comparison.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0 align-top">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{item.name}</span>
                      <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{item.use}</span>
                    </td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap">{d4(item.area)}</td>
                    <td className="py-2 pr-3 text-right whitespace-nowrap font-semibold">
                      {d2(item.ratioVsSrgb)}×
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                      {item.whitePoint}
                    </td>
                    <td className="py-2 text-right whitespace-nowrap">{item.safeBits}-bit</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What a wrong tag does</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="icc-actual">
              The file was really authored in
            </label>
            <select
              id="icc-actual"
              className={`mt-2 ${INPUT_CLASS}`}
              value={actualId}
              onChange={(event) => setActualId(event.target.value)}
            >
              {PROFILES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="icc-assumed">
              The app or browser assumed
            </label>
            <select
              id="icc-assumed"
              className={`mt-2 ${INPUT_CLASS}`}
              value={assumedId}
              onChange={(event) => setAssumedId(event.target.value)}
            >
              {PROFILES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mismatchFailed ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {mismatch.error}
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm font-semibold">{mismatch.verdict}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{mismatch.fix}</p>
            {mismatch.whitePointDiffers && (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                The two spaces also use different white points ({mismatch.actual.whitePoint.name} vs{" "}
                {mismatch.assumed.whitePoint.name}), so neutrals shift as well as saturated colour.
              </p>
            )}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Primary</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Authored xy</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Displayed xy</th>
                    <th scope="col" className="py-2 text-right font-semibold">Shift</th>
                  </tr>
                </thead>
                <tbody>
                  {mismatch.shifts.map((shift) => (
                    <tr key={shift.channel} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{shift.label}</td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap">
                        {d4(shift.from[0])}, {d4(shift.from[1])}
                      </td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap">
                        {d4(shift.to[0])}, {d4(shift.to[1])}
                      </td>
                      <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                        {d4(shift.distance)} · {shift.direction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Assign versus convert</h2>
        <ul className="mt-3 space-y-3">
          {ASSIGN_VS_CONVERT.map((item) => (
            <li key={item.id} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-sm font-semibold">{item.action}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.detail}</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Pixel numbers change: {item.numbersChange ? "yes" : "no"} · Appearance changes:{" "}
                {item.appearanceChanges ? "yes" : "no"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Rendering intents</h2>
        <ul className="mt-3 space-y-3">
          {RENDERING_INTENTS.map((intent) => (
            <li key={intent.id} className="rounded-md border border-[var(--border)] p-3">
              <p className="text-sm font-semibold">{intent.name}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{intent.summary}</p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Use it for: {intent.when} · Cost: {intent.cost}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Chromaticity area is a two-dimensional comparison and ignores lightness, so it ranks working
        spaces rather than predicting exactly which colours a device can reproduce. For output
        decisions, soft proof against the actual printer or display profile.
      </p>
    </main>
  );
}
