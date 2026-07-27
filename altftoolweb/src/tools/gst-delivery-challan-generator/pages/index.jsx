"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Plus, RotateCcw, Trash2, Truck } from "lucide-react";

import {
  CHALLAN_PURPOSES,
  EWAY_BILL_THRESHOLD,
  GST_RATES,
  JOB_WORK_RETURN_YEARS,
  MAX_SERIAL_LENGTH,
  buildDeliveryChallan,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const QTY = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD_CLASS = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const DASH = "—";

const PURPOSE_KEYS = Object.keys(CHALLAN_PURPOSES);

const DEFAULT_LINES = [
  {
    description: "MS steel bracket, laser cut",
    hsn: "7326",
    quantity: "10",
    unit: "NOS",
    rate: "2500",
    gstRate: "18",
  },
];

const DEFAULTS = {
  serialNumber: "DC/25-26/001",
  dateOfIssue: "2025-06-15",
  purpose: "jobWork",
  jobWorkGoodsType: "inputs",
  consignerName: "Alpha Engineering Works",
  consignerAddress: "Plot 24, MIDC Bhosari, Pune 411026",
  consignerGstin: "27AAAPL1234C1ZE",
  consigneeName: "Beta Powder Coating",
  consigneeAddress: "Gat 118, Chakan, Pune 410501",
  consigneeGstin: "27AABCJ5678K1Z1",
  placeOfSupply: "Maharashtra",
  vehicleNumber: "MH12 AB 3456",
  transporter: "Sai Roadlines",
  signed: true,
};

const blankLine = () => ({
  description: "",
  hsn: "",
  quantity: "1",
  unit: "NOS",
  rate: "0",
  gstRate: "18",
});

const toNumber = (value) => (String(value).trim() === "" ? Number.NaN : Number(value));

export default function ToolHome() {
  const [serialNumber, setSerialNumber] = useState(DEFAULTS.serialNumber);
  const [dateOfIssue, setDateOfIssue] = useState(DEFAULTS.dateOfIssue);
  const [purpose, setPurpose] = useState(DEFAULTS.purpose);
  const [jobWorkGoodsType, setJobWorkGoodsType] = useState(DEFAULTS.jobWorkGoodsType);
  const [consignerName, setConsignerName] = useState(DEFAULTS.consignerName);
  const [consignerAddress, setConsignerAddress] = useState(DEFAULTS.consignerAddress);
  const [consignerGstin, setConsignerGstin] = useState(DEFAULTS.consignerGstin);
  const [consigneeName, setConsigneeName] = useState(DEFAULTS.consigneeName);
  const [consigneeAddress, setConsigneeAddress] = useState(DEFAULTS.consigneeAddress);
  const [consigneeGstin, setConsigneeGstin] = useState(DEFAULTS.consigneeGstin);
  const [placeOfSupply, setPlaceOfSupply] = useState(DEFAULTS.placeOfSupply);
  const [vehicleNumber, setVehicleNumber] = useState(DEFAULTS.vehicleNumber);
  const [transporter, setTransporter] = useState(DEFAULTS.transporter);
  const [signed, setSigned] = useState(DEFAULTS.signed);
  const [lines, setLines] = useState(DEFAULT_LINES);
  const [copied, setCopied] = useState(false);

  const showTax = CHALLAN_PURPOSES[purpose]?.taxOnChallan ?? false;
  const isJobWork = CHALLAN_PURPOSES[purpose]?.jobWork ?? false;

  const result = useMemo(
    () =>
      buildDeliveryChallan({
        serialNumber,
        dateOfIssue,
        purpose,
        jobWorkGoodsType,
        consigner: { name: consignerName, address: consignerAddress, gstin: consignerGstin },
        consignee: { name: consigneeName, address: consigneeAddress, gstin: consigneeGstin },
        placeOfSupply,
        vehicleNumber,
        transporter,
        signed,
        lines: lines.map((line) => ({
          description: line.description,
          hsn: line.hsn,
          unit: line.unit,
          quantity: toNumber(line.quantity),
          rate: toNumber(line.rate),
          gstRate: toNumber(line.gstRate),
        })),
      }),
    [
      serialNumber,
      dateOfIssue,
      purpose,
      jobWorkGoodsType,
      consignerName,
      consignerAddress,
      consignerGstin,
      consigneeName,
      consigneeAddress,
      consigneeGstin,
      placeOfSupply,
      vehicleNumber,
      transporter,
      signed,
      lines,
    ],
  );

  const hasError = Boolean(result.error);

  const updateLine = (index, field, value) => {
    setLines((current) =>
      current.map((line, i) => (i === index ? { ...line, [field]: value } : line)),
    );
  };

  const addLine = () => setLines((current) => [...current, blankLine()]);
  const removeLine = (index) =>
    setLines((current) => (current.length <= 1 ? current : current.filter((_, i) => i !== index)));

  const challanText = useMemo(() => {
    if (hasError) return "";
    const rows = result.lines.map(
      (line, i) =>
        `${i + 1}. ${line.description}${line.hsn ? ` (HSN ${line.hsn})` : ""} — ` +
        `${QTY.format(line.quantity)} ${line.unit || ""} x ${INR2.format(line.rate)} = ${INR2.format(line.taxableValue)}` +
        (result.showTax ? ` + ${line.gstRate}% GST ${INR2.format(line.taxAmount)}` : ""),
    );
    const parts = [
      "DELIVERY CHALLAN (Rule 55, CGST Rules 2017)",
      `Challan No: ${result.serialNumber}    Date: ${result.dateOfIssue}`,
      `Purpose: ${result.purposeLabel}`,
      "",
      `Consigner: ${result.consigner.name}`,
      `${result.consigner.address || ""}`,
      `GSTIN: ${result.consigner.gstin} (${result.consigner.stateName})`,
      "",
      `Consignee: ${result.consignee.name || DASH}`,
      `${result.consignee.address || ""}`,
      `GSTIN: ${result.consignee.gstin || "Unregistered"}${result.consignee.stateName ? ` (${result.consignee.stateName})` : ""}`,
      result.placeOfSupply ? `Place of supply: ${result.placeOfSupply}` : "",
      result.vehicleNumber ? `Vehicle: ${result.vehicleNumber}` : "",
      result.transporter ? `Transporter: ${result.transporter}` : "",
      "",
      ...rows,
      "",
      `Taxable value: ${INR2.format(result.taxableValue)}`,
    ];
    if (result.showTax) {
      if (result.interState) {
        parts.push(`IGST: ${INR2.format(result.igst)}`);
      } else {
        parts.push(`CGST: ${INR2.format(result.cgst)}`, `SGST: ${INR2.format(result.sgst)}`);
      }
    }
    parts.push(
      `Consignment value: ${INR2.format(result.consignmentValue)}`,
      `In words: ${result.amountInWords}`,
      `E-way bill required: ${result.ewayBillRequired ? "Yes" : "No"}`,
    );
    if (result.jobWork) {
      parts.push(
        `Job work (${result.jobWork.goodsType === "inputs" ? "inputs" : "capital goods"}): return or supply by ${result.jobWork.returnBy} — Section 143`,
      );
    }
    parts.push("", ...result.copies.map((copy) => `[ ] ${copy}`));
    return parts.filter((part) => part !== undefined).join("\n");
  }, [hasError, result]);

  const copyResult = async () => {
    if (!challanText) return;
    try {
      await navigator.clipboard.writeText(challanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setSerialNumber(DEFAULTS.serialNumber);
    setDateOfIssue(DEFAULTS.dateOfIssue);
    setPurpose(DEFAULTS.purpose);
    setJobWorkGoodsType(DEFAULTS.jobWorkGoodsType);
    setConsignerName(DEFAULTS.consignerName);
    setConsignerAddress(DEFAULTS.consignerAddress);
    setConsignerGstin(DEFAULTS.consignerGstin);
    setConsigneeName(DEFAULTS.consigneeName);
    setConsigneeAddress(DEFAULTS.consigneeAddress);
    setConsigneeGstin(DEFAULTS.consigneeGstin);
    setPlaceOfSupply(DEFAULTS.placeOfSupply);
    setVehicleNumber(DEFAULTS.vehicleNumber);
    setTransporter(DEFAULTS.transporter);
    setSigned(DEFAULTS.signed);
    setLines(DEFAULT_LINES);
    setCopied(false);
  };

  const money = (value) => (hasError ? DASH : INR2.format(value));

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Truck className="h-4 w-4" aria-hidden="true" />
          Rule 55, CGST Rules 2017
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          GST Delivery Challan Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a delivery challan for goods moved without a tax invoice — job work, branch
          transfers, repairs, exhibitions and sale on approval. GSTINs are checksum-verified, the
          tax split follows the two state codes, and the e-way bill and Section 143 deadlines are
          worked out for you.
        </p>
      </header>

      <section className={`${CARD_CLASS} mb-6`} aria-labelledby="challan-details">
        <h2 id="challan-details" className="mb-4 text-lg font-semibold">
          Challan details
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-serial">
              Challan number
            </label>
            <input
              id="dc-serial"
              className={INPUT_CLASS}
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Consecutive series, at most {MAX_SERIAL_LENGTH} characters — letters, digits, hyphen
              and slash only.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-date">
              Date of issue
            </label>
            <input
              id="dc-date"
              type="date"
              className={INPUT_CLASS}
              value={dateOfIssue}
              onChange={(event) => setDateOfIssue(event.target.value)}
            />
            <p className={HINT_CLASS}>Used to date the job-work return deadline.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-purpose">
              Reason for movement
            </label>
            <select
              id="dc-purpose"
              className={INPUT_CLASS}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            >
              {PURPOSE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {CHALLAN_PURPOSES[key].label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              {showTax
                ? "Rule 55(1)(vii): tax rate and amount must be shown on this challan."
                : "No tax is shown — this movement is not a supply."}
            </p>
          </div>
          {isJobWork ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="dc-goods-type">
                Job work goods type
              </label>
              <select
                id="dc-goods-type"
                className={INPUT_CLASS}
                value={jobWorkGoodsType}
                onChange={(event) => setJobWorkGoodsType(event.target.value)}
              >
                <option value="inputs">Inputs ({JOB_WORK_RETURN_YEARS.inputs} year)</option>
                <option value="capitalGoods">
                  Capital goods ({JOB_WORK_RETURN_YEARS.capitalGoods} years)
                </option>
              </select>
              <p className={HINT_CLASS}>Section 143 return window.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className={`${CARD_CLASS} mb-6`} aria-labelledby="challan-parties">
        <h2 id="challan-parties" className="mb-4 text-lg font-semibold">
          Consigner and consignee
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-consigner-name">
              Consigner name
            </label>
            <input
              id="dc-consigner-name"
              className={INPUT_CLASS}
              value={consignerName}
              onChange={(event) => setConsignerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-consigner-gstin">
              Consigner GSTIN
            </label>
            <input
              id="dc-consigner-gstin"
              className={`${INPUT_CLASS} font-mono uppercase`}
              value={consignerGstin}
              onChange={(event) => setConsignerGstin(event.target.value.toUpperCase())}
              maxLength={15}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dc-consigner-address">
              Consigner address
            </label>
            <input
              id="dc-consigner-address"
              className={INPUT_CLASS}
              value={consignerAddress}
              onChange={(event) => setConsignerAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-consignee-name">
              Consignee name
            </label>
            <input
              id="dc-consignee-name"
              className={INPUT_CLASS}
              value={consigneeName}
              onChange={(event) => setConsigneeName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-consignee-gstin">
              Consignee GSTIN (blank if unregistered)
            </label>
            <input
              id="dc-consignee-gstin"
              className={`${INPUT_CLASS} font-mono uppercase`}
              value={consigneeGstin}
              onChange={(event) => setConsigneeGstin(event.target.value.toUpperCase())}
              maxLength={15}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dc-consignee-address">
              Consignee address
            </label>
            <input
              id="dc-consignee-address"
              className={INPUT_CLASS}
              value={consigneeAddress}
              onChange={(event) => setConsigneeAddress(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-place">
              Place of supply
            </label>
            <input
              id="dc-place"
              className={INPUT_CLASS}
              value={placeOfSupply}
              onChange={(event) => setPlaceOfSupply(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-vehicle">
              Vehicle number
            </label>
            <input
              id="dc-vehicle"
              className={INPUT_CLASS}
              value={vehicleNumber}
              onChange={(event) => setVehicleNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-transporter">
              Transporter
            </label>
            <input
              id="dc-transporter"
              className={INPUT_CLASS}
              value={transporter}
              onChange={(event) => setTransporter(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold"
              htmlFor="dc-signed"
            >
              <input
                id="dc-signed"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={signed}
                onChange={(event) => setSigned(event.target.checked)}
              />
              Challan will be signed
            </label>
          </div>
        </div>
      </section>

      <section className={`${CARD_CLASS} mb-6`} aria-labelledby="challan-lines">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="challan-lines" className="text-lg font-semibold">
            Goods being moved
          </h2>
          <button type="button" className={GHOST_BTN} onClick={addLine}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add line
          </button>
        </div>
        <div className="space-y-5">
          {lines.map((line, index) => (
            <div
              key={index}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                  Line {index + 1}
                </span>
                <button
                  type="button"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--danger)] transition hover:bg-[var(--danger-soft)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-40"
                  onClick={() => removeLine(index)}
                  disabled={lines.length <= 1}
                  aria-label={`Remove line ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`dc-desc-${index}`}>
                    Description of goods
                  </label>
                  <input
                    id={`dc-desc-${index}`}
                    className={INPUT_CLASS}
                    value={line.description}
                    onChange={(event) => updateLine(index, "description", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dc-hsn-${index}`}>
                    HSN code
                  </label>
                  <input
                    id={`dc-hsn-${index}`}
                    className={INPUT_CLASS}
                    inputMode="numeric"
                    value={line.hsn}
                    onChange={(event) => updateLine(index, "hsn", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dc-unit-${index}`}>
                    Unit
                  </label>
                  <input
                    id={`dc-unit-${index}`}
                    className={INPUT_CLASS}
                    value={line.unit}
                    onChange={(event) => updateLine(index, "unit", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dc-qty-${index}`}>
                    Quantity
                  </label>
                  <input
                    id={`dc-qty-${index}`}
                    className={INPUT_CLASS}
                    type="number"
                    min="0"
                    step="any"
                    value={line.quantity}
                    onChange={(event) => updateLine(index, "quantity", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dc-rate-${index}`}>
                    Rate per unit (₹)
                  </label>
                  <input
                    id={`dc-rate-${index}`}
                    className={INPUT_CLASS}
                    type="number"
                    min="0"
                    step="any"
                    value={line.rate}
                    onChange={(event) => updateLine(index, "rate", event.target.value)}
                  />
                </div>
                {showTax ? (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`dc-gst-${index}`}>
                      GST rate
                    </label>
                    <select
                      id={`dc-gst-${index}`}
                      className={INPUT_CLASS}
                      value={line.gstRate}
                      onChange={(event) => updateLine(index, "gstRate", event.target.value)}
                    >
                      {GST_RATES.map((rate) => (
                        <option key={rate} value={String(rate)}>
                          {rate}%
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={CARD_CLASS} aria-labelledby="challan-result">
        <h2 id="challan-result" className="mb-4 text-lg font-semibold">
          Challan summary
        </h2>

        {hasError ? (
          <p
            role="alert"
            className="mb-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        ) : null}

        <p className="text-sm font-medium text-[var(--muted-foreground)]">Consignment value</p>
        <p className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
          {hasError ? DASH : INR.format(result.consignmentValue)}
        </p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {hasError ? DASH : result.amountInWords}
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Taxable value</dt>
            <dd className="text-sm font-semibold tabular-nums">{money(result.taxableValue)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Total quantity</dt>
            <dd className="text-sm font-semibold tabular-nums">
              {hasError ? DASH : QTY.format(result.totalQuantity)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">CGST</dt>
            <dd className="text-sm font-semibold tabular-nums">{money(result.cgst)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">SGST</dt>
            <dd className="text-sm font-semibold tabular-nums">{money(result.sgst)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">IGST</dt>
            <dd className="text-sm font-semibold tabular-nums">{money(result.igst)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Movement type</dt>
            <dd className="text-sm font-semibold">
              {hasError ? DASH : result.interState ? "Inter-state (IGST)" : "Intra-state (CGST+SGST)"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">
              E-way bill (above {INR.format(EWAY_BILL_THRESHOLD)})
            </dt>
            <dd
              className={`text-sm font-semibold ${
                !hasError && result.ewayBillRequired
                  ? "text-[var(--danger)]"
                  : "text-[var(--success)]"
              }`}
            >
              {hasError ? DASH : result.ewayBillRequired ? "Required" : "Not required"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
            <dt className="text-sm text-[var(--muted-foreground)]">Job work return by</dt>
            <dd className="text-sm font-semibold tabular-nums">
              {hasError || !result.jobWork ? DASH : result.jobWork.returnBy}
            </dd>
          </div>
        </dl>

        {!hasError ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">Line-wise breakdown of the delivery challan</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Description
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    HSN
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Qty
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Rate
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Taxable
                  </th>
                  {result.showTax ? (
                    <th scope="col" className="py-2 text-right font-semibold">
                      Tax
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line, index) => (
                  <tr key={index} className="border-b border-[var(--border)]">
                    <td className="py-2 pr-3">{line.description}</td>
                    <td className="py-2 pr-3 tabular-nums">{line.hsn || DASH}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {QTY.format(line.quantity)} {line.unit}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">{INR2.format(line.rate)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {INR2.format(line.taxableValue)}
                    </td>
                    {result.showTax ? (
                      <td className="py-2 text-right tabular-nums">
                        {INR2.format(line.taxAmount)} ({line.gstRate}%)
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-6 space-y-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="flex gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]"
              >
                <AlertTriangle
                  className="mt-1 h-4 w-4 shrink-0 text-[var(--warning)]"
                  aria-hidden="true"
                />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {!hasError ? (
          <div className="mt-6">
            <p className="text-sm font-semibold">Copies to print — Rule 55(2)</p>
            <ul className="mt-2 grid gap-2 sm:grid-cols-3">
              {result.copies.map((copy) => (
                <li
                  key={copy}
                  className="rounded-md border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)]"
                >
                  {copy}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            disabled={hasError}
            aria-label="Copy the delivery challan to the clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy challan"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset all fields">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
