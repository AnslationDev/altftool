"use client";

import { useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  Briefcase,
  Clock,
  Copy,
  Info,
  Plus,
  RotateCcw,
  Trash2,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const defaultCosts = [
  { id: "software", name: "Software & subscriptions", amount: 36000 },
  { id: "gear", name: "Gear (amortised over 3 years)", amount: 40000 },
  { id: "internet", name: "Internet & phone", amount: 18000 },
  { id: "workspace", name: "Workspace / coworking", amount: 60000 },
  { id: "insurance", name: "Health & equipment insurance", amount: 30000 },
  { id: "compliance", name: "Accountant & compliance", amount: 15000 },
  { id: "growth", name: "Learning & marketing", amount: 20000 },
];

const flatPresets = [20, 25, 30, 35];
const slabPresets = [5, 10, 15, 20, 30];

const defaultBands = {
  development: [
    { id: "junior", label: "Junior", low: 500, high: 1000 },
    { id: "mid", label: "Mid", low: 1200, high: 2500 },
    { id: "senior", label: "Senior", low: 2500, high: 6000 },
  ],
  design: [
    { id: "junior", label: "Junior", low: 400, high: 800 },
    { id: "mid", label: "Mid", low: 900, high: 2000 },
    { id: "senior", label: "Senior", low: 2000, high: 4500 },
  ],
  writing: [
    { id: "junior", label: "Junior", low: 300, high: 700 },
    { id: "mid", label: "Mid", low: 800, high: 1800 },
    { id: "senior", label: "Senior", low: 1800, high: 4000 },
  ],
};

const disciplines = [
  { id: "development", label: "Development" },
  { id: "design", label: "Design" },
  { id: "writing", label: "Writing" },
];

const raiseScenarios = [10, 20];
const rushChips = [
  { value: 0, label: "Normal" },
  { value: 25, label: "Rush +25%" },
  { value: 50, label: "Drop-everything +50%" },
];

const inrFull = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatINR = (value) => inrFull.format(Number.isFinite(value) ? value : 0);

function formatCompactINR(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return formatINR(0);
  const abs = Math.abs(amount);
  if (abs >= 1e7) return `${amount < 0 ? "-" : ""}₹${Math.abs(amount / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${amount < 0 ? "-" : ""}₹${Math.abs(amount / 1e5).toFixed(2)} L`;
  return formatINR(amount);
}

const formatHours = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);

function effectiveSlab(slab) {
  return (slab * 1.04) / 100;
}

function revenueNeeded(target, costs, taxMode, taxRate) {
  if (taxMode === "44ada") {
    const denom = 1 - 0.5 * effectiveSlab(taxRate);
    return denom <= 0 ? Infinity : (target + costs) / denom;
  }
  const denom = 1 - taxRate / 100;
  return denom <= 0 ? Infinity : target / denom + costs;
}

function taxOnRevenue(revenue, costs, taxMode, taxRate) {
  if (taxMode === "44ada") return 0.5 * revenue * effectiveSlab(taxRate);
  const profit = revenue - costs;
  return Math.max(0, profit) * (taxRate / 100);
}

function takeHomeFromRevenue(revenue, costs, taxMode, taxRate) {
  return revenue - costs - taxOnRevenue(revenue, costs, taxMode, taxRate);
}

function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, step, suffix, hint }) {
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
          className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-12 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{hint}</span> : null}
    </label>
  );
}

