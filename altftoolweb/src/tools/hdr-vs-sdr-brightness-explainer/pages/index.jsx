"use client";

import { useMemo, useState } from "react";
import { Check, Contrast, Copy, RotateCcw } from "lucide-react";

import {
  HDR_REFERENCE_WHITE_NITS,
  SDR_REFERENCE_WHITE_NITS,
  analyseHdrVsSdr,
} from "../lib";

const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DEC3 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const d2 = (value) => DEC2.format(Number.isFinite(value) ? value : 0);
const d3 = (value) => DEC3.format(Number.isFinite(value) ? value : 0);
const int = (value) => INT.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  hdrPeak: "1000",
  sdrPeak: "200",
  diffuseWhite: String(HDR_REFERENCE_WHITE_NITS),
  sample: "1000",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [hdrPeak, setHdrPeak] = useState(DEFAULTS.hdrPeak);
  const [sdrPeak, setSdrPeak] = useState(DEFAULTS.sdrPeak);
  const [diffuseWhite, setDiffuseWhite] = useState(DEFAULTS.diffuseWhite);
  const [sample, setSample] = useState(DEFAULTS.sample);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseHdrVsSdr({
        hdrPeakNits: Number(hdrPeak),
        sdrPeakNits: Number(sdrPeak),
        diffuseWhiteNits: Number(diffuseWhite),
        sampleNits: Number(sample),
      }),
    [hdrPeak, sdrPeak, diffuseWhite, sample],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "HDR vs SDR brightness",
      `HDR peak ${int(result.hdrPeakNits)} nits · SDR display peak ${int(result.sdrPeakNits)} nits`,
      `Diffuse white ${int(result.diffuseWhiteNits)} nits`,
      `Specular headroom above diffuse white: ${d2(result.specularHeadroomStops)} stops`,
      `SDR headroom above the same white: ${d2(result.sdrHeadroomStops)} stops`,
      `Sample at ${int(result.sampleNits)} nits — PQ code ${d3(result.samplePqCode)}, HLG signal ${d3(result.sampleHlgSignal)}`,
      `Tone mapped to SDR: ${d2(result.toneMappedNits)} nits`,
      `Untone-mapped playback would show: ${d2(result.naivePlaybackNits)} nits (${d2(result.naiveLossStops)} stops darker)`,
    ].join("\n");
  }, [result, failed]);

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
    setHdrPeak(DEFAULTS.hdrPeak);
    setSdrPeak(DEFAULTS.sdrPeak);
    setDiffuseWhite(DEFAULTS.diffuseWhite);
    setSample(DEFAULTS.sample);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Contrast className="h-4 w-4" aria-hidden="true" />
          Nits, PQ and tone mapping
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">HDR Vs SDR Brightness Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          HDR does not make the picture brighter — it puts headroom above diffuse white. Set your
          peaks below to see that headroom in stops, the PQ and HLG code values behind each level,
          and exactly how much a player loses when it skips tone mapping.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hdr-peak">
              HDR peak (nits)
            </label>
            <input
              id="hdr-peak"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="10000"
              step="100"
              value={hdrPeak}
              onChange={(event) => setHdrPeak(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sdr-peak">
              SDR display peak (nits)
            </label>
            <input
              id="sdr-peak"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="50"
              max="4000"
              step="10"
              value={sdrPeak}
              onChange={(event) => setSdrPeak(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hdr-diffuse">
              Diffuse (paper) white in the grade (nits)
            </label>
            <input
              id="hdr-diffuse"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="50"
              max="1000"
              step="1"
              value={diffuseWhite}
              onChange={(event) => setDiffuseWhite(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hdr-sample">
              Level to explain (nits)
            </label>
            <input
              id="hdr-sample"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10000"
              step="10"
              value={sample}
              onChange={(event) => setSample(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          ITU-R BT.2408 sets HDR reference white at {HDR_REFERENCE_WHITE_NITS} nits; SDR mastering
          reference white is {SDR_REFERENCE_WHITE_NITS} nits in a dim room.
        </p>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Specular headroom above diffuse white
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${d2(result.specularHeadroomStops)} stops`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to run the comparison."
                : `SDR gives ${d2(result.sdrHeadroomStops)} stops over the same white`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the HDR to SDR comparison"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Peak advantage of HDR over this SDR display", failed ? DASH : `${d2(result.peakAdvantageStops)} stops`],
            ["PQ code value for the sample level", failed ? DASH : d3(result.samplePqCode)],
            ["HLG signal for the sample level", failed ? DASH : d3(result.sampleHlgSignal)],
            ["Sample tone mapped to SDR", failed ? DASH : `${d2(result.toneMappedNits)} nits`],
            ["Same sample with no tone mapping", failed ? DASH : `${d2(result.naivePlaybackNits)} nits`],
            ["Brightness lost by skipping tone mapping", failed ? DASH : `${d2(result.naiveLossStops)} stops`],
            [
              "Sample exceeds the SDR display",
              failed ? DASH : result.sampleClipsOnSdr ? "Yes — it would clip" : "No",
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!failed && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Brightness ladder</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Bar length follows the PQ code value, which is roughly perceptually uniform — that is
              why a 10x jump in nits is a modest jump in perceived brightness.
            </p>
            <ul className="mt-4 space-y-3">
              {result.ladder.map((level) => (
                <li key={level.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium">{level.label}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {int(level.nits)} nits · {d2(level.stopsOverDiffuse)} stops over white
                      {level.clippedOnSdr ? " · clips on SDR" : ""}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className={`block h-full ${level.clippedOnSdr ? "bg-[var(--danger)]" : "bg-[var(--primary)]"}`}
                      style={{ width: `${Math.max(0, Math.min(100, level.pqCode * 100))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Level by level</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Level</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Nits</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">PQ code</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">HLG signal</th>
                    <th scope="col" className="py-2 text-right font-semibold">Tone mapped</th>
                  </tr>
                </thead>
                <tbody>
                  {result.ladder.map((level) => (
                    <tr key={level.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{level.label}</td>
                      <td className="py-2 pr-3 text-right">{d2(level.nits)}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{d3(level.pqCode)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{d3(level.hlgSignal)}</td>
                      <td className="py-2 text-right">{d2(level.toneMappedNits)} nits</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Tone mapping here uses extended Reinhard with the HDR peak as the white point. Real players
        and displays use different operators — BT.2390 EETF, dynamic metadata, or a vendor curve —
        so treat these numbers as an explanation of the mechanism rather than a match to any one
        device.
      </p>
    </main>
  );
}
