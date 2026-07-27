"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Layers, RotateCcw } from "lucide-react";

import {
  DIELECTRIC_SRGB_RANGE,
  IOR_REFERENCE,
  buildMaterialTable,
  iorToF0,
  searchMaterials,
  srgb255ToHsl,
  validateBaseColor,
} from "../lib";

const DEC3 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const d3 = (value) => DEC3.format(Number.isFinite(value) ? value : 0);
const d2 = (value) => DEC2.format(Number.isFinite(value) ? value : 0);
const int = (value) => INT.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = { query: "", r: "196", g: "199", b: "199", metallic: "1", roughness: "0.35" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function swatchStyle(srgb) {
  const { h, s, l } = srgb255ToHsl(srgb);
  return { backgroundColor: `hsl(${d2(h)} ${d2(s)}% ${d2(l)}%)` };
}

export default function ToolHome() {
  const [query, setQuery] = useState(DEFAULTS.query);
  const [red, setRed] = useState(DEFAULTS.r);
  const [green, setGreen] = useState(DEFAULTS.g);
  const [blue, setBlue] = useState(DEFAULTS.b);
  const [metallic, setMetallic] = useState(DEFAULTS.metallic);
  const [roughness, setRoughness] = useState(DEFAULTS.roughness);
  const [copied, setCopied] = useState(false);

  const table = useMemo(() => buildMaterialTable(), []);
  const filtered = useMemo(() => searchMaterials(query, table), [query, table]);

  const check = useMemo(
    () =>
      validateBaseColor({
        r: Number(red),
        g: Number(green),
        b: Number(blue),
        metallic: Number(metallic),
        roughness: Number(roughness),
      }),
    [red, green, blue, metallic, roughness],
  );

  const failed = Boolean(check.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "PBR base colour check",
      `sRGB 8-bit: ${check.srgb.join(", ")}`,
      `Linear: ${check.linear.map((c) => d3(c)).join(", ")}`,
      `Relative luminance: ${d3(check.luminance)}`,
      `Metallic: ${d2(check.metallic)} · Roughness: ${d2(check.roughness)}`,
      `GGX alpha: ${d3(check.alpha)} · Gloss: ${d2(check.gloss)} · Blinn-Phong exponent: ${int(check.specularPower)}`,
      check.nearest ? `Closest reference: ${check.nearest.material.name}` : "",
      check.issues.length > 0 ? `Issues: ${check.issues.join(" ")}` : "No issues found.",
    ]
      .filter(Boolean)
      .join("\n");
  }, [check, failed]);

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
    setQuery(DEFAULTS.query);
    setRed(DEFAULTS.r);
    setGreen(DEFAULTS.g);
    setBlue(DEFAULTS.b);
    setMetallic(DEFAULTS.metallic);
    setRoughness(DEFAULTS.roughness);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Layers className="h-4 w-4" aria-hidden="true" />
          Material reference
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">PBR Material Value Cheatsheet</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Reference reflectance, albedo and roughness values for metals and dielectrics, converted
          between linear and sRGB, plus a checker that tells you when a base colour is physically
          out of range.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Check a base colour</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pbr-r">
              Base colour R (0-255 sRGB)
            </label>
            <input
              id="pbr-r"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="255"
              step="1"
              value={red}
              onChange={(event) => setRed(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbr-g">
              Base colour G (0-255 sRGB)
            </label>
            <input
              id="pbr-g"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="255"
              step="1"
              value={green}
              onChange={(event) => setGreen(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbr-b">
              Base colour B (0-255 sRGB)
            </label>
            <input
              id="pbr-b"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="255"
              step="1"
              value={blue}
              onChange={(event) => setBlue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbr-metallic">
              Metallic (0 or 1)
            </label>
            <input
              id="pbr-metallic"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="1"
              step="0.05"
              value={metallic}
              onChange={(event) => setMetallic(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pbr-roughness">
              Roughness (0-1)
            </label>
            <input
              id="pbr-roughness"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="1"
              step="0.01"
              value={roughness}
              onChange={(event) => setRoughness(event.target.value)}
            />
          </div>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {check.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {!failed && (
              <span
                className="mt-1 h-12 w-12 shrink-0 rounded-md ring-1 ring-[var(--border)]"
                style={swatchStyle(check.srgb)}
                role="img"
                aria-label={`Swatch for sRGB ${check.srgb.join(", ")}`}
              />
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Relative luminance (linear)
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                {failed ? DASH : d3(check.luminance)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {failed
                  ? "Fix the values above to run the check."
                  : check.ok
                    ? "Inside the usual physically plausible range."
                    : `${check.issues.length} thing${check.issues.length === 1 ? "" : "s"} to look at`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the base colour check"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy values"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["sRGB 8-bit", failed ? DASH : check.srgb.join(", ")],
            ["Linear values", failed ? DASH : check.linear.map((c) => d3(c)).join(", ")],
            ["GGX alpha (roughness squared)", failed ? DASH : d3(check.alpha)],
            ["Gloss (1 − roughness)", failed ? DASH : d2(check.gloss)],
            ["Blinn-Phong exponent", failed ? DASH : int(check.specularPower)],
            [
              "Closest reference material",
              failed || !check.nearest ? DASH : check.nearest.material.name,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && check.issues.length > 0 && (
          <ul className="mt-4 space-y-2">
            {check.issues.map((issue) => (
              <li
                key={issue}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {issue}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Reference values</h2>
          <p className="text-xs text-[var(--muted-foreground)]">{filtered.length} materials</p>
        </div>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="pbr-search">
            Search materials
          </label>
          <input
            id="pbr-search"
            className={`mt-2 ${INPUT_CLASS}`}
            type="search"
            placeholder="gold, concrete, metal…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Material</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Linear</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">sRGB 8-bit</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">F0</th>
                <th scope="col" className="py-2 text-right font-semibold">Roughness</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2 pr-3">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-5 w-5 shrink-0 rounded ring-1 ring-[var(--border)]"
                        style={swatchStyle(item.srgb)}
                        aria-hidden="true"
                      />
                      <span className="font-semibold">{item.name}</span>
                    </span>
                    <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{item.note}</span>
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap text-[var(--muted-foreground)]">
                    {item.type === "metal" ? "Metal" : "Dielectric"}
                  </td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">
                    {item.linearTriplet.map((c) => d3(c)).join(" / ")}
                  </td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">{item.srgb.join(", ")}</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">{d3(item.f0)}</td>
                  <td className="py-2 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                    {d2(item.roughness[0])} – {d2(item.roughness[1])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">No material matches that search.</p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">F0 from index of refraction</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          F0 = ((n − 1) / (n + 1))², the Fresnel reflectance at normal incidence with air outside.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Medium</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">IOR</th>
                <th scope="col" className="py-2 text-right font-semibold">F0</th>
              </tr>
            </thead>
            <tbody>
              {IOR_REFERENCE.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{item.name}</td>
                  <td className="py-2 pr-3 text-right">{d2(item.ior)}</td>
                  <td className="py-2 text-right font-semibold">{d3(iorToF0(item.ior))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Dielectric base colours are expected between {DIELECTRIC_SRGB_RANGE.min} and{" "}
        {DIELECTRIC_SRGB_RANGE.max} in 8-bit sRGB. Reference figures are measured averages — real
        surfaces vary with finish, wear and moisture, so treat them as starting points and check
        against a scanned reference where accuracy matters.
      </p>
    </main>
  );
}