export default function ToolHome() {
  const [targetTakeHome, setTargetTakeHome] = useState(1200000);
  const [costs, setCosts] = useState(defaultCosts);
  const [taxMode, setTaxMode] = useState("flat");
  const [flatRate, setFlatRate] = useState(30);
  const [slabRate, setSlabRate] = useState(30);
  const [workingWeeks, setWorkingWeeks] = useState(48);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [billablePct, setBillablePct] = useState(60);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [projectHours, setProjectHours] = useState(40);
  const [bufferPct, setBufferPct] = useState(20);
  const [rush, setRush] = useState(0);
  const [discipline, setDiscipline] = useState("development");
  const [bands, setBands] = useState(defaultBands);
  const [copied, setCopied] = useState(false);

  const model = useMemo(() => {
    const target = Math.max(0, Number(targetTakeHome) || 0);
    const totalCosts = costs.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const rate = taxMode === "44ada" ? Number(slabRate) || 0 : Number(flatRate) || 0;

    const revenue = revenueNeeded(target, totalCosts, taxMode, rate);
    const tax = taxOnRevenue(revenue, totalCosts, taxMode, rate);
    const deemedProfit = taxMode === "44ada" ? revenue * 0.5 : revenue - totalCosts;

    const weeks = Math.max(1, Number(workingWeeks) || 1);
    const perWeek = Math.max(1, Number(hoursPerWeek) || 1);
    const billableShare = Math.min(100, Math.max(1, Number(billablePct) || 1));
    const totalHours = weeks * perWeek;
    const billableHours = totalHours * (billableShare / 100);
    const unbilledHours = totalHours - billableHours;

    const hourly = billableHours > 0 && Number.isFinite(revenue) ? revenue / billableHours : 0;
    const dayRate = hourly * Math.max(1, Number(hoursPerDay) || 8);
    const monthlyRetainer = Number.isFinite(revenue) ? revenue / 12 : 0;
    const monthlyBillableHours = billableHours / 12;

    return {
      target,
      totalCosts,
      rate,
      revenue,
      tax,
      deemedProfit,
      weeks,
      perWeek,
      billableShare,
      totalHours,
      billableHours,
      unbilledHours,
      hourly,
      dayRate,
      monthlyRetainer,
      monthlyBillableHours,
    };
  }, [
    billablePct,
    costs,
    flatRate,
    hoursPerDay,
    hoursPerWeek,
    slabRate,
    targetTakeHome,
    taxMode,
    workingWeeks,
  ]);

  const project = useMemo(() => {
    const hours = Math.max(0, Number(projectHours) || 0);
    const buffer = Math.max(0, Number(bufferPct) || 0);
    const quotedHours = hours * (1 + buffer / 100);
    const base = quotedHours * model.hourly;
    const quote = base * (1 + rush / 100);
    const days = quotedHours / Math.max(1, Number(hoursPerDay) || 8);
    return { hours, buffer, quotedHours, base, quote, days };
  }, [bufferPct, hoursPerDay, model.hourly, projectHours, rush]);

  const marketCheck = useMemo(() => {
    const list = bands[discipline] || [];
    const junior = list[0];
    const senior = list[list.length - 1];
    if (!junior || !senior) return { status: "ok", band: null };

    const rate = model.hourly;
    if (rate < junior.low) {
      return {
        status: "under",
        band: null,
        message: `Your required rate is below the local junior floor of ${formatINR(junior.low)}/hr. Either your take-home target is too modest for the hours you plan to work, or you have room to charge far more than you think.`,
      };
    }
    if (rate > senior.high) {
      return {
        status: "over",
        band: null,
        message: `Your required rate sits above the local senior ceiling of ${formatINR(senior.high)}/hr. That is not fatal — it means you need premium or international clients, a productised offer, or a trimmed cost base. Charging this to a price-sensitive local market will not work.`,
      };
    }
    const band = list.find((item) => rate >= item.low && rate <= item.high) || null;
    return {
      status: "ok",
      band,
      message: band
        ? `Your required rate lands in the ${band.label.toLowerCase()} band (${formatINR(band.low)}–${formatINR(band.high)}/hr). That is a rate the market already pays.`
        : `Your required rate falls between the published bands — it is inside the overall market range.`,
    };
  }, [bands, discipline, model.hourly]);

  const raises = useMemo(
    () =>
      raiseScenarios.map((pct) => {
        const newRate = model.hourly * (1 + pct / 100);
        const hoursNeeded = model.billableHours / (1 + pct / 100);
        const hoursDropped = model.billableHours - hoursNeeded;
        const sameHoursRevenue = Number.isFinite(model.revenue) ? model.revenue * (1 + pct / 100) : 0;
        const sameHoursTakeHome = takeHomeFromRevenue(sameHoursRevenue, model.totalCosts, taxMode, model.rate);
        return {
          pct,
          newRate,
          hoursNeeded,
          hoursDropped,
          weeklyDrop: hoursDropped / model.weeks,
          extraTakeHome: sameHoursTakeHome - model.target,
        };
      }),
    [model, taxMode]
  );

  const updateCost = (id, field, value) => {
    setCosts((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addCost = () => {
    setCosts((rows) => [...rows, { id: `cost-${Date.now()}`, name: "New cost", amount: 0 }]);
  };

  const removeCost = (id) => {
    setCosts((rows) => rows.filter((row) => row.id !== id));
  };

  const updateBand = (bandId, field, value) => {
    setBands((current) => ({
      ...current,
      [discipline]: current[discipline].map((item) =>
        item.id === bandId ? { ...item, [field]: Number(value) || 0 } : item
      ),
    }));
  };

  const reset = () => {
    setTargetTakeHome(1200000);
    setCosts(defaultCosts);
    setTaxMode("flat");
    setFlatRate(30);
    setSlabRate(30);
    setWorkingWeeks(48);
    setHoursPerWeek(40);
    setBillablePct(60);
    setHoursPerDay(8);
    setProjectHours(40);
    setBufferPct(20);
    setRush(0);
    setDiscipline("development");
    setBands(defaultBands);
  };

  const rateCard = useMemo(
    () =>
      [
        "Freelance rate card",
        "",
        `Hourly rate: ${formatINR(model.hourly)}`,
        `Day rate (${hoursPerDay}h): ${formatINR(model.dayRate)}`,
        `Monthly retainer: ${formatINR(model.monthlyRetainer)} (${formatHours(model.monthlyBillableHours)} billable hours)`,
        "",
        "How it is built",
        `  Target take-home: ${formatINR(model.target)}`,
        `  Business costs: ${formatINR(model.totalCosts)} a year`,
        taxMode === "44ada"
          ? `  Tax: Section 44ADA presumptive — 50% of receipts deemed profit, taxed at ${model.rate}% + 4% cess`
          : `  Tax set-aside: ${model.rate}% of profit`,
        `  Revenue required: ${formatINR(model.revenue)}`,
        `  Tax provision: ${formatINR(model.tax)}`,
        `  Billable hours: ${formatHours(model.billableHours)} of ${formatHours(model.totalHours)} worked (${model.billableShare}%)`,
        `  Working weeks: ${model.weeks} at ${model.perWeek} h/week`,
        "",
        "Project pricing",
        `  ${formatHours(project.hours)} estimated hours + ${project.buffer}% buffer = ${formatHours(project.quotedHours)} quoted hours`,
        `  Quote: ${formatINR(project.quote)}${rush > 0 ? ` (includes ${rush}% rush fee)` : ""}`,
        "",
        `Market context (${discipline}): ${marketCheck.message}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [discipline, hoursPerDay, marketCheck.message, model, project, rush, taxMode]
  );

  const copyRateCard = async () => {
    const success = await safeCopyText(rateCard);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const activeBands = bands[discipline] || [];
  const ceiling = activeBands.length ? activeBands[activeBands.length - 1].high : 0;
  const marketMax = Math.max(ceiling, model.hourly) * 1.1;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <BadgeIndianRupee className="h-4 w-4" />
            Freelance pricing
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Freelance Hourly Rate Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Most freelancers price by halving a salary and dividing by 2,000 hours. That is how you end up
            working weekends for less than your old job paid. Start from the life you want, subtract what the
            business costs, subtract tax, then divide by the hours you can genuinely bill.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">1. The life you want</span>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <NumberField
                label="Target annual take-home"
                value={targetTakeHome}
                onChange={setTargetTakeHome}
                min={0}
                step={50000}
                suffix="₹"
                hint={`${formatINR(model.target / 12)} a month, in your pocket, after costs and tax`}
              />
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">2. What the business costs</span>
                <button type="button" onClick={addCost} className="btn-secondary min-h-8 px-2 py-1 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
              <div className="grid gap-2">
                {costs.map((row) => (
                  <div key={row.id} className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`cost-name-${row.id}`}>
                      Cost name
                    </label>
                    <input
                      id={`cost-name-${row.id}`}
                      type="text"
                      value={row.name}
                      onChange={(event) => updateCost(row.id, "name", event.target.value)}
                      className="h-10 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <label className="sr-only" htmlFor={`cost-amount-${row.id}`}>
                      {row.name} annual amount
                    </label>
                    <input
                      id={`cost-amount-${row.id}`}
                      type="number"
                      min={0}
                      step={1000}
                      value={row.amount}
                      onChange={(event) => updateCost(row.id, "amount", Number(event.target.value))}
                      className="h-10 w-28 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                    <button
                      type="button"
                      onClick={() => removeCost(row.id)}
                      aria-label={`Remove ${row.name}`}
                      className="rounded-md border border-[var(--border)] p-2 text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
                <span className="font-semibold">Total per year</span>
                <span className="font-semibold text-[var(--primary)]">{formatINR(model.totalCosts)}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                Amortise gear: a ₹1.2L laptop you replace every three years is ₹40,000 a year, not a one-off.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <span className="text-sm font-semibold">3. Tax set-aside</span>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTaxMode("flat")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    taxMode === "flat"
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  Flat % of profit
                </button>
                <button
                  type="button"
                  onClick={() => setTaxMode("44ada")}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    taxMode === "44ada"
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  44ADA presumptive
                </button>
              </div>

              {taxMode === "flat" ? (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {flatPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFlatRate(preset)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          Number(flatRate) === preset
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <NumberField
                      label="Tax rate on profit"
                      value={flatRate}
                      onChange={setFlatRate}
                      min={0}
                      max={60}
                      step={1}
                      suffix="%"
                      hint="Applied to revenue minus business costs, not to revenue"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {slabPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSlabRate(preset)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          Number(slabRate) === preset
                            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {preset}% slab
                      </button>
                    ))}
                  </div>
                  <div className="mt-3">
                    <NumberField
                      label="Your income-tax slab"
                      value={slabRate}
                      onChange={setSlabRate}
                      min={0}
                      max={40}
                      step={1}
                      suffix="%"
                      hint={`Effective ${(effectiveSlab(model.rate) * 100).toFixed(2)}% after 4% cess, charged on half your receipts`}
                    />
                  </div>
                  <div className="mt-3 rounded-md border border-[var(--primary)] bg-[var(--muted)] p-3 text-xs leading-5">
                    <span className="font-semibold">What Section 44ADA does.</span> If you are a specified
                    professional — software, engineering, design, legal, medical, accountancy, technical or
                    interior-decoration consultancy — you may declare 50% of gross receipts as profit and pay
                    slab tax on that half. The other half is deemed to be your expenses, so you cannot also
                    deduct your actual costs. You still pay those costs from your pocket, which is why they stay
                    in the maths above. No books of account, no audit.
                    <br />
                    <br />
                    Eligibility caps gross receipts at ₹75 lakh when cash receipts are 5% or less, otherwise ₹50
                    lakh. Opt out and you must stay out for five years. Rates and limits change — confirm with a
                    CA before you file.
                  </div>
                  {Number.isFinite(model.revenue) && model.revenue > 7500000 ? (
                    <div
                      className="mt-3 flex gap-2 rounded-md border p-3 text-xs leading-5"
                      style={{
                        borderColor: "var(--anslation-ds-danger)",
                        background: "var(--anslation-ds-danger-soft)",
                      }}
                    >
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        Required revenue of {formatCompactINR(model.revenue)} exceeds the ₹75 lakh 44ADA
                        ceiling. At this size you are into normal books, actual expense deduction, and likely a
                        tax audit. Switch to the flat mode with your real effective rate.
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <span className="text-sm font-semibold">4. Billable reality</span>
              <div className="mt-3 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    label="Working weeks"
                    value={workingWeeks}
                    onChange={setWorkingWeeks}
                    min={1}
                    max={52}
                    step={1}
                    hint="52 minus holidays and sick days"
                  />
                  <NumberField label="Hours per week" value={hoursPerWeek} onChange={setHoursPerWeek} min={1} max={80} step={1} />
                </div>

                <label className="block">
                  <span className="flex items-center justify-between text-sm font-semibold">
                    <span>Billable share of your week</span>
                    <span className="text-[var(--primary)]">{model.billableShare}%</span>
                  </span>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={5}
                    value={billablePct}
                    onChange={(event) => setBillablePct(Number(event.target.value))}
                    className="mt-3 w-full accent-[var(--primary)]"
                  />
                  <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                    {formatHours(model.billableHours)} billable of {formatHours(model.totalHours)} worked hours a
                    year
                  </span>
                </label>

                <NumberField label="Hours in a working day" value={hoursPerDay} onChange={setHoursPerDay} min={1} max={16} step={1} />
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  What you must charge
                </p>
                <button type="button" onClick={copyRateCard} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy rate card"}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-4" aria-live="polite">
                <div className="rounded-lg bg-[var(--muted)] p-5">
                  <p className="text-4xl font-semibold text-[var(--primary)]">{formatINR(model.hourly)}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">per billable hour</p>
                </div>
                <div className="grid gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold">
                    <Clock className="h-4 w-4 text-[var(--primary)]" />
                    {formatINR(model.dayRate)} per {hoursPerDay}-hour day
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm font-semibold">
                    <Briefcase className="h-4 w-4 text-[var(--primary)]" />
                    {formatINR(model.monthlyRetainer)} monthly retainer
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: revenue = {taxMode === "44ada" ? "(take-home + costs) ÷ (1 − ½ × slab)" : "take-home ÷ (1 − tax rate) + costs"};
                hourly rate = revenue ÷ billable hours. The retainer assumes{" "}
                {formatHours(model.monthlyBillableHours)} billable hours a month.
              </p>

              <div className="tool-compact-grid mt-6">
                <StatTile label="Revenue you must bill" value={formatCompactINR(model.revenue)} hint="Before costs and tax" />
                <StatTile
                  label={taxMode === "44ada" ? "Presumptive tax" : "Tax provision"}
                  value={formatCompactINR(model.tax)}
                  hint={taxMode === "44ada" ? `On ${formatCompactINR(model.deemedProfit)} deemed profit` : `On ${formatCompactINR(model.deemedProfit)} profit`}
                />
                <StatTile label="Business costs" value={formatCompactINR(model.totalCosts)} hint="Paid by you either way" />
                <StatTile label="Lands in your pocket" value={formatCompactINR(model.target)} hint="Your target, met exactly" />
              </div>

              <div className="mt-5 overflow-hidden rounded-md border border-[var(--border)]">
                <div className="flex h-8 w-full">
                  <div
                    className="flex items-center justify-center text-[10px] font-semibold text-[var(--primary-foreground)]"
                    style={{
                      width: `${Number.isFinite(model.revenue) && model.revenue > 0 ? (model.target / model.revenue) * 100 : 0}%`,
                      background: "var(--primary)",
                    }}
                  >
                    Take-home
                  </div>
                  <div
                    className="flex items-center justify-center text-[10px] font-semibold"
                    style={{
                      width: `${Number.isFinite(model.revenue) && model.revenue > 0 ? (model.tax / model.revenue) * 100 : 0}%`,
                      background: "var(--anslation-ds-warning)",
                      color: "var(--anslation-ds-footer)",
                    }}
                  >
                    Tax
                  </div>
                  <div
                    className="flex items-center justify-center text-[10px] font-semibold"
                    style={{
                      width: `${Number.isFinite(model.revenue) && model.revenue > 0 ? (model.totalCosts / model.revenue) * 100 : 0}%`,
                      background: "var(--anslation-ds-secondary)",
                      color: "var(--anslation-ds-footer)",
                    }}
                  >
                    Costs
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Every rupee you bill, split three ways. Only the teal slice is yours.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[var(--primary)]" />
                <p className="text-sm font-semibold">Why only {model.billableShare}% of your week is billable</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                You are not paid for a 40-hour week. You are paid for the hours a client will sign off on. The
                other {formatHours(model.unbilledHours)} hours a year are real work that earns nothing directly:
              </p>
              <div className="tool-compact-grid mt-4">
                {[
                  ["Sales & proposals", "Calls, scoping, pitches, and the quotes that never convert."],
                  ["Admin & invoicing", "Contracts, chasing payments, bookkeeping, GST, taxes."],
                  ["Gaps between projects", "One client ends Friday, the next starts in three weeks."],
                  ["Unpaid revisions", "The round of changes you did not scope but did anyway."],
                  ["Learning", "The skill that keeps you billable next year."],
                  ["Marketing", "Portfolio, writing, networking, and the referrals they seed."],
                ].map(([title, blurb]) => (
                  <div key={title} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{blurb}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                60% is a healthy, established freelancer. New freelancers often sit at 40% because they are still
                spending most of their week hunting for work. If you set this to 100%, you are quietly assuming
                you never sell, never invoice, and never take a gap — and your rate will come out too low to
                survive the first quiet month.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-sm font-semibold">Price a project</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Estimate the hours honestly, then add a buffer — because the estimate is always wrong in the same
              direction.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <NumberField label="Estimated hours" value={projectHours} onChange={setProjectHours} min={0} step={1} suffix="h" />
              <NumberField
                label="Buffer"
                value={bufferPct}
                onChange={setBufferPct}
                min={0}
                max={100}
                step={5}
                suffix="%"
                hint="20–30% is normal. 0% is optimism."
              />
            </div>
            <div className="mt-4">
              <span className="text-sm font-semibold">Urgency</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {rushChips.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setRush(chip.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      rush === chip.value
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-[var(--muted)] p-5" aria-live="polite">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Quote this</p>
              <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">{formatINR(project.quote)}</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {formatHours(project.hours)} h + {project.buffer}% buffer = {formatHours(project.quotedHours)} h
                at {formatINR(model.hourly)}/h
                {rush > 0 ? `, plus a ${rush}% rush fee of ${formatINR(project.quote - project.base)}` : ""}. That
                is roughly {project.days.toFixed(1)} working days.
              </p>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Quote the number, not the hours. A rush fee is not greed — it is the price of the other work you
              are pushing aside and the weekend you are giving up.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">Market reality check</p>
              <div className="flex flex-wrap gap-1">
                {disciplines.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDiscipline(item.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      discipline === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Indicative Indian freelance bands in ₹/hour. Your market is not our spreadsheet — edit them to
              match what you actually see clients paying.
            </p>

            <div className="mt-4 grid gap-3">
              {activeBands.map((band) => {
                const inBand = model.hourly >= band.low && model.hourly <= band.high;
                return (
                  <div
                    key={band.id}
                    className="rounded-md border p-3"
                    style={{
                      borderColor: inBand ? "var(--primary)" : "var(--border)",
                      background: inBand ? "var(--muted)" : "var(--background)",
                    }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {band.label}
                        {inBand ? (
                          <span className="ml-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary-foreground)]">
                            you are here
                          </span>
                        ) : null}
                      </p>
                      <div className="flex items-center gap-2">
                        <label className="sr-only" htmlFor={`band-low-${band.id}`}>
                          {band.label} low rate
                        </label>
                        <input
                          id={`band-low-${band.id}`}
                          type="number"
                          min={0}
                          step={50}
                          value={band.low}
                          onChange={(event) => updateBand(band.id, "low", event.target.value)}
                          className="h-9 w-24 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                        <span className="text-xs text-[var(--muted-foreground)]">to</span>
                        <label className="sr-only" htmlFor={`band-high-${band.id}`}>
                          {band.label} high rate
                        </label>
                        <input
                          id={`band-high-${band.id}`}
                          type="number"
                          min={0}
                          step={50}
                          value={band.high}
                          onChange={(event) => updateBand(band.id, "high", event.target.value)}
                          className="h-9 w-24 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </div>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          marginLeft: `${marketMax > 0 ? Math.min(100, (band.low / marketMax) * 100) : 0}%`,
                          width: `${marketMax > 0 ? Math.min(100, ((band.high - band.low) / marketMax) * 100) : 0}%`,
                          background: inBand ? "var(--primary)" : "var(--anslation-ds-secondary)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="mt-4 flex gap-2 rounded-md border p-3 text-sm leading-6"
              style={{
                borderColor:
                  marketCheck.status === "ok" ? "var(--anslation-ds-success)" : "var(--anslation-ds-warning)",
                background:
                  marketCheck.status === "ok"
                    ? "var(--anslation-ds-success-soft)"
                    : "var(--anslation-ds-warning-soft)",
              }}
            >
              {marketCheck.status === "ok" ? null : <TriangleAlert className="mt-1 h-4 w-4 shrink-0" />}
              <span>{marketCheck.message}</span>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
            <p className="text-sm font-semibold">Raise your rate, buy back your time</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            A rate rise is not only more money. Held at the same income, it is hours you never have to work
            again. Both options, priced:
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {raises.map((scenario) => (
              <div key={scenario.pct} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Charge +{scenario.pct}%</p>
                  <p className="text-lg font-semibold text-[var(--primary)]">{formatINR(scenario.newRate)}/hr</p>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)]">
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Same income, less work:</span> bill{" "}
                    {formatHours(scenario.hoursNeeded)} hours instead of {formatHours(model.billableHours)} —{" "}
                    {formatHours(scenario.hoursDropped)} hours back, about {scenario.weeklyDrop.toFixed(1)} hours
                    a week.
                  </p>
                  <p>
                    <span className="font-semibold text-[var(--foreground)]">Same hours, more income:</span> an
                    extra {formatCompactINR(scenario.extraTakeHome)} in your pocket a year.
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Raise the rate on new clients first. Existing clients get notice, a date, and no apology — you are
            not asking permission, you are telling them the price.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <p className="text-sm font-semibold">What this does not cover</p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)] sm:grid-cols-2">
            <li>GST, if you are registered — bill it on top; it is never yours to keep.</li>
            <li>Advance tax, due quarterly. Set the provision aside monthly or it will not be there in March.</li>
            <li>Retirement. An employee gets PF and gratuity; you get nothing unless you build it yourself.</li>
            <li>Unpaid leave. Your 48 working weeks already price the four weeks you take off.</li>
            <li>Bad debt. Some invoices are never paid. A deposit up front is the cheapest insurance there is.</li>
            <li>Currency. Billing overseas moves every one of these numbers.</li>
          </ul>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            Estimates to help you price with your eyes open, not tax advice. Confirm your position with a
            qualified CA.
          </p>
        </section>
      </div>
    </main>
  );
}
