"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileJson2,
  FileUp,
  LocateFixed,
  LockKeyhole,
  MapPin,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import {
  buildLocationExportName,
  parseLocationHistory,
  parsePrivacyZones,
  sanitizeLocationHistory,
  serializeLocationHistory,
} from "../lib/locationHistory.mjs";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

const SAMPLE_HISTORY = JSON.stringify(
  {
    locations: [
      {
        latitudeE7: 190760000,
        longitudeE7: 728777000,
        timestampMs: "1738382400000",
        accuracy: 12,
        source: "GPS",
      },
      {
        latitudeE7: 191104210,
        longitudeE7: 729103350,
        timestampMs: "1738386245000",
        accuracy: 25,
        source: "GPS",
      },
      {
        latitudeE7: 191236780,
        longitudeE7: 729522310,
        timestampMs: "1738390400000",
        accuracy: 18,
        source: "WIFI",
      },
    ],
  },
  null,
  2,
);

const EMPTY_ZONES = [
  {
    id: "home",
    label: "Home",
    latitude: "",
    longitude: "",
    radiusMeters: "300",
  },
  {
    id: "work",
    label: "Work",
    latitude: "",
    longitude: "",
    radiusMeters: "250",
  },
];

const primaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-bold text-[var(--primary-foreground)] shadow-sm transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)] disabled:cursor-not-allowed disabled:opacity-60";

const dangerButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--danger)] bg-[var(--danger-soft)] px-3 py-2 text-sm font-semibold text-[var(--danger)] transition-colors hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)]";

const inputClass =
  "h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--focus-ring)]";

const textareaClass =
  "w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-xs leading-6 text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--focus-ring)]";

