"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Monitor, RotateCcw } from "lucide-react";

import { REFERENCE_CURVES, analyseDisplay, gammaMatchCode, greyLightnessPercent } from "../lib";

const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const DEC3 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const d2 = (value) => DEC2.format(Number.isFinite(value) ? value : 0);
const d3 = (value) => DEC3.format(Number.isFinite(value) ? value : 0);
const int = (value) => INT.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = { matchCode: "188", steps: "11", bitDepth: "8" };
const BIT_DEPTHS = [4, 6, 8, 10];

const DITHER_BACKGROUND =
  "repeating-linear-gradient(to bottom, hsl(0 0% 0%) 0px, hsl(0 0% 0%) 1px, hsl(0 0% 100%) 1px, hsl(0 0% 100%) 2px)";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const grey = (code) => ({ backgroundColor: `hsl(0 0% ${d2(greyLightnessPercent(code))}%)` });

export default function ToolHome() {
  const [matchCode, setMatchCode] = useState(DEFAULTS.matchCode);
  const [steps, setSteps] = useState(DEFAULTS.steps);
  const [bitDepth, setBitDepth] = useState(DEFAULTS.bitDepth);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      analyseDisplay({
        matchCode: Number(matchCode),
        steps: Number(steps),
        bitDepth: Number(bitDepth),
      }),
    [matchCode, steps, bitDepth],
  );

  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Monitor gamma check",
      `Matching patch: ${int(result.code)} of 255`,
      `Estimated display gamma: ${d3(result.gamma)}`,
      `sRGB reference patch: ${d2(result.srgbMatchCode)} · gamma 2.2 reference: ${d2(result.gamma22MatchCode)}`,
      `Offset from gamma 2.2: ${d2(result.offsetFromGamma22)}`,
      result.verdict,
      `Banding ramp shown at ${result.ramp.bitDepth}-bit (${int(result.ramp.levels)} levels, ${d2(result.ramp.codeStep)} codes per step)`,
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
    setMatchCode(DEFAULTS.matchCode);
    setSteps(DEFAULTS.steps);
    setBitDepth(DEFAULTS.bitDepth);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Monitor className="h-4 w-4" aria-hidden="true" />
          Display check
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Monitor Gamma Test Pattern</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A one-pixel black and white dither emits exactly half the panel&apos;s peak light. Find the
          solid grey that matches it from a normal viewing distance and you have measured your
          display&apos;s gamma without a colorimeter.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Gamma match</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Step back from the screen, squint, and slide until the right half stops standing out
          against the striped half.
        </p>

        <div className="mt-4 flex w-full overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
          <div
            className="h-40 w-1/2"
            style={{ backgroundImage: DITHER_BACKGROUND }}
            role="img"
            aria-label="One pixel black and white dither reference at 50 percent light"
          />
          <div
            className="h-40 w-1/2"
            style={grey(Number(matchCode))}
            role="img"
            aria-label={`Solid grey patch at code ${matchCode}`}
          />
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="mgt-match">
            Matching patch value (0-255)
          </label>
          <input
            id="mgt-match"
            className="mt-2 h-11 w-full accent-[var(--primary)]"
            type="range"
            min="1"
            max="254"
            step="1"
            value={matchCode}
            onChange={(event) => setMatchCode(event.target.value)}
          />
          <input
            id="mgt-match-number"
            className={`mt-2 ${INPUT_CLASS}`}
            type="number"
            inputMode="numeric"
            min="1"
            max="254"
            step="1"
            value={matchCode}
            onChange={(event) => setMatchCode(event.target.value)}
            aria-label="Matching patch value as a number"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {REFERENCE_CURVES.map((curve) => (
            <button
              key={curve.id}
              type="button"
              className={CHIP_BTN}
              onClick={() => setMatchCode(String(Math.round(gammaMatchCode(curve.gamma))))}
            >
              {curve.label}
            </button>
          ))}
        </div>
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
              Estimated display gamma
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : d3(result.gamma)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Enter a patch value between 1 and 254." : result.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the gamma measurement"
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
            ["Matching patch you chose", failed ? DASH : int(result.code)],
            ["Patch a true sRGB display would match", failed ? DASH : d2(result.srgbMatchCode)],
            ["Patch a pure gamma 2.2 display would match", failed ? DASH : d2(result.gamma22MatchCode)],
            ["Difference from the sRGB patch", failed ? DASH : `${d2(result.offsetFromSrgbCodes)} codes`],
            ["Difference from gamma 2.2", failed ? DASH : d2(result.offsetFromGamma22)],
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
            <h2 className="text-base font-semibold">2. Step wedge</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Every step should look equally separated from its neighbours. Clumping at one end is a
              tone-curve problem, not an eyesight problem.
            </p>
            <div className="mt-3">
              <label className={LABEL_CLASS} htmlFor="mgt-steps">
                Patches ({steps})
              </label>
              <input
                id="mgt-steps"
                className="mt-2 h-11 w-full accent-[var(--primary)]"
                type="range"
                min="2"
                max="33"
                step="1"
                value={steps}
                onChange={(event) => setSteps(event.target.value)}
              />
            </div>
            <div className="mt-3 flex w-full overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
              {result.wedge.map((patch) => (
                <div key={patch.index} className="h-20 flex-1" style={grey(patch.code)} />
              ))}
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Patch</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Code</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Signal %</th>
                    <th scope="col" className="py-2 text-right font-semibold">Light emitted %</th>
                  </tr>
                </thead>
                <tbody>
                  {result.wedge.map((patch) => (
                    <tr key={patch.index} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{patch.index + 1}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{int(patch.code)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{d2(patch.percent)}%</td>
                      <td className="py-2 text-right">{d2(patch.linearLight)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">3. Banding ramp</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              A ramp quantised to the panel depth you select. If the 8-bit ramp already shows visible
              steps, the panel or the graphics pipeline is dropping levels.
            </p>
            <div className="mt-3">
              <label className={LABEL_CLASS} htmlFor="mgt-depth">
                Panel bit depth
              </label>
              <select
                id="mgt-depth"
                className={`mt-2 ${INPUT_CLASS}`}
                value={bitDepth}
                onChange={(event) => setBitDepth(event.target.value)}
              >
                {BIT_DEPTHS.map((depth) => (
                  <option key={depth} value={depth}>
                    {depth}-bit
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 flex w-full overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
              {result.ramp.stops.map((stop) => (
                <div key={stop.index} className="h-16 flex-1" style={grey(stop.code)} />
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {int(result.ramp.levels)} levels · {d2(result.ramp.codeStep)} 8-bit codes between
              neighbouring steps
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">4. Shadow and highlight clipping</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              In a dark room you should be able to separate every near-black patch, and every
              near-white patch from paper white. Any that merge are being clipped.
            </p>
            <div className="mt-4">
              <p className="text-sm font-semibold">Near black</p>
              <div className="mt-2 flex w-full overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
                {result.nearBlack.map((patch) => (
                  <div key={patch.code} className="h-16 flex-1" style={grey(patch.code)} />
                ))}
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Codes {result.nearBlack.map((patch) => patch.code).join(", ")}
              </p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold">Near white</p>
              <div className="mt-2 flex w-full overflow-hidden rounded-lg ring-1 ring-[var(--border)]">
                {result.nearWhite.map((patch) => (
                  <div key={patch.code} className="h-16 flex-1" style={grey(patch.code)} />
                ))}
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Codes {result.nearWhite.map((patch) => patch.code).join(", ")}
              </p>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Set the browser to 100% zoom and view the page at native resolution — scaling blurs the
        one-pixel dither and shifts the match. This is a sanity check, not a substitute for a
        hardware colorimeter, which also measures white point, uniformity and absolute luminance.
      </p>
    </main>
  );
}
