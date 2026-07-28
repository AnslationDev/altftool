"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PawPrint, RotateCcw } from "lucide-react";

import { FOOD_BUFFER_PERCENT, LIFE_STAGES, buildPetBoardingConsent } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)] transition hover:border-[var(--primary)]";
const CHECKBOX =
  "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  ownerName: "Priya Menon",
  ownerPhone: "+91 98860 45511",
  altContactName: "Rahul Menon",
  altContactPhone: "+91 99000 22114",
  facilityName: "Happy Tails Boarding",
  petName: "Simba",
  breed: "Indian pariah cross",
  microchip: "9810 2233 4455",
  vetName: "Dr A. Kulkarni, Petcare Clinic",
  vetPhone: "+91 80 4123 7788",
  foodBrand: "Royal Canin Medium Adult",
  medications: "",
  behaviourNotes: "Nervous of loud noises; needs a covered corner in the run.",
  currencySymbol: "INR",
  checkInDate: "2026-08-10",
  checkOutDate: "2026-08-17",
  stageId: "dogNeutered",
  vaccinationsCurrent: true,
  allowGrooming: true,
  allowGroupPlay: false,
  allowPhotos: true,
  weightKg: "18",
  kcalPer100g: "360",
  mealsPerDay: "2",
  nightlyRate: "800",
  dailyExtras: "100",
  vetSpendCap: "8000",
};

