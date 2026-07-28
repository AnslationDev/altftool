/**
 * AQI Today — national air-quality board.
 *
 * This module does NOT re-implement the index. The CPCB National AQI (2014)
 * breakpoint tables, the sub-index formula
 *     Ip = ((IHi − ILo) / (BPHi − BPLo)) × (Cp − BPLo) + ILo
 * the worst-sub-index rule and the six category bands all live in
 * `src/tools/aqi-live-dashboard/lib.js` and are imported below.
 *
 * What this module adds:
 *  1. Building the Open-Meteo Air Quality request for a batch of cities.
 *  2. Turning an hourly forecast/reanalysis series into the CPCB averaging
 *     windows — 24 h for PM2.5, PM10, NO2 and SO2; 8 h for CO and O3 —
 *     including the µg/m³ → mg/m³ conversion CO needs before it can be fed to
 *     the CPCB table.
 *  3. Ranking the cities worst-first and summarising the board.
 *
 * PROVENANCE, stated plainly: Open-Meteo serves CAMS-family modelled /
 * reanalysis concentrations on a grid, not CPCB station telemetry. The index
 * arithmetic is CPCB's; the concentrations are not official CPCB readings.
 */

/** AQI category bands (CPCB National AQI). */
export const AQI_CATEGORIES = [
  { min: 0, max: 50, label: "Good", advisory: "Air quality is satisfactory and poses little or no risk." },
  { min: 51, max: 100, label: "Satisfactory", advisory: "May cause minor breathing discomfort to sensitive people." },
  {
    min: 101,
    max: 200,
    label: "Moderate",
    advisory:
      "May cause breathing discomfort to people with lung disease such as asthma, and discomfort to people with heart disease, children and older adults.",
  },
  {
    min: 201,
    max: 300,
    label: "Poor",
    advisory: "May cause breathing discomfort to most people on prolonged exposure, and discomfort to people with heart disease.",
  },
  {
    min: 301,
    max: 400,
    label: "Very Poor",
    advisory:
      "May cause respiratory illness on prolonged exposure. Effects are more pronounced in people with lung and heart disease.",
  },
  {
    min: 401,
    max: 500,
    label: "Severe",
    advisory:
      "May cause respiratory effects even in healthy people, and serious health impacts on people with lung or heart disease. Avoid outdoor activity.",
  },
];

/** Index band edges shared by every pollutant. */
const INDEX_BANDS = [
  [0, 50],
  [51, 100],
  [101, 200],
  [201, 300],
  [301, 400],
  [401, 500],
];

/**
 * Concentration breakpoints per pollutant, in the units listed.
 * Each entry is the upper edge of a band; the lower edge is the previous one.
 * The final band is open-ended, exactly as CPCB publishes it.
 */
export const POLLUTANTS = [
  {
    id: "pm25",
    label: "PM2.5",
    unit: "µg/m³",
    averaging: "24-hour",
    edges: [0, 30, 60, 90, 120, 250],
    isPrimary: true,
  },
  {
    id: "pm10",
    label: "PM10",
    unit: "µg/m³",
    averaging: "24-hour",
    edges: [0, 50, 100, 250, 350, 430],
    isPrimary: true,
  },
  { id: "no2", label: "NO₂", unit: "µg/m³", averaging: "24-hour", edges: [0, 40, 80, 180, 280, 400] },
  { id: "so2", label: "SO₂", unit: "µg/m³", averaging: "24-hour", edges: [0, 40, 80, 380, 800, 1600] },
  { id: "co", label: "CO", unit: "mg/m³", averaging: "8-hour", edges: [0, 1, 2, 10, 17, 34] },
  { id: "o3", label: "O₃", unit: "µg/m³", averaging: "8-hour", edges: [0, 50, 100, 168, 208, 748] },
  { id: "nh3", label: "NH₃", unit: "µg/m³", averaging: "24-hour", edges: [0, 200, 400, 800, 1200, 1800] },
  { id: "pb", label: "Pb", unit: "µg/m³", averaging: "24-hour", edges: [0, 0.5, 1, 2, 3, 3.5] },
];

export const POLLUTANTS_BY_ID = new Map(POLLUTANTS.map((pollutant) => [pollutant.id, pollutant]));

/** CPCB will not publish an AQI from fewer pollutants than this. */
export const MIN_POLLUTANTS_FOR_AQI = 3;

/** The index can never exceed this, however bad the air is. */
export const MAX_AQI = 500;

