"use client";

import { useMemo, useState } from "react";
import { Backpack, Check, Copy, RotateCcw } from "lucide-react";

import {
  BITRATE_PRESETS,
  SHOOT_TYPES,
  batteryWattHours,
  buildPackingList,
  gramsToKg,
} from "../lib";

const DEC1 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const DEC2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const d1 = (value) => DEC1.format(Number.isFinite(value) ? value : 0);
const d2 = (value) => DEC2.format(Number.isFinite(value) ? value : 0);
const int = (value) => INT.format(Number.isFinite(value) ? value : 0);

const DASH = "—";

const DEFAULTS = {
  shootTypeId: "studio-interview",
  recordMinutes: "120",
  minutesPerBattery: "60",
  bitrateMbps: "100",
  cardGb: "128",
  cameraCount: "2",
  speakerCount: "2",
  lightCount: "3",
  backupCopies: "1",
  outdoor: false,
  night: false,
  mainsPower: true,
  flying: false,
  voltage: "7.2",
  capacityMah: "6600",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-semibold";

export default function ToolHome() {
  const [shootTypeId, setShootTypeId] = useState(DEFAULTS.shootTypeId);
  const [recordMinutes, setRecordMinutes] = useState(DEFAULTS.recordMinutes);
  const [minutesPerBattery, setMinutesPerBattery] = useState(DEFAULTS.minutesPerBattery);
  const [bitrateMbps, setBitrateMbps] = useState(DEFAULTS.bitrateMbps);
  const [cardGb, setCardGb] = useState(DEFAULTS.cardGb);
  const [cameraCount, setCameraCount] = useState(DEFAULTS.cameraCount);
  const [speakerCount, setSpeakerCount] = useState(DEFAULTS.speakerCount);
  const [lightCount, setLightCount] = useState(DEFAULTS.lightCount);
  const [backupCopies, setBackupCopies] = useState(DEFAULTS.backupCopies);
  const [outdoor, setOutdoor] = useState(DEFAULTS.outdoor);
  const [night, setNight] = useState(DEFAULTS.night);
  const [mainsPower, setMainsPower] = useState(DEFAULTS.mainsPower);
  const [flying, setFlying] = useState(DEFAULTS.flying);
  const [voltage, setVoltage] = useState(DEFAULTS.voltage);
  const [capacityMah, setCapacityMah] = useState(DEFAULTS.capacityMah);
  const [packed, setPacked] = useState([]);
  const [copied, setCopied] = useState(false);

  const list = useMemo(
    () =>
      buildPackingList({
        shootTypeId,
        recordMinutes: Number(recordMinutes),
        minutesPerBattery: Number(minutesPerBattery),
        bitrateMbps: Number(bitrateMbps),
        cardGb: Number(cardGb),
        cameraCount: Number(cameraCount),
        speakerCount: Number(speakerCount),
        lightCount: Number(lightCount),
        backupCopies: Number(backupCopies),
        outdoor,
        night,
        mainsPower,
        flying,
      }),
    [
      shootTypeId,
      recordMinutes,
      minutesPerBattery,
      bitrateMbps,
      cardGb,
      cameraCount,
      speakerCount,
      lightCount,
      backupCopies,
      outdoor,
      night,
      mainsPower,
      flying,
    ],
  );

  const battery = useMemo(
    () => batteryWattHours({ voltage: Number(voltage), capacityMah: Number(capacityMah) }),
    [voltage, capacityMah],
  );

  const failed = Boolean(list.error);

  const toggle = (id) => {
    setPacked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      `Gear packing list — ${list.shootType.label}`,
      `Batteries: ${list.power.total} (${list.power.perCamera} per body, covers ${list.power.coveredMinutes} min)`,
      `Cards: ${list.storage.totalCards} · footage ${d1(list.storage.totalGb)} GB · backup ${d1(list.storage.backupGb)} GB`,
      `Pack weight: ${d2(list.totalKg)} kg across ${list.itemCount} items`,
      "",
      ...list.sections.flatMap((section) => [
        `${section.label}:`,
        ...section.items.map(
          (item) => `  [${packed.includes(item.id) ? "x" : " "}] ${item.name} x${item.quantity}`,
        ),
      ]),
      "",
      ...list.warnings.map((warning) => `! ${warning}`),
    ].join("\n");
  }, [list, packed, failed]);

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
    setShootTypeId(DEFAULTS.shootTypeId);
    setRecordMinutes(DEFAULTS.recordMinutes);
    setMinutesPerBattery(DEFAULTS.minutesPerBattery);
    setBitrateMbps(DEFAULTS.bitrateMbps);
    setCardGb(DEFAULTS.cardGb);
    setCameraCount(DEFAULTS.cameraCount);
    setSpeakerCount(DEFAULTS.speakerCount);
    setLightCount(DEFAULTS.lightCount);
    setBackupCopies(DEFAULTS.backupCopies);
    setOutdoor(DEFAULTS.outdoor);
    setNight(DEFAULTS.night);
    setMainsPower(DEFAULTS.mainsPower);
    setFlying(DEFAULTS.flying);
    setVoltage(DEFAULTS.voltage);
    setCapacityMah(DEFAULTS.capacityMah);
    setPacked([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Backpack className="h-4 w-4" aria-hidden="true" />
          Shoot prep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Creator Gear Packing List</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Battery counts and card capacity are arithmetic, not guesswork. Describe the shoot and get
          the list, the numbers behind the power and storage, and what the bag will weigh.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="gpl-type">
              Shoot type
            </label>
            <select
              id="gpl-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={shootTypeId}
              onChange={(event) => setShootTypeId(event.target.value)}
            >
              {SHOOT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpl-record">
              Rolling record time (minutes)
            </label>
            <input
              id="gpl-record"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="2880"
              step="10"
              value={recordMinutes}
              onChange={(event) => setRecordMinutes(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpl-battery">
              Minutes per battery
            </label>
            <input
              id="gpl-battery"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="5"
              max="600"
              step="5"
              value={minutesPerBattery}
              onChange={(event) => setMinutesPerBattery(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpl-bitrate">
              Recording bitrate (Mbps)
            </label>
            <input
              id="gpl-bitrate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="5000"
              step="10"
              value={bitrateMbps}
              onChange={(event) => setBitrateMbps(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpl-card">
              Card size (GB)
            </label>
            <input
              id="gpl-card"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="4000"
              step="32"
              value={cardGb}
              onChange={(event) => setCardGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpl-cameras">
              Camera bodies
            </label>
            <input
              id="gpl-cameras"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="8"
              step="1"
              value={cameraCount}
              onChange={(event) => setCameraCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpl-speakers">
              People on mic
            </label>
            <input
              id="gpl-speakers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="8"
              step="1"
              value={speakerCount}
              onChange={(event) => setSpeakerCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpl-lights">
              Lights to rig
            </label>
            <input
              id="gpl-lights"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="8"
              step="1"
              value={lightCount}
              onChange={(event) => setLightCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpl-backups">
              Backup copies made on the day
            </label>
            <input
              id="gpl-backups"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="3"
              step="1"
              value={backupCopies}
              onChange={(event) => setBackupCopies(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {BITRATE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={CHIP_BTN}
              onClick={() => setBitrateMbps(String(preset.mbps))}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={TOGGLE_CLASS} htmlFor="gpl-outdoor">
            <input
              id="gpl-outdoor"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={outdoor}
              onChange={(event) => setOutdoor(event.target.checked)}
            />
            Outdoors or on location
          </label>
          <label className={TOGGLE_CLASS} htmlFor="gpl-night">
            <input
              id="gpl-night"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={night}
              onChange={(event) => setNight(event.target.checked)}
            />
            After dark
          </label>
          <label className={TOGGLE_CLASS} htmlFor="gpl-mains">
            <input
              id="gpl-mains"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={mainsPower}
              onChange={(event) => setMainsPower(event.target.checked)}
            />
            Mains power available
          </label>
          <label className={TOGGLE_CLASS} htmlFor="gpl-flying">
            <input
              id="gpl-flying"
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={flying}
              onChange={(event) => setFlying(event.target.checked)}
            />
            Travelling by air
          </label>
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {list.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total pack weight
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${d2(list.totalKg)} kg`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above to build the list."
                : `${int(list.itemCount)} items across ${list.lineCount} lines`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the gear packing list"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy list"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Batteries to pack",
              failed ? DASH : `${int(list.power.total)} (${int(list.power.perCamera)} per body)`,
            ],
            [
              "Recording time those batteries cover",
              failed ? DASH : `${int(list.power.coveredMinutes)} min per body`,
            ],
            ["Footage on the day", failed ? DASH : `${d1(list.storage.totalGb)} GB`],
            ["Cards to pack", failed ? DASH : int(list.storage.totalCards)],
            ["Minutes on one card", failed ? DASH : `${int(list.storage.minutesPerCard)} min`],
            ["Backup storage needed", failed ? DASH : `${d1(list.storage.backupGb)} GB`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && list.warnings.length > 0 && (
          <ul className="mt-4 space-y-2">
            {list.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Battery watt-hours for flying</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Wh = volts × amp-hours. Airlines police watt-hours, not milliamp-hours.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="gpl-volt">
              Battery voltage (V)
            </label>
            <input
              id="gpl-volt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="0.1"
              value={voltage}
              onChange={(event) => setVoltage(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="gpl-mah">
              Capacity (mAh)
            </label>
            <input
              id="gpl-mah"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="100"
              value={capacityMah}
              onChange={(event) => setCapacityMah(event.target.value)}
            />
          </div>
        </div>
        {battery.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {battery.error}
          </p>
        ) : (
          <>
            <p className="mt-4 text-3xl font-semibold text-[var(--primary)]">
              {d2(battery.wattHours)} Wh
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{battery.rule}</p>
          </>
        )}
      </section>

      {!failed &&
        list.sections.map((section) => (
          <section
            key={section.category}
            className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">{section.label}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{d2(gramsToKg(section.grams))} kg</p>
            </div>
            <ul className="mt-3 space-y-2">
              {section.items.map((item) => (
                <li key={item.id}>
                  <label
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3"
                    htmlFor={`gpl-item-${item.id}`}
                  >
                    <input
                      id={`gpl-item-${item.id}`}
                      type="checkbox"
                      className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={packed.includes(item.id)}
                      onChange={() => toggle(item.id)}
                    />
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-[var(--muted-foreground)]">×{item.quantity}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Item weights are typical figures for mid-range kit, so the total is a planning estimate
        rather than a baggage guarantee. Airline lithium rules vary by carrier and route — confirm
        with yours before you travel.
      </p>
    </main>
  );
}
