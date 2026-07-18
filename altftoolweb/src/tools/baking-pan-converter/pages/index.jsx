"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Copy,
  Egg,
  FileDown,
  Lightbulb,
  RefreshCw,
  Ruler,
  Square,
  Timer,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CUBIC_INCH_ML = 16.387;
const CUP_ML = 236.6;
const PX_PER_INCH = 9;

const PANS = [
  { id: "round-6", label: "Round 6″", cm: "15 cm", shape: "round", w: 6, h: 6, depth: 2 },
  { id: "round-7", label: "Round 7″", cm: "18 cm", shape: "round", w: 7, h: 7, depth: 2 },
  { id: "round-8", label: "Round 8″", cm: "20 cm", shape: "round", w: 8, h: 8, depth: 2 },
  { id: "round-9", label: "Round 9″", cm: "23 cm", shape: "round", w: 9, h: 9, depth: 2 },
  { id: "round-10", label: "Round 10″", cm: "25 cm", shape: "round", w: 10, h: 10, depth: 2 },
  { id: "square-8", label: "Square 8″", cm: "20 × 20 cm", shape: "rect", w: 8, h: 8, depth: 2 },
  { id: "square-9", label: "Square 9″", cm: "23 × 23 cm", shape: "rect", w: 9, h: 9, depth: 2 },
  { id: "rect-9x13", label: "Rectangle 9 × 13″", cm: "23 × 33 cm", shape: "rect", w: 13, h: 9, depth: 2 },
  { id: "loaf-8x4", label: "Loaf 8 × 4″", cm: "20 × 10 cm", shape: "rect", w: 8, h: 4, depth: 2.5 },
  { id: "loaf-9x5", label: "Loaf 9 × 5″", cm: "23 × 13 cm", shape: "rect", w: 9, h: 5, depth: 3 },
  {
    id: "bundt-10",
    label: "Bundt 10″ (12-cup)",
    cm: "25 cm",
    shape: "bundt",
    w: 10,
    h: 10,
    depth: 3.75,
    areaOverride: 70,
    volumeOverrideMl: 2839,
  },
  {
    id: "cupcakes-12",
    label: "Cupcake tin (12 standard)",
    cm: "12 × 118 mL cups",
    shape: "cupcakes",
    w: 11,
    h: 8.5,
    depth: 1.4,
    areaOverride: 71,
    volumeOverrideMl: 1420,
  },
];

const PRACTICAL_MULTIPLIERS = [
  { value: 0.5, label: "½×" },
  { value: 0.67, label: "⅔×" },
  { value: 0.75, label: "¾×" },
  { value: 1, label: "1×" },
  { value: 1.25, label: "1¼×" },
  { value: 1.33, label: "1⅓×" },
  { value: 1.5, label: "1½×" },
  { value: 1.75, label: "1¾×" },
  { value: 2, label: "2×" },
  { value: 2.5, label: "2½×" },
  { value: 3, label: "3×" },
];

const panArea = (pan) => (pan.areaOverride ? pan.areaOverride : pan.shape === "round" ? Math.PI * (pan.w / 2) ** 2 : pan.w * pan.h);
const panVolumeMl = (pan) => (pan.volumeOverrideMl ? pan.volumeOverrideMl : panArea(pan) * pan.depth * CUBIC_INCH_ML);
const litres = (ml) => `${(ml / 1000).toFixed(2)} L`;
const cups = (ml) => `${(ml / CUP_ML).toFixed(1)} cups`;

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function PanShape({ pan, variant }) {
  const isTarget = variant === "target";
  const borderClass = isTarget
    ? "border-2 border-[var(--primary)]"
    : "border-2 border-dashed border-[var(--muted-foreground)]";
  const fillStyle = isTarget ? { background: "color-mix(in srgb, var(--primary) 10%, transparent)" } : undefined;

  if (pan.shape === "cupcakes") {
    return (
      <div className={`grid grid-cols-4 gap-1.5 rounded-md p-2 ${borderClass}`} style={fillStyle}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className={`rounded-full ${isTarget ? "border border-[var(--primary)]" : "border border-[var(--muted-foreground)]"}`}
            style={{ width: 2.75 * PX_PER_INCH, height: 2.75 * PX_PER_INCH }}
          />
        ))}
      </div>
    );
  }

  if (pan.shape === "bundt") {
    return (
      <div
        className={`relative rounded-full ${borderClass}`}
        style={{ width: pan.w * PX_PER_INCH, height: pan.h * PX_PER_INCH, ...fillStyle }}
      >
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--card)] ${
            isTarget ? "border-2 border-[var(--primary)]" : "border-2 border-dashed border-[var(--muted-foreground)]"
          }`}
          style={{ width: 3.4 * PX_PER_INCH, height: 3.4 * PX_PER_INCH }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${pan.shape === "round" ? "rounded-full" : "rounded-sm"} ${borderClass}`}
      style={{ width: pan.w * PX_PER_INCH, height: pan.h * PX_PER_INCH, ...fillStyle }}
    />
  );
}