function makeZoneId() {
  return `zone-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatCoordinate(value) {
  return Number(value).toFixed(6);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function inferHint(filename) {
  return /\.csv$/i.test(filename) ? "csv" : "json";
}

function isValidZone(zone) {
  const latitude = Number(zone.latitude);
  const longitude = Number(zone.longitude);
  const radius = Number(zone.radiusMeters);
  return (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    Number.isFinite(radius) &&
    radius > 0
  );
}

function isStartedZone(zone) {
  return [zone.latitude, zone.longitude, zone.radiusMeters].some(
    (value) => String(value).trim() !== "",
  );
}

function downloadText(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Section({ title, description, icon: Icon, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Metric({ label, value, detail, tone = "default" }) {
  const valueClass =
    tone === "danger"
      ? "bg-[var(--danger-soft)] text-[var(--danger)]"
      : tone === "success"
        ? "bg-[var(--success-soft)] text-[var(--success)]"
        : "bg-[var(--section-highlight)] text-[var(--primary)]";

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </p>
      <p
        className={`mt-2 inline-flex rounded-md px-3 py-1 text-2xl font-black ${valueClass}`}
      >
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
        {detail}
      </p>
    </article>
  );
}

export default function LocationHistoryCleaner() {
  const [rawData, setRawData] = useState("");
  const [filename, setFilename] = useState("location-history.json");
  const [formatHint, setFormatHint] = useState("auto");
  const [fileSummary, setFileSummary] = useState("");
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState("");
  const [zones, setZones] = useState(EMPTY_ZONES);
  const [zoneImport, setZoneImport] = useState("");
  const [zoneError, setZoneError] = useState("");
  const [removeInsideZones, setRemoveInsideZones] = useState(true);
  const [coordinateDecimals, setCoordinateDecimals] = useState("none");
  const [timestampBucket, setTimestampBucket] = useState("none");

  const validZones = useMemo(
    () =>
      zones.filter(isValidZone).map((zone) => ({
        ...zone,
        latitude: Number(zone.latitude),
        longitude: Number(zone.longitude),
        radiusMeters: Number(zone.radiusMeters),
      })),
    [zones],
  );
  const invalidZoneCount = zones.filter(
    (zone) => isStartedZone(zone) && !isValidZone(zone),
  ).length;

  const result = useMemo(() => {
    if (!parsed) return null;
    return sanitizeLocationHistory(parsed, {
      zones: validZones,
      removeInsideZones,
      coordinateDecimals:
        coordinateDecimals === "none" ? null : Number(coordinateDecimals),
      timestampBucketMinutes:
        timestampBucket === "none" ? null : Number(timestampBucket),
    });
  }, [
    parsed,
    validZones,
    removeInsideZones,
    coordinateDecimals,
    timestampBucket,
  ]);

  function analyze(content = rawData, hint = formatHint) {
    setParseError("");
    try {
      const nextParsed = parseLocationHistory(content, hint);
      setParsed(nextParsed);
    } catch (error) {
      setParsed(null);
      setParseError(error.message);
    }
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setParseError("");
    if (file.size > MAX_FILE_BYTES) {
      setParsed(null);
      setParseError(
        `This file is ${formatBytes(file.size)}. Use a file smaller than ${formatBytes(MAX_FILE_BYTES)} so the browser stays responsive.`,
      );
      return;
    }
    try {
      const text = await file.text();
      const hint = inferHint(file.name);
      setRawData(text);
      setFilename(file.name);
      setFormatHint(hint);
      setFileSummary(`${file.name} · ${formatBytes(file.size)}`);
      analyze(text, hint);
    } catch {
      setParsed(null);
      setParseError("The browser could not read that file.");
    }
  }

  function loadSample() {
    setRawData(SAMPLE_HISTORY);
    setFilename("sample-location-history.json");
    setFileSummary("Built-in sample · nothing uploaded");
    setFormatHint("json");
    setZones((current) =>
      current.map((zone) =>
        zone.id === "home"
          ? {
              ...zone,
              latitude: "19.076",
              longitude: "72.8777",
              radiusMeters: "300",
            }
          : zone,
      ),
    );
    analyze(SAMPLE_HISTORY, "json");
  }

  function resetTool() {
    setRawData("");
    setFilename("location-history.json");
    setFormatHint("auto");
    setFileSummary("");
    setParsed(null);
    setParseError("");
    setZones(EMPTY_ZONES);
    setZoneImport("");
    setZoneError("");
    setRemoveInsideZones(true);
    setCoordinateDecimals("none");
    setTimestampBucket("none");
  }

  function updateZone(id, field, value) {
    setZones((current) =>
      current.map((zone) => (zone.id === id ? { ...zone, [field]: value } : zone)),
    );
  }

  function addEmptyZone() {
    setZones((current) => [
      ...current,
      {
        id: makeZoneId(),
        label: `Private place ${current.length + 1}`,
        latitude: "",
        longitude: "",
        radiusMeters: "250",
      },
    ]);
  }

  function addPointAsZone(point, index) {
    setZones((current) => [
      ...current,
      {
        id: makeZoneId(),
        label: `History point ${index + 1}`,
        latitude: formatCoordinate(point.latitude),
        longitude: formatCoordinate(point.longitude),
        radiusMeters: "250",
      },
    ]);
  }

  function importZones() {
    setZoneError("");
    try {
      const imported = parsePrivacyZones(zoneImport).map((zone) => ({
        ...zone,
        id: makeZoneId(),
        latitude: String(zone.latitude),
        longitude: String(zone.longitude),
        radiusMeters: String(zone.radiusMeters),
      }));
      if (!imported.length) {
        setZoneError("Paste at least one zone before importing.");
        return;
      }
      setZones((current) => [...current, ...imported]);
      setZoneImport("");
    } catch (error) {
      setZoneError(error.message);
    }
  }

  function exportResult() {
    if (!result) return;
    const content = serializeLocationHistory(result);
    const type =
      result.format === "csv"
        ? "text/csv;charset=utf-8"
        : result.format === "geojson"
          ? "application/geo+json;charset=utf-8"
          : "application/json;charset=utf-8";
    downloadText(
      content,
      buildLocationExportName(filename, result.format),
      type,
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                Local-only privacy tool
              </span>
              <h1 className="mt-3 text-2xl font-black text-[var(--foreground)] sm:text-3xl">
                Clean precise places before sharing location history
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
                Remove records near home, work or another private place, then
                optionally reduce coordinate and timestamp precision. Parsing and
                export happen on this device.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--success-soft)] p-4 text-sm text-[var(--foreground)]">
            <p className="flex items-center gap-2 font-bold text-[var(--success)]">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              No upload, map or geocoding
            </p>
            <p className="mt-1 max-w-xs leading-6 text-[var(--muted-foreground)]">
              The tool does not request map tiles, place names or network lookups.
            </p>
          </div>
        </div>
      </section>

      <Section
        title="1. Import location history"
        description="Use Google Takeout-style JSON, coordinate CSV, GeoJSON Point features, or paste compatible data."
        icon={FileUp}
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <label
              htmlFor="location-history-file"
              className="block text-sm font-bold text-[var(--foreground)]"
            >
              History file
            </label>
            <input
              id="location-history-file"
              type="file"
              accept=".json,.geojson,.csv,application/json,application/geo+json,text/csv"
              onChange={handleFile}
              className="mt-2 block w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--section-highlight)] file:px-3 file:py-2 file:font-bold file:text-[var(--primary)] hover:file:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)]"
            />
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Maximum {formatBytes(MAX_FILE_BYTES)}. The selected file stays in
              browser memory and is not persisted.
            </p>
          </div>
          <div>
            <label
              htmlFor="location-format"
              className="block text-sm font-bold text-[var(--foreground)]"
            >
              Input format
            </label>
            <select
              id="location-format"
              value={formatHint}
              onChange={(event) => setFormatHint(event.target.value)}
              className={`${inputClass} mt-2`}
            >
              <option value="auto">Auto detect</option>
              <option value="json">JSON / GeoJSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              htmlFor="location-data"
              className="text-sm font-bold text-[var(--foreground)]"
            >
              Pasted data
            </label>
            {fileSummary ? (
              <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                {fileSummary}
              </span>
            ) : null}
          </div>
          <textarea
            id="location-data"
            value={rawData}
            onChange={(event) => {
              setRawData(event.target.value);
              setParsed(null);
              setParseError("");
            }}
            className={`${textareaClass} mt-2 min-h-48`}
            placeholder='{"locations":[{"latitudeE7":190760000,"longitudeE7":728777000}]}'
            spellCheck={false}
            aria-invalid={Boolean(parseError)}
            aria-describedby={parseError ? "location-parse-error" : undefined}
          />
          {parseError ? (
            <p
              id="location-parse-error"
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-md border border-[var(--danger)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {parseError}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => analyze()}
              disabled={!rawData.trim()}
              className={primaryButton}
            >
              <FileJson2 className="h-4 w-4" aria-hidden="true" />
              Analyze locally
            </button>
            <button type="button" onClick={loadSample} className={secondaryButton}>
              Load safe sample
            </button>
            <button type="button" onClick={resetTool} className={secondaryButton}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {parsed ? (
          <div
            className="mt-4 rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-4"
            role="status"
          >
            <p className="flex items-center gap-2 text-sm font-bold text-[var(--success)]">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              Found {parsed.points.length.toLocaleString()} valid point
              {parsed.points.length === 1 ? "" : "s"} in{" "}
              {parsed.format.toUpperCase()}
            </p>
            {parsed.warnings.map((warning) => (
              <p
                key={warning}
                className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]"
              >
                {warning}
              </p>
            ))}
          </div>
        ) : null}
      </Section>

      <Section
        title="2. Define private places"
        description="Enter coordinates directly, import center/radius rows, or add a detected history point as a privacy-zone center."
        icon={MapPin}
      >
        <div className="space-y-4">
          {zones.map((zone, index) => (
            <fieldset
              key={zone.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <legend className="px-2 text-sm font-bold text-[var(--foreground)]">
                Zone {index + 1}
              </legend>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] lg:items-end">
                <div>
                  <label
                    htmlFor={`zone-label-${zone.id}`}
                    className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]"
                  >
                    Label
                  </label>
                  <input
                    id={`zone-label-${zone.id}`}
                    value={zone.label}
                    onChange={(event) =>
                      updateZone(zone.id, "label", event.target.value)
                    }
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`zone-lat-${zone.id}`}
                    className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]"
                  >
                    Latitude
                  </label>
                  <input
                    id={`zone-lat-${zone.id}`}
                    type="number"
                    min="-90"
                    max="90"
                    step="any"
                    value={zone.latitude}
                    onChange={(event) =>
                      updateZone(zone.id, "latitude", event.target.value)
                    }
                    placeholder="19.0760"
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`zone-lon-${zone.id}`}
                    className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]"
                  >
                    Longitude
                  </label>
                  <input
                    id={`zone-lon-${zone.id}`}
                    type="number"
                    min="-180"
                    max="180"
                    step="any"
                    value={zone.longitude}
                    onChange={(event) =>
                      updateZone(zone.id, "longitude", event.target.value)
                    }
                    placeholder="72.8777"
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`zone-radius-${zone.id}`}
                    className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]"
                  >
                    Radius (metres)
                  </label>
                  <input
                    id={`zone-radius-${zone.id}`}
                    type="number"
                    min="1"
                    step="1"
                    value={zone.radiusMeters}
                    onChange={(event) =>
                      updateZone(zone.id, "radiusMeters", event.target.value)
                    }
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setZones((current) =>
                      current.filter((candidate) => candidate.id !== zone.id),
                    )
                  }
                  className={dangerButton}
                  aria-label={`Remove ${zone.label || `zone ${index + 1}`}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="lg:sr-only">Remove</span>
                </button>
              </div>
            </fieldset>
          ))}
        </div>

        <button
          type="button"
          onClick={addEmptyZone}
          className={`${secondaryButton} mt-4`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add another zone
        </button>

        {parsed ? (
          <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
              <LocateFixed className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
              Add a detected point as a center
            </h3>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
              Coordinates are shown without a map or place-name lookup. Verify the
              point before treating it as home or work.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {parsed.points.slice(0, 6).map((point, index) => (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => addPointAsZone(point, index)}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-left text-sm text-[var(--foreground)] transition-colors hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)]"
                >
                  <span className="block font-bold">Point {index + 1}</span>
                  <span className="mt-1 block font-mono text-xs text-[var(--muted-foreground)]">
                    {formatCoordinate(point.latitude)},{" "}
                    {formatCoordinate(point.longitude)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
          <label
            htmlFor="zone-import"
            className="text-sm font-bold text-[var(--foreground)]"
          >
            Import centers
          </label>
          <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
            One CSV row per zone: label, latitude, longitude, radius metres. JSON
            arrays with the same fields are also supported.
          </p>
          <textarea
            id="zone-import"
            value={zoneImport}
            onChange={(event) => {
              setZoneImport(event.target.value);
              setZoneError("");
            }}
            className={`${textareaClass} mt-2 min-h-24`}
            placeholder={"Home,19.0760,72.8777,300\nWork,19.1200,72.9100,250"}
            spellCheck={false}
            aria-invalid={Boolean(zoneError)}
            aria-describedby={zoneError ? "zone-import-error" : undefined}
          />
          {zoneError ? (
            <p
              id="zone-import-error"
              role="alert"
              className="mt-2 text-sm text-[var(--danger)]"
            >
              {zoneError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={importZones}
            className={`${secondaryButton} mt-3`}
          >
            Import zones
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-[var(--success-soft)] px-3 py-1 font-bold text-[var(--success)]">
            {validZones.length} valid zone{validZones.length === 1 ? "" : "s"}
          </span>
          {invalidZoneCount ? (
            <span className="rounded-full bg-[var(--warning-soft)] px-3 py-1 font-bold text-[var(--foreground)]">
              {invalidZoneCount} incomplete or invalid
            </span>
          ) : null}
        </div>
      </Section>

      <Section
        title="3. Choose privacy transformations"
        description="Removal affects records inside a zone. Precision controls apply to every retained point."
        icon={SlidersHorizontal}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <input
              type="checkbox"
              checked={removeInsideZones}
              onChange={(event) => setRemoveInsideZones(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
            />
            <span>
              <span className="block text-sm font-bold text-[var(--foreground)]">
                Remove records inside zones
              </span>
              <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                A multi-point record is removed if any detected point is inside a
                configured radius.
              </span>
            </span>
          </label>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <label
              htmlFor="coordinate-precision"
              className="text-sm font-bold text-[var(--foreground)]"
            >
              Coordinate precision
            </label>
            <select
              id="coordinate-precision"
              value={coordinateDecimals}
              onChange={(event) => setCoordinateDecimals(event.target.value)}
              className={`${inputClass} mt-2`}
            >
              <option value="none">Keep original</option>
              <option value="4">4 decimals · roughly 11 m</option>
              <option value="3">3 decimals · roughly 110 m</option>
              <option value="2">2 decimals · roughly 1.1 km</option>
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Distance varies by latitude, especially for longitude.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <label
              htmlFor="timestamp-precision"
              className="text-sm font-bold text-[var(--foreground)]"
            >
              Timestamp precision
            </label>
            <select
              id="timestamp-precision"
              value={timestampBucket}
              onChange={(event) => setTimestampBucket(event.target.value)}
              className={`${inputClass} mt-2`}
            >
              <option value="none">Keep original</option>
              <option value="15">Round down to 15 minutes</option>
              <option value="60">Round down to the hour</option>
              <option value="1440">Round down to the day (UTC)</option>
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Recognized ISO, Unix-second and Unix-millisecond values are changed.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="4. Preview and export"
        description="Review the map-free impact summary before downloading a sanitized copy."
        icon={Download}
      >
        {result ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
              <Metric
                label="Detected"
                value={result.totalPoints.toLocaleString()}
                detail={`${parsed.format.toUpperCase()} coordinate points`}
              />
              <Metric
                label="Removed"
                value={result.removedPoints.toLocaleString()}
                detail={`${result.removedRecords.toLocaleString()} containing records removed`}
                tone={result.removedPoints ? "danger" : "default"}
              />
              <Metric
                label="Retained"
                value={result.retainedPoints.toLocaleString()}
                detail="Points remaining in the export"
                tone="success"
              />
              <Metric
                label="Coarsened"
                value={result.coordinatesCoarsened.toLocaleString()}
                detail={`${result.timestampsCoarsened.toLocaleString()} timestamps changed`}
              />
            </div>

            {result.zoneSummary.length ? (
              <div className="mt-5 overflow-hidden rounded-lg border border-[var(--border)]">
                <table className="w-full border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Privacy-zone match summary
                  </caption>
                  <thead className="bg-[var(--surface-soft)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-bold">
                        Zone
                      </th>
                      <th scope="col" className="px-4 py-3 font-bold">
                        Radius
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-bold">
                        Points in radius
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] bg-[var(--background)] text-[var(--foreground)]">
                    {result.zoneSummary.map((zone) => (
                      <tr key={zone.id}>
                        <th scope="row" className="px-4 py-3 font-semibold">
                          {zone.label}
                        </th>
                        <td className="px-4 py-3 text-[var(--muted-foreground)]">
                          {zone.radiusMeters.toLocaleString()} m
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {zone.matchedPoints.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 text-sm leading-6 text-[var(--foreground)]">
                No valid privacy zone is active. You can still coarsen all retained
                coordinates or timestamps.
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportResult}
                className={primaryButton}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download sanitized {result.format.toUpperCase()}
              </button>
              <span className="text-xs leading-5 text-[var(--muted-foreground)]">
                Original input remains unchanged in browser memory.
              </span>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--background)] p-6 text-center">
            <FileJson2
              className="mx-auto h-8 w-8 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <p className="mt-3 font-bold text-[var(--foreground)]">
              Analyze a supported file to create a preview
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Nothing is uploaded while you work.
            </p>
          </div>
        )}
      </Section>

      <section className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]">
          <AlertTriangle className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
          Privacy limits to understand
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Radius checks use straight-line distance on Earth, not roads, buildings
            or GPS accuracy fields.
          </li>
          <li>
            Vendor exports vary. Unrecognized coordinate or timestamp shapes are
            preserved and may still contain sensitive information.
          </li>
          <li>
            Coarse points, timing patterns, labels and repeated journeys can still
            identify a person. Review the exported file before sharing it.
          </li>
          <li>
            Keep the original safely. This browser tool cannot recover removed
            records from the downloaded sanitized copy.
          </li>
        </ul>
      </section>
    </div>
  );
}
