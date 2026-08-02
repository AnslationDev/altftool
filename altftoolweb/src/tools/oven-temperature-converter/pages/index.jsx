"use client";

import { useMemo, useState } from "react";
import { Copy, Fan, Flame, Info, Lightbulb, RotateCcw, Thermometer } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const gasMarks = [
  { mark: "¼", value: 0.25, c: 110, f: 225, label: "Very cool", description: "Very cool — meringues, drying herbs, dehydrating" },
  { mark: "½", value: 0.5, c: 120, f: 250, label: "Very cool", description: "Very cool — pavlova, slow-dried fruit" },
  { mark: "1", value: 1, c: 140, f: 275, label: "Cool", description: "Cool — slow braises, rich fruit cake" },
  { mark: "2", value: 2, c: 150, f: 300, label: "Cool", description: "Cool — slow roasts, baked custards" },
  { mark: "3", value: 3, c: 160, f: 325, label: "Warm", description: "Warm — cheesecake, shortbread, delicate sponges" },
  { mark: "4", value: 4, c: 180, f: 350, label: "Moderate", description: "Moderate — the default for most cakes and bakes" },
  { mark: "5", value: 5, c: 190, f: 375, label: "Moderately hot", description: "Moderately hot — cookies, muffins, scones" },
  { mark: "6", value: 6, c: 200, f: 400, label: "Fairly hot", description: "Fairly hot — roast chicken, tray bakes, veg" },
  { mark: "7", value: 7, c: 220, f: 425, label: "Hot", description: "Hot — puff pastry, roast potatoes" },
  { mark: "8", value: 8, c: 230, f: 450, label: "Very hot", description: "Very hot — bread, focaccia, pastry lift" },
  { mark: "9", value: 9, c: 240, f: 475, label: "Very hot", description: "Very hot — pizza, naan, high-heat roasting" },
  { mark: "10", value: 10, c: 260, f: 500, label: "Extremely hot", description: "Extremely hot — pizza stone, grilling, max heat" },
];

const zones = [
  { from: 100, to: 119, display: "100–119", name: "Very cool", note: "Meringues, drying, keeping food warm" },
  { from: 120, to: 150, display: "120–150", name: "Low & slow", note: "Slow roasts, braises, custards, rich fruit cake" },
  { from: 151, to: 159, display: "151–159", name: "Warm", note: "Cheesecakes, delicate sponges, shortbread" },
  { from: 160, to: 180, display: "160–180", name: "Moderate", note: "Cakes, brownies, most everyday baking" },
  { from: 181, to: 199, display: "181–199", name: "Moderately hot", note: "Cookies, muffins, scones, tray bakes" },
  { from: 200, to: 220, display: "200–220", name: "Hot", note: "Roast vegetables, chicken, pastry" },
  { from: 221, to: 229, display: "221–229", name: "Very hot", note: "Puff pastry, roast potatoes, bread crust" },
  { from: 230, to: 280, display: "230+", name: "Extremely hot", note: "Pizza, naan, artisan bread, searing" },
];

const presets = [
  { label: "Cakes & bakes", c: 180 },
  { label: "Cookies", c: 190 },
  { label: "Roast veg", c: 200 },
  { label: "Slow roast", c: 140 },
  { label: "Bread", c: 230 },
  { label: "Pizza", c: 250 },
];

const scaleMin = 100;
const scaleMax = 280;
const ticks = [100, 140, 180, 220, 260];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toFahrenheit = (c) => (c * 9) / 5 + 32;

const nearestGas = (c) =>
  gasMarks.reduce((best, item) => (Math.abs(item.c - c) < Math.abs(best.c - c) ? item : best), gasMarks[0]);

const zoneFor = (c) => {
  if (c > scaleMax) return zones[zones.length - 1];
  if (c < scaleMin) return null;
  return zones.find((zone) => c >= zone.from && c <= zone.to) || null;
};

