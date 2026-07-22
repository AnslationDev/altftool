"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BatteryCharging,
  Cable,
  CheckCircle2,
  Clipboard,
  Download,
  Gauge,
  Laptop,
  PlugZap,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Usb,
  Zap,
} from "lucide-react";

const DEVICE_PRESETS = {
  phone: {
    label: "Smartphone",
    icon: Smartphone,
    capacity: 5000,
    capacityUnit: "mAh",
    nominalVoltage: 3.85,
    deviceLimit: 30,
    startPercent: 20,
    targetPercent: 90,
    note: "Most modern phones charge best around 20W to 30W.",
  },
  tablet: {
    label: "Tablet",
    icon: Smartphone,
    capacity: 9000,
    capacityUnit: "mAh",
    nominalVoltage: 3.85,
    deviceLimit: 45,
    startPercent: 15,
    targetPercent: 90,
    note: "Large tablets usually benefit from 30W to 45W USB-C chargers.",
  },
  laptop: {
    label: "Laptop",
    icon: Laptop,
    capacity: 60,
    capacityUnit: "Wh",
    nominalVoltage: 11.55,
    deviceLimit: 65,
    startPercent: 10,
    targetPercent: 100,
    note: "Thin laptops commonly need 45W to 65W, while heavier models need more.",
  },
  earbuds: {
    label: "Earbuds / Watch",
    icon: BatteryCharging,
    capacity: 500,
    capacityUnit: "mAh",
    nominalVoltage: 3.8,
    deviceLimit: 5,
    startPercent: 25,
    targetPercent: 100,
    note: "Small accessories should use low-watt charging for better heat control.",
  },
};

const CHARGER_PRESETS = [
  { label: "5V x 1A", voltage: 5, current: 1, cable: 2, deviceLimit: 10 },
  { label: "5V x 2A", voltage: 5, current: 2, cable: 2, deviceLimit: 12 },
  { label: "9V x 2A", voltage: 9, current: 2, cable: 3, deviceLimit: 30 },
  { label: "12V x 1.5A", voltage: 12, current: 1.5, cable: 3, deviceLimit: 30 },
  { label: "15V x 3A", voltage: 15, current: 3, cable: 3, deviceLimit: 45 },
  { label: "20V x 3.25A", voltage: 20, current: 3.25, cable: 5, deviceLimit: 65 },
  { label: "20V x 5A", voltage: 20, current: 5, cable: 5, deviceLimit: 100 },
];

function clampNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

function formatWatts(value) {
  if (!Number.isFinite(value)) return "0 W";
  if (value < 10) return `${value.toFixed(1)} W`;
  return `${Math.round(value)} W`;
}