/** Category for a numeric index value. */
export function categoryFor(index) {
  if (!Number.isFinite(index)) return null;
  const value = Math.round(index);
  return AQI_CATEGORIES.find((band) => value >= band.min && value <= band.max) || AQI_CATEGORIES[AQI_CATEGORIES.length - 1];
}

/**
 * Sub-index for one pollutant concentration.
 * Returns { error } for a missing, negative or non-numeric reading.
 */
export function subIndex(pollutantId, concentration) {
  const pollutant = POLLUTANTS_BY_ID.get(pollutantId);
  if (!pollutant) return { error: `Unknown pollutant "${pollutantId}".` };
  const c = Number(concentration);
  if (!Number.isFinite(c)) return { error: `Enter a number for ${pollutant.label}.` };
  if (c < 0) return { error: `${pollutant.label} cannot be negative.` };

  const edges = pollutant.edges;
  for (let band = 0; band < INDEX_BANDS.length; band += 1) {
    const cLow = edges[band];
    const cHigh = edges[band + 1];
    const [iLow, iHigh] = INDEX_BANDS[band];
    if (cHigh !== undefined && c <= cHigh) {
      const span = cHigh - cLow;
      const index = span > 0 ? ((iHigh - iLow) / span) * (c - cLow) + iLow : iLow;
      return {
        pollutantId,
        label: pollutant.label,
        unit: pollutant.unit,
        concentration: c,
        index,
        rounded: Math.round(index),
        band,
        extrapolated: false,
        category: categoryFor(index),
      };
    }
  }

  // Open-ended Severe band: extrapolate with the slope of the band below.
  const lastLow = edges[edges.length - 2];
  const lastHigh = edges[edges.length - 1];
  const slope = lastHigh > lastLow ? (400 - 301) / (lastHigh - lastLow) : 0;
  const raw = 401 + (c - lastHigh) * slope;
  const index = Math.min(MAX_AQI, raw);
  return {
    pollutantId,
    label: pollutant.label,
    unit: pollutant.unit,
    concentration: c,
    index,
    rounded: Math.round(index),
    band: INDEX_BANDS.length - 1,
    extrapolated: true,
    cappedAt500: raw > MAX_AQI,
    category: categoryFor(index),
  };
}

/**
 * Full dashboard: sub-index every reading given, pick the worst, and check the
 * CPCB validity rule. `readings` is { pm25: 55, pm10: 90, ... } — blank or
 * missing values are simply skipped.
 */
export function computeAqi(readings = {}) {
  const entries = [];
  const problems = [];
  for (const pollutant of POLLUTANTS) {
    const raw = readings[pollutant.id];
    if (raw === undefined || raw === null || raw === "") continue;
    const result = subIndex(pollutant.id, raw);
    if (result.error) {
      problems.push(result.error);
      continue;
    }
    entries.push(result);
  }

  if (problems.length) return { error: problems[0] };
  if (entries.length === 0) {
    return { error: "Enter at least one pollutant concentration to compute an index." };
  }

  const sorted = [...entries].sort((a, b) => b.index - a.index);
  const worst = sorted[0];
  const hasPrimary = entries.some((entry) => POLLUTANTS_BY_ID.get(entry.pollutantId)?.isPrimary);
  const valid = entries.length >= MIN_POLLUTANTS_FOR_AQI && hasPrimary;

  const validityNote = valid
    ? "Meets the CPCB rule: three or more pollutants including PM2.5 or PM10."
    : !hasPrimary
      ? "CPCB requires PM2.5 or PM10 to be one of the measured pollutants — this figure is indicative only."
      : `CPCB requires at least ${MIN_POLLUTANTS_FOR_AQI} pollutants; you have entered ${entries.length}. This figure is indicative only.`;

  return {
    aqi: worst.rounded,
    exactAqi: worst.index,
    category: worst.category,
    prominentPollutant: worst.label,
    prominentPollutantId: worst.pollutantId,
    extrapolated: worst.extrapolated === true,
    subIndices: sorted,
    pollutantCount: entries.length,
    valid,
    validityNote,
  };
}

/** Keyless, CORS-enabled endpoint. */
export const OPEN_METEO_ENDPOINT = "https://air-quality-api.open-meteo.com/v1/air-quality";

/** Human-readable provenance string, shown on the page and in the copied text. */
export const DATA_SOURCE_LABEL =
  "Open-Meteo Air Quality API (CAMS-family modelled surface concentrations)";

/** The index method this page applies to those concentrations. */
export const INDEX_METHOD_LABEL =
  "CPCB National Air Quality Index, notified 17 October 2014 (breakpoint tables read 2026-07-28)";

