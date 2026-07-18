"use client";

import { useMemo, useState } from "react";
import {
  AirVent,
  Check,
  Copy,
  FileDown,
  Info,
  Lightbulb,
  RotateCcw,
  Sun,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const BASE_BTU_PER_SQFT = 34;
const OCCUPANT_BTU = 600;
const GLASS_SUNNY_BTU = 165;
const GLASS_SHADED_BTU = 55;
const WINDOW_INFILTRATION_BTU = 150;
const ROOF_BTU_PER_SQFT = 28;
const WEST_FACING_FACTOR = 0.08;
const WATT_TO_BTU = 3.412;
const BTU_PER_TON = 12000;

const CLIMATE_ZONES = [
  {
    id: "hot-dry",
    label: "Hot & dry",
    factor: 1.1,
    blurb: "43-47°C peak, low humidity. Heavy sensible load, light dehumidification.",
    cities: "Delhi, Jaipur, Ahmedabad, Nagpur",
  },
  {
    id: "hot-humid",
    label: "Hot & humid",
    factor: 1.15,
    blurb: "35-38°C but 70-85% RH. Latent (moisture) load dominates the compressor.",
    cities: "Mumbai, Chennai, Kolkata, Kochi",
  },
  {
    id: "moderate",
    label: "Moderate",
    factor: 0.92,
    blurb: "Rarely above 35°C. Smaller units cope comfortably year round.",
    cities: "Bengaluru, Pune, Shillong, Dehradun",
  },
  {
    id: "composite",
    label: "Composite",
    factor: 1.05,
    blurb: "Hot-dry summer, humid monsoon, cold winter. Sized for the summer peak.",
    cities: "Lucknow, Bhopal, Patna, Kanpur",
  },
];

const CITIES = [
  { name: "Delhi", zone: "hot-dry" },
  { name: "Jaipur", zone: "hot-dry" },
  { name: "Ahmedabad", zone: "hot-dry" },
  { name: "Nagpur", zone: "hot-dry" },
  { name: "Jodhpur", zone: "hot-dry" },
  { name: "Gurugram", zone: "hot-dry" },
  { name: "Noida", zone: "hot-dry" },
  { name: "Mumbai", zone: "hot-humid" },
  { name: "Chennai", zone: "hot-humid" },
  { name: "Kolkata", zone: "hot-humid" },
  { name: "Kochi", zone: "hot-humid" },
  { name: "Visakhapatnam", zone: "hot-humid" },
  { name: "Goa (Panaji)", zone: "hot-humid" },
  { name: "Thiruvananthapuram", zone: "hot-humid" },
  { name: "Surat", zone: "hot-humid" },
  { name: "Bengaluru", zone: "moderate" },
  { name: "Pune", zone: "moderate" },
  { name: "Dehradun", zone: "moderate" },
  { name: "Shillong", zone: "moderate" },
  { name: "Mysuru", zone: "moderate" },
  { name: "Lucknow", zone: "composite" },
  { name: "Bhopal", zone: "composite" },
  { name: "Patna", zone: "composite" },
  { name: "Kanpur", zone: "composite" },
  { name: "Indore", zone: "composite" },
  { name: "Hyderabad", zone: "composite" },
  { name: "Chandigarh", zone: "composite" },
  { name: "Raipur", zone: "composite" },
];

const INSULATION = [
  {
    id: "poor",
    label: "Poor",
    factor: 0.12,
    blurb: "Single-brick or sheet walls, no false ceiling, thin single-glazed windows.",
  },
  {
    id: "average",
    label: "Average",
    factor: 0,
    blurb: "Standard 9-inch brick / RCC, plain glass, curtains on some windows.",
  },
  {
    id: "good",
    label: "Good",
    factor: -0.08,
    blurb: "False ceiling or roof insulation, thick curtains or double glazing, shaded walls.",
  },
];

const APPLIANCES = [
  { id: "tv", label: "TV + set-top box", watts: 120 },
  { id: "lights", label: "Lights (room)", watts: 100 },
  { id: "laptop", label: "Laptop", watts: 65 },
  { id: "desktop", label: "Desktop + monitor", watts: 250 },
  { id: "fridge", label: "Fridge in room", watts: 200 },
  { id: "kitchen", label: "Open kitchen / cooking", watts: 1200 },
  { id: "server", label: "Server / network rack", watts: 800 },
  { id: "console", label: "Gaming console", watts: 150 },
];

const STANDARD_TONS = [0.8, 1, 1.5, 2, 2.5];

const ISEER = {
  inverter: { 3: 3.7, 4: 4.2, 5: 4.8 },
  fixed: { 3: 3.2, 4: 3.4, 5: 3.6 },
};

const STAR_PRICE_DELTA = { 3: 0, 4: 3500, 5: 8000 };

const PRESETS = [
  {
    label: "Delhi top-floor bedroom",
    state: { length: 12, width: 12, height: 10, city: "Delhi", zone: "hot-dry", topFloor: true, sunlight: true, westFacing: true, windowArea: 15, windowCount: 1, occupants: 2, insulation: "average", appliances: ["tv", "lights"] },
  },
  {
    label: "Mumbai 1BHK hall",
    state: { length: 15, width: 12, height: 10, city: "Mumbai", zone: "hot-humid", topFloor: false, sunlight: false, westFacing: false, windowArea: 24, windowCount: 2, occupants: 4, insulation: "average", appliances: ["tv", "lights", "fridge"] },
  },
  {
    label: "Bengaluru work-from-home room",
    state: { length: 10, width: 11, height: 10, city: "Bengaluru", zone: "moderate", topFloor: false, sunlight: false, westFacing: false, windowArea: 12, windowCount: 1, occupants: 1, insulation: "good", appliances: ["desktop", "lights"] },
  },
];

const DEFAULTS = {
  length: 12,
  width: 12,
  height: 10,
  city: "Delhi",
  zone: "hot-dry",
  topFloor: true,
  sunlight: true,
  westFacing: false,
  windowArea: 15,
  windowCount: 1,
  occupants: 2,
  insulation: "average",
  appliances: ["tv", "lights"],
};

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const num = (value, digits = 0) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(
    Number.isFinite(value) ? value : 0
  );

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function Toggle({ label, hint, checked, onChange, Icon }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left transition ${
        checked
          ? "border-[var(--primary)] bg-[var(--muted)]"
          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
          checked
            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "border-[var(--border)]"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {Icon && <Icon className="h-3.5 w-3.5 text-[var(--primary)]" />}
          {label}
        </span>
        <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">{hint}</span>
      </span>
    </button>
  );
}

function NumberField({ label, value, onChange, min = 0, max = 100, step = 1, suffix }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <div className="relative mt-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-14 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--muted-foreground)]">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

export default function ToolHome() {
  const [length, setLength] = useState(DEFAULTS.length);
  const [width, setWidth] = useState(DEFAULTS.width);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [city, setCity] = useState(DEFAULTS.city);
  const [zone, setZone] = useState(DEFAULTS.zone);
  const [topFloor, setTopFloor] = useState(DEFAULTS.topFloor);
  const [sunlight, setSunlight] = useState(DEFAULTS.sunlight);
  const [westFacing, setWestFacing] = useState(DEFAULTS.westFacing);
  const [windowArea, setWindowArea] = useState(DEFAULTS.windowArea);
  const [windowCount, setWindowCount] = useState(DEFAULTS.windowCount);
  const [occupants, setOccupants] = useState(DEFAULTS.occupants);
  const [insulation, setInsulation] = useState(DEFAULTS.insulation);
  const [appliances, setAppliances] = useState(DEFAULTS.appliances);
  const [otherWatts, setOtherWatts] = useState(0);

  const [stars, setStars] = useState(5);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [tariff, setTariff] = useState(8);
  const [copied, setCopied] = useState(false);

  const load = useMemo(() => {
    const len = Math.max(0, Number(length) || 0);
    const wid = Math.max(0, Number(width) || 0);
    const hgt = Math.max(1, Number(height) || 10);
    const area = len * wid;
    const heightFactor = hgt / 10;

    const zoneInfo = CLIMATE_ZONES.find((item) => item.id === zone) || CLIMATE_ZONES[0];
    const insulationInfo = INSULATION.find((item) => item.id === insulation) || INSULATION[1];

    const baseLoad = area * BASE_BTU_PER_SQFT * heightFactor;
    const occupantLoad = Math.max(0, Number(occupants) || 0) * OCCUPANT_BTU;
    const glassRate = sunlight ? GLASS_SUNNY_BTU : GLASS_SHADED_BTU;
    const glassLoad = Math.max(0, Number(windowArea) || 0) * glassRate;
    const infiltrationLoad = Math.max(0, Number(windowCount) || 0) * WINDOW_INFILTRATION_BTU;
    const applianceWatts =
      APPLIANCES.filter((item) => appliances.includes(item.id)).reduce((sum, item) => sum + item.watts, 0) +
      Math.max(0, Number(otherWatts) || 0);
    const applianceLoad = applianceWatts * WATT_TO_BTU;
    const roofLoad = topFloor ? area * ROOF_BTU_PER_SQFT : 0;
    const westLoad = westFacing ? baseLoad * WEST_FACING_FACTOR : 0;
    const insulationLoad = baseLoad * insulationInfo.factor;

    const rows = [
      {
        key: "base",
        label: "Room fabric + air changes",
        detail: `${num(area)} sq ft × ${BASE_BTU_PER_SQFT} BTU/sq ft × ${num(heightFactor, 2)} height factor`,
        btu: baseLoad,
      },
      {
        key: "occupants",
        label: "People in the room",
        detail: `${num(Math.max(0, Number(occupants) || 0))} × ${OCCUPANT_BTU} BTU each (body heat + moisture)`,
        btu: occupantLoad,
      },
      {
        key: "glass",
        label: sunlight ? "Solar gain through glass (direct sun)" : "Solar gain through glass (shaded)",
        detail: `${num(Math.max(0, Number(windowArea) || 0))} sq ft glass × ${glassRate} BTU/sq ft`,
        btu: glassLoad,
      },
      {
        key: "infiltration",
        label: "Window leakage",
        detail: `${num(Math.max(0, Number(windowCount) || 0))} window(s) × ${WINDOW_INFILTRATION_BTU} BTU`,
        btu: infiltrationLoad,
      },
      {
        key: "appliances",
        label: "Appliances + lights",
        detail: `${num(applianceWatts)} W × ${WATT_TO_BTU} BTU per watt`,
        btu: applianceLoad,
      },
    ];

    if (topFloor) {
      rows.push({
        key: "roof",
        label: "Top-floor roof gain",
        detail: `${num(area)} sq ft roof × ${ROOF_BTU_PER_SQFT} BTU/sq ft (sun-baked RCC slab)`,
        btu: roofLoad,
      });
    }
    if (westFacing) {
      rows.push({
        key: "west",
        label: "West-facing wall",
        detail: `+${Math.round(WEST_FACING_FACTOR * 100)}% of fabric load (peak afternoon sun)`,
        btu: westLoad,
      });
    }
    if (insulationInfo.factor !== 0) {
      rows.push({
        key: "insulation",
        label: `${insulationInfo.label} insulation`,
        detail: `${insulationInfo.factor > 0 ? "+" : ""}${Math.round(insulationInfo.factor * 100)}% of fabric load`,
        btu: insulationLoad,
      });
    }

    const subtotal = rows.reduce((sum, row) => sum + row.btu, 0);
    const total = subtotal * zoneInfo.factor;
    const tons = total / BTU_PER_TON;

    const recommended = STANDARD_TONS.find((size) => size >= tons - 0.03) || null;
    const units = recommended ? 1 : Math.ceil(tons / 2.5);

    return {
      area,
      heightFactor,
      zoneInfo,
      insulationInfo,
      rows,
      subtotal,
      total,
      tons,
      recommended,
      units,
      applianceWatts,
    };
  }, [
    length,
    width,
    height,
    zone,
    insulation,
    occupants,
    sunlight,
    windowArea,
    windowCount,
    appliances,
    otherWatts,
    topFloor,
    westFacing,
  ]);

  const running = useMemo(() => {
    const totalTons = load.recommended || Math.max(0.8, load.tons);
    const coolingWatts = totalTons * BTU_PER_TON * 0.293071;
    const hours = Math.max(0, Number(hoursPerDay) || 0);
    const rate = Math.max(0, Number(tariff) || 0);

    const forType = (type, star) => {
      const iseer = ISEER[type][star];
      const drawKw = coolingWatts / iseer / 1000;
      const unitsMonth = drawKw * hours * 30;
      return { iseer, drawKw, unitsMonth, bill: unitsMonth * rate };
    };

    const table = [3, 4, 5].map((star) => ({
      star,
      inverter: forType("inverter", star),
      fixed: forType("fixed", star),
    }));

    const selected = forType("inverter", stars);
    const selectedFixed = forType("fixed", stars);
    const baseline = forType("inverter", 3);
    const monthlySaving = baseline.bill - selected.bill;
    const priceDelta = STAR_PRICE_DELTA[stars] || 0;
    const paybackMonths = monthlySaving > 0 ? priceDelta / monthlySaving : null;
    const inverterSaving = selectedFixed.bill - selected.bill;

    return {
      tons: totalTons,
      coolingWatts,
      table,
      selected,
      selectedFixed,
      baseline,
      monthlySaving,
      priceDelta,
      paybackMonths,
      inverterSaving,
    };
  }, [load, stars, hoursPerDay, tariff]);

  const toggleAppliance = (id) => {
    setAppliances((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const applyPreset = (preset) => {
    const s = preset.state;
    setLength(s.length);
    setWidth(s.width);
    setHeight(s.height);
    setCity(s.city);
    setZone(s.zone);
    setTopFloor(s.topFloor);
    setSunlight(s.sunlight);
    setWestFacing(s.westFacing);
    setWindowArea(s.windowArea);
    setWindowCount(s.windowCount);
    setOccupants(s.occupants);
    setInsulation(s.insulation);
    setAppliances(s.appliances);
    setOtherWatts(0);
  };

  const report = useMemo(() => {
    const lines = [
      "AC Tonnage Sizing Report",
      "",
      `Room: ${num(length)} ft × ${num(width)} ft × ${num(height)} ft = ${num(load.area)} sq ft`,
      `City / climate: ${city === "custom" ? "Custom" : city} (${load.zoneInfo.label}, factor ${load.zoneInfo.factor})`,
      `Occupants: ${num(occupants)} · Windows: ${num(windowCount)} (${num(windowArea)} sq ft glass)`,
      `Top floor: ${topFloor ? "Yes" : "No"} · Direct sun: ${sunlight ? "Yes" : "No"} · West-facing: ${westFacing ? "Yes" : "No"}`,
      `Insulation: ${load.insulationInfo.label} · Appliance heat: ${num(load.applianceWatts)} W`,
      "",
      "Load breakdown (BTU/hr)",
      ...load.rows.map((row) => `  ${row.label}: ${num(row.btu)}  [${row.detail}]`),
      `  Subtotal: ${num(load.subtotal)}`,
      `  × ${load.zoneInfo.label} climate factor ${load.zoneInfo.factor}: ${num(load.total)}`,
      "",
      `Calculated load: ${num(load.total)} BTU/hr = ${num(load.tons, 2)} ton`,
      `Recommended size: ${load.recommended ? `${load.recommended} ton` : `${load.units} units (${num(load.tons, 2)} ton total)`}`,
      "",
      `Running cost — ${running.tons} ton, ${stars} star inverter (ISEER ${running.selected.iseer})`,
      `  Average power draw: ${num(running.selected.drawKw, 2)} kW`,
      `  ${num(hoursPerDay)} hrs/day × 30 days = ${num(running.selected.unitsMonth)} units`,
      `  At ${inr(tariff)}/unit → ${inr(running.selected.bill)} per month`,
      `  Same size fixed-speed ${stars} star (ISEER ${running.selectedFixed.iseer}) → ${inr(running.selectedFixed.bill)} per month`,
      `  Inverter saves ${inr(running.inverterSaving)} per month`,
      "",
      "Method: base 34 BTU/sq ft (Indian brick/RCC construction at 43-45°C design outdoor temp, includes wall/floor",
      "conduction and air-change load) × height/10 · 600 BTU per person · glass 165 BTU/sq ft in direct sun, 55 shaded ·",
      "150 BTU per window for leakage · appliances at 3.412 BTU per watt · top-floor roof 28 BTU/sq ft · climate multiplier.",
      "1 ton = 12,000 BTU/hr. Running cost uses BEE ISEER bands; a real quote should follow a site survey.",
      "",
      `Generated: ${new Date().toLocaleString()}`,
    ];
    return lines.join("\n");
  }, [
    length,
    width,
    height,
    city,
    load,
    occupants,
    windowCount,
    windowArea,
    topFloor,
    sunlight,
    westFacing,
    running,
    stars,
    hoursPerDay,
    tariff,
  ]);

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const resetAll = () => applyPreset({ state: DEFAULTS });

  const maxRowBtu = Math.max(...load.rows.map((row) => Math.abs(row.btu)), 1);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <AirVent className="h-4 w-4" />
            Cooling load sizing
          </div>
          <h1 className="text-4xl font-semibold leading-tight">AC Tonnage Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Work out the real cooling load of your room instead of guessing. Dimensions, sun, windows, people,
            appliances, and your city&apos;s climate all shift the answer &mdash; and both an undersized and an
            oversized AC will cost you.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Room</h2>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <NumberField label="Length" value={length} onChange={setLength} min={1} max={80} suffix="ft" />
                <NumberField label="Width" value={width} onChange={setWidth} min={1} max={80} suffix="ft" />
                <NumberField label="Height" value={height} onChange={setHeight} min={6} max={20} suffix="ft" />
              </div>
              <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                Floor area <span className="font-semibold text-[var(--foreground)]">{num(load.area)} sq ft</span> ·
                volume {num(load.area * height)} cu ft · height factor {num(load.heightFactor, 2)}× (10 ft is the
                baseline)
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <NumberField label="People in the room" value={occupants} onChange={setOccupants} min={0} max={30} />
                <NumberField label="Number of windows" value={windowCount} onChange={setWindowCount} min={0} max={20} />
              </div>
              <div className="mt-4">
                <NumberField
                  label="Total window glass area"
                  value={windowArea}
                  onChange={setWindowArea}
                  min={0}
                  max={400}
                  suffix="sq ft"
                />
                <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                  A standard 4 ft × 4 ft window is about 16 sq ft.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-3 text-sm font-semibold">Exposure</h2>
              <div className="grid gap-2">
                <Toggle
                  label="Top floor"
                  hint="Roof slab bakes all afternoon and radiates into the room at night."
                  checked={topFloor}
                  onChange={setTopFloor}
                  Icon={Sun}
                />
                <Toggle
                  label="Direct sunlight on windows"
                  hint="Unshaded glass triples the solar gain versus a shaded window."
                  checked={sunlight}
                  onChange={setSunlight}
                  Icon={Sun}
                />
                <Toggle
                  label="West-facing wall"
                  hint="Catches the harshest 3-6 pm sun, exactly when you want the room cold."
                  checked={westFacing}
                  onChange={setWestFacing}
                  Icon={Sun}
                />
              </div>

              <h3 className="mb-2 mt-5 text-sm font-semibold">Insulation quality</h3>
              <div className="grid gap-2">
                {INSULATION.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInsulation(item.id)}
                    className={`rounded-md border px-3 py-2.5 text-left transition ${
                      insulation === item.id
                        ? "border-[var(--primary)] bg-[var(--muted)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                      {item.label}
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {item.factor > 0 ? "+" : ""}
                        {Math.round(item.factor * 100)}%
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">{item.blurb}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-3 text-sm font-semibold">City &amp; climate zone</h2>
              <label className="block">
                <span className="text-sm font-semibold">Your city</span>
                <select
                  value={city}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCity(value);
                    const match = CITIES.find((item) => item.name === value);
                    if (match) setZone(match.zone);
                  }}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                >
                  {CLIMATE_ZONES.map((zoneItem) => (
                    <optgroup key={zoneItem.id} label={zoneItem.label}>
                      {CITIES.filter((item) => item.zone === zoneItem.id).map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                  <option value="custom">Other / pick a zone manually</option>
                </select>
              </label>

              <div className="mt-4 grid gap-2">
                {CLIMATE_ZONES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setZone(item.id);
                      setCity("custom");
                    }}
                    className={`rounded-md border px-3 py-2.5 text-left transition ${
                      zone === item.id
                        ? "border-[var(--primary)] bg-[var(--muted)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                      {item.label}
                      <span className="text-xs text-[var(--muted-foreground)]">×{item.factor}</span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">{item.blurb}</span>
                    <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{item.cities}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-1 text-sm font-semibold">Heat-generating appliances</h2>
              <p className="mb-3 text-xs text-[var(--muted-foreground)]">
                Every watt an appliance draws ends up as heat the AC has to remove.
              </p>
              <div className="flex flex-wrap gap-2">
                {APPLIANCES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAppliance(item.id)}
                    aria-pressed={appliances.includes(item.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      appliances.includes(item.id)
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label} · {item.watts} W
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <NumberField
                  label="Other equipment"
                  value={otherWatts}
                  onChange={setOtherWatts}
                  min={0}
                  max={20000}
                  step={50}
                  suffix="W"
                />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="mb-3 text-sm font-semibold">Quick presets</h2>
              <div className="grid gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Recommended size</p>
                  <p className="mt-2 text-5xl font-semibold text-[var(--primary)]" aria-live="polite">
                    {load.recommended ? `${load.recommended} ton` : `${load.units} × 2.5 ton`}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                    Calculated load {num(load.total)} BTU/hr = {num(load.tons, 2)} ton · 1 ton = 12,000 BTU/hr
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy report"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTextFile("ac-tonnage-sizing-report.txt", report)}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <FileDown className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {STANDARD_TONS.map((size) => {
                  const isPick = load.recommended === size;
                  const tooSmall = size < load.tons - 0.03;
                  return (
                    <span
                      key={size}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        isPick
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                      }`}
                    >
                      {isPick && <Check className="h-3.5 w-3.5" />}
                      {size} ton
                      {!isPick && (
                        <span className="opacity-70">{tooSmall ? "undersized" : "oversized"}</span>
                      )}
                    </span>
                  );
                })}
              </div>

              {!load.recommended && (
                <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  This load is beyond a single standard split AC. Split it across {load.units} units so each one runs
                  in its own zone &mdash; one huge unit in a large hall leaves cold and hot pockets.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <h2 className="text-sm font-semibold">Load breakdown</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Every line is a real heat source. Change an input and watch which one dominates.
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="px-2 py-2 font-semibold">Heat source</th>
                      <th className="px-2 py-2 font-semibold">How it is worked out</th>
                      <th className="px-2 py-2 text-right font-semibold">BTU/hr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {load.rows.map((row) => (
                      <tr key={row.key} className="border-b border-[var(--border)] align-top">
                        <td className="px-2 py-3">
                          <span className="font-semibold">{row.label}</span>
                          <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${Math.min(100, (Math.abs(row.btu) / maxRowBtu) * 100)}%`,
                                background: row.btu < 0 ? "var(--anslation-ds-success)" : "var(--primary)",
                              }}
                            />
                          </span>
                        </td>
                        <td className="px-2 py-3 text-xs text-[var(--muted-foreground)]">{row.detail}</td>
                        <td className="whitespace-nowrap px-2 py-3 text-right font-semibold">
                          {row.btu < 0 ? "−" : ""}
                          {num(Math.abs(row.btu))}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-b border-[var(--border)]">
                      <td className="px-2 py-3 font-semibold">Subtotal</td>
                      <td className="px-2 py-3 text-xs text-[var(--muted-foreground)]">Sum of all heat sources</td>
                      <td className="px-2 py-3 text-right font-semibold">{num(load.subtotal)}</td>
                    </tr>
                    <tr className="border-b border-[var(--border)]">
                      <td className="px-2 py-3 font-semibold">{load.zoneInfo.label} climate factor</td>
                      <td className="px-2 py-3 text-xs text-[var(--muted-foreground)]">
                        × {load.zoneInfo.factor} &mdash; {load.zoneInfo.blurb}
                      </td>
                      <td className="px-2 py-3 text-right font-semibold">×{load.zoneInfo.factor}</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-3 text-base font-semibold">Total cooling load</td>
                      <td className="px-2 py-3 text-xs text-[var(--muted-foreground)]">
                        ÷ 12,000 = {num(load.tons, 2)} ton
                      </td>
                      <td className="px-2 py-3 text-right text-base font-semibold text-[var(--primary)]">
                        {num(load.total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">Undersized and oversized both hurt</h2>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                    Too small
                  </p>
                  <ul className="mt-2 grid gap-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                    <li>Compressor runs flat out and never reaches the set point on the hottest days.</li>
                    <li>Runs 100% of the time, so the bill is high anyway &mdash; you just stay warm too.</li>
                    <li>Constant full-load operation shortens compressor life.</li>
                  </ul>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-sm font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                    Too big
                  </p>
                  <ul className="mt-2 grid gap-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                    <li>
                      <span className="font-semibold text-[var(--foreground)]">Short-cycling</span> &mdash; hits the set
                      temperature in minutes, shuts off, restarts. Each start is the hungriest moment of the cycle.
                    </li>
                    <li>
                      <span className="font-semibold text-[var(--foreground)]">Poor dehumidification</span> &mdash; the
                      coil needs sustained runtime to pull moisture out. Short runs leave the room cold and clammy, which
                      feels worse than warm and dry.
                    </li>
                    <li>You pay more upfront and more every month for a worse experience.</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-xs leading-5 text-[var(--muted-foreground)]">
                The sweet spot is the smallest standard size that covers the calculated load &mdash; which is exactly
                what this tool picks. An inverter AC widens that sweet spot because it can throttle down instead of
                cycling off.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">Running cost</h2>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <span className="text-sm font-semibold">Star rating</span>
                  <div className="mt-2 flex gap-2">
                    {[3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setStars(star)}
                        className={`h-12 flex-1 rounded-md border text-sm font-semibold transition ${
                          stars === star
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {star}★
                      </button>
                    ))}
                  </div>
                </div>
                <NumberField
                  label="Hours per day"
                  value={hoursPerDay}
                  onChange={setHoursPerDay}
                  min={0}
                  max={24}
                  suffix="hrs"
                />
                <NumberField
                  label="Electricity tariff"
                  value={tariff}
                  onChange={setTariff}
                  min={0}
                  max={50}
                  step={0.5}
                  suffix="₹/unit"
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-[var(--muted)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Average power draw</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--primary)]">
                    {num(running.selected.drawKw, 2)} kW
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {num(running.tons, 2)} ton ÷ ISEER {running.selected.iseer}
                  </p>
                </div>
                <div className="rounded-md bg-[var(--muted)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Units per month</p>
                  <p className="mt-1 text-2xl font-semibold">{num(running.selected.unitsMonth)}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {num(hoursPerDay)} hrs × 30 days
                  </p>
                </div>
                <div className="rounded-md bg-[var(--muted)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Monthly bill</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--primary)]" aria-live="polite">
                    {inr(running.selected.bill)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">at {inr(tariff)}/unit</p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                      <th className="px-2 py-2 font-semibold">Rating</th>
                      <th className="px-2 py-2 font-semibold">Inverter ISEER</th>
                      <th className="px-2 py-2 text-right font-semibold">Inverter / month</th>
                      <th className="px-2 py-2 font-semibold">Fixed-speed ISEER</th>
                      <th className="px-2 py-2 text-right font-semibold">Fixed-speed / month</th>
                    </tr>
                  </thead>
                  <tbody>
                    {running.table.map((row) => (
                      <tr
                        key={row.star}
                        className={`border-b border-[var(--border)] ${
                          row.star === stars ? "bg-[var(--muted)]" : ""
                        }`}
                      >
                        <td className="px-2 py-3 font-semibold">{row.star}★</td>
                        <td className="px-2 py-3 text-[var(--muted-foreground)]">{row.inverter.iseer}</td>
                        <td className="px-2 py-3 text-right font-semibold text-[var(--primary)]">
                          {inr(row.inverter.bill)}
                        </td>
                        <td className="px-2 py-3 text-[var(--muted-foreground)]">{row.fixed.iseer}</td>
                        <td className="px-2 py-3 text-right font-semibold">{inr(row.fixed.bill)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Inverter vs fixed-speed</p>
                  <p className="mt-1.5 text-lg font-semibold" style={{ color: "var(--anslation-ds-success)" }}>
                    {inr(running.inverterSaving)} / month
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    Same {num(running.tons, 2)} ton, same {stars}★ label. BEE rates the two on separate ISEER scales
                    because a fixed-speed unit can only slam on and off, while an inverter throttles to match the load.
                    Over a year that is {inr(running.inverterSaving * 12)}.
                  </p>
                </div>
                <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    {stars}★ vs 3★ payback
                  </p>
                  {stars === 3 ? (
                    <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                      3★ is the baseline here. Switch to 4★ or 5★ above to see how quickly the higher price pays itself
                      back at your usage.
                    </p>
                  ) : (
                    <>
                      <p className="mt-1.5 text-lg font-semibold text-[var(--primary)]">
                        {running.paybackMonths
                          ? `${num(running.paybackMonths, 1)} months of use`
                          : "No saving at 0 hrs/day"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                        A {stars}★ costs roughly {inr(running.priceDelta)} more than a 3★ and saves{" "}
                        {inr(running.monthlySaving)} a month at {num(hoursPerDay)} hrs/day. Count only the months you
                        actually run it &mdash; at 4 summer months a year that is about{" "}
                        {running.paybackMonths ? num(running.paybackMonths / 4, 1) : "—"} years.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold">Before you buy</h2>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Match the star rating to your hours",
                    "A 5★ only beats a 3★ if you run it enough for the saving to clear the price gap. Guest room at 2 hrs a day? 3★ is the honest answer. Bedroom at 8+ hrs through a north-Indian summer? 5★ inverter, every time.",
                  ],
                  [
                    "Insist on copper coils",
                    "Copper transfers heat better, is repairable in any local workshop, and survives coastal air. Alloy or aluminium coils are cheaper upfront and a headache to fix. Check the spec sheet, not the salesperson.",
                  ],
                  [
                    "Inverter for long hours",
                    "Inverter compressors vary speed instead of cycling, so they hold a steadier temperature and dehumidify properly. Short, occasional use is the only case where fixed-speed still makes sense.",
                  ],
                  [
                    "Fix the room before upsizing",
                    "Thick curtains, a reflective roof coat, and sealing door gaps can knock 10-20% off the load. That is often the difference between 1.5 ton and 2 ton — cheaper than the bigger AC and it keeps paying every month.",
                  ],
                  [
                    "Size for the room, not the brand chart",
                    "Showroom charts assume a middle-floor, shaded, 2-person room. A top-floor west-facing room with the same floor area can need a full size more — which is what the breakdown above shows you.",
                  ],
                  [
                    "Budget for installation",
                    "Copper piping beyond the bundled 3 metres, a stabiliser if your voltage swings, and proper drainage slope all cost extra. Factor ₹3,000-8,000 so it does not ambush you at delivery.",
                  ],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)] p-5">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                  <span className="font-semibold text-[var(--foreground)]">How this is calculated.</span> Fabric load
                  uses 34 BTU/sq ft &mdash; higher than the 20 BTU/sq ft figure quoted for insulated temperate homes,
                  because it covers wall, floor and air-change load for typical Indian brick/RCC construction at a
                  43-45°C design outdoor temperature &mdash; scaled by ceiling height ÷ 10 ft. Then 600 BTU per person,
                  glass at 165 BTU/sq ft in direct sun (55 shaded), 150 BTU per window for leakage, appliances at 3.412
                  BTU per watt, a sun-baked roof at 28 BTU/sq ft for top floors, and finally the climate multiplier.
                  Running cost divides cooling capacity by the BEE ISEER band for that star rating, which is a
                  seasonal average &mdash; your actual bill moves with weather, thermostat setting, and how well the
                  room is sealed. For a large office or a full-home system, get a site survey.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