export default function ToolHome() {
  const [sourceId, setSourceId] = useState("round-9");
  const [targetId, setTargetId] = useState("rect-9x13");
  const [scaleAmount, setScaleAmount] = useState(200);
  const [copied, setCopied] = useState(false);

  const source = PANS.find((pan) => pan.id === sourceId) || PANS[0];
  const target = PANS.find((pan) => pan.id === targetId) || PANS[0];

  const result = useMemo(() => {
    const sourceVol = panVolumeMl(source);
    const targetVol = panVolumeMl(target);
    const multiplier = targetVol / sourceVol;
    const practical = PRACTICAL_MULTIPLIERS.reduce((best, item) =>
      Math.abs(item.value - multiplier) < Math.abs(best.value - multiplier) ? item : best
    );
    const depthRatio = multiplier * (panArea(source) / panArea(target));
    const fillFraction = (0.67 * sourceVol) / targetVol;

    let timeAdvice;
    if (target.shape === "cupcakes") {
      const count = Math.round((0.67 * sourceVol) / 80);
      timeAdvice = `Fill each liner about ⅔ full — your unscaled batter makes roughly ${count} standard cupcakes. Cupcakes bake far faster than a cake: 18-22 min at the recipe temperature, first check at 15 min.`;
    } else if (target.shape === "bundt") {
      timeAdvice =
        "Bundt pans are deep: lower the temperature by 15°C (25°F), expect 20-40% more time than a layer pan, and test the thickest part with a skewer. Grease every crevice well.";
    } else if (depthRatio > 1.15) {
      timeAdvice = `Batter will sit about ${Math.round((depthRatio - 1) * 100)}% deeper. Lower the temperature by 15°C (25°F), expect roughly 15-30% more time, and tent with foil if the top browns early.`;
    } else if (depthRatio < 0.85) {
      timeAdvice = `Batter will sit about ${Math.round((1 - depthRatio) * 100)}% shallower. Keep the recipe temperature and start checking at around ${Math.max(55, Math.round(depthRatio * 100))}% of the original bake time.`;
    } else {
      timeAdvice = "Batter depth stays almost the same — keep the original temperature and time, and start checking about 5 minutes early.";
    }

    let fillStatus;
    if (fillFraction > 0.67) {
      fillStatus = {
        tone: "danger",
        title: "Overflow risk without scaling",
        text: `Poured as-is, the original batter would fill ~${Math.round(fillFraction * 100)}% of the new pan — above the safe ⅔ line. Scale the recipe down or keep spare batter for cupcakes.`,
      };
    } else if (fillFraction < 0.33) {
      fillStatus = {
        tone: "warning",
        title: "Layer would be very thin without scaling",
        text: `Unscaled batter fills only ~${Math.round(fillFraction * 100)}% of the new pan (under ⅓), giving a flat, dry bake. Scale the recipe up using the multiplier.`,
      };
    } else {
      fillStatus = {
        tone: "success",
        title: "Safe fill either way",
        text: `Even without scaling, the original batter fills ~${Math.round(fillFraction * 100)}% of the new pan — within the ⅓ to ⅔ comfort zone.`,
      };
    }

    return { sourceVol, targetVol, multiplier, practical, depthRatio, fillFraction, timeAdvice, fillStatus };
  }, [source, target]);

  const noScalingNeeded = Math.abs(result.multiplier - 1) <= 0.1;

  const report = useMemo(
    () =>
      [
        "Baking Pan Conversion",
        `From: ${source.label} (${source.cm}), ${litres(result.sourceVol)} / ${cups(result.sourceVol)} to the brim`,
        `To: ${target.label} (${target.cm}), ${litres(result.targetVol)} / ${cups(result.targetVol)} to the brim`,
        `Ingredient multiplier: ×${result.multiplier.toFixed(2)} (practical: ${result.practical.label})`,
        `Formula: target pan volume ÷ source pan volume`,
        `Bake time: ${result.timeAdvice}`,
        `Fill check: ${result.fillStatus.text}`,
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [result, source, target]
  );

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const swapPans = () => {
    setSourceId(targetId);
    setTargetId(sourceId);
  };

  const toneVar = {
    danger: "var(--anslation-ds-danger)",
    warning: "var(--anslation-ds-warning)",
    success: "var(--anslation-ds-success)",
  }[result.fillStatus.tone];
  const toneSoftVar = {
    danger: "var(--anslation-ds-danger-soft)",
    warning: "var(--anslation-ds-warning-soft)",
    success: "var(--anslation-ds-success-soft)",
  }[result.fillStatus.tone];

  const scaledAmount = (Number(scaleAmount) || 0) * result.multiplier;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Square className="h-4 w-4" />
            Baking helper
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Baking Pan Size Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Recipe written for a 9″ round but you only own a 9 × 13? Pick both pans to get the exact ingredient
            multiplier, adjusted bake-time advice, and a warning if the batter would overflow or bake too thin.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="block">
              <span className="text-sm font-semibold">Recipe pan (what the recipe asks for)</span>
              <select
                value={sourceId}
                onChange={(event) => setSourceId(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {PANS.map((pan) => (
                  <option key={pan.id} value={pan.id}>
                    {pan.label} · {pan.cm}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={swapPans}
                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Swap pans
              </button>
            </div>

            <label className="mt-3 block">
              <span className="text-sm font-semibold">Your pan (what you will bake in)</span>
              <select
                value={targetId}
                onChange={(event) => setTargetId(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              >
                {PANS.map((pan) => (
                  <option key={pan.id} value={pan.id}>
                    {pan.label} · {pan.cm}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5 rounded-md bg-[var(--muted)] p-4">
              <p className="text-sm font-semibold">Quick ingredient scaler</p>
              <label className="mt-2 block">
                <span className="text-xs text-[var(--muted-foreground)]">Amount in original recipe (g, mL, tbsp…)</span>
                <input
                  type="number"
                  value={scaleAmount}
                  min={0}
                  onChange={(event) => setScaleAmount(Number(event.target.value))}
                  className="mt-1.5 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </label>
              <p aria-live="polite" className="mt-2 text-sm">
                Scaled amount:{" "}
                <span className="font-semibold text-[var(--primary)]">
                  {Number.isInteger(scaledAmount) ? scaledAmount : scaledAmount.toFixed(1)}
                </span>
              </p>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-md bg-[var(--muted)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
              <Egg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
              <span>
                Eggs: multiply, then round to the nearest half egg. For half an egg, whisk one and use about 25 g
                (2 tbsp).
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {source.label} <ArrowRight className="mx-1 inline h-3.5 w-3.5" /> {target.label}
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadTextFile("pan-conversion.txt", report)}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <FileDown className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>

            <div aria-live="polite" className="mt-4 flex flex-wrap items-center gap-4">
              <div className="rounded-lg bg-[var(--muted)] p-5">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Multiply every ingredient by</p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">×{result.multiplier.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-4">
                <p className="text-xs text-[var(--muted-foreground)]">Practical kitchen rounding</p>
                <p className="mt-1 text-2xl font-semibold">
                  {noScalingNeeded ? "Keep recipe as-is" : result.practical.label}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {noScalingNeeded
                    ? "Difference is under 10% — no scaling needed"
                    : `= ×${result.practical.value}, close enough for baking`}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
              Formula: your pan volume ÷ recipe pan volume = {litres(result.targetVol)} ÷ {litres(result.sourceVol)} =
              ×{result.multiplier.toFixed(2)}. Volumes are measured to the brim; both pans are compared at the same
              fill level.
            </p>

            <div className="mt-5 rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Timer className="h-4 w-4 text-[var(--primary)]" />
                Bake time & temperature
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{result.timeAdvice}</p>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Rule of thumb: shallower batter bakes faster; deeper batter needs longer at a slightly lower
                temperature so the centre cooks before the edges dry out.
              </p>
            </div>

            <div className="mt-4 rounded-md p-4" style={{ background: toneSoftVar }}>
              <p className="flex items-center gap-2 text-sm font-semibold">
                {result.fillStatus.tone === "success" ? (
                  <CheckCircle className="h-4 w-4" style={{ color: toneVar }} />
                ) : (
                  <AlertTriangle className="h-4 w-4" style={{ color: toneVar }} />
                )}
                {result.fillStatus.title}
              </p>
              <p className="mt-1.5 text-sm leading-6">{result.fillStatus.text}</p>
              <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full bg-[var(--background)]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.round(result.fillFraction * 100))}%`, background: toneVar }}
                />
                <div className="absolute inset-y-0 left-[33%] w-px bg-[var(--border)]" />
                <div className="absolute inset-y-0 left-[67%] w-px bg-[var(--border)]" />
              </div>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Fill if you pour the original batter without scaling · markers at ⅓ and ⅔
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Ruler className="h-5 w-5 text-[var(--primary)]" />
            Size comparison, drawn to scale
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Top-down view · dashed = recipe pan, solid = your pan.</p>
          <div className="mt-5 overflow-x-auto">
            <div className="flex min-w-[480px] items-end justify-center gap-12 py-4">
              <div className="flex flex-col items-center gap-3">
                <PanShape pan={source} variant="source" />
                <div className="text-center">
                  <p className="text-sm font-semibold">{source.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {source.cm} · {source.depth}″ deep · {cups(result.sourceVol)}
                  </p>
                </div>
              </div>
              <ArrowRight className="mb-16 h-6 w-6 shrink-0 text-[var(--primary)]" />
              <div className="flex flex-col items-center gap-3">
                <PanShape pan={target} variant="target" />
                <div className="text-center">
                  <p className="text-sm font-semibold">{target.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {target.cm} · {target.depth}″ deep · {cups(result.targetVol)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="text-xl font-semibold">Pan volume reference</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Capacities measured to the brim. In practice you fill cake pans between half and two-thirds.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="py-2 pr-4 font-semibold">Pan</th>
                  <th className="py-2 pr-4 font-semibold">Size</th>
                  <th className="py-2 pr-4 font-semibold">Depth</th>
                  <th className="py-2 pr-4 font-semibold">Volume</th>
                  <th className="py-2 font-semibold">Cups</th>
                </tr>
              </thead>
              <tbody>
                {PANS.map((pan) => {
                  const volume = panVolumeMl(pan);
                  const isActive = pan.id === sourceId || pan.id === targetId;
                  return (
                    <tr
                      key={pan.id}
                      className="border-b border-[var(--border)] last:border-b-0"
                      style={isActive ? { background: "color-mix(in srgb, var(--primary) 6%, transparent)" } : undefined}
                    >
                      <td className="py-3 pr-4 font-semibold">
                        {pan.label}
                        {pan.id === sourceId && <span className="ml-2 text-xs font-semibold text-[var(--muted-foreground)]">recipe</span>}
                        {pan.id === targetId && <span className="ml-2 text-xs font-semibold text-[var(--primary)]">yours</span>}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">{pan.cm}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{pan.depth}″</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{litres(volume)}</td>
                      <td className="py-3 whitespace-nowrap">{cups(volume)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Lightbulb className="h-5 w-5 text-[var(--anslation-ds-warning)]" />
            Baker&apos;s notes
          </h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)] lg:grid-cols-2">
            <li className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              Two pans of the same “size” can differ: a 9″ square holds about 27% more than a 9″ round.
            </li>
            <li className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              Dark metal pans brown faster — drop the temperature by 10°C (25°F) when switching from light to dark.
            </li>
            <li className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              Glass pans heat slowly but hold heat: keep the temperature, expect a few extra minutes, and watch the edges.
            </li>
            <li className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
              Extra batter? Bake it as cupcakes (about 80 mL each, ⅔ full) rather than overfilling the pan.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
