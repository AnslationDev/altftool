"use client";

import { useMemo, useState } from "react";
import { Calculator, Copy, FileDown, ReceiptText, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const GST_RATES = [0, 3, 5, 12, 18, 28];

const GST_PRESETS = [
  { label: "Standard invoice", amount: 10000, rate: 18, mode: "exclusive", taxType: "intra" },
  { label: "Extract from bill", amount: 11800, rate: 18, mode: "inclusive", taxType: "intra" },
  { label: "Interstate quote", amount: 50000, rate: 18, mode: "exclusive", taxType: "inter" },
];

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value, tone = "default" }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p
        className={`tool-money-value mt-2 ${
          tone === "primary" ? "text-[var(--primary)]" : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function ToolHome() {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState("exclusive");
  const [taxType, setTaxType] = useState("intra");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const baseAmount = Number(amount) || 0;
    const gstRate = Number(rate) || 0;
    const gst = gstRate / 100;

    if (mode === "inclusive") {
      const taxable = baseAmount / (1 + gst);
      const tax = baseAmount - taxable;
      return {
        taxable,
        tax,
        total: baseAmount,
        cgst: taxType === "intra" ? tax / 2 : 0,
        sgst: taxType === "intra" ? tax / 2 : 0,
        igst: taxType === "inter" ? tax : 0,
      };
    }

    const tax = baseAmount * gst;
    return {
      taxable: baseAmount,
      tax,
      total: baseAmount + tax,
      cgst: taxType === "intra" ? tax / 2 : 0,
      sgst: taxType === "intra" ? tax / 2 : 0,
      igst: taxType === "inter" ? tax : 0,
    };
  }, [amount, rate, mode, taxType]);

  const report = useMemo(
    () =>
      [
        "GST Calculator Report",
        `Mode: ${mode === "exclusive" ? "Add GST" : "Extract GST"}`,
        `Tax type: ${taxType === "intra" ? "CGST + SGST" : "IGST"}`,
        `Amount entered: ${formatMoney(Number(amount) || 0)}`,
        `GST rate: ${rate}%`,
        `Taxable value: ${formatMoney(result.taxable)}`,
        `GST amount: ${formatMoney(result.tax)}`,
        `CGST: ${formatMoney(result.cgst)}`,
        `SGST: ${formatMoney(result.sgst)}`,
        `IGST: ${formatMoney(result.igst)}`,
        `Final amount: ${formatMoney(result.total)}`,
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [amount, mode, rate, result, taxType]
  );

  const applyPreset = (preset) => {
    setAmount(preset.amount);
    setRate(preset.rate);
    setMode(preset.mode);
    setTaxType(preset.taxType);
  };

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="grid gap-6 2xl:grid-cols-[1fr_340px] 2xl:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <ReceiptText className="h-4 w-4" />
                Finance calculator
              </div>
              <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">GST Calculator</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Calculate GST-inclusive or GST-exclusive prices with clean tax splits for invoices and quotes.
              </p>
            </div>
            <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Total amount</p>
              <p className="tool-money-value tool-hero-value mt-2 text-[var(--primary)]">{formatMoney(result.total)}</p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">GST amount: {formatMoney(result.tax)}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[420px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Inputs</h2>
              <button
                type="button"
                onClick={() => {
                  setAmount(10000);
                  setRate(18);
                  setMode("exclusive");
                  setTaxType("intra");
                }}
                className="btn-secondary min-h-9 px-3 py-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>

            <div className="mb-5">
              <span className="text-sm font-semibold">Quick presets</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                {GST_PRESETS.map((preset) => (
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

            <label className="block">
              <span className="text-sm font-semibold">Amount</span>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
              />
            </label>

            <div className="mt-5">
              <span className="text-sm font-semibold">GST rate</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {GST_RATES.map((gstRate) => (
                  <button
                    key={gstRate}
                    type="button"
                    onClick={() => setRate(gstRate)}
                    className={`h-10 rounded-md border text-sm font-semibold transition ${
                      rate === gstRate
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {gstRate}%
                  </button>
                ))}
              </div>
            </div>

            <div className="tool-compact-grid mt-5">
              {[
                ["exclusive", "Add GST"],
                ["inclusive", "Extract GST"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold ${
                    mode === value
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="tool-compact-grid mt-5">
              {[
                ["intra", "CGST + SGST"],
                ["inter", "IGST"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTaxType(value)}
                  className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold ${
                    taxType === value
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="tool-card-grid">
              <StatCard label="Taxable value" value={formatMoney(result.taxable)} />
              <StatCard label="GST amount" value={formatMoney(result.tax)} tone="primary" />
              <StatCard label="CGST" value={formatMoney(result.cgst)} />
              <StatCard label="SGST" value={formatMoney(result.sgst)} />
              <StatCard label="IGST" value={formatMoney(result.igst)} />
              <StatCard label="Final amount" value={formatMoney(result.total)} tone="primary" />
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
                  <Calculator className="h-4 w-4" />
                  Formula
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy report"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTextFile("gst-calculation-report.txt", report)}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <FileDown className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                {mode === "exclusive"
                  ? "GST amount = Taxable value x GST rate / 100. Final amount = Taxable value + GST amount."
                  : "Taxable value = Inclusive amount / (1 + GST rate / 100). GST amount = Inclusive amount - Taxable value."}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
