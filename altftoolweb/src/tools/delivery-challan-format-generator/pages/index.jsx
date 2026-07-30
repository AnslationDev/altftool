"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, FileText, Info, RotateCcw, Truck } from "lucide-react";

import {
  CHALLAN_COPIES,
  CHALLAN_REASONS,
  EWB_THRESHOLD,
  GST_RATES,
  GST_STATE_CODES,
  RULE_55_PARTICULARS,
  UNITS,
  buildDeliveryChallan,
  challanToText,
  formatDate,
  formatInr,
} from "../lib";

const DASH = "—";
const QTY = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 3 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CARD = "rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)] sm:p-5";

const DEFAULTS = {
  challanNumber: "DC/2026-27/014",
  challanDate: "2026-07-29",
  reasonId: "job-work",
  consignerName: "Sunrise Textiles Pvt Ltd",
  consignerAddress: "Plot 14, MIDC Phase II, Pune 411019",
  consignerGstin: "27AAPFU0939F1ZV",
  consignerState: "27",
  consigneeName: "Rajesh Dyeing Works",
  consigneeAddress: "22 Industrial Estate, Surat 395002",
  consigneeGstin: "24AABCS1429B1Z0",
  consigneeState: "24",
  placeOfSupply: "Surat, Gujarat",
  forSupply: false,
  items: [
    {
      description: "Grey cotton fabric",
      hsn: "5208",
      uom: "MTR",
      quantity: "10",
      rate: "2500",
      taxRate: "5",
      provisional: false,
    },
    {
      description: "Polyester yarn cones",
      hsn: "5402",
      uom: "KGS",
      quantity: "5",
      rate: "6000",
      taxRate: "12",
      provisional: false,
    },
  ],
  mode: "Road",
  vehicle: "MH12AB1234",
  transporterId: "",
  distanceKm: "450",
  overDimensional: false,
  handicraftUnregistered: false,
  intraStateThreshold: String(EWB_THRESHOLD),
  goodsType: "inputs",
  tooling: false,
  dispatchDate: "2026-07-29",
  aato: "60000000",
};

