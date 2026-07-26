"use client";

import { useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RotateCcw } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const num = (value) => NUM.format(Number.isFinite(value) ? value : 0);

/** Health cover is quoted in lakh / crore in India. */
const inWords = (value) => {
  if (!Number.isFinite(value) || value <= 0) return "—";
  if (value >= 10000000) return `${NUM.format(value / 10000000)} crore`;
  if (value >= 100000) return `${NUM.format(value / 100000)} lakh`;
  return money(value);
};

/**
 * Base sum insured for one adult, driven by what a major hospitalisation
 * (cardiac, oncology, major accident) typically costs in each city band.
 */
const CITY_TIERS = [
  { id: "metro", label: "Metro (Mumbai, Delhi NCR, Bengaluru, Chennai)", base: 1000000 },
  { id: "tier1", label: "Tier 1 (Pune, Hyderabad, Kolkata, Ahmedabad)", base: 800000 },
  { id: "tier2", label: "Tier 2 (Jaipur, Lucknow, Kochi, Indore)", base: 600000 },
  { id: "tier3", label: "Tier 3 / smaller towns", base: 500000 },
];

/** Premiums and claim sizes rise sharply with the age of the eldest insured. */
const AGE_BANDS = [
  { max: 35, factor: 1, label: "under 36" },
  { max: 45, factor: 1.25, label: "36-45" },
  { max: 55, factor: 1.5, label: "46-55" },
  { max: 65, factor: 1.9, label: "56-65" },
  { max: 200, factor: 2.3, label: "over 65" },
];

