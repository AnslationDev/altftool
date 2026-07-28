"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Check,
  Copy,
  Gem,
  Info,
  Package,
  Plane,
  RotateCcw,
  ScrollText,
  ShieldAlert,
  Tag,
  TriangleAlert,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import {
  BAGGAGE_PROFILES,
  BUDGET_CAVEAT,
  CATEGORIES,
  CATEGORY_GROUPS,
  CURRENCIES,
  GENDERS,
  METAL_FORMS,
  PASSENGER_FIXED_ALLOWANCES,
  RATES_STAMP,
} from "../data";
import {
  BAGGAGE_ALL_IN_RATE,
  GIFT_EXEMPTION_LIMIT_INR,
  compareWithIndianPrice,
  computeBaggageDuty,
  computeCourierLandedCost,
  computeMetalBaggage,
  estimateFreightAndInsurance,
  formatResultText,
} from "../lib";

/* ---------------- formatting ---------------- */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inr = (value) => (Number.isFinite(value) ? inrFormatter.format(value) : "—");

const pct = (value) =>
  Number.isFinite(value)
    ? `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}%`
    : "—";

const grams = (value) =>
  Number.isFinite(value)
    ? `${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)} g`
    : "—";

const DASH = "—";

/* ---------------- shared class strings ---------------- */

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const LABEL = "mb-1.5 block text-sm font-medium text-[var(--foreground)]";

const HINT = "mt-1 text-xs text-[var(--muted-foreground)]";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 text-sm font-semibold text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none";

const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const ALERT =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]";

const MODES = [
  { id: "courier", label: "Courier / post", icon: Package },
  { id: "baggage", label: "Carried in baggage", icon: Plane },
  { id: "metal", label: "Gold & silver", icon: Gem },
];

const EMPHASIS_KEYS = new Set(["av", "dutiable", "duty", "landed"]);
const HIDE_WHEN_ZERO = new Set(["laptop", "allowance", "handling", "free", "insurance", "freight", "igst", "sws"]);

/* ---------------- component ---------------- */