const STATE_ENTRIES = Object.entries(GST_STATE_CODES);

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copyIndex, setCopyIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Move the sample dates to today only after mount, so server and client markup match.
  useEffect(() => {
    const now = new Date();
    const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`;
    setForm((prev) => ({ ...prev, challanDate: iso, dispatchDate: iso }));
  }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setItem = (index, key, value) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));

  const addItem = () =>
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          hsn: "",
          uom: "NOS",
          quantity: "1",
          rate: "0",
          taxRate: "5",
          provisional: false,
        },
      ],
    }));

  const removeItem = (index) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items,
    }));

  const result = useMemo(
    () =>
      buildDeliveryChallan({
        challanNumber: form.challanNumber,
        challanDate: form.challanDate,
        reasonId: form.reasonId,
        placeOfSupply: form.placeOfSupply,
        forSupply: form.forSupply,
        consigner: {
          name: form.consignerName,
          address: form.consignerAddress,
          gstin: form.consignerGstin,
          stateCode: form.consignerState,
        },
        consignee: {
          name: form.consigneeName,
          address: form.consigneeAddress,
          gstin: form.consigneeGstin,
          stateCode: form.consigneeState,
        },
        items: form.items,
        transport: {
          mode: form.mode,
          vehicle: form.vehicle,
          transporterId: form.transporterId,
          distanceKm: form.distanceKm,
          overDimensional: form.overDimensional,
          handicraftUnregistered: form.handicraftUnregistered,
        },
        jobWork: {
          goodsType: form.goodsType,
          tooling: form.tooling,
          dispatchDate: form.dispatchDate,
          aato: form.aato,
        },
        intraStateThreshold: form.intraStateThreshold,
      }),
    [form],
  );

  const hasError = Boolean(result.error);
  const challan = hasError ? null : result;
  const text = useMemo(
    () => (challan ? challanToText(challan, CHALLAN_COPIES[copyIndex].marking) : ""),
    [challan, copyIndex],
  );

  const copyResult = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopyIndex(0);
    setCopied(false);
  };

  const currentReason = CHALLAN_REASONS.find((entry) => entry.id === form.reasonId);
  const jobWorkReason = Boolean(currentReason?.jobWork);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Truck className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Delivery Challan Format Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lays out a delivery challan carrying the nine particulars Rule 55(2) of the CGST Rules,
          2017 requires, in the triplicate Rule 55(3) prescribes. It works out the consignment value
          as Explanation 2 to Rule 138(1) defines it, says whether an e-way bill is needed and how
          long it stays valid, and dates the section 143 job-work return. Everything runs in this
          browser.
        </p>
      </header>

      <section aria-label="Challan header" className={CARD}>
        <h2 className="text-base font-semibold">Challan</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-number">
              Challan number
            </label>
            <input
              id="dc-number"
              type="text"
              className={`${INPUT_CLASS} mt-1`}
              value={form.challanNumber}
              onChange={(event) => set("challanNumber", event.target.value)}
            />
            <p className={HINT_CLASS}>A consecutive series for the financial year — Rule 55(2)(i).</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-date">
              Challan date
            </label>
            <input
              id="dc-date"
              type="date"
              className={`${INPUT_CLASS} mt-1`}
              value={form.challanDate}
              onChange={(event) => set("challanDate", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="dc-reason">
              Why are the goods moving?
            </label>
            <select
              id="dc-reason"
              className={`${INPUT_CLASS} mt-1`}
              value={form.reasonId}
              onChange={(event) => set("reasonId", event.target.value)}
            >
              {CHALLAN_REASONS.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.label} — {reason.clause}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{currentReason?.detail}</p>
          </div>
          <div className="sm:col-span-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-medium"
              htmlFor="dc-forsupply"
            >
              <input
                id="dc-forsupply"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.forSupply}
                onChange={(event) => set("forSupply", event.target.checked)}
              />
              The movement is a supply to the consignee, so tax has to be shown
            </label>
            <p className={HINT_CLASS}>
              Rule 55(2)(vii) asks for the tax rate and amount only where the transportation is for
              supply to the consignee.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section aria-label="Consigner" className={CARD}>
          <h2 className="text-base font-semibold">Consigner — Rule 55(2)(ii)</h2>
          <div className="mt-3 grid gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="dc-cnr-name">
                Name
              </label>
              <input
                id="dc-cnr-name"
                type="text"
                className={`${INPUT_CLASS} mt-1`}
                value={form.consignerName}
                onChange={(event) => set("consignerName", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="dc-cnr-address">
                Address
              </label>
              <textarea
                id="dc-cnr-address"
                className={`${AREA_CLASS} mt-1 min-h-20`}
                value={form.consignerAddress}
                onChange={(event) => set("consignerAddress", event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="dc-cnr-gstin">
                  GSTIN (if registered)
                </label>
                <input
                  id="dc-cnr-gstin"
                  type="text"
                  className={`${INPUT_CLASS} mt-1 uppercase`}
                  value={form.consignerGstin}
                  onChange={(event) => set("consignerGstin", event.target.value.toUpperCase())}
                />
                <p className={HINT_CLASS}>Checked against the GSTIN mod-36 check digit.</p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="dc-cnr-state">
                  State (if unregistered)
                </label>
                <select
                  id="dc-cnr-state"
                  className={`${INPUT_CLASS} mt-1`}
                  value={form.consignerState}
                  onChange={(event) => set("consignerState", event.target.value)}
                >
                  <option value="">Not stated</option>
                  {STATE_ENTRIES.map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} — {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Consignee" className={CARD}>
          <h2 className="text-base font-semibold">Consignee — Rule 55(2)(iii)</h2>
          <div className="mt-3 grid gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="dc-cne-name">
                Name
              </label>
              <input
                id="dc-cne-name"
                type="text"
                className={`${INPUT_CLASS} mt-1`}
                value={form.consigneeName}
                onChange={(event) => set("consigneeName", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="dc-cne-address">
                Address
              </label>
              <textarea
                id="dc-cne-address"
                className={`${AREA_CLASS} mt-1 min-h-20`}
                value={form.consigneeAddress}
                onChange={(event) => set("consigneeAddress", event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="dc-cne-gstin">
                  GSTIN or UIN (if registered)
                </label>
                <input
                  id="dc-cne-gstin"
                  type="text"
                  className={`${INPUT_CLASS} mt-1 uppercase`}
                  value={form.consigneeGstin}
                  onChange={(event) => set("consigneeGstin", event.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="dc-cne-state">
                  State (if unregistered)
                </label>
                <select
                  id="dc-cne-state"
                  className={`${INPUT_CLASS} mt-1`}
                  value={form.consigneeState}
                  onChange={(event) => set("consigneeState", event.target.value)}
                >
                  <option value="">Not stated</option>
                  {STATE_ENTRIES.map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} — {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="dc-pos">
                Place of supply (inter-State movement only)
              </label>
              <input
                id="dc-pos"
                type="text"
                className={`${INPUT_CLASS} mt-1`}
                value={form.placeOfSupply}
                onChange={(event) => set("placeOfSupply", event.target.value)}
              />
              <p className={HINT_CLASS}>Required by Rule 55(2)(viii) when the States differ.</p>
            </div>
          </div>
        </section>
      </div>

      <section aria-label="Goods" className={`${CARD} mt-4`}>
        <h2 className="text-base font-semibold">Goods — Rule 55(2)(iv) to (vi)</h2>
        <div className="mt-3 grid gap-4">
          {form.items.map((item, index) => (
            <div key={index} className="rounded-lg border border-[var(--border)] p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`dc-desc-${index}`}>
                    Description of goods {index + 1}
                  </label>
                  <input
                    id={`dc-desc-${index}`}
                    type="text"
                    className={`${INPUT_CLASS} mt-1`}
                    value={item.description}
                    onChange={(event) => setItem(index, "description", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dc-hsn-${index}`}>
                    HSN code
                  </label>
                  <input
                    id={`dc-hsn-${index}`}
                    type="text"
                    inputMode="numeric"
                    className={`${INPUT_CLASS} mt-1`}
                    value={item.hsn}
                    onChange={(event) => setItem(index, "hsn", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dc-uom-${index}`}>
                    Unit
                  </label>
                  <select
                    id={`dc-uom-${index}`}
                    className={`${INPUT_CLASS} mt-1`}
                    value={item.uom}
                    onChange={(event) => setItem(index, "uom", event.target.value)}
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dc-qty-${index}`}>
                    Quantity
                  </label>
                  <input
                    id={`dc-qty-${index}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    className={`${INPUT_CLASS} mt-1`}
                    value={item.quantity}
                    onChange={(event) => setItem(index, "quantity", event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`dc-rate-${index}`}>
                    Value per unit
                  </label>
                  <input
                    id={`dc-rate-${index}`}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    className={`${INPUT_CLASS} mt-1`}
                    value={item.rate}
                    onChange={(event) => setItem(index, "rate", event.target.value)}
                  />
                </div>
                {form.forSupply ? (
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`dc-tax-${index}`}>
                      GST rate
                    </label>
                    <select
                      id={`dc-tax-${index}`}
                      className={`${INPUT_CLASS} mt-1`}
                      value={item.taxRate}
                      onChange={(event) => setItem(index, "taxRate", event.target.value)}
                    >
                      {GST_RATES.map((rate) => (
                        <option key={rate} value={String(rate)}>
                          {rate}%
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-end">
                  <label
                    className="flex min-h-11 flex-1 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-medium"
                    htmlFor={`dc-prov-${index}`}
                  >
                    <input
                      id={`dc-prov-${index}`}
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--primary)]"
                      checked={item.provisional}
                      onChange={(event) => setItem(index, "provisional", event.target.checked)}
                    />
                    Quantity is provisional — Rule 55(2)(v)
                  </label>
                  <button
                    type="button"
                    className={GHOST_BTN}
                    onClick={() => removeItem(index)}
                    disabled={form.items.length < 2}
                    aria-label={`Remove line ${index + 1}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div>
            <button type="button" className={GHOST_BTN} onClick={addItem}>
              Add a line
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Transport" className={`${CARD} mt-4`}>
        <h2 className="text-base font-semibold">Transport and e-way bill</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-mode">
              Mode
            </label>
            <select
              id="dc-mode"
              className={`${INPUT_CLASS} mt-1`}
              value={form.mode}
              onChange={(event) => set("mode", event.target.value)}
            >
              {["Road", "Rail", "Air", "Ship"].map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-vehicle">
              Vehicle number
            </label>
            <input
              id="dc-vehicle"
              type="text"
              className={`${INPUT_CLASS} mt-1 uppercase`}
              value={form.vehicle}
              onChange={(event) => set("vehicle", event.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-transporter">
              Transporter ID (optional)
            </label>
            <input
              id="dc-transporter"
              type="text"
              className={`${INPUT_CLASS} mt-1 uppercase`}
              value={form.transporterId}
              onChange={(event) => set("transporterId", event.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-distance">
              Approximate distance (km)
            </label>
            <input
              id="dc-distance"
              type="number"
              inputMode="numeric"
              min="0"
              className={`${INPUT_CLASS} mt-1`}
              value={form.distanceKm}
              onChange={(event) => set("distanceKm", event.target.value)}
            />
            <p className={HINT_CLASS}>Sets the e-way bill validity under Rule 138(10).</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dc-threshold">
              Intra-State e-way bill threshold
            </label>
            <input
              id="dc-threshold"
              type="number"
              inputMode="numeric"
              min="1"
              className={`${INPUT_CLASS} mt-1`}
              value={form.intraStateThreshold}
              onChange={(event) => set("intraStateThreshold", event.target.value)}
            />
            <p className={HINT_CLASS}>
              {formatInr(EWB_THRESHOLD)} under Rule 138(1). Several States notified a higher limit
              for movement inside the State — set yours here.
            </p>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-medium"
              htmlFor="dc-odc"
            >
              <input
                id="dc-odc"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.overDimensional}
                onChange={(event) => set("overDimensional", event.target.checked)}
              />
              Over dimensional cargo
            </label>
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-medium"
              htmlFor="dc-handicraft"
            >
              <input
                id="dc-handicraft"
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={form.handicraftUnregistered}
                onChange={(event) => set("handicraftUnregistered", event.target.checked)}
              />
              Handicraft goods, mover exempt from registration
            </label>
          </div>
        </div>
      </section>

      {jobWorkReason ? (
        <section aria-label="Job work" className={`${CARD} mt-4`}>
          <h2 className="text-base font-semibold">Job work — section 143 and ITC-04</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="dc-goodstype">
                What was sent
              </label>
              <select
                id="dc-goodstype"
                className={`${INPUT_CLASS} mt-1`}
                value={form.goodsType}
                onChange={(event) => set("goodsType", event.target.value)}
              >
                <option value="inputs">Inputs — back within 1 year</option>
                <option value="capital">Capital goods — back within 3 years</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="dc-dispatch">
                Date the goods were sent out
              </label>
              <input
                id="dc-dispatch"
                type="date"
                className={`${INPUT_CLASS} mt-1`}
                value={form.dispatchDate}
                onChange={(event) => set("dispatchDate", event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="dc-aato">
                Aggregate annual turnover
              </label>
              <input
                id="dc-aato"
                type="number"
                inputMode="numeric"
                min="0"
                className={`${INPUT_CLASS} mt-1`}
                value={form.aato}
                onChange={(event) => set("aato", event.target.value)}
              />
              <p className={HINT_CLASS}>Decides whether ITC-04 is half-yearly or annual.</p>
            </div>
            <div className="flex items-end">
              <label
                className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-medium"
                htmlFor="dc-tooling"
              >
                <input
                  id="dc-tooling"
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={form.tooling}
                  onChange={(event) => set("tooling", event.target.checked)}
                />
                Moulds, dies, jigs, fixtures or tools
              </label>
            </div>
          </div>
        </section>
      ) : null}

      {hasError ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section aria-label="Result" className={`${CARD} mt-4`}>
        <p className="text-sm font-semibold text-[var(--muted-foreground)]">
          Consignment value — Explanation 2 to Rule 138(1)
        </p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--primary)]">
          {challan ? formatInr(challan.totals.consignmentValue) : DASH}
        </p>
        <p className="mt-1 text-sm">{challan ? challan.amountInWords : DASH}</p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Taxable value
            </dt>
            <dd className="text-sm font-semibold tabular-nums">
              {challan ? formatInr(challan.totals.taxable) : DASH}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Tax charged
            </dt>
            <dd className="text-sm font-semibold tabular-nums">
              {!challan
                ? DASH
                : challan.forSupply
                  ? `${formatInr(challan.totals.tax)} — CGST ${formatInr(
                      challan.totals.cgst,
                    )}, SGST ${formatInr(challan.totals.sgst)}, IGST ${formatInr(challan.totals.igst)}`
                  : "None — this movement is not a supply"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">Movement</dt>
            <dd className="text-sm font-semibold">
              {!challan
                ? DASH
                : challan.parties.interState === null
                  ? "State not known"
                  : challan.parties.interState
                    ? `Inter-State · ${challan.parties.consigner.stateName} to ${challan.parties.consignee.stateName}`
                    : `Intra-State · ${challan.parties.consigner.stateName}`}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">E-way bill</dt>
            <dd
              className={`text-sm font-semibold ${
                challan ? (challan.ewayBill.required ? "text-[var(--danger)]" : "text-[var(--success)]") : ""
              }`}
            >
              {!challan ? DASH : challan.ewayBill.required ? "Required" : "Not required"}
              {challan && challan.ewayBill.required && challan.ewayBill.validityDays
                ? ` · valid ${challan.ewayBill.validityDays} day${
                    challan.ewayBill.validityDays === 1 ? "" : "s"
                  } from generation`
                : ""}
            </dd>
          </div>
        </dl>

        {challan ? (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-[var(--muted-foreground)]">
            {challan.ewayBill.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
            <li>{challan.ewayBill.partBNote}</li>
            {challan.ewayBill.required && challan.ewayBill.validityDays ? (
              <li>
                Rule 138(10): one day for the first {challan.ewayBill.kmPerDay} km and one more day
                for every {challan.ewayBill.kmPerDay} km or part after that, counted from when the
                e-way bill is generated.
              </li>
            ) : null}
          </ul>
        ) : null}

        {challan && challan.jobWork ? (
          <div className="mt-4 rounded-lg border border-[var(--border)] p-3">
            <h3 className="text-sm font-semibold">Job work clocks</h3>
            <dl className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  Due back by
                </dt>
                <dd className="text-sm font-semibold">
                  {challan.jobWork.returnBy ? formatDate(challan.jobWork.returnBy) : "Not applicable"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  If the Commissioner extends
                </dt>
                <dd className="text-sm font-semibold">
                  {challan.jobWork.extendedReturnBy
                    ? formatDate(challan.jobWork.extendedReturnBy)
                    : "Not applicable"}
                </dd>
              </div>
              {challan.jobWork.itc04 ? (
                <>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      ITC-04 period
                    </dt>
                    <dd className="text-sm font-semibold">
                      {challan.jobWork.itc04.frequency} · {challan.jobWork.itc04.period}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      ITC-04 due
                    </dt>
                    <dd className="text-sm font-semibold">{formatDate(challan.jobWork.itc04.dueDate)}</dd>
                  </div>
                </>
              ) : null}
            </dl>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">{challan.jobWork.basis}</p>
            {challan.jobWork.extensionBasis ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {challan.jobWork.extensionBasis}
              </p>
            ) : null}
            {challan.jobWork.itc04 ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{challan.jobWork.itc04.basis}</p>
            ) : null}
          </div>
        ) : null}

        {challan && challan.missing.length > 0 ? (
          <div
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            <p className="font-semibold">Rule 55(2) particulars still missing:</p>
            <ul className="mt-1 list-disc pl-5">
              {challan.missing.map((particular) => (
                <li key={particular.id}>
                  {particular.clause} — {particular.label}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {challan && challan.warnings.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {challan.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section aria-label="Challan preview" className={`${CARD} mt-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Challan preview
          </h2>
          <div>
            <label className="sr-only" htmlFor="dc-copy">
              Which copy to print
            </label>
            <select
              id="dc-copy"
              className={INPUT_CLASS}
              value={copyIndex}
              onChange={(event) => setCopyIndex(Number(event.target.value))}
            >
              {CHALLAN_COPIES.map((copy, index) => (
                <option key={copy.id} value={index}>
                  {copy.marking} — {copy.clause}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  #
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Description
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  HSN
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Qty
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Unit
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Rate
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Taxable value
                </th>
                {challan?.forSupply ? (
                  <>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      CGST
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      SGST
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      IGST
                    </th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {!challan ? (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={7}>
                    {DASH}
                  </td>
                </tr>
              ) : (
                challan.lines.map((line) => (
                  <tr key={line.serial} className="border-b border-[var(--border)]/60">
                    <td className="py-2 pr-3 tabular-nums">{line.serial}</td>
                    <td className="py-2 pr-3">{line.description || DASH}</td>
                    <td className="py-2 pr-3 tabular-nums">{line.hsn || DASH}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {QTY.format(line.quantity)}
                      {line.provisional ? " (prov.)" : ""}
                    </td>
                    <td className="py-2 pr-3">{line.uom || DASH}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatInr(line.rate)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {formatInr(line.taxableValue)}
                    </td>
                    {challan.forSupply ? (
                      <>
                        <td className="py-2 pr-3 text-right tabular-nums">{formatInr(line.cgst)}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{formatInr(line.sgst)}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{formatInr(line.igst)}</td>
                      </>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-xs leading-5">
          {text || DASH}
        </pre>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            disabled={!text}
            aria-label="Copy the challan text"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy challan"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset the form">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section aria-label="Rule 55 checklist" className={`${CARD} mt-4`}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Info className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          The nine particulars of Rule 55(2)
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
          {RULE_55_PARTICULARS.map((particular) => (
            <li key={particular.id}>
              <span className="font-medium text-[var(--foreground)]">{particular.clause}</span>{" "}
              {particular.label}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          Rule 55(3) wants three copies: original for the consignee, duplicate for the transporter,
          triplicate for the consigner — pick each from the selector above. This is a document layout
          with the value and date arithmetic done for you, not tax advice; check your own facts
          against the rules before the goods move.
        </p>
      </section>
    </div>
  );
}