function formatHours(hours) {
  if (!Number.isFinite(hours) || hours <= 0) return "0 min";
  const totalMinutes = Math.round(hours * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (!hrs) return `${mins} min`;
  if (!mins) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
}

function formatWh(value) {
  return `${Number(value || 0).toFixed(1)} Wh`;
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getPowerClass(usableWatts, deviceLimit, deviceType) {
  const ratio = deviceLimit > 0 ? usableWatts / deviceLimit : 0;
  if (usableWatts <= 7) {
    return {
      label: "Slow charge",
      tone: "warn",
      detail: deviceType === "earbuds" ? "Good for small accessories." : "Safe, but charging will feel slow.",
    };
  }
  if (ratio < 0.45) {
    return {
      label: "Underpowered",
      tone: "warn",
      detail: "This charger works, but it is below the device comfort zone.",
    };
  }
  if (ratio < 0.88) {
    return {
      label: "Balanced",
      tone: "good",
      detail: "Good everyday charging speed with controlled heat.",
    };
  }
  return {
    label: "Fast charge",
    tone: "good",
    detail: "Near the device limit. Use a quality cable and avoid heat.",
  };
}

function getPdProfile(voltage, watts) {
  if (voltage >= 28) return "USB-C PD EPR";
  if (voltage >= 20) return watts > 60 ? "USB-C PD laptop" : "USB-C PD 20V";
  if (voltage >= 15) return "USB-C PD 15V";
  if (voltage >= 9) return "Fast charge 9V/12V";
  return "Standard USB 5V";
}

function buildSummary(inputs, results) {
  return [
    "# Charger Wattage Calculator",
    `Device: ${DEVICE_PRESETS[inputs.deviceType].label}`,
    `Charger label: ${inputs.voltage}V x ${inputs.current}A`,
    `Rated wattage: ${formatWatts(results.ratedWatts)}`,
    `Cable-limited wattage: ${formatWatts(results.cableWatts)}`,
    `Device accepted wattage: ${formatWatts(results.deviceWatts)}`,
    `Usable charging wattage: ${formatWatts(results.usableWatts)}`,
    `Battery size: ${formatWh(results.batteryWh)}`,
    `Energy needed: ${formatWh(results.energyNeededWh)}`,
    `Estimated time: ${formatHours(results.chargeHours)}`,
    `Profile: ${results.pdProfile}`,
    `Verdict: ${results.powerClass.label} - ${results.powerClass.detail}`,
  ].join("\n");
}

function MetricCard({ icon: Icon, label, value, detail, tone = "info" }) {
  const toneClass = {
    info: "bg-[var(--section-highlight)] text-[var(--primary)]",
    good: "tool-status-good",
    warn: "tool-status-warn",
    bad: "tool-status-bad",
  }[tone];

  return (
    <article className="tool-card min-w-0 overflow-hidden !p-4 text-center sm:!p-5 xl:!p-6">
      <div className="grid min-w-0 gap-3">
        <span className={`mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg sm:h-11 sm:w-11 ${toneClass}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-[0.68rem] font-bold uppercase tracking-wide text-[var(--muted-foreground)] sm:text-xs">
            {label}
          </p>
          <p className="mt-1 whitespace-nowrap text-2xl font-black leading-tight text-[var(--foreground)] sm:text-[1.7rem]">
            {value}
          </p>
          {detail ? <p className="mt-2 hidden break-words text-sm text-[var(--muted-foreground)] sm:block">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block break-words text-sm font-semibold text-[var(--foreground)]">{label}</span>
      {children}
    </label>
  );
}

function PowerBar({ label, value, max, icon: Icon, detail }) {
  const width = Math.max(4, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  return (
    <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="break-words text-sm font-black text-[var(--foreground)]">{label}</p>
            <p className="mt-1 break-words text-xs text-[var(--muted-foreground)]">{detail}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--section-highlight)] px-3 py-1 text-xs font-black text-[var(--primary)]">
          {formatWatts(value)}
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
        <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function PresetButton({ preset, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(preset)}
      className={`min-w-0 rounded-xl border px-3 py-3 text-sm font-black transition ${
        active
          ? "border-[var(--primary)] bg-[var(--section-highlight)] text-[var(--primary)]"
          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
      }`}
    >
      <span className="block truncate">{preset.label}</span>
    </button>
  );
}

export default function ChargerWattageCalculator() {
  const [inputs, setInputs] = useState({
    deviceType: "phone",
    capacity: 5000,
    capacityUnit: "mAh",
    nominalVoltage: 3.85,
    deviceLimit: 30,
    voltage: 9,
    current: 2,
    cableLimit: 3,
    efficiency: 86,
    startPercent: 20,
    targetPercent: 90,
    ambientTemp: 28,
  });

  const results = useMemo(() => {
    const capacity = Math.max(1, Number(inputs.capacity) || 1);
    const batteryWh =
      inputs.capacityUnit === "Wh"
        ? capacity
        : (capacity * Math.max(3, Number(inputs.nominalVoltage) || 3.85)) / 1000;
    const start = clampNumber(inputs.startPercent, 0, 99, 20);
    const target = Math.max(start + 1, clampNumber(inputs.targetPercent, 1, 100, 90));
    const percentToAdd = target - start;
    const voltage = Math.max(1, Number(inputs.voltage) || 1);
    const current = Math.max(0.1, Number(inputs.current) || 0.1);
    const cableLimit = Math.max(0.1, Number(inputs.cableLimit) || 0.1);
    const deviceLimit = Math.max(1, Number(inputs.deviceLimit) || 1);
    const efficiency = clampNumber(inputs.efficiency, 50, 98, 86) / 100;
    const ratedWatts = voltage * current;
    const cableWatts = voltage * Math.min(current, cableLimit);
    const deviceWatts = Math.min(cableWatts, deviceLimit);
    const usableWatts = Math.max(0.1, deviceWatts * efficiency);
    const energyNeededWh = batteryWh * (percentToAdd / 100);
    const taperPenalty = target > 80 ? 1 + ((target - 80) / 20) * 0.22 : 1;
    const lowBatteryBoost = start < 10 ? 0.95 : 1;
    const chargeHours = (energyNeededWh / usableWatts) * taperPenalty * lowBatteryBoost;
    const fullChargeHours = (batteryWh / usableWatts) * 1.22;
    const wattsPerWh = usableWatts / Math.max(1, batteryWh);
    const powerClass = getPowerClass(usableWatts, deviceLimit, inputs.deviceType);
    const cableLimited = cableLimit < current;
    const deviceLimited = deviceLimit < cableWatts;
    const heatRisk =
      inputs.ambientTemp >= 38 || usableWatts / deviceLimit > 0.93
        ? "High attention"
        : inputs.ambientTemp >= 32 || usableWatts / deviceLimit > 0.75
          ? "Warm zone"
          : "Comfortable";
    const heatTone = heatRisk === "High attention" ? "bad" : heatRisk === "Warm zone" ? "warn" : "good";
    const pdProfile = getPdProfile(voltage, ratedWatts);
    const maxStageWatts = Math.max(ratedWatts, cableWatts, deviceWatts, usableWatts, 1);

    return {
      batteryWh,
      start,
      target,
      percentToAdd,
      ratedWatts,
      cableWatts,
      deviceWatts,
      usableWatts,
      energyNeededWh,
      chargeHours,
      fullChargeHours,
      wattsPerWh,
      powerClass,
      cableLimited,
      deviceLimited,
      heatRisk,
      heatTone,
      pdProfile,
      maxStageWatts,
    };
  }, [inputs]);

  const updateInput = (key, value) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const applyDevicePreset = (key) => {
    const preset = DEVICE_PRESETS[key];
    setInputs((current) => ({
      ...current,
      deviceType: key,
      capacity: preset.capacity,
      capacityUnit: preset.capacityUnit,
      nominalVoltage: preset.nominalVoltage,
      deviceLimit: preset.deviceLimit,
      startPercent: preset.startPercent,
      targetPercent: preset.targetPercent,
    }));
  };

  const applyChargerPreset = (preset) => {
    setInputs((current) => ({
      ...current,
      voltage: preset.voltage,
      current: preset.current,
      cableLimit: preset.cable,
      deviceLimit: Math.max(current.deviceLimit, Math.min(preset.deviceLimit, 100)),
    }));
  };

  const copySummary = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildSummary(inputs, results));
    }
  };

  const exportCsv = () => {
    const rows = [
      ["Metric", "Value"],
      ["Device", DEVICE_PRESETS[inputs.deviceType].label],
      ["Rated wattage", formatWatts(results.ratedWatts)],
      ["Cable-limited wattage", formatWatts(results.cableWatts)],
      ["Device accepted wattage", formatWatts(results.deviceWatts)],
      ["Usable charging wattage", formatWatts(results.usableWatts)],
      ["Battery size", formatWh(results.batteryWh)],
      ["Energy needed", formatWh(results.energyNeededWh)],
      ["Charge time", formatHours(results.chargeHours)],
      ["Full charge estimate", formatHours(results.fullChargeHours)],
      ["PD profile", results.pdProfile],
      ["Verdict", results.powerClass.label],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadFile("charger-wattage-calculator.csv", csv, "text/csv");
  };

  const resetSample = () => {
    setInputs({
      deviceType: "phone",
      capacity: 5000,
      capacityUnit: "mAh",
      nominalVoltage: 3.85,
      deviceLimit: 30,
      voltage: 9,
      current: 2,
      cableLimit: 3,
      efficiency: 86,
      startPercent: 20,
      targetPercent: 90,
      ambientTemp: 28,
    });
  };

  const DeviceIcon = DEVICE_PRESETS[inputs.deviceType].icon;
  const isActivePreset = (preset) =>
    Number(inputs.voltage) === preset.voltage && Number(inputs.current) === preset.current;

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate">Charging power planner</span>
            </span>
            <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
              results.powerClass.tone === "good" ? "tool-status-good" : "tool-status-warn"
            }`}>
              {results.powerClass.tone === "good" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
              {results.powerClass.label}
            </span>
          </div>
          <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-3xl sm:text-5xl">
            Charger Wattage Calculator
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
            Decode charger labels, compare cable limits, estimate charging time, and find whether your USB-C or adapter setup is safe and fast enough for your device.
          </p>
        </div>

        <section className="tool-card-grid mx-auto mt-8 w-full max-w-6xl">
          <MetricCard icon={PlugZap} label="Rated Output" value={formatWatts(results.ratedWatts)} detail={`${inputs.voltage}V x ${inputs.current}A charger label.`} />
          <MetricCard icon={Cable} label="After Cable Limit" value={formatWatts(results.cableWatts)} detail={results.cableLimited ? "Cable rating is limiting the charger." : "Cable can carry this current."} tone={results.cableLimited ? "warn" : "good"} />
          <MetricCard icon={BatteryCharging} label="Usable Power" value={formatWatts(results.usableWatts)} detail={`${Math.round(inputs.efficiency)}% efficiency after conversion loss.`} tone="good" />
          <MetricCard icon={Gauge} label="Charge Time" value={formatHours(results.chargeHours)} detail={`${results.start}% to ${results.target}% for ${formatWh(results.batteryWh)} battery.`} />
        </section>
      </header>

      <section className="mt-8 grid min-w-0 gap-6">
        <div className="tool-feature-grid min-w-0">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <DeviceIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Device Battery</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{DEVICE_PRESETS[inputs.deviceType].note}</p>
              </div>
            </div>

            <div className="tool-tab-grid mb-5 min-w-0">
              {Object.entries(DEVICE_PRESETS).map(([key, preset]) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyDevicePreset(key)}
                    className={`min-w-0 rounded-xl border px-3 py-3 text-left transition ${
                      inputs.deviceType === key
                        ? "border-[var(--primary)] bg-[var(--section-highlight)] text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <Icon className="mb-2 h-4 w-4" />
                    <span className="block truncate text-sm font-black">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <Field label="Battery capacity">
                <input
                  type="number"
                  min="1"
                  value={inputs.capacity}
                  onChange={(event) => updateInput("capacity", Math.max(1, Number(event.target.value) || 1))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Capacity unit">
                <select
                  value={inputs.capacityUnit}
                  onChange={(event) => updateInput("capacityUnit", event.target.value)}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  <option value="mAh">mAh</option>
                  <option value="Wh">Wh</option>
                </select>
              </Field>
              <Field label="Battery nominal voltage">
                <input
                  type="number"
                  min="3"
                  step="0.01"
                  value={inputs.nominalVoltage}
                  onChange={(event) => updateInput("nominalVoltage", Math.max(3, Number(event.target.value) || 3.85))}
                  disabled={inputs.capacityUnit === "Wh"}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] disabled:opacity-60"
                />
              </Field>
              <Field label="Device max accepted watts">
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={inputs.deviceLimit}
                  onChange={(event) => updateInput("deviceLimit", clampNumber(event.target.value, 1, 240, 30))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Usb className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Charger Label</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Pick a common adapter label or enter your own voltage and current.</p>
              </div>
            </div>

            <div className="mb-5 grid min-w-0 grid-cols-2 gap-2 md:grid-cols-3">
              {CHARGER_PRESETS.map((preset) => (
                <PresetButton key={preset.label} preset={preset} active={isActivePreset(preset)} onClick={applyChargerPreset} />
              ))}
            </div>

            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <Field label="Voltage (V)">
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={inputs.voltage}
                  onChange={(event) => updateInput("voltage", Math.max(1, Number(event.target.value) || 1))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Current (A)">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={inputs.current}
                  onChange={(event) => updateInput("current", Math.max(0.1, Number(event.target.value) || 0.1))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Cable current limit (A)">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={inputs.cableLimit}
                  onChange={(event) => updateInput("cableLimit", Math.max(0.1, Number(event.target.value) || 0.1))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
              <Field label="Efficiency (%)">
                <input
                  type="number"
                  min="50"
                  max="98"
                  value={inputs.efficiency}
                  onChange={(event) => updateInput("efficiency", clampNumber(event.target.value, 50, 98, 86))}
                  className="h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
              </Field>
            </div>

            <div className="tool-action-grid mt-7">
              <button type="button" className="btn-primary" onClick={copySummary}>
                <Clipboard className="h-4 w-4" />
                Copy Summary
              </button>
              <button type="button" className="btn-secondary" onClick={exportCsv}>
                <Download className="h-4 w-4" />
                CSV
              </button>
              <button type="button" className="btn-secondary" onClick={resetSample}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </article>
        </div>

        <div className="grid min-w-0 gap-6">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Zap className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Power Path Result</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{results.powerClass.detail}</p>
              </div>
            </div>

            <div className="grid min-w-0 gap-3">
              <PowerBar icon={PlugZap} label="Adapter rated output" value={results.ratedWatts} max={results.maxStageWatts} detail="Voltage multiplied by current." />
              <PowerBar icon={Cable} label="Cable-limited output" value={results.cableWatts} max={results.maxStageWatts} detail={results.cableLimited ? "Cable amp rating is the bottleneck." : "Cable rating is enough for this adapter."} />
              <PowerBar icon={ShieldCheck} label="Device accepted power" value={results.deviceWatts} max={results.maxStageWatts} detail={results.deviceLimited ? "Device limit prevents using full charger power." : "Device can accept the available cable power."} />
              <PowerBar icon={BatteryCharging} label="Usable battery-side power" value={results.usableWatts} max={results.maxStageWatts} detail="After conversion loss and heat overhead." />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className={`rounded-xl border p-4 ${results.powerClass.tone === "good" ? "tool-callout-good" : "tool-callout-warn"}`}>
                <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-3 text-sm font-black text-[var(--foreground)]">{results.powerClass.label}</p>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{results.powerClass.detail}</p>
              </div>
              <div className={`rounded-xl border p-4 ${results.heatTone === "good" ? "tool-callout-good" : results.heatTone === "warn" ? "tool-callout-warn" : "tool-callout-bad"}`}>
                <AlertTriangle className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-3 text-sm font-black text-[var(--foreground)]">Heat signal: {results.heatRisk}</p>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  {results.heatRisk === "Comfortable" ? "Good for daily use." : "Avoid charging under pillow, direct sun, or heavy gaming."}
                </p>
              </div>
            </div>
          </article>

          <section className="grid min-w-0 gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
            <article className="tool-card min-w-0 overflow-hidden">
              <div className="mb-5 flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <BatteryCharging className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Charge Window</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Estimate time for your selected battery start and target level.</p>
                </div>
              </div>

              <div className="grid min-w-0 gap-5 md:grid-cols-2">
                <Field label={`Start battery: ${results.start}%`}>
                  <input
                    type="range"
                    min="0"
                    max="99"
                    value={inputs.startPercent}
                    onChange={(event) => updateInput("startPercent", clampNumber(event.target.value, 0, 99, 20))}
                    className="w-full accent-[var(--primary)]"
                  />
                </Field>
                <Field label={`Target battery: ${results.target}%`}>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={inputs.targetPercent}
                    onChange={(event) => updateInput("targetPercent", clampNumber(event.target.value, 1, 100, 90))}
                    className="w-full accent-[var(--primary)]"
                  />
                </Field>
              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-[var(--muted-foreground)]">
                  <span>{results.start}%</span>
                  <span>{results.target}%</span>
                </div>
                <div className="relative h-4 overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="absolute bottom-0 top-0 rounded-full bg-[var(--primary)]"
                    style={{ left: `${results.start}%`, width: `${Math.max(2, results.percentToAdd)}%` }}
                  />
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-[var(--section-highlight)] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Selected charge time</p>
                    <p className="mt-2 text-2xl font-black text-[var(--foreground)]">{formatHours(results.chargeHours)}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--section-highlight)] p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">0 to 100 estimate</p>
                    <p className="mt-2 text-2xl font-black text-[var(--foreground)]">{formatHours(results.fullChargeHours)}</p>
                  </div>
                </div>
              </div>
            </article>

            <article className="tool-card min-w-0 overflow-hidden">
              <div className="mb-5 flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Compatibility Notes</h2>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">Quick checks before you trust a charger, cable, or power bank.</p>
                </div>
              </div>

              <div className="grid min-w-0 gap-3">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Detected profile</p>
                  <p className="mt-2 break-words text-xl font-black text-[var(--foreground)]">{results.pdProfile}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Battery size</p>
                  <p className="mt-2 break-words text-xl font-black text-[var(--foreground)]">{formatWh(results.batteryWh)}</p>
                  <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">{results.wattsPerWh.toFixed(2)} W per Wh effective charge rate.</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">Ambient temperature</p>
                  <input
                    type="number"
                    min="0"
                    max="55"
                    value={inputs.ambientTemp}
                    onChange={(event) => updateInput("ambientTemp", clampNumber(event.target.value, 0, 55, 28))}
                    className="mt-2 h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </div>
              </div>
            </article>
          </section>

          <section className="grid min-w-0 gap-6 2xl:grid-cols-3">
            <article className="tool-card min-w-0 overflow-hidden !p-5">
              <Cable className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="mt-3 break-words text-lg font-black text-[var(--foreground)]">Cable Rule</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">For 60W plus charging, use a USB-C cable rated for 3A or 5A with proper e-marker support.</p>
            </article>
            <article className="tool-card min-w-0 overflow-hidden !p-5">
              <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="mt-3 break-words text-lg font-black text-[var(--foreground)]">Safety Rule</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">A higher watt charger is okay only when the device negotiates power correctly.</p>
            </article>
            <article className="tool-card min-w-0 overflow-hidden !p-5">
              <BatteryCharging className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="mt-3 break-words text-lg font-black text-[var(--foreground)]">Battery Rule</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">Charging from 80% to 100% is slower because devices taper power to protect battery health.</p>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