export default function IndiaImportDutyCalculator() {
  const [mode, setMode] = useState("courier");

  // shared "what and where from"
  const [categoryId, setCategoryId] = useState("smartphone");
  const [price, setPrice] = useState("999");
  const [quantity, setQuantity] = useState("1");
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("88");

  // courier
  const [useDeemedFreight, setUseDeemedFreight] = useState(false);
  const [freight, setFreight] = useState("40");
  const [insurance, setInsurance] = useState("11");
  const [isGift, setIsGift] = useState(false);
  const [handlingFee, setHandlingFee] = useState("0");
  const [bcdOverride, setBcdOverride] = useState("");
  const [igstOverride, setIgstOverride] = useState("");

  // baggage
  const [profileId, setProfileId] = useState("indian-adult");
  const [passengerAge, setPassengerAge] = useState("30");
  const [claimLaptop, setClaimLaptop] = useState(false);
  const [laptopPrice, setLaptopPrice] = useState("0");

  // metal
  const [metal, setMetal] = useState("gold");
  const [metalForm, setMetalForm] = useState("jewellery");
  const [metalGrams, setMetalGrams] = useState("40");
  const [pricePerGram, setPricePerGram] = useState("9000");
  const [gender, setGender] = useState("female");
  const [stayMonths, setStayMonths] = useState("18");

  // comparison
  const [indianPrice, setIndianPrice] = useState("");

  const [copied, setCopied] = useState(false);

  const category = useMemo(
    () => CATEGORIES.find((item) => item.id === categoryId) || CATEGORIES[0],
    [categoryId]
  );

  const profile = useMemo(
    () => BAGGAGE_PROFILES.find((item) => item.id === profileId) || BAGGAGE_PROFILES[0],
    [profileId]
  );

  const currencyMeta = useMemo(
    () => CURRENCIES.find((item) => item.code === currency) || CURRENCIES[0],
    [currency]
  );

  const deemed = useMemo(
    () => estimateFreightAndInsurance(price, Number(quantity) || 1),
    [price, quantity]
  );

  const effectiveBcd = bcdOverride === "" ? category.bcd : bcdOverride;
  const effectiveIgst = igstOverride === "" ? category.igst : igstOverride;

  const courierResult = useMemo(() => {
    const freightIn = useDeemedFreight ? deemed.freight : freight;
    const insuranceIn = useDeemedFreight ? deemed.insurance : insurance;
    return computeCourierLandedCost({
      itemPrice: price,
      quantity: Number(quantity),
      exchangeRate,
      freight: deemed.error && useDeemedFreight ? 0 : freightIn,
      insurance: deemed.error && useDeemedFreight ? 0 : insuranceIn,
      bcdRate: effectiveBcd,
      igstRate: effectiveIgst,
      isGift,
      handlingFeeInr: handlingFee,
    });
  }, [
    price,
    quantity,
    exchangeRate,
    freight,
    insurance,
    deemed,
    useDeemedFreight,
    effectiveBcd,
    effectiveIgst,
    isGift,
    handlingFee,
  ]);

  const baggageResult = useMemo(
    () =>
      computeBaggageDuty({
        itemPrice: price,
        quantity: Number(quantity),
        exchangeRate,
        freeAllowanceInr: profile.allowance,
        isAnnexureI: Boolean(category.annexureI),
        claimLaptopExemption: claimLaptop,
        laptopPrice,
        passengerAge,
      }),
    [price, quantity, exchangeRate, profile, category, claimLaptop, laptopPrice, passengerAge]
  );

  const metalResult = useMemo(
    () =>
      computeMetalBaggage({
        metal,
        form: metalForm,
        grams: metalGrams,
        pricePerGram,
        // Indian bullion and jewellery rates are quoted per gram in rupees, so
        // this panel does not take the foreign exchange rate at all.
        exchangeRate: 1,
        gender,
        stayAbroadMonths: stayMonths,
      }),
    [metal, metalForm, metalGrams, pricePerGram, gender, stayMonths]
  );

  const result =
    mode === "courier" ? courierResult : mode === "baggage" ? baggageResult : metalResult;

  const hasError = Boolean(result.error);

  const comparison = useMemo(() => {
    if (hasError || indianPrice === "") return null;
    return compareWithIndianPrice({
      landedCostInr: result.landedCost,
      indianPriceInr: indianPrice,
    });
  }, [hasError, indianPrice, result]);

  const heading =
    mode === "courier"
      ? "India import duty — courier / post route"
      : mode === "baggage"
        ? "India import duty — carried in accompanied baggage"
        : "India import duty — gold & silver carried in baggage";

  async function handleCopy() {
    const text = formatResultText({
      heading,
      result,
      category: mode === "metal" ? null : category,
      stamp: RATES_STAMP,
      comparison,
    });
    const ok = await safeCopyText(text);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleReset() {
    setMode("courier");
    setCategoryId("smartphone");
    setPrice("999");
    setQuantity("1");
    setCurrency("USD");
    setExchangeRate("88");
    setUseDeemedFreight(false);
    setFreight("40");
    setInsurance("11");
    setIsGift(false);
    setHandlingFee("0");
    setBcdOverride("");
    setIgstOverride("");
    setProfileId("indian-adult");
    setPassengerAge("30");
    setClaimLaptop(false);
    setLaptopPrice("0");
    setMetal("gold");
    setMetalForm("jewellery");
    setMetalGrams("40");
    setPricePerGram("9000");
    setGender("female");
    setStayMonths("18");
    setIndianPrice("");
    setCopied(false);
  }

  const visibleLines = hasError
    ? []
    : result.lines.filter((item) => !(item.amount === 0 && HIDE_WHEN_ZERO.has(item.key)));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 text-[var(--foreground)]">
      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">
          India Import Duty &amp; Landed Cost Calculator
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Works the customs waterfall line by line for both routes into India — a courier or postal
          import, and goods carried in on a flight — so you can see where every rupee comes from.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]">
          <ScrollText aria-hidden="true" className="h-4 w-4 shrink-0" />
          {RATES_STAMP}
        </p>
      </header>

      {/* ---------- route tabs ---------- */}
      <div
        role="tablist"
        aria-label="Import route"
        className="mb-5 grid gap-2 sm:grid-cols-3"
      >
        {MODES.map((item) => {
          const ModeIcon = item.icon;
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(item.id)}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 focus-visible:outline-none ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
              }`}
            >
              <ModeIcon aria-hidden="true" className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5">
        {/* ---------- inputs ---------- */}
        <section className={CARD}>
          <h2 className="mb-4 text-base font-semibold">
            {mode === "metal" ? "The metal you are carrying" : "What you are importing"}
          </h2>

          {mode !== "metal" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={LABEL} htmlFor="iid-category">
                  Goods category
                </label>
                <select
                  id="iid-category"
                  className={FIELD}
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  {CATEGORY_GROUPS.map((group) => (
                    <optgroup key={group} label={group}>
                      {CATEGORIES.filter((item) => item.group === group).map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className={HINT}>
                  Assumed HSN heading {category.hsn} (Chapter {category.chapter}) — BCD {category.bcd}%,
                  IGST {category.igst}%.
                </p>
              </div>

              <div>
                <label className={LABEL} htmlFor="iid-price">
                  Price abroad, per unit ({currencyMeta.code})
                </label>
                <input
                  id="iid-price"
                  className={FIELD}
                  inputMode="decimal"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </div>

              <div>
                <label className={LABEL} htmlFor="iid-quantity">
                  Quantity
                </label>
                <input
                  id="iid-quantity"
                  className={FIELD}
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />
              </div>
            </div>
          )}

          {mode === "metal" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="iid-metal">
                  Metal
                </label>
                <select
                  id="iid-metal"
                  className={FIELD}
                  value={metal}
                  onChange={(event) => setMetal(event.target.value)}
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                </select>
              </div>
              <div>
                <label className={LABEL} htmlFor="iid-metal-form">
                  Form
                </label>
                <select
                  id="iid-metal-form"
                  className={FIELD}
                  value={metalForm}
                  onChange={(event) => setMetalForm(event.target.value)}
                >
                  {METAL_FORMS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL} htmlFor="iid-grams">
                  Weight (grams)
                </label>
                <input
                  id="iid-grams"
                  className={FIELD}
                  inputMode="decimal"
                  value={metalGrams}
                  onChange={(event) => setMetalGrams(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="iid-per-gram">
                  Price per gram (₹)
                </label>
                <input
                  id="iid-per-gram"
                  className={FIELD}
                  inputMode="decimal"
                  value={pricePerGram}
                  onChange={(event) => setPricePerGram(event.target.value)}
                />
                <p className={HINT}>
                  Indian bullion rates are quoted per gram in rupees, so this panel takes rupees
                  directly. The figure shown is a placeholder — replace it with the rate you are
                  valuing at.
                </p>
              </div>
              <div>
                <label className={LABEL} htmlFor="iid-gender">
                  Passenger
                </label>
                <select
                  id="iid-gender"
                  className={FIELD}
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                >
                  {GENDERS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <p className={HINT}>Rule 5 sets a different weight and value cap for each.</p>
              </div>
              <div>
                <label className={LABEL} htmlFor="iid-stay">
                  Months lived abroad
                </label>
                <input
                  id="iid-stay"
                  className={FIELD}
                  inputMode="numeric"
                  value={stayMonths}
                  onChange={(event) => setStayMonths(event.target.value)}
                />
                <p className={HINT}>
                  Over 12 months unlocks the Rule 5 free jewellery allowance; 6 months or more makes
                  the passenger &ldquo;eligible&rdquo; for the concessional metal rate.
                </p>
              </div>
            </div>
          )}

          {mode !== "metal" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="iid-currency">
                Currency
              </label>
              <select
                id="iid-currency"
                className={FIELD}
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                {CURRENCIES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="iid-fx">
                Exchange rate (₹ per 1 {currencyMeta.code})
              </label>
              <input
                id="iid-fx"
                className={FIELD}
                inputMode="decimal"
                value={exchangeRate}
                onChange={(event) => setExchangeRate(event.target.value)}
              />
              <p className={HINT}>
                Customs converts at the rate notified by CBIC under Section 14 of the Customs Act,
                1962, revised fortnightly — not your card rate. The value here is a placeholder you
                should replace.
              </p>
            </div>
          </div>
          )}
        </section>

        {/* ---------- route-specific inputs ---------- */}
        {mode === "courier" && (
          <section className={CARD}>
            <h2 className="mb-4 text-base font-semibold">Freight, insurance and rates</h2>

            <label className="mb-4 flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={useDeemedFreight}
                onChange={(event) => setUseDeemedFreight(event.target.checked)}
              />
              <span>
                Use the residual valuation percentages (freight 20% of FOB, insurance 1.125% of FOB)
                from the Customs Valuation Rules, 2007
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL} htmlFor="iid-freight">
                  Freight ({currencyMeta.code})
                </label>
                <input
                  id="iid-freight"
                  className={FIELD}
                  inputMode="decimal"
                  disabled={useDeemedFreight}
                  value={
                    useDeemedFreight
                      ? deemed.error
                        ? ""
                        : String(Math.round(deemed.freight * 100) / 100)
                      : freight
                  }
                  onChange={(event) => setFreight(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="iid-insurance">
                  Insurance ({currencyMeta.code})
                </label>
                <input
                  id="iid-insurance"
                  className={FIELD}
                  inputMode="decimal"
                  disabled={useDeemedFreight}
                  value={
                    useDeemedFreight
                      ? deemed.error
                        ? ""
                        : String(Math.round(deemed.insurance * 100) / 100)
                      : insurance
                  }
                  onChange={(event) => setInsurance(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="iid-bcd">
                  BCD rate override (%)
                </label>
                <input
                  id="iid-bcd"
                  className={FIELD}
                  inputMode="decimal"
                  placeholder={`${category.bcd} (encoded for ${category.hsn})`}
                  value={bcdOverride}
                  onChange={(event) => setBcdOverride(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="iid-igst">
                  IGST rate override (%)
                </label>
                <input
                  id="iid-igst"
                  className={FIELD}
                  inputMode="decimal"
                  placeholder={`${category.igst} (encoded for ${category.hsn})`}
                  value={igstOverride}
                  onChange={(event) => setIgstOverride(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="iid-handling">
                  Courier handling / clearance fee (₹)
                </label>
                <input
                  id="iid-handling"
                  className={FIELD}
                  inputMode="decimal"
                  value={handlingFee}
                  onChange={(event) => setHandlingFee(event.target.value)}
                />
                <p className={HINT}>Charged by the courier, not by customs.</p>
              </div>
              <div className="flex items-end">
                <label className="flex min-h-11 w-full items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                    checked={isGift}
                    onChange={(event) => setIsGift(event.target.checked)}
                  />
                  <span>Declared as a bona fide gift</span>
                </label>
              </div>
            </div>

            {isGift && (
              <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--foreground)]">
                <ShieldAlert aria-hidden="true" className="mr-1 inline h-4 w-4 align-text-bottom" />
                The gift exemption is narrower than it looks. It caps out at a CIF value of{" "}
                {inr(GIFT_EXEMPTION_LIMIT_INR)} under Notification No. 171/93-Customs, and since 12
                December 2019 DGFT Notification No. 35/2015-2020 has prohibited the import of goods
                as gifts through courier or post altogether, other than life-saving drugs and rakhi.
                India has no general de minimis: a consignment outside these exemptions is dutiable
                from the first rupee.
              </p>
            )}
          </section>
        )}

        {mode === "baggage" && (
          <section className={CARD}>
            <h2 className="mb-4 text-base font-semibold">Passenger and allowance</h2>
            <div className="grid gap-4">
              <div>
                <label className={LABEL} htmlFor="iid-profile">
                  Who is carrying it
                </label>
                <select
                  id="iid-profile"
                  className={FIELD}
                  value={profileId}
                  onChange={(event) => setProfileId(event.target.value)}
                >
                  {BAGGAGE_PROFILES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} — {inr(item.allowance)}
                    </option>
                  ))}
                </select>
                <p className={HINT}>
                  {profile.rule}. {profile.condition}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor="iid-age">
                    Passenger age
                  </label>
                  <input
                    id="iid-age"
                    className={FIELD}
                    inputMode="numeric"
                    value={passengerAge}
                    onChange={(event) => setPassengerAge(event.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="iid-laptop-price">
                    Value of the laptop in that total ({currencyMeta.code})
                  </label>
                  <input
                    id="iid-laptop-price"
                    className={FIELD}
                    inputMode="decimal"
                    disabled={!claimLaptop}
                    value={laptopPrice}
                    onChange={(event) => setLaptopPrice(event.target.value)}
                  />
                </div>
              </div>

              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={claimLaptop}
                  onChange={(event) => setClaimLaptop(event.target.checked)}
                />
                <span>
                  Claim the one-laptop exemption — one laptop is duty free over and above the value
                  allowance for a passenger aged 18 or above (Notification No. 11/2004-Customs)
                </span>
              </label>

              {baggageResult.laptopRejectedForAge && (
                <p className={ALERT} role="alert">
                  The laptop exemption needs a passenger aged 18 or above, so it has not been
                  applied.
                </p>
              )}

              {category.annexureI && (
                <p className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--foreground)]">
                  <TriangleAlert aria-hidden="true" className="mr-1 inline h-4 w-4 align-text-bottom" />
                  {category.label} is listed in Annexure I to the Baggage Rules, 2016 — no duty-free
                  allowance is available against it, so the full value is charged at{" "}
                  {BAGGAGE_ALL_IN_RATE}%.
                </p>
              )}
            </div>
          </section>
        )}

        {/* ---------- result ---------- */}
        <section className={CARD} aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {mode === "courier" ? "Total duty and tax" : "Total duty payable"}
              </p>
              <p className="text-3xl font-bold tabular-nums sm:text-4xl">
                {hasError ? DASH : inr(result.totalDuty)}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Landed cost {hasError ? DASH : inr(result.landedCost)} · effective rate{" "}
                {hasError ? DASH : pct(result.effectiveDutyRate)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={PRIMARY_BTN}
                onClick={handleCopy}
                aria-label="Copy the full duty breakdown to the clipboard"
                disabled={hasError}
              >
                {copied ? (
                  <Check aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Copy aria-hidden="true" className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy result"}
              </button>
              <button
                type="button"
                className={GHOST_BTN}
                onClick={handleReset}
                aria-label="Reset all inputs to their defaults"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {hasError && (
            <p className={`${ALERT} mt-4`} role="alert">
              {result.error}
            </p>
          )}

          {mode !== "metal" && (
            <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-xs text-[var(--foreground)]">
              <Tag aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Assumed classification:</strong> {category.label} — HSN heading{" "}
                {category.hsn}, Chapter {category.chapter}
                {category.verify ? " (this heading splits across sub-headings — check yours)" : ""}.{" "}
                {category.note}
              </span>
            </p>
          )}

          {!hasError && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[26rem] text-sm">
                <caption className="sr-only">Duty waterfall, line by line</caption>
                <tbody>
                  {visibleLines.map((item) => (
                    <tr
                      key={item.key}
                      className={
                        EMPHASIS_KEYS.has(item.key)
                          ? "border-t border-[var(--border)] font-semibold"
                          : ""
                      }
                    >
                      <th scope="row" className="py-2 pr-4 text-left font-normal">
                        <span className={EMPHASIS_KEYS.has(item.key) ? "font-semibold" : ""}>
                          {item.label}
                        </span>
                        {item.note && (
                          <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                            {item.note}
                          </span>
                        )}
                      </th>
                      <td className="py-2 text-right tabular-nums whitespace-nowrap">
                        {inr(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!hasError && mode === "courier" && result.giftExemptionApplied && (
            <p className="mt-4 rounded-md bg-[var(--success-soft)] px-3 py-2 text-xs text-[var(--success)]">
              The assessable value is within the {inr(GIFT_EXEMPTION_LIMIT_INR)} bona fide gift
              exemption, so no duty has been charged — subject to the DGFT prohibition on gift
              imports noted above.
            </p>
          )}

          {!hasError && mode === "baggage" && (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--muted-foreground)]">Free allowance available</dt>
                <dd className="font-semibold tabular-nums">{inr(result.allowanceAvailable)}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted-foreground)]">Allowance left unused</dt>
                <dd className="font-semibold tabular-nums">{inr(result.allowanceUnused)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[var(--muted-foreground)]">Baggage rate applied</dt>
                <dd className="font-semibold">
                  {BAGGAGE_ALL_IN_RATE}% flat — 35% Basic Customs Duty under heading 9803 plus a
                  Social Welfare Surcharge of 10% of that duty. IGST is not charged separately on
                  articles cleared under the baggage heading.
                </dd>
              </div>
            </dl>
          )}

          {!hasError && mode === "metal" && (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--muted-foreground)]">Duty-free under Rule 5</dt>
                <dd className="font-semibold tabular-nums">
                  {grams(result.freeGrams)} · {inr(result.freeValue)}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--muted-foreground)]">Dutiable weight</dt>
                <dd className="font-semibold tabular-nums">{grams(result.dutiableGrams)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[var(--muted-foreground)]">Basis of the rate applied</dt>
                <dd>{result.basis}</dd>
              </div>
            </dl>
          )}

          {!hasError && mode === "metal" && result.overWeightCap && (
            <p className={`${ALERT} mt-4`} role="alert">
              {grams(result.grams)} is above the {grams(result.weightCap)} ceiling a passenger may
              bring in under the concession (S. Nos. 356 and 357 of Notification No.
              50/2017-Customs). The excess of {grams(result.excessGrams)} is outside the passenger
              concession entirely and cannot be cleared on it — the figure above prices the whole
              quantity at the concessional rate and is therefore not what the counter would charge.
            </p>
          )}
        </section>

        {/* ---------- is it cheaper abroad ---------- */}
        <section className={CARD}>
          <h2 className="mb-1 flex items-center gap-2 text-base font-semibold">
            <ArrowRightLeft aria-hidden="true" className="h-4 w-4" />
            Is it cheaper abroad?
          </h2>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            Puts the landed cost above next to what the same item sells for in India.
          </p>

          <div className="max-w-sm">
            <label className={LABEL} htmlFor="iid-india-price">
              Indian retail price (₹, inclusive of GST)
            </label>
            <input
              id="iid-india-price"
              className={FIELD}
              inputMode="decimal"
              placeholder="e.g. 145900"
              value={indianPrice}
              onChange={(event) => setIndianPrice(event.target.value)}
            />
          </div>

          {comparison && comparison.error && (
            <p className={`${ALERT} mt-4`} role="alert">
              {comparison.error}
            </p>
          )}

          {comparison && !comparison.error && (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[var(--muted-foreground)]">Landed cost</dt>
                <dd className="text-lg font-bold tabular-nums">{inr(comparison.landedCost)}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted-foreground)]">Indian retail price</dt>
                <dd className="text-lg font-bold tabular-nums">{inr(comparison.indianPrice)}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted-foreground)]">Difference</dt>
                <dd className="text-lg font-bold tabular-nums">
                  {inr(comparison.absDifference)}
                </dd>
                <dd className="text-xs text-[var(--muted-foreground)]">
                  Landed cost is {pct(Math.abs(comparison.percentVsIndian))}{" "}
                  {comparison.cheaperSide === "abroad"
                    ? "below"
                    : comparison.cheaperSide === "india"
                      ? "above"
                      : "the same as"}{" "}
                  the Indian price
                </dd>
              </div>
            </dl>
          )}

          {!comparison && (
            <p className={`${HINT} mt-3`}>
              Enter the Indian price to see the gap. Nothing is compared until you do.
            </p>
          )}

          <p className="mt-4 text-xs text-[var(--muted-foreground)]">
            This states the two figures and the gap between them and stops there. It does not price
            warranty cover, returns, the cost of the trip, the risk of the goods being classified
            under a different heading at the counter, or the penalty for a mis-declaration.
          </p>
        </section>

        {/* ---------- allowance reference ---------- */}
        <section className={CARD}>
          <h2 className="mb-3 text-base font-semibold">
            Fixed passenger allowances, alongside the value allowance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Item
                  </th>
                  <th scope="col" className="py-2 pr-4 font-semibold">
                    Limit
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {PASSENGER_FIXED_ALLOWANCES.map((row) => (
                  <tr key={row.item} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-4 align-top">{row.item}</td>
                    <td className="py-2 pr-4 align-top">{row.limit}</td>
                    <td className="py-2 align-top text-xs text-[var(--muted-foreground)]">
                      {row.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- caveats ---------- */}
        <section className={CARD}>
          <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Info aria-hidden="true" className="h-4 w-4" />
            What this figure is, and what it is not
          </h2>
          <ul className="grid gap-2 text-sm text-[var(--muted-foreground)]">
            <li>
              <strong className="text-[var(--foreground)]">Classification is the real risk.</strong>{" "}
              The arithmetic here is exact; the HSN heading behind it is an assumption. A smartwatch
              read as communication apparatus and a smartwatch read as a watch carry different
              duties. The assumed heading is printed on every result so a wrong classification is
              traceable — override the rate if yours differs.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">{BUDGET_CAVEAT}</strong>
            </li>
            <li>
              Anti-dumping duty, countervailing duty, safeguard duty, compensation cess, AIDC on
              non-metal goods and any specific rupees-per-unit rate are not modelled here. Where a
              tariff line carries an alternative specific rate, the higher of the two applies.
            </li>
            <li>
              Assessable value is plain CIF. The 1% landing charge that used to be added was removed
              with effect from 26 September 2017 by Notification No. 91/2017-Customs (N.T.).
            </li>
            <li>
              This is an estimate on the rates encoded in this page. It is not a customs valuation,
              not a bill of entry, and not advice. The assessing officer&rsquo;s classification and
              valuation decide what is actually payable.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
