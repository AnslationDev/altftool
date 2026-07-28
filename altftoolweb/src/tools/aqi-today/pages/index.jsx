"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Info, MapPin, RefreshCw, Search, TriangleAlert, Wind } from "lucide-react";

import { CITIES, ZONES } from "../data";
import {
  AQI_CATEGORIES,
  DATA_SOURCE_LABEL,
  INDEX_METHOD_LABEL,
  boardToText,
  buildAirQualityUrl,
  buildBoard,
  chunk,
  filterRows,
  utcHourToIstLabel,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

/**
 * CPCB band → semantic token pair. Six bands, four severity tokens: Poor and
 * Very Poor share the danger tint and are told apart by the ring and by the
 * label, which is always printed, so colour is never the only signal.
 */
const BAND_CLASS = {
  Good: "bg-[var(--success-soft)] text-[var(--success)]",
  Satisfactory: "bg-[var(--info-soft)] text-[var(--info)]",
  Moderate: "bg-[var(--warning-soft)] text-[var(--warning)]",
  Poor: "bg-[var(--danger-soft)] text-[var(--danger)]",
  "Very Poor": "bg-[var(--danger-soft)] text-[var(--danger)] ring-1 ring-[var(--danger)]",
  Severe: "bg-[var(--danger)] text-[var(--danger-foreground)]",
};

const intFmt = new Intl.NumberFormat("en-IN");
const conc2 = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function bandClass(label) {
  return BAND_CLASS[label] || "bg-[var(--muted)] text-[var(--muted-foreground)]";
}

function BandPill({ label }) {
  if (!label) return <span className="text-[var(--muted-foreground)]">{DASH}</span>;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${bandClass(label)}`}>
      {label}
    </span>
  );
}

/** Fetch every city in batches. One failed batch marks only its own cities unavailable. */
async function fetchBatches(cities, signal) {
  const groups = chunk(cities);
  const results = await Promise.all(
    groups.map(async (group) => {
      const built = buildAirQualityUrl(group);
      if (built.error) return { cities: group, error: built.error };
      try {
        const response = await fetch(built.url, { signal });
        if (!response.ok) return { cities: group, error: `Air-quality API returned HTTP ${response.status}.` };
        return { cities: group, payload: await response.json() };
      } catch (error) {
        if (error?.name === "AbortError") throw error;
        return { cities: group, error: "Could not reach the air-quality API from this browser." };
      }
    }),
  );
  return results;
}

export default function ToolHome() {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [generatedAt, setGeneratedAt] = useState("");
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("all");
  const [selectedId, setSelectedId] = useState("");
  const [copied, setCopied] = useState(false);

  const runIdRef = useRef(0);

  const load = useCallback(async (signal) => {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setLoading(true);
    setLoadError("");
    const nowIso = new Date().toISOString();
    try {
      const batches = await fetchBatches(CITIES, signal);
      if (runIdRef.current !== runId) return;
      const next = buildBoard(batches, nowIso);
      if (next.error) {
        setLoadError(next.error);
        setBoard(null);
      } else {
        setBoard(next);
        setGeneratedAt(nowIso);
        if (next.summary.reporting === 0) {
          setLoadError("No city returned usable data. Nothing below is a live figure.");
        }
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      if (runIdRef.current !== runId) return;
      setLoadError("The air-quality request failed. No figures are shown rather than stale ones.");
      setBoard(null);
    } finally {
      if (runIdRef.current === runId) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const rows = board?.rows ?? [];
  const summary = board?.summary ?? null;

  const visibleRows = useMemo(() => filterRows(rows, { query, zone }), [rows, query, zone]);
  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) || summary?.worst || null,
    [rows, selectedId, summary],
  );

  const copyBoard = useCallback(async () => {
    if (!board) return;
    try {
      await navigator.clipboard.writeText(boardToText(board, generatedAt));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [board, generatedAt]);

  const hasFigures = Boolean(summary && summary.reporting > 0 && !loadError);
  const worst = hasFigures ? summary.worst : null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
      <header className="space-y-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
          <Wind className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          AQI Today — India board
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Current air quality for {intFmt.format(CITIES.length)} Indian cities, worst first, with the dominant
          pollutant, all six sub-indices and the CPCB band for each.
        </p>
        <div className="flex items-start gap-2 rounded-md bg-[var(--info-soft)] px-3 py-2 text-sm text-[var(--info)]">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            These are <strong>modelled</strong> concentrations from the {DATA_SOURCE_LABEL}, put through the CPCB
            National AQI formula on this page. They are <strong>not</strong> official CPCB station readings. For the
            published bulletin see{" "}
            <a
              className="underline underline-offset-2 hover:text-[var(--primary)]"
              href="https://cpcb.nic.in/National-Air-Quality-Index/"
              rel="noopener noreferrer"
              target="_blank"
            >
              CPCB National Air Quality Index
            </a>
            .
          </p>
        </div>
      </header>

      {loadError ? (
        <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
          {loadError}
        </p>
      ) : null}

      {/* ---- Headline ---- */}
      <section className={CARD} aria-label="National summary">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Worst of the {intFmt.format(CITIES.length)} cities
            </p>
            <p className="mt-1 text-5xl font-bold leading-none text-[var(--foreground)]">
              {hasFigures ? intFmt.format(worst.aqi) : DASH}
            </p>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--foreground)]">
              <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
              <span className="font-semibold">{hasFigures ? worst.name : DASH}</span>
              <span className="text-[var(--muted-foreground)]">{hasFigures ? worst.state : ""}</span>
              {hasFigures ? <BandPill label={worst.category.label} /> : null}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Dominant pollutant: {hasFigures ? worst.dominantPollutant : DASH}
              {hasFigures && worst.observedAt ? ` · hour ending ${utcHourToIstLabel(worst.observedAt)}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className={GHOST_BTN} disabled={loading} onClick={() => load()} type="button">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />
              {loading ? "Loading" : "Refresh"}
            </button>
            <button
              aria-label="Copy the full city board as text"
              className={PRIMARY_BTN}
              disabled={!board}
              onClick={copyBoard}
              type="button"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy board"}
            </button>
          </div>
        </div>

        <dl className="mt-5 grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-[var(--muted-foreground)]">Cities reporting</dt>
            <dd className="text-lg font-semibold text-[var(--foreground)]">
              {summary ? `${intFmt.format(summary.reporting)} of ${intFmt.format(summary.total)}` : DASH}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--muted-foreground)]">Median AQI of those reporting</dt>
            <dd className="text-lg font-semibold text-[var(--foreground)]">
              {hasFigures && summary.medianAqi !== null ? intFmt.format(Math.round(summary.medianAqi)) : DASH}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--muted-foreground)]">At Poor (201+) or worse</dt>
            <dd className="text-lg font-semibold text-[var(--foreground)]">
              {hasFigures ? intFmt.format(summary.atOrAbovePoor) : DASH}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--muted-foreground)]">Cleanest reporting city</dt>
            <dd className="text-lg font-semibold text-[var(--foreground)]">
              {hasFigures ? `${summary.cleanest.name} ${intFmt.format(summary.cleanest.aqi)}` : DASH}
            </dd>
          </div>
        </dl>

        {hasFigures ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">CPCB advisory for {worst.category.label}:</span>{" "}
            {worst.category.advisory}
          </p>
        ) : null}
      </section>

      {/* ---- Band spread ---- */}
      {hasFigures ? (
        <section aria-label="Cities per CPCB band" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {summary.bands.map((band) => (
            <div key={band.label} className={`rounded-lg px-3 py-2 ${bandClass(band.label)}`}>
              <p className="text-xs font-semibold">{band.label}</p>
              <p className="text-xs opacity-80">
                {band.min}–{band.max}
              </p>
              <p className="text-xl font-bold">{intFmt.format(band.count)}</p>
            </div>
          ))}
        </section>
      ) : null}

      {/* ---- Controls ---- */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="aqi-city-search">
            Find a city
          </label>
          <div className="relative mt-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <input
              className={`${INPUT_CLASS} pl-9`}
              id="aqi-city-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kanpur, Kerala…"
              type="search"
              value={query}
            />
          </div>
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="aqi-zone">
            Zone
          </label>
          <select
            className={`${INPUT_CLASS} mt-1`}
            id="aqi-zone"
            onChange={(event) => setZone(event.target.value)}
            value={zone}
          >
            <option value="all">All of India</option>
            {ZONES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ---- Board ---- */}
      <section aria-label="City board" className="overflow-hidden rounded-xl ring-1 ring-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">Indian cities ranked worst air quality first</caption>
            <thead className="bg-[var(--muted)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <tr>
                <th className="px-3 py-2 font-semibold" scope="col">#</th>
                <th className="px-3 py-2 font-semibold" scope="col">City</th>
                <th className="px-3 py-2 font-semibold" scope="col">State / UT</th>
                <th className="px-3 py-2 text-right font-semibold" scope="col">AQI</th>
                <th className="px-3 py-2 font-semibold" scope="col">CPCB band</th>
                <th className="px-3 py-2 font-semibold" scope="col">Dominant</th>
                <th className="px-3 py-2 font-semibold" scope="col">Detail</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center text-[var(--muted-foreground)]" colSpan={7}>
                    {loading ? "Fetching current concentrations…" : "No city matches that filter."}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => {
                  const ok = row.status === "ok";
                  const isSelected = selected?.id === row.id;
                  return (
                    <tr
                      className={`border-t border-[var(--border)] ${isSelected ? "bg-[var(--primary-soft)]" : ""}`}
                      key={row.id}
                    >
                      <td className="px-3 py-2 text-[var(--muted-foreground)]">{ok ? intFmt.format(row.rank) : DASH}</td>
                      <td className="px-3 py-2 font-semibold text-[var(--foreground)]">{row.name}</td>
                      <td className="px-3 py-2 text-[var(--muted-foreground)]">{row.state}</td>
                      <td className="px-3 py-2 text-right text-base font-bold text-[var(--foreground)]">
                        {ok ? intFmt.format(row.aqi) : DASH}
                      </td>
                      <td className="px-3 py-2">
                        {ok ? (
                          <BandPill label={row.category.label} />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--danger)]">
                            <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[var(--foreground)]">{ok ? row.dominantPollutant : DASH}</td>
                      <td className="px-3 py-2">
                        {ok ? (
                          <button
                            className="min-h-11 rounded-md px-2 text-sm font-semibold text-[var(--primary)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                            onClick={() => setSelectedId(row.id)}
                            type="button"
                          >
                            Sub-indices
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--muted-foreground)]">{row.reason}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---- City detail ---- */}
      {selected && selected.status === "ok" ? (
        <section className={CARD} aria-label={`Pollutant detail for ${selected.name}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {selected.name}, {selected.state}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              {selected.lat.toFixed(4)}°N, {selected.lon.toFixed(4)}°E · hour ending{" "}
              {utcHourToIstLabel(selected.observedAt)}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-4xl font-bold text-[var(--foreground)]">{intFmt.format(selected.aqi)}</p>
            <BandPill label={selected.category.label} />
            <p className="text-sm text-[var(--muted-foreground)]">
              Dominant pollutant {selected.dominantPollutant} — the AQI is that pollutant&apos;s sub-index, the highest
              of the six.
            </p>
          </div>

          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">CPCB advisory for {selected.category.label}:</span>{" "}
            {selected.category.advisory}
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <tr>
                  <th className="py-2 pr-3 font-semibold" scope="col">Pollutant</th>
                  <th className="py-2 pr-3 text-right font-semibold" scope="col">Concentration</th>
                  <th className="py-2 pr-3 font-semibold" scope="col">Averaging window</th>
                  <th className="py-2 pr-3 text-right font-semibold" scope="col">Sub-index</th>
                  <th className="py-2 font-semibold" scope="col">Band</th>
                </tr>
              </thead>
              <tbody>
                {selected.windows.map((window) => {
                  const sub = selected.subIndices.find((entry) => entry.pollutantId === window.id);
                  return (
                    <tr className="border-t border-[var(--border)]" key={window.id}>
                      <td className="py-2 pr-3 font-semibold text-[var(--foreground)]">{window.label}</td>
                      <td className="py-2 pr-3 text-right text-[var(--foreground)]">
                        {window.available ? `${conc2.format(window.concentration)} ${window.unit}` : DASH}
                      </td>
                      <td className="py-2 pr-3 text-[var(--muted-foreground)]">
                        {window.available
                          ? `${window.hours}-hour mean (${intFmt.format(window.hoursUsed)} hrs used)`
                          : window.note}
                      </td>
                      <td className="py-2 pr-3 text-right font-bold text-[var(--foreground)]">
                        {sub ? intFmt.format(sub.rounded) : DASH}
                      </td>
                      <td className="py-2">{sub ? <BandPill label={sub.category.label} /> : <span className="text-[var(--muted-foreground)]">{DASH}</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-[var(--muted-foreground)]">{selected.validityNote}</p>
          {selected.extrapolated ? (
            <p className="mt-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--warning)]">
              The driving concentration sits above the last published breakpoint. CPCB leaves the Severe band
              open-ended, so this sub-index is extrapolated with the slope of the band below and capped at 500.
            </p>
          ) : null}
        </section>
      ) : null}

      {/* ---- Method ---- */}
      <section className={CARD} aria-label="Method and provenance">
        <h2 className="text-lg font-bold text-[var(--foreground)]">How each number was produced</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
          <li>
            <span className="font-semibold text-[var(--foreground)]">Index method.</span> {INDEX_METHOD_LABEL}. Every
            pollutant is interpolated inside its published breakpoint band with Ip = ((IHi − ILo) ÷ (BPHi − BPLo)) ×
            (Cp − BPLo) + ILo, and the AQI is the worst of the six sub-indices.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Averaging.</span> 24-hour rolling mean for PM2.5,
            PM10, NO₂ and SO₂; 8-hour rolling mean for CO and O₃, as CPCB specifies. A 24-hour mean needs at least 16
            valid hours, which is CPCB&apos;s minimum-data rule; the 6-of-8 threshold used for the 8-hour window is this
            page&apos;s own proportional equivalent, not a CPCB rule.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Units.</span> The source returns every gas in
            µg/m³. CO is divided by 1000 to mg/m³ before the CPCB CO table is applied.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Concentrations.</span> {DATA_SOURCE_LABEL}, fetched
            live in your browser by city-centre coordinate. These are gridded model values, not CPCB CAAQMS telemetry,
            and they will differ from the official bulletin. A city whose request fails is shown as unavailable — no
            stale or substituted figure is ever displayed.
          </li>
          <li>
            <span className="font-semibold text-[var(--foreground)]">Bands.</span>{" "}
            {AQI_CATEGORIES.map((band) => `${band.label} ${band.min}–${band.max}`).join(", ")}. Advisory text is quoted
            from the CPCB band descriptions; it is general public-health guidance, not personal medical advice.
          </li>
        </ul>
        {generatedAt ? (
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">Board generated {utcHourToIstLabel(generatedAt)}.</p>
        ) : null}
      </section>
    </div>
  );
}