export default function ToolHome() {
  const [field, setField] = useState("c");
  const [raw, setRaw] = useState("180");
  const [copied, setCopied] = useState(false);

  const celsius = useMemo(() => {
    const trimmed = raw.trim();
    if (trimmed === "") return null;
    const value = Number(trimmed);
    if (!Number.isFinite(value)) return null;
    if (field === "f") return ((value - 32) * 5) / 9;
    if (field === "fan") return value + 20;
    return value;
  }, [field, raw]);

  const gas = celsius == null ? null : nearestGas(celsius);
  const zone = celsius == null ? null : zoneFor(celsius);
  const gasExact = gas != null && Math.abs(gas.c - celsius) < 0.5;

  const show = (value, active) => {
    if (active) return raw;
    if (celsius == null) return "";
    return String(Math.round(value));
  };

  const markerPct =
    celsius == null ? 0 : clamp(((celsius - scaleMin) / (scaleMax - scaleMin)) * 100, 0, 100);

  const setValue = (nextField, value) => {
    setField(nextField);
    setRaw(value);
  };

  const summary =
    celsius == null
      ? "Enter a temperature in any box to convert it everywhere else."
      : gasExact
        ? `Gas ${gas.mark} = ${gas.label} = ${Math.round(celsius)}°C conventional = ${Math.round(
            toFahrenheit(celsius)
          )}°F = ${Math.round(celsius - 20)}°C fan`
        : `${Math.round(celsius)}°C = ${Math.round(toFahrenheit(celsius))}°F = ${Math.round(
            celsius - 20
          )}°C fan — ${zone ? zone.name : "below the chart range"}, nearest gas mark ${gas.mark}`;

  const report = useMemo(() => {
    if (celsius == null) return "Oven Temperature Converter";
    return [
      "Oven Temperature Converter",
      `Conventional: ${Math.round(celsius)}°C / ${Math.round(toFahrenheit(celsius))}°F`,
      `Fan / convection: ${Math.round(celsius - 20)}°C / ${Math.round(toFahrenheit(celsius - 20))}°F`,
      `Gas mark: ${gas.mark}${gasExact ? "" : " (nearest)"}`,
      `Zone: ${zone ? `${zone.name} — ${zone.note}` : `Below the chart range (chart starts at ${scaleMin}°C)`}`,
      `Generated: ${new Date().toLocaleString()}`,
    ].join("\n");
  }, [celsius, gas, gasExact, zone]);

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const fieldClass =
    "mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Thermometer className="h-4 w-4" />
            Kitchen converter
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Oven Temperature Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Celsius, Fahrenheit, gas mark and fan settings, all live from whichever box you type in. Recipes
            from three countries, one oven dial.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Type in any field</span>
              <button
                type="button"
                onClick={() => setValue("c", "180")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Celsius (conventional oven)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={show(celsius, field === "c")}
                  onChange={(event) => setValue("c", event.target.value)}
                  className={fieldClass}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Fahrenheit</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={show(celsius == null ? 0 : toFahrenheit(celsius), field === "f")}
                  onChange={(event) => setValue("f", event.target.value)}
                  className={fieldClass}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Fan / convection (°C)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={show(celsius == null ? 0 : celsius - 20, field === "fan")}
                  onChange={(event) => setValue("fan", event.target.value)}
                  className={fieldClass}
                />
                <span className="mt-1.5 block text-xs text-[var(--muted-foreground)]">
                  Fan runs 20°C below conventional for the same result.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Gas mark</span>
                <select
                  value={gas ? String(gas.value) : ""}
                  onChange={(event) => {
                    const found = gasMarks.find((item) => String(item.value) === event.target.value);
                    if (found) setValue("c", String(found.c));
                  }}
                  className={fieldClass}
                >
                  {!gas && (
                    <option value="" disabled>
                      Select a gas mark
                    </option>
                  )}
                  {gasMarks.map((item) => (
                    <option key={item.value} value={String(item.value)}>
                      Gas mark {item.mark} — {item.c}°C / {item.f}°F
                    </option>
                  ))}
                </select>
                {gas && !gasExact && (
                  <span className="mt-1.5 block text-xs text-[var(--muted-foreground)]">
                    Nearest mark shown — gas dials do not do in-between numbers.
                  </span>
                )}
              </label>
            </div>

            <div className="mt-5">
              <span className="text-sm font-semibold">Common settings</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setValue("c", String(preset.c))}
                    className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                      celsius != null && Math.round(celsius) === preset.c
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span className="block">{preset.label}</span>
                    <span className="text-xs font-normal opacity-80">{preset.c}°C</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  {zone ? zone.name : "Oven temperature"}
                </p>
                <button
                  type="button"
                  onClick={copyReport}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div aria-live="polite">
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {[
                    ["Conventional", celsius == null ? "—" : `${Math.round(celsius)}°C`, true],
                    ["Fahrenheit", celsius == null ? "—" : `${Math.round(toFahrenheit(celsius))}°F`, false],
                    ["Fan", celsius == null ? "—" : `${Math.round(celsius - 20)}°C`, false],
                    ["Gas mark", gas == null ? "—" : `${gasExact ? "" : "≈ "}${gas.mark}`, false],
                  ].map(([label, value, accent]) => (
                    <div key={label} className="rounded-lg bg-[var(--muted)] p-4">
                      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
                      <p
                        className={`mt-1 text-2xl font-semibold ${
                          accent ? "text-[var(--primary)]" : ""
                        }`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{summary}</p>
              </div>

              <div className="mt-6">
                <div className="relative h-9">
                  {celsius != null && (
                    <div
                      className="absolute -translate-x-1/2 transition-all"
                      style={{ left: `${markerPct}%` }}
                    >
                      <span className="block whitespace-nowrap rounded-full bg-[var(--primary)] px-2.5 py-1 text-xs font-semibold text-[var(--primary-foreground)]">
                        {Math.round(celsius)}°C
                      </span>
                      <span
                        className="mx-auto mt-0.5 block h-0 w-0"
                        style={{
                          borderLeft: "5px solid transparent",
                          borderRight: "5px solid transparent",
                          borderTop: "5px solid var(--primary)",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex h-4 overflow-hidden rounded-full border border-[var(--border)]">
                  {zones.map((item, index) => (
                    <div
                      key={item.name}
                      className="h-full"
                      style={{
                        flexGrow: item.to - item.from + 1,
                        background: "var(--primary)",
                        opacity: 0.2 + (index / (zones.length - 1)) * 0.8,
                      }}
                    />
                  ))}
                </div>

                <div className="relative mt-1.5 h-5">
                  {ticks.map((tick) => (
                    <span
                      key={tick}
                      className="absolute -translate-x-1/2 text-xs text-[var(--muted-foreground)]"
                      style={{ left: `${((tick - scaleMin) / (scaleMax - scaleMin)) * 100}%` }}
                    >
                      {tick}°C
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {zones.map((item) => {
                    const active = zone && zone.name === item.name;
                    return (
                      <div
                        key={item.name}
                        className={`rounded-md border p-3 transition ${
                          active
                            ? "border-[var(--primary)] bg-[var(--muted)]"
                            : "border-[var(--border)] bg-[var(--background)]"
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <p
                            className={`text-sm font-semibold ${active ? "text-[var(--primary)]" : ""}`}
                          >
                            {item.name}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">{item.display}°C</p>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{item.note}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Full gas mark reference</h2>
              </div>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                The classic British gas scale. Mark 1 is 275°F and every mark after it adds 25°F.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="pb-2 pr-3 font-semibold">Gas</th>
                      <th className="pb-2 pr-3 font-semibold">°C</th>
                      <th className="pb-2 pr-3 font-semibold">°F</th>
                      <th className="pb-2 pr-3 font-semibold">Fan °C</th>
                      <th className="pb-2 font-semibold">Typical use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gasMarks.map((item) => {
                      const active = gas && gas.value === item.value;
                      return (
                        <tr
                          key={item.value}
                          className={`border-b border-[var(--border)] last:border-0 ${
                            active ? "bg-[var(--muted)]" : ""
                          }`}
                        >
                          <td
                            className={`py-2.5 pr-3 font-semibold ${
                              active ? "text-[var(--primary)]" : ""
                            }`}
                          >
                            {item.mark}
                          </td>
                          <td className="py-2.5 pr-3 font-semibold">{item.c}°C</td>
                          <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{item.f}°F</td>
                          <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{item.c - 20}°C</td>
                          <td className="py-2.5 text-[var(--muted-foreground)]">{item.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: °F = °C x 9/5 + 32. Fan °C = conventional °C − 20. Gas mark = (°F − 250) / 25 for
                marks 1 and above.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Fan className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Fan or conventional?</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Use fan for",
                    "Roast vegetables, tray bakes, cookies on two shelves, anything you want browned and crisp. Moving air strips the damp layer off the surface, so things colour faster and cook evenly on every rack.",
                  ],
                  [
                    "Use conventional for",
                    "Tall cakes, soufflés, custards, delicate sponges, bread that needs a slow rise in the oven. Still air lets things set gently instead of skinning over and cracking.",
                  ],
                  [
                    "The −20°C rule",
                    "Fan ovens cook faster at the same dial number, so drop the recipe temperature by 20°C when you switch a conventional recipe to fan. Check 5–10 minutes early too — fan bakes usually finish sooner.",
                  ],
                  [
                    "Rack position",
                    "Middle rack for almost everything. Move up one for browning tops and pizza, down one for pastry bases and anything catching on top. In a fan oven the rack matters less, which is the whole point of it.",
                  ],
                  [
                    "Preheat properly",
                    "Give the oven 15–20 minutes after the light goes off. That light means the air hit temperature, not the walls and shelves — and it is the stored heat in those that actually bakes your food.",
                  ],
                  [
                    "Trust a thermometer, not the dial",
                    "Home ovens routinely run 10–20°C off, and drift as they age. A £5 oven thermometer on the middle shelf explains more bad bakes than any recipe ever will.",
                  ],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold">Why the numbers look rounded</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Gas mark 4 is exactly 350°F, which converts to 176.7°C — but every recipe book prints 180°C,
                because oven dials move in 10s and no home oven holds a temperature that precisely anyway. The
                reference table above uses the rounded values cooks actually use; the live boxes give you the
                true arithmetic. Where they disagree by a couple of degrees, follow the table.
              </p>
              <div className="mt-4 flex items-start gap-2 rounded-md bg-[var(--muted)] p-4">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                  American recipes are almost always conventional and in °F. British ones often quote gas
                  marks. Australian and Indian books usually assume °C conventional. If a recipe says
                  &ldquo;fan-forced&rdquo; or &ldquo;convection&rdquo;, its number is already 20°C lower —
                  do not subtract twice.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