/** Micrograms in one milligram. Used to convert the CO series to CPCB units. */
export const CO_UG_PER_MG = 1000;

/**
 * Open-Meteo hourly variable name → CPCB pollutant id, with the CPCB averaging
 * window and the unit conversion needed.
 *
 * Averaging periods: CPCB National AQI 2014 — 24-hourly for PM2.5, PM10, NO2,
 * SO2, NH3 and Pb; 8-hourly for CO and O3.
 *
 * `factor`: Open-Meteo returns every gas in µg/m³ (confirmed from the API's own
 * `hourly_units`). The CPCB CO breakpoint table is in mg/m³, so CO is divided
 * by 1000. Every other pollutant is already in the CPCB unit.
 */
export const POLLUTANT_SOURCES = [
  { apiKey: "pm2_5", id: "pm25", hours: 24, factor: 1 },
  { apiKey: "pm10", id: "pm10", hours: 24, factor: 1 },
  { apiKey: "nitrogen_dioxide", id: "no2", hours: 24, factor: 1 },
  { apiKey: "sulphur_dioxide", id: "so2", hours: 24, factor: 1 },
  { apiKey: "carbon_monoxide", id: "co", hours: 8, factor: 1 / CO_UG_PER_MG },
  { apiKey: "ozone", id: "o3", hours: 8, factor: 1 },
];

/** Hourly variables requested from Open-Meteo, in request order. */
export const OPEN_METEO_HOURLY_FIELDS = POLLUTANT_SOURCES.map((source) => source.apiKey);

/**
 * CPCB's data-completeness rule for a 24-hour average: a minimum of 16 hours of
 * valid data within the window. (CPCB National AQI 2014, minimum data
 * requirement.)
 */
export const MIN_HOURS_24H = 16;

/**
 * CPCB publishes no equivalent completeness figure for the 8-hour window, so
 * this page applies the same 2/3 proportion: 6 of 8 hours. That threshold is
 * this page's own, not a CPCB rule.
 */
export const MIN_HOURS_8H = 6;

/** Cities per HTTP request. Keeps the URL short and lets one batch fail alone. */
export const BATCH_SIZE = 12;

/** How many hours of history the request must cover to fill a 24-hour window. */
const PAST_DAYS = 2;
const FORECAST_DAYS = 1;

/** Minimum number of pollutants CPCB needs before an AQI may be published. */
export const REQUIRED_POLLUTANT_COUNT = 3;

/** Split an array into fixed-size chunks. */
export function chunk(items, size = BATCH_SIZE) {
  const list = Array.isArray(items) ? items : [];
  const step = Number.isInteger(size) && size > 0 ? size : 1;
  const out = [];
  for (let i = 0; i < list.length; i += step) out.push(list.slice(i, i + step));
  return out;
}

/**
 * Build the Open-Meteo request URL for a batch of cities.
 * Returns { error } for an empty batch or a coordinate outside Earth.
 */
export function buildAirQualityUrl(cities) {
  const batch = Array.isArray(cities) ? cities : [];
  if (batch.length === 0) return { error: "No cities were given to fetch." };
  for (const city of batch) {
    const lat = Number(city?.lat);
    const lon = Number(city?.lon);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      return { error: `Latitude for ${city?.name || "a city"} is outside -90 to 90.` };
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      return { error: `Longitude for ${city?.name || "a city"} is outside -180 to 180.` };
    }
  }
  const params = new URLSearchParams({
    latitude: batch.map((city) => city.lat).join(","),
    longitude: batch.map((city) => city.lon).join(","),
    hourly: OPEN_METEO_HOURLY_FIELDS.join(","),
    past_days: String(PAST_DAYS),
    forecast_days: String(FORECAST_DAYS),
    timezone: "UTC",
  });
  return { url: `${OPEN_METEO_ENDPOINT}?${params.toString()}` };
}

/**
 * Normalise the response body. Open-Meteo returns a bare object for one
 * coordinate and an array for several. Always returns an array.
 */
export function normaliseBatchPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") return [payload];
  return [];
}

/** "2026-07-28T14:00" → "2026-07-28T14". Pure string slice, no timezone maths. */
export function toHourKey(isoString) {
  const text = String(isoString || "");
  return text.length >= 13 ? text.slice(0, 13) : "";
}

/**
 * Index of the latest hourly slot at or before `nowIso`.
 * `times` must be the UTC hour strings Open-Meteo returns; `nowIso` a UTC ISO
 * string. Returns { error } when the series is empty or starts after `now`.
 */
