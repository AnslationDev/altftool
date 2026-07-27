"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Scale } from "lucide-react";

import {
  R2_CLASS_A_PER_M,
  R2_CLASS_B_PER_M,
  R2_STORAGE_PER_GB,
  S3_READ_PER_M,
  S3_WRITE_PER_M,
  compareR2VsS3,
} from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const PCT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  storageGb: "1000",
  writeOpsM: "1",
  readOpsM: "10",
  egressGb: "2000",
  applyR2FreeTier: true,
};

const DASH = "—";

export default function ToolHome() {
  const [storageGb, setStorageGb] = useState(DEFAULTS.storageGb);
  const [writeOpsM, setWriteOpsM] = useState(DEFAULTS.writeOpsM);
  const [readOpsM, setReadOpsM] = useState(DEFAULTS.readOpsM);
  const [egressGb, setEgressGb] = useState(DEFAULTS.egressGb);
  const [applyR2FreeTier, setApplyR2FreeTier] = useState(DEFAULTS.applyR2FreeTier);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareR2VsS3({
        storageGb: storageGb.trim() === "" ? Number.NaN : Number(storageGb),
        writeOpsM: writeOpsM.trim() === "" ? 0 : Number(writeOpsM),
        readOpsM: readOpsM.trim() === "" ? 0 : Number(readOpsM),
        egressGb: egressGb.trim() === "" ? 0 : Number(egressGb),
        applyR2FreeTier,
      }),
    [storageGb, writeOpsM, readOpsM, egressGb, applyR2FreeTier],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Cloudflare R2 vs Amazon S3 Standard monthly cost (list prices)",
      `R2 total: ${money(result.r2.total)} (storage ${money(result.r2.storage)}, writes ${money(result.r2.writes)}, reads ${money(result.r2.reads)}, egress $0)`,
      `S3 total: ${money(result.s3.total)} (storage ${money(result.s3.storage)}, writes ${money(result.s3.writes)}, reads ${money(result.s3.reads)}, egress ${money(result.s3.egress)})`,
      `${result.cheaper === "r2" ? "R2" : "S3"} is cheaper by ${money(result.saving)} (${PCT.format(result.savingPercent)}%)`,
    ].join("\n");
  }, [hasError, result]);

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
    setStorageGb(DEFAULTS.storageGb);
    setWriteOpsM(DEFAULTS.writeOpsM);
    setReadOpsM(DEFAULTS.readOpsM);
    setEgressGb(DEFAULTS.egressGb);
    setApplyR2FreeTier(DEFAULTS.applyR2FreeTier);
    setCopied(false);
  };

  const breakdown = [
    ["Storage", "storage"],
    ["Write requests", "writes"],
    ["Read requests", "reads"],
    ["Internet egress", "egress"],
    ["Total", "total"],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Scale className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          R2 vs S3 Cost Comparison
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Cloudflare R2 stores data at ${R2_STORAGE_PER_GB}/GB-month with zero egress fees; S3
          Standard charges $0.023/GB-month plus tiered internet egress from $0.09/GB. Enter your
          traffic profile to see which wins and by how much.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="r2s3-storage">
              Data stored (GB)
            </label>
            <input
              id="r2s3-storage"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={storageGb}
              onChange={(event) => setStorageGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="r2s3-egress">
              Served to the internet (GB/month)
            </label>
            <input
              id="r2s3-egress"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={egressGb}
              onChange={(event) => setEgressGb(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="r2s3-writes">
              Writes — PUT/COPY/LIST (millions/month)
            </label>
            <input
              id="r2s3-writes"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={writeOpsM}
              onChange={(event) => setWriteOpsM(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              R2 Class A ${R2_CLASS_A_PER_M}/M vs S3 ${S3_WRITE_PER_M}/M.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="r2s3-reads">
              Reads — GET (millions/month)
            </label>
            <input
              id="r2s3-reads"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={readOpsM}
              onChange={(event) => setReadOpsM(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              R2 Class B ${R2_CLASS_B_PER_M}/M vs S3 ${S3_READ_PER_M}/M.
            </p>
          </div>
        </div>
        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="r2s3-free"
        >
          <input
            id="r2s3-free"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={applyR2FreeTier}
            onChange={(event) => setApplyR2FreeTier(event.target.checked)}
          />
          Apply R2's monthly free tier (10 GB storage, 1M Class A and 10M Class B operations)
        </label>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {hasError
                ? "Monthly saving"
                : `${result.cheaper === "r2" ? "Cloudflare R2" : "Amazon S3"} is cheaper — monthly saving`}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.saving)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${PCT.format(result.savingPercent)}% less than the dearer option (R2 ${money(result.r2.total)} vs S3 ${money(result.s3.total)}).`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the R2 vs S3 comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Line item
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Cloudflare R2
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Amazon S3 Standard
                </th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map(([label, key]) => (
                <tr key={key} className="border-b border-[var(--border)] last:border-0">
                  <td className={`py-2 pr-3 ${key === "total" ? "font-semibold" : ""}`}>{label}</td>
                  <td className={`py-2 pr-3 text-right ${key === "total" ? "font-semibold" : ""}`}>
                    {hasError ? DASH : money(result.r2[key])}
                  </td>
                  <td className={`py-2 text-right ${key === "total" ? "font-semibold" : ""}`}>
                    {hasError ? DASH : money(result.s3[key])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational comparison of published list prices: R2 Standard versus S3 Standard in
        us-east-1. S3 infrequent-access tiers, R2 Infrequent Access, replication, lifecycle
        transitions and AWS's 12-month free tier are not modelled — validate against both providers'
        calculators before migrating.
      </p>
    </main>
  );
}