const DEFAULTS = {
  city: "metro",
  adults: 2,
  children: 1,
  eldestAge: 42,
  parentsIncluded: false,
  chronic: false,
  inflation: 14,
  horizon: 5,
  existingCover: 500000,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1.5 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3";

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const ageBandFor = (age) => AGE_BANDS.find((band) => age <= band.max) ?? AGE_BANDS[AGE_BANDS.length - 1];

/** Rounds up to the sum-insured slabs insurers actually sell. */
const roundToSlab = (value) => {
  if (!(value > 0)) return 0;
  const step = value <= 2500000 ? 500000 : 5000000;
  return Math.ceil(value / step) * step;
};

/**
 * Family floater sizing: one adult's age-loaded base cover, plus a share of the
 * base for each additional member, loaded for chronic conditions, then
 * projected forward at medical inflation.
 */
export function computeHealthCover(input) {
  const {
    base,
    adults,
    children,
    eldestAge,
    parentsIncluded,
    chronic,
    inflation,
    horizon,
    existingCover,
  } = input;

  const band = ageBandFor(eldestAge);
  const primary = base * band.factor;
  const extraAdults = Math.max(0, adults - 1) * base * 0.4;
  const childLoad = children * base * 0.25;
  // Senior parents drive the largest claims; a separate floater is safer.
  const parentLoad = parentsIncluded ? base * 1.5 : 0;
  const subtotal = primary + extraAdults + childLoad + parentLoad;
  const chronicLoad = chronic ? subtotal * 0.3 : 0;
  const rawToday = subtotal + chronicLoad;

  const recommendedToday = roundToSlab(rawToday);
  const futureRaw = rawToday * Math.pow(1 + inflation / 100, horizon);
  const recommendedFuture = roundToSlab(futureRaw);
  const gap = Math.max(0, recommendedToday - existingCover);

  // Cheapest practical structure: a base policy plus a super top-up above it.
  const basePolicy = Math.min(recommendedToday, roundToSlab(rawToday / 2));
  const topUp = Math.max(0, recommendedToday - basePolicy);

  return {
    band,
    primary,
    extraAdults,
    childLoad,
    parentLoad,
    chronicLoad,
    rawToday,
    recommendedToday,
    futureRaw,
    recommendedFuture,
    gap,
    basePolicy,
    topUp,
    members: adults + children + (parentsIncluded ? 2 : 0),
  };
}

export default function ToolHome() {
  const [city, setCity] = useState(DEFAULTS.city);
  const [adults, setAdults] = useState(String(DEFAULTS.adults));
  const [children, setChildren] = useState(String(DEFAULTS.children));
  const [eldestAge, setEldestAge] = useState(String(DEFAULTS.eldestAge));
  const [parentsIncluded, setParentsIncluded] = useState(DEFAULTS.parentsIncluded);
  const [chronic, setChronic] = useState(DEFAULTS.chronic);
  const [inflation, setInflation] = useState(String(DEFAULTS.inflation));
  const [horizon, setHorizon] = useState(String(DEFAULTS.horizon));
  const [existingCover, setExistingCover] = useState(String(DEFAULTS.existingCover));
  const [copied, setCopied] = useState(false);

  const tier = CITY_TIERS.find((item) => item.id === city) ?? CITY_TIERS[0];

  const calc = useMemo(() => {
    const a = toNumber(adults);
    const c = toNumber(children);
    const age = toNumber(eldestAge);
    const infl = toNumber(inflation);
    const years = toNumber(horizon);
    const existing = toNumber(existingCover);

    if ([a, c, age, infl, years, existing].some((value) => Number.isNaN(value))) {
      return { error: "Enter valid numbers in every field." };
    }
    if (!Number.isInteger(a) || a < 1 || a > 4) {
      return { error: "Enter between 1 and 4 adults on the policy." };
    }
    if (!Number.isInteger(c) || c < 0 || c > 6) {
      return { error: "Enter between 0 and 6 children." };
    }
    if (age < 18 || age > 90) return { error: "Age of the eldest member should be between 18 and 90." };
    if (infl < 0 || infl > 30) return { error: "Medical inflation should be between 0% and 30% per year." };
    if (years < 0 || years > 30) return { error: "Plan horizon should be between 0 and 30 years." };
    if (existing < 0) return { error: "Existing cover cannot be negative." };

    return {
      adults: a,
      children: c,
      eldestAge: age,
      inflation: infl,
      horizon: years,
      existingCover: existing,
      ...computeHealthCover({
        base: tier.base,
        adults: a,
        children: c,
        eldestAge: age,
        parentsIncluded,
        chronic,
        inflation: infl,
        horizon: years,
        existingCover: existing,
      }),
    };
  }, [adults, children, eldestAge, inflation, horizon, existingCover, tier, parentsIncluded, chronic]);

  const summary = useMemo(() => {
    if (calc.error) return "";
    return [
      "Health Insurance Cover Calculator",
      `City band: ${tier.label}`,
      `Family: ${calc.adults} adult(s), ${calc.children} child(ren)${parentsIncluded ? ", parents included" : ""}`,
      `Eldest member: ${calc.eldestAge} years (age band ${calc.band.label})`,
      `Recommended cover today: ${money(calc.recommendedToday)} (${inWords(calc.recommendedToday)})`,
      `Existing cover: ${money(calc.existingCover)}`,
      calc.gap > 0 ? `Gap to close: ${money(calc.gap)}` : "Gap to close: none",
      `Suggested structure: ${inWords(calc.basePolicy)} base policy + ${inWords(calc.topUp)} super top-up`,
      `Cover to aim for in ${calc.horizon} years at ${num(calc.inflation)}% medical inflation: ${money(
        calc.recommendedFuture,
      )}`,
    ].join("\n");
  }, [calc, tier, parentsIncluded]);

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
    setCity(DEFAULTS.city);
    setAdults(String(DEFAULTS.adults));
    setChildren(String(DEFAULTS.children));
    setEldestAge(String(DEFAULTS.eldestAge));
    setParentsIncluded(DEFAULTS.parentsIncluded);
    setChronic(DEFAULTS.chronic);
    setInflation(String(DEFAULTS.inflation));
    setHorizon(String(DEFAULTS.horizon));
    setExistingCover(String(DEFAULTS.existingCover));
    setCopied(false);
  };

  const enough = calc.error ? false : calc.gap <= 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          Health cover
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Health Insurance Cover Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Sizes a family floater from the cost of a serious hospitalisation in your city, the number
          and age of the people on the policy, and medical inflation — then shows the gap against
          the cover you already hold.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="health-city">
              Where you would be treated
            </label>
            <select
              id="health-city"
              className={`mt-2 ${INPUT_CLASS}`}
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              {CITY_TIERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>
              Base cover for one adult in this band: {money(tier.base)}. Pick the costliest city you
              would realistically be treated in, not just where you live.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="health-adults">
              Adults on the policy
            </label>
            <input
              id="health-adults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="4"
              step="1"
              value={adults}
              onChange={(event) => setAdults(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="health-children">
              Children on the policy
            </label>
            <input
              id="health-children"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="6"
              step="1"
              value={children}
              onChange={(event) => setChildren(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="health-age">
              Age of the eldest member
            </label>
            <input
              id="health-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="18"
              max="90"
              step="1"
              value={eldestAge}
              onChange={(event) => setEldestAge(event.target.value)}
            />
            <p className={HINT_CLASS}>A floater is priced off the oldest person on it.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="health-existing">
              Cover you already hold (INR)
            </label>
            <input
              id="health-existing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100000"
              value={existingCover}
              onChange={(event) => setExistingCover(event.target.value)}
            />
            <p className={HINT_CLASS}>Include employer group mediclaim, which lapses when you leave.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="health-inflation">
              Medical inflation (% per year)
            </label>
            <input
              id="health-inflation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.5"
              value={inflation}
              onChange={(event) => setInflation(event.target.value)}
            />
            <p className={HINT_CLASS}>Health costs in India have been rising far faster than retail inflation.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="health-horizon">
              Plan horizon (years)
            </label>
            <input
              id="health-horizon"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="30"
              step="1"
              value={horizon}
              onChange={(event) => setHorizon(event.target.value)}
            />
          </div>
          <label className={`${CHECK_ROW} sm:col-span-1`} htmlFor="health-parents">
            <input
              id="health-parents"
              type="checkbox"
              className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
              checked={parentsIncluded}
              onChange={(event) => setParentsIncluded(event.target.checked)}
            />
            <span className="text-sm">
              <span className="font-semibold">Senior parents on the same policy</span>
              <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                Adds a large loading — a separate senior floater is usually cheaper.
              </span>
            </span>
          </label>
          <label className={`${CHECK_ROW} sm:col-span-1`} htmlFor="health-chronic">
            <input
              id="health-chronic"
              type="checkbox"
              className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
              checked={chronic}
              onChange={(event) => setChronic(event.target.checked)}
            />
            <span className="text-sm">
              <span className="font-semibold">Someone has a chronic condition</span>
              <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                Diabetes, hypertension, cardiac or kidney history — adds 30%.
              </span>
            </span>
          </label>
        </div>
      </section>

      {calc.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {calc.error}
        </p>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Recommended cover today
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {money(calc.recommendedToday)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  About {inWords(calc.recommendedToday)} for {calc.members} member
                  {calc.members === 1 ? "" : "s"} on a family floater.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy health insurance cover result"
                  className={GHOST_BTN}
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
                  aria-label="Reset all inputs"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm font-medium ${
                enough
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--danger-soft)] text-[var(--danger)]"
              }`}
              role={enough ? undefined : "alert"}
            >
              {enough
                ? `Your existing ${money(calc.existingCover)} already meets this estimate.`
                : `You are short by ${money(calc.gap)} — about ${inWords(calc.gap)} of extra cover.`}
            </p>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["City base cover for one adult", money(tier.base)],
                [`Age loading (eldest ${calc.eldestAge}, band ${calc.band.label})`, `× ${num(calc.band.factor)}`],
                ["Cover for the eldest adult", money(calc.primary)],
                ["Additional adults", money(calc.extraAdults)],
                ["Children", money(calc.childLoad)],
                ["Senior parents included", parentsIncluded ? money(calc.parentLoad) : "Not included"],
                ["Chronic-condition loading", chronic ? money(calc.chronicLoad) : "None"],
                ["Computed requirement", money(calc.rawToday)],
                ["Rounded to a purchasable slab", money(calc.recommendedToday)],
                ["Existing cover", money(calc.existingCover)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">A cheaper way to buy the same cover</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Instead of one large policy, most families pay less for a{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {inWords(calc.basePolicy)} base policy
              </span>{" "}
              plus a{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {inWords(calc.topUp)} super top-up
              </span>{" "}
              with a deductible equal to the base cover. The top-up only pays once the base is
              exhausted, so its premium is a fraction of a standalone policy of the same size.
            </p>

            <h2 className="mt-6 text-base font-semibold">What medical inflation does to this number</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
              {[
                [`Requirement in ${calc.horizon} year${calc.horizon === 1 ? "" : "s"}`, money(calc.futureRaw)],
                ["Slab to aim for by then", money(calc.recommendedFuture)],
                [
                  "Assumed medical inflation",
                  `${num(calc.inflation)}% per year`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Look for a policy with a no-claim bonus or automatic restoration — those features grow
              your sum insured over time without you having to buy a fresh policy at an older age.
            </p>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not medical or insurance advice. Actual sums insured available to you,
        waiting periods for pre-existing diseases, room-rent limits and sub-limits vary by insurer
        and are decided at underwriting — read the policy wording and check the hospital network
        before you buy.
      </p>
    </main>
  );
}