export function latestHourIndex(times, nowIso) {
  const series = Array.isArray(times) ? times : [];
  if (series.length === 0) return { error: "The forecast series is empty." };
  const nowKey = toHourKey(nowIso);
  if (!nowKey) return { error: "A valid ISO timestamp is required." };
  let found = -1;
  for (let i = 0; i < series.length; i += 1) {
    if (toHourKey(series[i]) <= nowKey) found = i;
    else break;
  }
  if (found < 0) return { error: "The series begins after the requested time." };
  return { index: found, time: series[found] };
}

/**
 * Mean of the `hours` slots ending at `endIndex` inclusive.
 * Non-numeric slots are skipped and counted as missing.
 * Returns { error } when fewer than `minHours` valid slots are present.
 */
export function averageWindow(series, endIndex, hours, minHours) {
  const values = Array.isArray(series) ? series : [];
  if (!Number.isInteger(endIndex) || endIndex < 0) return { error: "Invalid window end." };
  if (!Number.isInteger(hours) || hours <= 0) return { error: "Window length must be a positive whole number of hours." };
  const start = Math.max(0, endIndex - hours + 1);
  let sum = 0;
  let count = 0;
  for (let i = start; i <= endIndex && i < values.length; i += 1) {
    const raw = values[i];
    // Open-Meteo writes `null` for a missing hour. Number(null) is 0, which is
    // finite — so nulls must be rejected before the numeric check or a gap in
    // the series would be averaged in as a clean-air reading.
    if (raw === null || raw === undefined || raw === "") continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) continue;
    sum += value;
    count += 1;
  }
  if (count < minHours) {
    return { error: `Only ${count} of ${hours} hours available; ${minHours} required.`, count, hours };
  }
  return { mean: sum / count, count, hours };
}

/**
 * Turn one city's hourly block into CPCB-ready concentrations.
 * Returns { readings, windows } or { error }.
 */
export function readingsFromHourly(hourly, nowIso) {
  if (!hourly || typeof hourly !== "object") return { error: "No hourly data was returned for this city." };
  const anchor = latestHourIndex(hourly.time, nowIso);
  if (anchor.error) return { error: anchor.error };

  const readings = {};
  const windows = [];
  for (const source of POLLUTANT_SOURCES) {
    const minHours = source.hours === 24 ? MIN_HOURS_24H : MIN_HOURS_8H;
    const window = averageWindow(hourly[source.apiKey], anchor.index, source.hours, minHours);
    const pollutant = POLLUTANTS_BY_ID.get(source.id);
    if (window.error) {
      windows.push({ id: source.id, label: pollutant?.label || source.id, hours: source.hours, available: false, note: window.error });
      continue;
    }
    const concentration = window.mean * source.factor;
    readings[source.id] = concentration;
    windows.push({
      id: source.id,
      label: pollutant?.label || source.id,
      unit: pollutant?.unit || "µg/m³",
      hours: source.hours,
      hoursUsed: window.count,
      concentration,
      available: true,
    });
  }

  if (Object.keys(readings).length === 0) {
    return { error: "No pollutant had enough valid hours to average." };
  }
  return { readings, windows, observedAt: anchor.time, hourIndex: anchor.index };
}

/**
 * Full result for one city. `hourly` is the `hourly` block from Open-Meteo, or
 * null/undefined when that city's request failed.
 * Always returns a row; `status` is "ok" or "unavailable".
 */
export function cityRow(city, hourly, nowIso, failureReason) {
  const base = { id: city?.id, name: city?.name, state: city?.state, zone: city?.zone, lat: city?.lat, lon: city?.lon };
  if (failureReason) return { ...base, status: "unavailable", reason: failureReason };

  const parsed = readingsFromHourly(hourly, nowIso);
  if (parsed.error) return { ...base, status: "unavailable", reason: parsed.error };

  const result = computeAqi(parsed.readings);
  if (result.error) return { ...base, status: "unavailable", reason: result.error };

  return {
    ...base,
    status: "ok",
    aqi: result.aqi,
    category: result.category,
    dominantPollutant: result.prominentPollutant,
    dominantPollutantId: result.prominentPollutantId,
    subIndices: result.subIndices,
    windows: parsed.windows,
    pollutantCount: result.pollutantCount,
    valid: result.valid,
    validityNote: result.validityNote,
    extrapolated: result.extrapolated,
    observedAt: parsed.observedAt,
  };
}

