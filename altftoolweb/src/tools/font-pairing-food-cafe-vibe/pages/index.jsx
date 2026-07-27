"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Utensils } from "lucide-react";

import { LIGHTING, PAIRS, buildMenuReport, menuMinimumSize } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const SAMPLE_ITEMS = [
  { name: "Masala Dosa", price: "₹180" },
  { name: "Paneer Tikka", price: "₹320" },
  { name: "Filter Coffee", price: "₹90" },
];

const toNumber = (raw) => {
  const value = Number(String(raw).trim());
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [pairId, setPairId] = useState(PAIRS[0].id);
  const [lightingId, setLightingId] = useState("dim");
  const [distance, setDistance] = useState("400");
  const [columnWidth, setColumnWidth] = useState("80");
  const [bodySize, setBodySize] = useState("11");
  const [itemChars, setItemChars] = useState("14");
  const [priceChars, setPriceChars] = useState("4");
  const [copied, setCopied] = useState("");

  const report = useMemo(
    () =>
      buildMenuReport({
        pairId,
        lightingId,
        readingDistanceMm: toNumber(distance),
        columnWidthMm: toNumber(columnWidth),
        bodySizePt: toNumber(bodySize),
        itemChars: toNumber(itemChars),
        priceChars: toNumber(priceChars),
      }),
    [pairId, lightingId, distance, columnWidth, bodySize, itemChars, priceChars],
  );

  const activePair = useMemo(() => PAIRS.find((item) => item.id === pairId) || PAIRS[0], [pairId]);

  const lightingTable = useMemo(
    () =>
      LIGHTING.map((item) => ({
        ...item,
        result: menuMinimumSize({ readingDistanceMm: toNumber(distance), lightingFactor: item.factor }),
      })),
    [distance],
  );

  const summary = useMemo(() => {
    if (report.error) return "";
    return [
      "Food And Cafe Font Pairing",
      `Pair: ${report.pair.name}`,
      `Minimum body size for ${report.lighting.label.toLowerCase()} at ${distance} mm: ${report.minimum.pt} pt`,
      `Chosen body size: ${bodySize} pt — ${report.passesMinimum ? "clears the minimum" : "below the minimum"}`,
      `Column ${columnWidth} mm holds about ${report.line.chars} characters per line (${report.line.verdict})`,
      report.leaders.error ? `Leader dots: ${report.leaders.error}` : `Leader dots between name and price: ${report.leaders.dots}`,
      "",
      report.css,
    ].join("\n");
  }, [report, distance, bodySize, columnWidth]);

  const copy = async (key, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setPairId(PAIRS[0].id);
    setLightingId("dim");
    setDistance("400");
    setColumnWidth("80");
    setBodySize("11");
    setItemChars("14");
    setPriceChars("4");
    setCopied("");
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Utensils className="h-4 w-4" aria-hidden="true" />
          Menu type
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Food And Cafe Font Pairing</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Warm pairings for menus, boards and packaging, plus the two print calculations a menu actually
          needs: the smallest body size that still reads in a dim dining room, and how many leader dots
          fit between a dish name and its price.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="fc-pair">
          Font pair
        </label>
        <select
          id="fc-pair"
          className={`mt-2 ${INPUT_CLASS}`}
          value={pairId}
          onChange={(event) => setPairId(event.target.value)}
        >
          {PAIRS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{activePair.why}</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-light">
              Lighting
            </label>
            <select
              id="fc-light"
              className={`mt-2 ${INPUT_CLASS}`}
              value={lightingId}
              onChange={(event) => setLightingId(event.target.value)}
            >
              {LIGHTING.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-distance">
              Reading distance (mm)
            </label>
            <input
              id="fc-distance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="100"
              max="5000"
              step="25"
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-column">
              Menu column width (mm)
            </label>
            <input
              id="fc-column"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="500"
              step="5"
              value={columnWidth}
              onChange={(event) => setColumnWidth(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-size">
              Body size (pt)
            </label>
            <input
              id="fc-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="6"
              max="72"
              step="0.5"
              value={bodySize}
              onChange={(event) => setBodySize(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-item">
              Longest dish name (characters)
            </label>
            <input
              id="fc-item"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="80"
              step="1"
              value={itemChars}
              onChange={(event) => setItemChars(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fc-price">
              Price (characters)
            </label>
            <input
              id="fc-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              value={priceChars}
              onChange={(event) => setPriceChars(event.target.value)}
            />
          </div>
        </div>
      </section>

      {report.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {report.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Minimum body size
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {report.error ? DASH : `${report.minimum.pt} pt`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {report.error ? DASH : `${report.minimum.px} px on screen · ${report.lighting.label}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy("summary", summary)}
              disabled={Boolean(report.error)}
              aria-label="Copy the menu typography report and CSS"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied === "summary" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "summary" ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={GHOST_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Heading face", report.error ? DASH : `${report.pair.heading.family} ${report.pair.heading.weight}`],
            ["Body face", report.error ? DASH : `${report.pair.body.family} ${report.pair.body.weight}`],
            ["Required cap height", report.error ? DASH : `${report.minimum.capHeightMm} mm`],
            ["Characters per line", report.error ? DASH : `${NUM.format(report.line.chars)} (${report.line.verdict})`],
            [
              "Leader dots between name and price",
              report.error ? DASH : report.leaders.error ? "does not fit" : String(report.leaders.dots),
            ],
            [
              "Space left for leaders",
              report.error ? DASH : report.leaders.error ? DASH : `${NUM.format(report.leaders.availableMm)} mm`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!report.error && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
              report.passesMinimum
                ? "bg-[var(--muted)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]"
            }`}
            role={report.passesMinimum ? undefined : "alert"}
          >
            {report.passesMinimum
              ? `${bodySize} pt clears the ${report.minimum.pt} pt minimum for this lighting and distance.`
              : `${bodySize} pt is below the ${report.minimum.pt} pt minimum — guests will struggle in this lighting.`}
          </p>
        )}
        {!report.error && report.leaders.error && (
          <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {report.leaders.error}
          </p>
        )}
      </section>

      {!report.error && (
        <>
          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Menu preview</h2>
            <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p
                style={{
                  fontFamily: report.pair.heading.stack,
                  fontWeight: report.pair.heading.weight,
                  fontSize: `${Math.round(toNumber(bodySize) * 1.6 * 1.333)}px`,
                  letterSpacing: "0.02em",
                }}
              >
                Small Plates
              </p>
              <ul className="mt-3 space-y-2">
                {SAMPLE_ITEMS.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-baseline gap-2"
                    style={{
                      fontFamily: report.pair.body.stack,
                      fontWeight: report.pair.body.weight,
                      fontSize: `${Math.round(toNumber(bodySize) * 1.333)}px`,
                      lineHeight: 1.45,
                    }}
                  >
                    <span>{item.name}</span>
                    <span className="min-w-6 flex-1 -translate-y-1 border-b border-dotted border-[var(--border)]" aria-hidden="true" />
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              On screen the leader is a dotted border, which reflows automatically. In print, the dot
              count above tells you how long the leader run will actually be.
            </p>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-base font-semibold">Minimum size by lighting</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Read at {distance} mm.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Lighting</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Allowance</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Minimum pt</th>
                    <th scope="col" className="py-2 text-right font-semibold">Cap height</th>
                  </tr>
                </thead>
                <tbody>
                  {lightingTable.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">{row.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{row.factor}x</td>
                      <td className="py-2 pr-3 text-right">{row.result.error ? DASH : row.result.pt}</td>
                      <td className="py-2 text-right text-[var(--muted-foreground)]">
                        {row.result.error ? DASH : `${row.result.capHeightMm} mm`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">CSS</h2>
              <button type="button" onClick={() => copy("css", report.css)} className={PRIMARY_BTN} aria-label="Copy the CSS block">
                {copied === "css" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied === "css" ? "Copied!" : "Copy CSS"}
              </button>
            </div>
            <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <pre className="text-xs leading-5">{report.css}</pre>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Google Fonts request</h3>
              <button type="button" onClick={() => copy("url", report.fontUrl)} className={GHOST_BTN} aria-label="Copy the Google Fonts URL">
                {copied === "url" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied === "url" ? "Copied!" : "Copy URL"}
              </button>
            </div>
            <div className="mt-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <pre className="text-xs leading-5 break-all text-[var(--muted-foreground)]">{report.fontUrl}</pre>
            </div>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Lighting allowances are design margins rather than photometric measurements, and character widths
        are averages for each family. Print a proof at final size and read it in the actual room before
        signing off a menu.
      </p>
    </main>
  );
}
