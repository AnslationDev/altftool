"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Copy,
  Gem,
  Info,
  Lightbulb,
  Receipt,
  RotateCcw,
  TrendingDown,
  TriangleAlert,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const HALLMARK_FEE = 45;
const GST_RATE = 0.03;

const PURITIES = [
  { id: "24k", label: "24K", fineness: 0.999, mark: "999", note: "Coins and bars. Too soft to shape into jewellery." },
  { id: "22k", label: "22K", fineness: 0.916, mark: "916", note: "The Indian jewellery standard for chains and bangles." },
  { id: "18k", label: "18K", fineness: 0.75, mark: "750", note: "Diamond and stone-studded pieces. Harder, holds settings." },
  { id: "14k", label: "14K", fineness: 0.585, mark: "585", note: "Light daily wear and export designs." },
];

const PRESETS = [
  { label: "22K chain, 10 g", purityId: "22k", grossWeight: 10, stoneWeight: 0, makingMode: "percent", makingPercent: 12, makingPerGram: 500, wastage: 0, stoneCharges: 0 },
  { label: "22K bangle, 25 g, flat making", purityId: "22k", grossWeight: 25, stoneWeight: 0, makingMode: "flat", makingPercent: 12, makingPerGram: 500, wastage: 0, stoneCharges: 0 },
  { label: "18K diamond ring, 5 g", purityId: "18k", grossWeight: 5, stoneWeight: 0.8, makingMode: "percent", makingPercent: 18, makingPerGram: 600, wastage: 0, stoneCharges: 25000 },
  { label: "24K coin, 10 g", purityId: "24k", grossWeight: 10, stoneWeight: 0, makingMode: "flat", makingPercent: 3, makingPerGram: 150, wastage: 0, stoneCharges: 0 },
  { label: "Wastage trap, 22K 15 g", purityId: "22k", grossWeight: 15, stoneWeight: 0, makingMode: "percent", makingPercent: 10, makingPerGram: 500, wastage: 8, stoneCharges: 0 },
];

const BUYING_TIPS = [
  {
    title: "Always ask for the itemised breakup",
    body: "A real bill shows rate per gram, net weight, making charges, wastage, GST and hallmark as separate lines. If the shop quotes only one lump-sum figure, you cannot tell what you are paying for.",
  },
  {
    title: "Making charges are where shops compete",
    body: "8% to 25% of gold value is the normal band, or roughly Rs 300 to Rs 800 per gram flat. It is negotiable, especially on plain gold. A zero-making festival offer usually hides the cost in a higher rate or in wastage.",
  },
  {
    title: "Never pay wastage and making twice",
    body: "Wastage and making charges both pay for the same labour. If a bill carries both, ask for one of them to be dropped. Wastage of 8% on a 15 g piece quietly adds more than a gram of gold to your bill.",
  },
  {
    title: "Check the HUID before you pay",
    body: "Every hallmarked piece carries the BIS logo, the purity mark (916, 750, 585) and a six-digit alphanumeric HUID. Scan it in the free BIS CARE app. No HUID means no guarantee of purity.",
  },
  {
    title: "Stones are not gold",
    body: "Kundan, meena, lac filling and diamonds must be weighed and deducted, then priced separately. Being charged a gold rate on stone weight is the single most common overcharge in Indian jewellery.",
  },
  {
    title: "Get the buyback policy in writing",
    body: "Ask what the shop pays back today for this exact piece, and whether an exchange gets a better rate than cash. Deductions of 2% to 5% are normal; anything above that is worth walking away from.",
  },
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const inrPrecise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const grams = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const money = (value) => inr.format(Number.isFinite(value) ? value : 0);
const moneyExact = (value) => inrPrecise.format(Number.isFinite(value) ? value : 0);
const weight = (value) => `${grams.format(Number.isFinite(value) ? value : 0)} g`;

function BillRow({ label, hint, value, strong }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className={`text-sm ${strong ? "font-semibold" : ""}`}>{label}</p>
        {hint ? (
          <p className="mt-0.5 text-[11px] leading-4 text-[var(--muted-foreground)]">{hint}</p>
        ) : null}
      </div>
      <p className={`shrink-0 text-sm tabular-nums ${strong ? "font-semibold" : ""}`}>{value}</p>
    </div>
  );
}