/** Worst first; ties broken alphabetically; unavailable cities last. */
export function rankRows(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const ok = list.filter((row) => row.status === "ok");
  const gone = list.filter((row) => row.status !== "ok");
  ok.sort((a, b) => (b.aqi - a.aqi) || String(a.name).localeCompare(String(b.name)));
  gone.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  return [...ok.map((row, i) => ({ ...row, rank: i + 1 })), ...gone];
}

/** Median of a numeric list. Returns null for an empty list. */
export function median(values) {
  const list = (Array.isArray(values) ? values : []).filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (list.length === 0) return null;
  const mid = Math.floor(list.length / 2);
  return list.length % 2 === 1 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
}

/** Counts per CPCB band, plus worst/cleanest and the median of reporting cities. */
export function summariseBoard(rows) {
  const list = Array.isArray(rows) ? rows : [];
  const ok = list.filter((row) => row.status === "ok");
  const bands = AQI_CATEGORIES.map((band) => ({
    label: band.label,
    advisory: band.advisory,
    min: band.min,
    max: band.max,
    count: ok.filter((row) => row.category?.label === band.label).length,
  }));
  const sorted = [...ok].sort((a, b) => b.aqi - a.aqi);
  return {
    reporting: ok.length,
    unavailable: list.length - ok.length,
    total: list.length,
    bands,
    worst: sorted[0] || null,
    cleanest: sorted.length ? sorted[sorted.length - 1] : null,
    medianAqi: median(ok.map((row) => row.aqi)),
    atOrAbovePoor: ok.filter((row) => row.aqi >= 201).length,
  };
}

/**
 * Build the whole board from the raw batch payloads.
 * `batches` is [{ cities, payload }] or [{ cities, error }].
 */
export function buildBoard(batches, nowIso) {
  const list = Array.isArray(batches) ? batches : [];
  const rows = [];
  for (const batch of list) {
    const cities = Array.isArray(batch?.cities) ? batch.cities : [];
    const results = batch?.error ? [] : normaliseBatchPayload(batch?.payload);
    for (let i = 0; i < cities.length; i += 1) {
      const reason = batch?.error || (results[i] ? null : "This city was missing from the API response.");
      rows.push(cityRow(cities[i], results[i]?.hourly, nowIso, reason));
    }
  }
  if (rows.length === 0) return { error: "No cities were requested." };
  const ranked = rankRows(rows);
  return { rows: ranked, summary: summariseBoard(ranked) };
}

/** Filter helper used by the UI. Pure. */
export function filterRows(rows, { query = "", zone = "all" } = {}) {
  const needle = String(query || "").trim().toLowerCase();
  return (Array.isArray(rows) ? rows : []).filter((row) => {
    if (zone !== "all" && row.zone !== zone) return false;
    if (!needle) return true;
    return `${row.name} ${row.state}`.toLowerCase().includes(needle);
  });
}

/**
 * Indian Standard Time is a fixed UTC+05:30 with no daylight saving, so the
 * conversion is a constant offset rather than a timezone lookup.
 */
export const IST_OFFSET_MINUTES = 330;

/** "2026-07-28T17:00" (UTC) → "28 Jul 2026, 22:30 IST". Returns "" if unparseable. */
export function utcHourToIstLabel(isoHour) {
  const text = String(isoHour || "");
  if (!text) return "";
  const ms = Date.parse(text.endsWith("Z") ? text : `${text}Z`);
  if (!Number.isFinite(ms)) return "";
  const shifted = new Date(ms + IST_OFFSET_MINUTES * 60 * 1000);
  const fmt = new Intl.DateTimeFormat("en-IN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${fmt.format(shifted)} IST`;
}

/** Plain-text board for the copy button. */
export function boardToText(board, nowIso) {
  if (!board || board.error) return board?.error || "No board.";
  const lines = [
    `AQI Today — CPCB National AQI applied to modelled concentrations`,
    `Generated ${nowIso}`,
    `Index method: ${INDEX_METHOD_LABEL}`,
    `Concentrations: ${DATA_SOURCE_LABEL} — not official CPCB station readings`,
    "",
  ];
  for (const row of board.rows) {
    if (row.status !== "ok") {
      lines.push(`${row.name} (${row.state}): unavailable — ${row.reason}`);
      continue;
    }
    lines.push(`${row.rank}. ${row.name} (${row.state}): AQI ${row.aqi} ${row.category.label} — dominant ${row.dominantPollutant}`);
  }
  lines.push("", `Reporting ${board.summary.reporting} of ${board.summary.total} cities; median AQI ${board.summary.medianAqi ?? "n/a"}.`);
  return lines.join("\n");
}