const NUMERIC_FIELDS = [
  "weightKg",
  "kcalPer100g",
  "mealsPerDay",
  "nightlyRate",
  "dailyExtras",
  "vetSpendCap",
];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const result = useMemo(() => {
    const numbers = {};
    for (const key of NUMERIC_FIELDS) {
      numbers[key] = form[key] === "" ? NaN : Number(form[key]);
    }
    return buildPetBoardingConsent({ ...form, ...numbers });
  }, [form]);

  const hasError = Boolean(result.error);

  const money = (value) =>
    form.currencySymbol.trim().toUpperCase() === "INR"
      ? INR.format(value)
      : `${form.currencySymbol} ${NUM.format(value)}`;

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.documentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Nights boarded", DASH],
        ["Feeding days", DASH],
        ["Resting energy (RER)", DASH],
        ["Daily energy need", DASH],
        ["Food per day", DASH],
        ["Food per meal", DASH],
        [`Food to pack (+${FOOD_BUFFER_PERCENT}%)`, DASH],
        ["Board charge", DASH],
        ["Daily extras", DASH],
        ["Vet spend authorised", DASH],
      ]
    : [
        ["Nights boarded", `${NUM.format(result.nights)}`],
        ["Feeding days", `${NUM.format(result.feedingDays)}`],
        ["Resting energy (RER)", `${NUM.format(result.ration.rerKcal)} kcal/day`],
        [
          "Daily energy need",
          `${NUM.format(result.ration.merKcal)} kcal/day (${NUM1.format(result.ration.factor)} x RER)`,
        ],
        ["Food per day", `${NUM.format(result.ration.gramsPerDay)} g`],
        ["Food per meal", `${NUM.format(result.ration.gramsPerMeal)} g x ${result.ration.mealsPerDay}`],
        [`Food to pack (+${FOOD_BUFFER_PERCENT}%)`, `${NUM.format(result.foodToPackG)} g`],
        ["Board charge", money(result.boardCost)],
        ["Daily extras", money(result.extrasCost)],
        [
          "Vet spend authorised",
          result.vetSpendCap > 0 ? money(result.vetSpendCap) : "Call me first (no cap set)",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PawPrint className="h-4 w-4" aria-hidden="true" />
          Consent forms
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Pet Boarding Consent Form Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Write the boarding agreement and the feeding sheet in one go: vet treatment authority with
          a spend cap, medication handover rules, activity permissions, and portion sizes worked out
          from your pet&apos;s weight and the calories on the bag.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Owner, pet and facility</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-owner">
              Owner name
            </label>
            <input
              id="pbc-owner"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.ownerName}
              onChange={(event) => set("ownerName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-owner-phone">
              Owner phone
            </label>
            <input
              id="pbc-owner-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.ownerPhone}
              onChange={(event) => set("ownerPhone", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-alt">
              Second contact
            </label>
            <input
              id="pbc-alt"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.altContactName}
              onChange={(event) => set("altContactName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-alt-phone">
              Second contact phone
            </label>
            <input
              id="pbc-alt-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.altContactPhone}
              onChange={(event) => set("altContactPhone", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-facility">
              Boarding facility
            </label>
            <input
              id="pbc-facility"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.facilityName}
              onChange={(event) => set("facilityName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-pet">
              Pet name
            </label>
            <input
              id="pbc-pet"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.petName}
              onChange={(event) => set("petName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-breed">
              Breed
            </label>
            <input
              id="pbc-breed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.breed}
              onChange={(event) => set("breed", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-chip">
              Microchip or tag number
            </label>
            <input
              id="pbc-chip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.microchip}
              onChange={(event) => set("microchip", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-in">
              Drop-off date
            </label>
            <input
              id="pbc-in"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.checkInDate}
              onChange={(event) => set("checkInDate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-out">
              Collection date
            </label>
            <input
              id="pbc-out"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={form.checkOutDate}
              onChange={(event) => set("checkOutDate", event.target.value)}
            />
          </div>
        </div>

        <label className={`mt-4 ${CHECK_ROW}`} htmlFor="pbc-vax">
          <input
            id="pbc-vax"
            className={CHECKBOX}
            type="checkbox"
            checked={form.vaccinationsCurrent}
            onChange={(event) => set("vaccinationsCurrent", event.target.checked)}
          />
          <span>Vaccinations are in date and the certificate is available</span>
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Feeding</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pbc-stage">
              Species and life stage
            </label>
            <select
              id="pbc-stage"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.stageId}
              onChange={(event) => set("stageId", event.target.value)}
            >
              {LIFE_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label} ({stage.factor} x RER)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-weight">
              Weight (kg)
            </label>
            <input
              id="pbc-weight"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0.5"
              max="100"
              step="0.1"
              value={form.weightKg}
              onChange={(event) => set("weightKg", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-kcal">
              Food energy (kcal per 100 g)
            </label>
            <input
              id="pbc-kcal"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="20"
              max="600"
              step="5"
              value={form.kcalPer100g}
              onChange={(event) => set("kcalPer100g", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-meals">
              Meals per day
            </label>
            <input
              id="pbc-meals"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="6"
              step="1"
              value={form.mealsPerDay}
              onChange={(event) => set("mealsPerDay", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-food">
              Food brand and variety
            </label>
            <input
              id="pbc-food"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.foodBrand}
              onChange={(event) => set("foodBrand", event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Vet, medication and permissions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-vet">
              Vet practice
            </label>
            <input
              id="pbc-vet"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.vetName}
              onChange={(event) => set("vetName", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-vet-phone">
              Vet phone
            </label>
            <input
              id="pbc-vet-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={form.vetPhone}
              onChange={(event) => set("vetPhone", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-cap">
              Treatment authorised without calling me
            </label>
            <input
              id="pbc-cap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={form.vetSpendCap}
              onChange={(event) => set("vetSpendCap", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-currency">
              Currency label
            </label>
            <input
              id="pbc-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={form.currencySymbol}
              onChange={(event) => set("currencySymbol", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-rate">
              Nightly rate
            </label>
            <input
              id="pbc-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={form.nightlyRate}
              onChange={(event) => set("nightlyRate", event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pbc-extras">
              Daily extras (walks, grooming)
            </label>
            <input
              id="pbc-extras"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="25"
              value={form.dailyExtras}
              onChange={(event) => set("dailyExtras", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pbc-meds">
              Medication, dose and timing
            </label>
            <textarea
              id="pbc-meds"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              placeholder="Leave blank if none"
              value={form.medications}
              onChange={(event) => set("medications", event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pbc-behaviour">
              Behaviour and handling notes
            </label>
            <textarea
              id="pbc-behaviour"
              className={`mt-2 ${AREA_CLASS}`}
              rows={2}
              value={form.behaviourNotes}
              onChange={(event) => set("behaviourNotes", event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className={CHECK_ROW} htmlFor="pbc-play">
            <input
              id="pbc-play"
              className={CHECKBOX}
              type="checkbox"
              checked={form.allowGroupPlay}
              onChange={(event) => set("allowGroupPlay", event.target.checked)}
            />
            <span>Supervised group play with other animals</span>
          </label>
          <label className={CHECK_ROW} htmlFor="pbc-groom">
            <input
              id="pbc-groom"
              className={CHECKBOX}
              type="checkbox"
              checked={form.allowGrooming}
              onChange={(event) => set("allowGrooming", event.target.checked)}
            />
            <span>Bathing, brushing and nail trimming</span>
          </label>
          <label className={CHECK_ROW} htmlFor="pbc-photos">
            <input
              id="pbc-photos"
              className={CHECKBOX}
              type="checkbox"
              checked={form.allowPhotos}
              onChange={(event) => set("allowPhotos", event.target.checked)}
            />
            <span>Photos may be posted on the facility&apos;s social media</span>
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Quoted for the stay
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.totalCost)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the problem below to build the form"
                : `${result.nights} night${result.nights === 1 ? "" : "s"}, excluding any veterinary cost`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the boarding consent form"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy form"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {hasError && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.warnings.length > 0 && (
          <ul className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Boarding consent and care agreement</h2>
          <div className="mt-3 overflow-x-auto">
            <pre className="min-w-full whitespace-pre-wrap break-words font-sans text-sm leading-6">
              {result.documentText}
            </pre>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template only, not legal or veterinary advice. Portion figures assume a healthy
        animal on a complete maintenance diet {DASH} for a prescription diet, a growing puppy or
        kitten, a pregnant or nursing animal, or any medical condition, feed to your vet&apos;s
        instructions and confirm the amount with them.
      </p>
    </main>
  );
}
