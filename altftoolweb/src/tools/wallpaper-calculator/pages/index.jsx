"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Wallpaper } from "lucide-react";

import {
  calculateWallpaper,
  DEFAULT_TRIM_M,
  MATCH_TYPES,
  ROLL_PRESETS,
  roomPerimeter,
  toMetres,
} from "../lib";

const DEFAULTS = {
  unit: "m",
  mode: "room",
  roomLength: "4",
  roomWidth: "3",
  wallRun: "14",
  wallHeight: "2.4",
  rollPreset: "euro",
  customRollLength: "10.05",
  customRollWidth: "0.53",
  matchType: "straight",
  repeatCm: "64",
  trimCm: "10",
  openingsWidth: "0",
  extraRolls: "1",
  pricePerRoll: "2400",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

const NUM2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const two = (v) => (Number.isFinite(v) ? NUM2.format(v) : DASH);
const int = (v) => (Number.isFinite(v) ? INT.format(v) : DASH);
const money = (v) => (Number.isFinite(v) ? INR.format(v) : DASH);

const toNumber = (raw) => {
  const cleaned = String(raw).replace(/,/g, "").trim();
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-2 last:border-0">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold text-[var(--foreground)] tabular-nums">{value}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [roomLength, setRoomLength] = useState(DEFAULTS.roomLength);
  const [roomWidth, setRoomWidth] = useState(DEFAULTS.roomWidth);
  const [wallRun, setWallRun] = useState(DEFAULTS.wallRun);
  const [wallHeight, setWallHeight] = useState(DEFAULTS.wallHeight);
  const [rollPreset, setRollPreset] = useState(DEFAULTS.rollPreset);
  const [customRollLength, setCustomRollLength] = useState(DEFAULTS.customRollLength);
  const [customRollWidth, setCustomRollWidth] = useState(DEFAULTS.customRollWidth);
  const [matchType, setMatchType] = useState(DEFAULTS.matchType);
  const [repeatCm, setRepeatCm] = useState(DEFAULTS.repeatCm);
  const [trimCm, setTrimCm] = useState(DEFAULTS.trimCm);
  const [openingsWidth, setOpeningsWidth] = useState(DEFAULTS.openingsWidth);
  const [extraRolls, setExtraRolls] = useState(DEFAULTS.extraRolls);
  const [pricePerRoll, setPricePerRoll] = useState(DEFAULTS.pricePerRoll);
  const [copied, setCopied] = useState(false);

  const preset = ROLL_PRESETS.find((p) => p.id === rollPreset) ?? ROLL_PRESETS[0];

  const perimeter = useMemo(
    () => roomPerimeter(toMetres(toNumber(roomLength), unit), toMetres(toNumber(roomWidth), unit)),
    [roomLength, roomWidth, unit],
  );

  const wallRunM = mode === "room" ? (perimeter.error ? NaN : perimeter.perimeterM) : toMetres(toNumber(wallRun), unit);

  const result = useMemo(() => {
    if (mode === "room" && perimeter.error) return { error: perimeter.error };
    return calculateWallpaper({
      wallRunM,
      wallHeightM: toMetres(toNumber(wallHeight), unit),
      rollLengthM: preset.lengthM ?? toNumber(customRollLength),
      rollWidthM: preset.widthM ?? toNumber(customRollWidth),
      matchType,
      repeatM: toNumber(repeatCm) / 100,
      trimM: toNumber(trimCm) / 100,
      openingsWidthM: toMetres(toNumber(openingsWidth), unit),
      extraRolls: toNumber(extraRolls),
      pricePerRoll: toNumber(pricePerRoll),
    });
  }, [mode, perimeter, wallRunM, wallHeight, unit, preset, customRollLength, customRollWidth, matchType, repeatCm, trimCm, openingsWidth, extraRolls, pricePerRoll]);

  const error = result.error || null;

  function reset() {
    setUnit(DEFAULTS.unit);
    setMode(DEFAULTS.mode);
    setRoomLength(DEFAULTS.roomLength);
    setRoomWidth(DEFAULTS.roomWidth);
    setWallRun(DEFAULTS.wallRun);
    setWallHeight(DEFAULTS.wallHeight);
    setRollPreset(DEFAULTS.rollPreset);
    setCustomRollLength(DEFAULTS.customRollLength);
    setCustomRollWidth(DEFAULTS.customRollWidth);
    setMatchType(DEFAULTS.matchType);
    setRepeatCm(DEFAULTS.repeatCm);
    setTrimCm(DEFAULTS.trimCm);
    setOpeningsWidth(DEFAULTS.openingsWidth);
    setExtraRolls(DEFAULTS.extraRolls);
    setPricePerRoll(DEFAULTS.pricePerRoll);
    setCopied(false);
  }

  async function copyResult() {
    if (error) return;
    const lines = [
      `Wallpaper order: ${int(result.rollsToBuy)} rolls`,
      `Wall run papered: ${two(result.paperedRunM)} m at ${wallHeight} ${unit} high`,
      `Drop length: ${two(result.dropLengthM)} m${result.repeatsPerDrop ? ` (${result.repeatsPerDrop} pattern repeats)` : ""}`,
      `Drops needed: ${int(result.dropsNeeded)}; drops per roll: ${int(result.dropsPerRoll)}`,
      `Rolls to cover: ${int(result.rollsNeeded)} + ${int(result.sparesIncluded)} spare`,
      `Waste: ${two(result.wastePercent)}%`,
      result.totalCost !== null ? `Cost: ${money(result.totalCost)}` : "",
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Wallpaper className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Wallpaper Calculator
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Rolls, drops and waste for any room — with the pattern repeat that decides whether you need seven rolls or nine.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="wp-unit">
                Measurement unit
              </label>
              <select id="wp-unit" className={`mt-1 ${INPUT_CLASS}`} value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="m">Metres</option>
                <option value="cm">Centimetres</option>
                <option value="ft">Feet</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wp-mode">
                Measure the walls as
              </label>
              <select id="wp-mode" className={`mt-1 ${INPUT_CLASS}`} value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="room">Whole room (length x width)</option>
                <option value="run">One wall run I measured</option>
              </select>
            </div>

            {mode === "room" ? (
              <>
                <div>
                  <label className={LABEL_CLASS} htmlFor="wp-room-length">
                    Room length ({unit})
                  </label>
                  <input id="wp-room-length" className={`mt-1 ${INPUT_CLASS}`} value={roomLength} onChange={(e) => setRoomLength(e.target.value)} inputMode="decimal" />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor="wp-room-width">
                    Room width ({unit})
                  </label>
                  <input id="wp-room-width" className={`mt-1 ${INPUT_CLASS}`} value={roomWidth} onChange={(e) => setRoomWidth(e.target.value)} inputMode="decimal" />
                </div>
              </>
            ) : (
              <div>
                <label className={LABEL_CLASS} htmlFor="wp-run">
                  Wall run to paper ({unit})
                </label>
                <input id="wp-run" className={`mt-1 ${INPUT_CLASS}`} value={wallRun} onChange={(e) => setWallRun(e.target.value)} inputMode="decimal" />
              </div>
            )}

            <div>
              <label className={LABEL_CLASS} htmlFor="wp-height">
                Wall height ({unit})
              </label>
              <input id="wp-height" className={`mt-1 ${INPUT_CLASS}`} value={wallHeight} onChange={(e) => setWallHeight(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wp-openings">
                Full-height openings, total width ({unit})
              </label>
              <input id="wp-openings" className={`mt-1 ${INPUT_CLASS}`} value={openingsWidth} onChange={(e) => setOpeningsWidth(e.target.value)} inputMode="decimal" />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="wp-roll">
              Roll size
            </label>
            <select id="wp-roll" className={`mt-1 ${INPUT_CLASS}`} value={rollPreset} onChange={(e) => setRollPreset(e.target.value)}>
              {ROLL_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {rollPreset === "custom" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="wp-roll-length">
                  Roll length (m)
                </label>
                <input id="wp-roll-length" className={`mt-1 ${INPUT_CLASS}`} value={customRollLength} onChange={(e) => setCustomRollLength(e.target.value)} inputMode="decimal" />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="wp-roll-width">
                  Roll width (m)
                </label>
                <input id="wp-roll-width" className={`mt-1 ${INPUT_CLASS}`} value={customRollWidth} onChange={(e) => setCustomRollWidth(e.target.value)} inputMode="decimal" />
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="wp-match">
                Pattern match
              </label>
              <select id="wp-match" className={`mt-1 ${INPUT_CLASS}`} value={matchType} onChange={(e) => setMatchType(e.target.value)}>
                {MATCH_TYPES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            {matchType !== "free" ? (
              <div>
                <label className={LABEL_CLASS} htmlFor="wp-repeat">
                  Pattern repeat (cm)
                </label>
                <input id="wp-repeat" className={`mt-1 ${INPUT_CLASS}`} value={repeatCm} onChange={(e) => setRepeatCm(e.target.value)} inputMode="decimal" />
              </div>
            ) : null}
            <div>
              <label className={LABEL_CLASS} htmlFor="wp-trim">
                Trim allowance per drop (cm)
              </label>
              <input id="wp-trim" className={`mt-1 ${INPUT_CLASS}`} value={trimCm} onChange={(e) => setTrimCm(e.target.value)} inputMode="decimal" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wp-extra">
                Spare rolls to add
              </label>
              <input id="wp-extra" className={`mt-1 ${INPUT_CLASS}`} value={extraRolls} onChange={(e) => setExtraRolls(e.target.value)} inputMode="numeric" />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wp-price">
                Price per roll (INR)
              </label>
              <input id="wp-price" className={`mt-1 ${INPUT_CLASS}`} value={pricePerRoll} onChange={(e) => setPricePerRoll(e.target.value)} inputMode="decimal" />
            </div>
          </div>

          <p className="text-xs text-[var(--muted-foreground)]">
            Default trim allowance is {DEFAULT_TRIM_M * 100} cm per drop — 5 cm at the ceiling and 5 cm at the skirting.
          </p>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={PRIMARY_BTN} onClick={copyResult} aria-label="Copy the wallpaper order summary to the clipboard">
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all fields to their defaults">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </section>

        <section className="grid gap-4">
          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            {error ? (
              <p className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]" role="alert">
                {error}
              </p>
            ) : null}
            <p className="text-sm text-[var(--muted-foreground)]">Rolls to buy</p>
            <p className="text-4xl font-bold tracking-tight text-[var(--foreground)] tabular-nums">
              {error ? DASH : int(result.rollsToBuy)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error ? DASH : `${int(result.rollsNeeded)} to cover the walls plus ${int(result.sparesIncluded)} spare`}
            </p>

            <dl className="mt-4">
              <Row label="Wall run papered" value={error ? DASH : `${two(result.paperedRunM)} m`} />
              <Row label="Drop length" value={error ? DASH : `${two(result.dropLengthM)} m`} />
              <Row label="Pattern repeats per drop" value={error ? DASH : result.repeatsPerDrop ?? "Not matched"} />
              <Row label="Drops needed" value={error ? DASH : int(result.dropsNeeded)} />
              <Row label="Full drops per roll" value={error ? DASH : int(result.dropsPerRoll)} />
              <Row label="Offcut left on each roll" value={error ? DASH : `${two(result.offcutPerRollM)} m`} />
              <Row label="Spare drops after the job" value={error ? DASH : int(result.spareDrops)} />
              <Row label="Paper on the wall" value={error ? DASH : `${two(result.paperUsedM2)} m²`} />
              <Row label="Paper bought" value={error ? DASH : `${two(result.paperBoughtM2)} m²`} />
              <Row label="Waste" value={error ? DASH : `${two(result.wastePercent)}%`} />
              <Row label="Total cost" value={error || result.totalCost === null ? DASH : money(result.totalCost)} />
            </dl>
          </div>

          <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">How the count is made</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
              <li>Drops needed = wall run divided by roll width, rounded up.</li>
              <li>Drop length = wall height + trim, then rounded up to a whole pattern repeat when the pattern must match.</li>
              <li>Drops per roll = roll length divided by drop length, rounded down — a part drop is unusable.</li>
              <li>Rolls = drops needed divided by drops per roll, rounded up.</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