export default function ToolHome() {
  const [goldRate10g, setGoldRate10g] = useState(100000);
  const [purityId, setPurityId] = useState("22k");
  const [grossWeight, setGrossWeight] = useState(10);
  const [stoneWeight, setStoneWeight] = useState(0);
  const [makingMode, setMakingMode] = useState("percent");
  const [makingPercent, setMakingPercent] = useState(12);
  const [makingPerGram, setMakingPerGram] = useState(500);
  const [wastage, setWastage] = useState(0);
  const [stoneCharges, setStoneCharges] = useState(0);
  const [hallmark, setHallmark] = useState(true);
  const [resaleDeduction, setResaleDeduction] = useState(3);
  const [copied, setCopied] = useState(false);

  const purity = useMemo(
    () => PURITIES.find((item) => item.id === purityId) || PURITIES[1],
    [purityId]
  );

  const calc = useMemo(() => {
    const rate10g = Math.max(0, Number(goldRate10g) || 0);
    const rate24PerGram = rate10g / 10;
    const ratePerGram = rate24PerGram * (purity.fineness / 0.999);

    const gross = Math.max(0, Number(grossWeight) || 0);
    const stones = Math.min(Math.max(0, Number(stoneWeight) || 0), gross);
    const net = Math.max(0, gross - stones);

    const goldValue = net * ratePerGram;
    const wastagePct = Math.max(0, Number(wastage) || 0);
    const wastageGrams = net * (wastagePct / 100);
    const wastageValue = goldValue * (wastagePct / 100);

    const makingPct = Math.max(0, Number(makingPercent) || 0);
    const makingFlat = Math.max(0, Number(makingPerGram) || 0);
    const making = makingMode === "percent" ? goldValue * (makingPct / 100) : makingFlat * net;

    const stoneValue = Math.max(0, Number(stoneCharges) || 0);
    const taxable = goldValue + wastageValue + making + stoneValue;
    const gst = taxable * GST_RATE;
    const hallmarkFee = hallmark ? HALLMARK_FEE : 0;
    const total = taxable + gst + hallmarkFee;

    const deductionPct = Math.min(Math.max(0, Number(resaleDeduction) || 0), 100);
    const buybackCut = goldValue * (deductionPct / 100);
    const resale = goldValue - buybackCut;
    const loss = total - resale;
    const lossPct = total > 0 ? (loss / total) * 100 : 0;

    const canBreakEven = net > 0 && deductionPct < 100 && purity.fineness > 0;
    const breakEvenPerGram = canBreakEven ? total / (net * (1 - deductionPct / 100)) : 0;
    const breakEven24Per10g = breakEvenPerGram * (0.999 / purity.fineness) * 10;
    const breakEvenRisePct = rate10g > 0 && canBreakEven ? (breakEven24Per10g / rate10g - 1) * 100 : 0;

    return {
      rate10g,
      rate24PerGram,
      ratePerGram,
      gross,
      stones,
      net,
      goldValue,
      wastagePct,
      wastageGrams,
      wastageValue,
      makingPct,
      makingFlat,
      making,
      makingShare: goldValue > 0 ? (making / goldValue) * 100 : 0,
      stoneValue,
      stoneSaved: stones * ratePerGram,
      taxable,
      gst,
      hallmarkFee,
      total,
      deductionPct,
      buybackCut,
      resale,
      loss,
      lossPct,
      canBreakEven,
      breakEven24Per10g,
      breakEvenRisePct,
    };
  }, [
    goldRate10g,
    grossWeight,
    hallmark,
    makingMode,
    makingPercent,
    makingPerGram,
    purity,
    resaleDeduction,
    stoneCharges,
    stoneWeight,
    wastage,
  ]);

  const makingLabel =
    makingMode === "percent"
      ? `Making charges @ ${calc.makingPct}% of gold value`
      : `Making charges @ ${money(calc.makingFlat)}/g x ${weight(calc.net)}`;

  const applyPreset = (preset) => {
    setPurityId(preset.purityId);
    setGrossWeight(preset.grossWeight);
    setStoneWeight(preset.stoneWeight);
    setMakingMode(preset.makingMode);
    setMakingPercent(preset.makingPercent);
    setMakingPerGram(preset.makingPerGram);
    setWastage(preset.wastage);
    setStoneCharges(preset.stoneCharges);
  };

  const reset = () => {
    setGoldRate10g(100000);
    setPurityId("22k");
    setGrossWeight(10);
    setStoneWeight(0);
    setMakingMode("percent");
    setMakingPercent(12);
    setMakingPerGram(500);
    setWastage(0);
    setStoneCharges(0);
    setHallmark(true);
    setResaleDeduction(3);
  };

  const bill = useMemo(
    () =>
      [
        "GOLD JEWELLERY PRICE ESTIMATE",
        "",
        `Purity: ${purity.label} (${purity.mark} hallmark)`,
        `24K rate entered: ${money(calc.rate10g)} per 10 g`,
        `${purity.label} rate per gram: ${moneyExact(calc.ratePerGram)}`,
        `  Formula: (24K rate / 10) x (${purity.fineness} / 0.999)`,
        "",
        `Gross weight: ${weight(calc.gross)}`,
        `Less stone / gem weight: ${weight(calc.stones)}`,
        `Net gold weight: ${weight(calc.net)}`,
        "",
        `Gold value (${weight(calc.net)} x ${moneyExact(calc.ratePerGram)}): ${money(calc.goldValue)}`,
        `Wastage @ ${calc.wastagePct}% (${weight(calc.wastageGrams)} of gold): ${money(calc.wastageValue)}`,
        `${makingLabel}: ${money(calc.making)}`,
        `Stone / gem charges: ${money(calc.stoneValue)}`,
        `Taxable value: ${money(calc.taxable)}`,
        `GST @ 3%: ${money(calc.gst)}`,
        `Hallmark charges: ${money(calc.hallmarkFee)}`,
        `TOTAL PAYABLE: ${money(calc.total)}`,
        "",
        "RESALE REALITY CHECK (at the same gold rate)",
        `Buyback value of gold: ${money(calc.goldValue)}`,
        `Less buyback deduction @ ${calc.deductionPct}%: ${money(calc.buybackCut)}`,
        `You would get back: ${money(calc.resale)}`,
        `Immediate loss: ${money(calc.loss)} (${calc.lossPct.toFixed(1)}% of what you paid)`,
        calc.canBreakEven
          ? `Gold must rise ${calc.breakEvenRisePct.toFixed(1)}% (24K to ${money(calc.breakEven24Per10g)}/10 g) to break even`
          : "",
        "",
        "Making charges, wastage, GST and hallmark fees are never refunded on resale.",
        `Generated: ${new Date().toLocaleString()}`,
      ]
        .filter(Boolean)
        .join("\n"),
    [calc, makingLabel, purity]
  );

  const copyBill = async () => {
    const success = await safeCopyText(bill);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const lossParts = [
    { label: "Making charges", value: calc.making },
    { label: "Wastage", value: calc.wastageValue },
    { label: "Stone / gem value", value: calc.stoneValue },
    { label: "GST @ 3%", value: calc.gst },
    { label: "Hallmark fee", value: calc.hallmarkFee },
    { label: `Buyback deduction @ ${calc.deductionPct}%`, value: calc.buybackCut },
  ].filter((part) => part.value > 0);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Gem className="h-4 w-4" />
            Jeweller bill, decoded
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Gold Jewellery Price Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            The price on the tag is gold rate x weight, plus making charges, plus 3% GST. This builds the
            full itemised bill line by line, then shows what the same piece would fetch if you sold it
            back today.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="grid gap-6 self-start">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <label className="block">
                <span className="text-sm font-semibold">24K gold rate (per 10 g)</span>
                <input
                  type="number"
                  min="0"
                  value={goldRate10g}
                  onChange={(event) => setGoldRate10g(event.target.value)}
                  className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                />
                <span className="mt-1.5 block text-[11px] leading-4 text-[var(--muted-foreground)]">
                  Rates move every day. Enter the 24K rate your jeweller quotes today, or the IBJA rate
                  for your city. Everything below is derived from this one number.
                </span>
              </label>

              <div className="mt-4">
                <span className="text-sm font-semibold">Purity</span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {PURITIES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPurityId(item.id)}
                      className={`rounded-md border px-2 py-3 text-center text-sm font-semibold transition ${
                        purityId === item.id
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-4 text-[var(--muted-foreground)]">
                  {purity.mark} hallmark. {purity.note}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Gross weight (g)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={grossWeight}
                    onChange={(event) => setGrossWeight(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Stone / gem weight (g)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={stoneWeight}
                    onChange={(event) => setStoneWeight(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              </div>

              <div
                className="mt-3 rounded-md p-3"
                style={{
                  background:
                    calc.stones > 0
                      ? "var(--anslation-ds-success-soft)"
                      : "var(--anslation-ds-warning-soft)",
                }}
              >
                {calc.stones > 0 ? (
                  <p className="text-[11px] leading-4">
                    <strong>Net gold weight {weight(calc.net)}.</strong> Deducting {weight(calc.stones)}{" "}
                    of stones keeps {money(calc.stoneSaved)} of stone weight off the gold rate.
                  </p>
                ) : (
                  <p className="text-[11px] leading-4">
                    If the piece has stones, kundan, meena or a lac filling, get that weight deducted
                    here. Stones weigh less than gold and must never be billed at the gold rate.
                  </p>
                )}
              </div>

              <div className="mt-4">
                <span className="text-sm font-semibold">Making charges</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMakingMode("percent")}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      makingMode === "percent"
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    % of gold value
                  </button>
                  <button
                    type="button"
                    onClick={() => setMakingMode("flat")}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                      makingMode === "flat"
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    Flat per gram
                  </button>
                </div>
                {makingMode === "percent" ? (
                  <label className="mt-3 block">
                    <span className="text-sm font-semibold">Making charge %</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={makingPercent}
                      onChange={(event) => setMakingPercent(event.target.value)}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                ) : (
                  <label className="mt-3 block">
                    <span className="text-sm font-semibold">Making charge per gram</span>
                    <input
                      type="number"
                      min="0"
                      value={makingPerGram}
                      onChange={(event) => setMakingPerGram(event.target.value)}
                      className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                )}
                <p className="mt-1.5 text-[11px] leading-4 text-[var(--muted-foreground)]">
                  Both formats are used in real shops. Typical range is 8% to 25%, or Rs 300 to Rs 800
                  per gram. This works out to {calc.makingShare.toFixed(1)}% of gold value.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm font-semibold">Wastage %</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={wastage}
                    onChange={(event) => setWastage(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Stone / gem charges</span>
                  <input
                    type="number"
                    min="0"
                    value={stoneCharges}
                    onChange={(event) => setStoneCharges(event.target.value)}
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
              </div>

              {calc.wastagePct > 0 && calc.making > 0 ? (
                <div
                  className="mt-3 flex gap-2 rounded-md p-3"
                  style={{ background: "var(--anslation-ds-danger-soft)" }}
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="text-[11px] leading-4">
                    <strong>You are being charged twice for the same labour.</strong> Wastage of{" "}
                    {calc.wastagePct}% adds {weight(calc.wastageGrams)} of notional gold ({money(calc.wastageValue)})
                    on top of making charges. Ask the shop to drop one of the two.
                  </p>
                </div>
              ) : null}

              <label className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={hallmark}
                  onChange={(event) => setHallmark(event.target.checked)}
                  className="h-4 w-4"
                  style={{ accentColor: "var(--primary)" }}
                />
                <span className="text-sm font-semibold">
                  Add BIS hallmark charge ({money(HALLMARK_FEE)} per article)
                </span>
              </label>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">Quick presets</span>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
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
          </div>

          <div className="grid gap-6 self-start">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Derived {purity.label} rate
              </p>
              <p aria-live="polite" className="mt-2 text-3xl font-semibold text-[var(--primary)]">
                {moneyExact(calc.ratePerGram)}
                <span className="ml-2 text-base font-semibold text-[var(--muted-foreground)]">
                  per gram
                </span>
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: (24K rate {money(calc.rate10g)} ÷ 10) x ({purity.fineness} ÷ 0.999) ={" "}
                {moneyExact(calc.rate24PerGram)} x {(purity.fineness / 0.999).toFixed(4)}
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                A jeweller quoting a {purity.label} rate far above this is padding the rate itself, not
                just the making charges.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-sm font-semibold">Itemised bill</h2>
                </div>
                <button
                  type="button"
                  onClick={copyBill}
                  className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied" : "Copy bill"}
                </button>
              </div>

              <div className="mt-4 rounded-md bg-[var(--muted)] p-4">
                <div className="divide-y divide-[var(--border)]">
                  <BillRow
                    label="Purity"
                    hint={`${purity.mark} BIS hallmark`}
                    value={purity.label}
                  />
                  <BillRow
                    label={`${purity.label} rate per gram`}
                    hint={`Derived from ${money(calc.rate10g)} per 10 g of 24K`}
                    value={moneyExact(calc.ratePerGram)}
                  />
                  <BillRow label="Gross weight" value={weight(calc.gross)} />
                  <BillRow
                    label="Less: stone / gem weight"
                    hint="Not charged at gold rate"
                    value={`- ${weight(calc.stones)}`}
                  />
                  <BillRow label="Net gold weight" value={weight(calc.net)} strong />
                </div>

                <div className="mt-3 divide-y divide-[var(--border)] border-t border-[var(--border)] pt-1">
                  <BillRow
                    label="Gold value"
                    hint={`${weight(calc.net)} x ${moneyExact(calc.ratePerGram)}`}
                    value={money(calc.goldValue)}
                  />
                  <BillRow
                    label={`Wastage @ ${calc.wastagePct}%`}
                    hint={
                      calc.wastagePct > 0
                        ? `Adds ${weight(calc.wastageGrams)} of gold you do not receive`
                        : "None added"
                    }
                    value={money(calc.wastageValue)}
                  />
                  <BillRow label={makingLabel} value={money(calc.making)} />
                  <BillRow
                    label="Stone / gem charges"
                    hint={calc.stoneValue > 0 ? "Priced separately, not at gold rate" : "None"}
                    value={money(calc.stoneValue)}
                  />
                  <BillRow label="Taxable value" value={money(calc.taxable)} strong />
                  <BillRow
                    label="GST @ 3%"
                    hint="Charged on gold + wastage + making + stones"
                    value={money(calc.gst)}
                  />
                  <BillRow
                    label="Hallmark charges (BIS)"
                    hint={hallmark ? "Per article" : "Not applied"}
                    value={money(calc.hallmarkFee)}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3 border-t-2 border-[var(--primary)] pt-3">
                  <p className="text-sm font-semibold uppercase">Total payable</p>
                  <p aria-live="polite" className="text-3xl font-semibold text-[var(--primary)]">
                    {money(calc.total)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-[var(--anslation-ds-danger)]" />
                <h2 className="text-sm font-semibold">What you would get back today</h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                If you walked back in and sold this piece at the same gold rate. Buyers pay for the gold
                only, and knock off 2% to 5% for melting and refining loss.
              </p>

              <label className="mt-4 block">
                <span className="text-sm font-semibold">
                  Buyback deduction: {calc.deductionPct}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={resaleDeduction}
                  onChange={(event) => setResaleDeduction(event.target.value)}
                  className="mt-2 w-full"
                  style={{ accentColor: "var(--primary)" }}
                />
                <span className="mt-1 block text-[11px] text-[var(--muted-foreground)]">
                  2% to 5% is the normal band at an organised chain. Small shops may quote more.
                </span>
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-[var(--muted)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">You pay</p>
                  <p className="mt-1 text-xl font-semibold">{money(calc.total)}</p>
                </div>
                <div className="rounded-md bg-[var(--muted)] p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">You get back</p>
                  <p className="mt-1 text-xl font-semibold">{money(calc.resale)}</p>
                </div>
                <div
                  className="rounded-md p-4"
                  style={{ background: "var(--anslation-ds-danger-soft)" }}
                >
                  <p className="text-xs">Immediate loss</p>
                  <p className="mt-1 text-xl font-semibold">{money(calc.loss)}</p>
                  <p className="text-[11px]">{calc.lossPct.toFixed(1)}% of what you paid</p>
                </div>
              </div>

              {lossParts.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    Where the loss comes from
                  </p>
                  <div className="mt-2 grid gap-2">
                    {lossParts.map((part) => (
                      <div key={part.label}>
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-xs">{part.label}</p>
                          <p className="text-xs font-semibold tabular-nums">{money(part.value)}</p>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${calc.loss > 0 ? (part.value / calc.loss) * 100 : 0}%`,
                              background: "var(--anslation-ds-danger)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] leading-4 text-[var(--muted-foreground)]">
                    Making charges, wastage, GST and the hallmark fee are gone the moment you pay. No
                    buyer refunds them, which is why jewellery is a poor way to hold gold as an
                    investment compared with coins, bars, ETFs or sovereign bonds.
                  </p>
                </div>
              ) : null}

              {calc.canBreakEven && calc.breakEvenRisePct > 0 ? (
                <div
                  className="mt-4 rounded-md p-4"
                  style={{ background: "var(--anslation-ds-warning-soft)" }}
                >
                  <p className="text-sm leading-6">
                    Gold has to rise about{" "}
                    <strong>{calc.breakEvenRisePct.toFixed(1)}%</strong> — a 24K rate of{" "}
                    <strong>{money(calc.breakEven24Per10g)} per 10 g</strong> — before selling this piece
                    just returns the {money(calc.total)} you paid.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-sm font-semibold">Before you buy</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {BUYING_TIPS.map((tip) => (
              <div key={tip.title} className="rounded-md bg-[var(--muted)] p-4">
                <div className="flex items-start gap-2">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <p className="text-sm font-semibold">{tip.title}</p>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">{tip.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-sm font-semibold">Purity reference</h2>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="py-2 pr-3 font-semibold">Purity</th>
                  <th className="py-2 pr-3 font-semibold">Hallmark</th>
                  <th className="py-2 pr-3 font-semibold">Gold content</th>
                  <th className="py-2 pr-3 text-right font-semibold">Rate per gram</th>
                  <th className="py-2 font-semibold">Typically used for</th>
                </tr>
              </thead>
              <tbody>
                {PURITIES.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] align-top">
                    <td className="py-2.5 pr-3 font-semibold">{item.label}</td>
                    <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">{item.mark}</td>
                    <td className="py-2.5 pr-3 text-[var(--muted-foreground)]">
                      {(item.fineness * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">
                      {moneyExact((calc.rate10g / 10) * (item.fineness / 0.999))}
                    </td>
                    <td className="py-2.5 text-[var(--muted-foreground)]">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Estimates for comparison and negotiation. Gold rates change through the day and every shop
            adds its own margin, so treat the total as a benchmark to check a quote against, not a
            binding price.
          </p>
        </section>
      </div>
    </main>
  );
}
