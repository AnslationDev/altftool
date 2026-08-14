"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HardDrive, RotateCcw } from "lucide-react";

import { SNAPSHOT_PER_GB_MONTH, VOLUME_TYPES, computeEbsCost } from "../lib";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-US");

const money = (value) => USD.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  volumeType: "gp3",
  sizeGb: "500",
  provisionedIops: "3000",
  throughputMbps: "125",
  volumeCount: "1",
  snapshotGb: "0",
};

const DASH = "—";

export default function ToolHome() {
  const [volumeType, setVolumeType] = useState(DEFAULTS.volumeType);
  const [sizeGb, setSizeGb] = useState(DEFAULTS.sizeGb);
  const [provisionedIops, setProvisionedIops] = useState(DEFAULTS.provisionedIops);
  const [throughputMbps, setThroughputMbps] = useState(DEFAULTS.throughputMbps);
  const [volumeCount, setVolumeCount] = useState(DEFAULTS.volumeCount);
  const [snapshotGb, setSnapshotGb] = useState(DEFAULTS.snapshotGb);
  const [copied, setCopied] = useState(false);

  const type = VOLUME_TYPES.find((t) => t.id === volumeType) ?? VOLUME_TYPES[0];

  const result = useMemo(
    () =>
      computeEbsCost({
        volumeType,
        sizeGb: sizeGb.trim() === "" ? Number.NaN : Number(sizeGb),
        provisionedIops: provisionedIops.trim() === "" ? 0 : Number(provisionedIops),
        throughputMbps: throughputMbps.trim() === "" ? 0 : Number(throughputMbps),
        volumeCount: volumeCount.trim() === "" ? 1 : Number(volumeCount),
        snapshotGb: snapshotGb.trim() === "" ? 0 : Number(snapshotGb),
      }),
    [volumeType, sizeGb, provisionedIops, throughputMbps, volumeCount, snapshotGb],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "AWS EBS monthly cost estimate (us-east-1 list prices)",
      `Volume: ${result.volumeCount} × ${NUM.format(Number(sizeGb))} GB ${result.volumeLabel}`,
      `Storage: ${money(result.storageCost)}`,
      `Provisioned IOPS: ${money(result.iopsCost)}`,
      `Provisioned throughput: ${money(result.throughputCost)}`,
      `Snapshots: ${NUM.format(result.snapshotGbTotal)} GB total stored data at the standard tier = ${money(result.snapshotCost)}`,
      `Total per month: ${money(result.total)}`,
    ].join("\n");
  }, [hasError, result, sizeGb, snapshotGb]);

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
    setVolumeType(DEFAULTS.volumeType);
    setSizeGb(DEFAULTS.sizeGb);
    setProvisionedIops(DEFAULTS.provisionedIops);
    setThroughputMbps(DEFAULTS.throughputMbps);
    setVolumeCount(DEFAULTS.volumeCount);
    setSnapshotGb(DEFAULTS.snapshotGb);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Storage", DASH],
        ["Provisioned IOPS", DASH],
        ["Provisioned throughput", DASH],
        ["Snapshots", DASH],
        ["Cost per volume", DASH],
      ]
    : [
        ["Storage", money(result.storageCost)],
        ["Provisioned IOPS", money(result.iopsCost)],
        ["Provisioned throughput", money(result.throughputCost)],
        ["Snapshots (standard tier)", money(result.snapshotCost)],
        ["Cost per volume", money(result.perVolume)],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HardDrive className="h-4 w-4" aria-hidden="true" />
          Cloud cost
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          AWS EBS Cost Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Estimate the monthly bill for EBS volumes using us-east-1 list prices — gp3 storage at
          $0.08/GB-month with 3,000 free IOPS and 125 MB/s free throughput, io2 tiered IOPS, plus
          snapshot storage at ${SNAPSHOT_PER_GB_MONTH.toFixed(2)}/GB-month.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ebs-type">
              Volume type
            </label>
            <select
              id="ebs-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={volumeType}
              onChange={(event) => setVolumeType(event.target.value)}
            >
              {VOLUME_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebs-size">
              Volume size (GB)
            </label>
            <input
              id="ebs-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              step="10"
              value={sizeGb}
              onChange={(event) => setSizeGb(event.target.value)}
            />
          </div>
          {type.supportsProvisionedIops ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ebs-iops">
                Provisioned IOPS
              </label>
              <input
                id="ebs-iops"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="100"
                value={provisionedIops}
                onChange={(event) => setProvisionedIops(event.target.value)}
              />
              {type.id === "gp3" ? (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  First 3,000 IOPS are included free on gp3.
                </p>
              ) : null}
            </div>
          ) : null}
          {type.supportsProvisionedThroughput ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="ebs-throughput">
                Provisioned throughput (MB/s)
              </label>
              <input
                id="ebs-throughput"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="25"
                value={throughputMbps}
                onChange={(event) => setThroughputMbps(event.target.value)}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                First 125 MB/s is included free on gp3.
              </p>
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="ebs-count">
              Number of identical volumes
            </label>
            <input
              id="ebs-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={volumeCount}
              onChange={(event) => setVolumeCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ebs-snapshot">
              Total snapshot storage (GB, standard tier)
            </label>
            <input
              id="ebs-snapshot"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={snapshotGb}
              onChange={(event) => setSnapshotGb(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Enter the total incremental snapshot data stored across all volumes; this is not multiplied by volume count.
            </p>
          </div>
        </div>
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
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Estimated monthly EBS cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.total)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "us-east-1 on-demand list prices; other regions differ."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the EBS cost estimate"
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

        <dl
          className="mt-5 divide-y divide-[var(--border)] text-sm"
          aria-live="polite"
          aria-atomic="true"
        >
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">us-east-1 storage rates used</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Volume type
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Storage $/GB-month
                </th>
              </tr>
            </thead>
            <tbody>
              {VOLUME_TYPES.map((option) => (
                <tr key={option.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">{option.label}</td>
                  <td className="py-2 text-right font-semibold">
                    ${option.storagePerGbMonth.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimate only, based on published us-east-1 on-demand list prices. AWS bills
        per second of provisioned time, and prices vary by region and change over time — confirm in
        the AWS Pricing Calculator before budgeting.
      </p>
    </main>
  );
}
