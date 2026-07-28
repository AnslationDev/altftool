"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BedDouble,
  Check,
  Copy,
  IndianRupee,
  Info,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";

import {
  COMMON_SUM_INSURED_SLABS,
  DEFAULT_ICU_CAP_PERCENT,
  DEFAULT_ROOM_CAP_PERCENT,
  RULE_AS_OF,
  RULE_SOURCE,
  computeProportionateDeduction,
  computeRequiredSumInsured,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD_CLASS = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const inrPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const pct = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
/** Headline figures sit next to a rupee glyph, so the digits are formatted alone. */
const plain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const money = (value) => (Number.isFinite(value) ? inr.format(value) : DASH);
const moneyExact = (value) => (Number.isFinite(value) ? inrPaise.format(value) : DASH);
const percent = (value) => (Number.isFinite(value) ? `${pct.format(value)}%` : DASH);

const DEFAULT_FORWARD = {
  sumInsured: "500000",
  capMode: "percent",
  capPercent: String(DEFAULT_ROOM_CAP_PERCENT),
  capAmount: "5000",
  actualRoomRentPerDay: "8000",
  days: "4",
  roomChargesBilled: "",
  nursingCharges: "12000",
  otCharges: "30000",
  surgeonFees: "60000",
  consultationFees: "8000",
  pharmacy: "25000",
  implants: "40000",
  diagnostics: "15000",
  nonPayables: "3000",
  copayPercent: "10",
  differentialBilling: true,
  proportionDiagnostics: false,
};

const DEFAULT_REVERSE = {
  desiredRoomRentPerDay: "8000",
  capPercent: String(DEFAULT_ROOM_CAP_PERCENT),
  currentSumInsured: "500000",
};

const PROPORTIONED_LINES = [
  ["nursingCharges", "Nursing charges", "Named in the standard definition."],
  ["otCharges", "Operation theatre charges", "Named in the standard definition."],
  ["surgeonFees", "Surgeon / anaesthetist fees", "In-hospital practitioner fees."],
  ["consultationFees", "Consultations and doctor visits", "Specialist rounds during the stay."],
];

const UNPROPORTIONED_LINES = [
  ["pharmacy", "Pharmacy and consumables", "Excluded from associated medical expenses."],
  ["implants", "Implants and medical devices", "Excluded from associated medical expenses."],
];

export default function ToolHome() {
  const [mode, setMode] = useState("forward");
  const [forward, setForward] = useState(DEFAULT_FORWARD);
  const [reverse, setReverse] = useState(DEFAULT_REVERSE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeProportionateDeduction(forward), [forward]);
  const reverseResult = useMemo(() => computeRequiredSumInsured(reverse), [reverse]);

  const active = mode === "forward" ? result : reverseResult;
  const failed = Boolean(active.error);

  function setF(key, value) {
    setForward((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }

  function setR(key, value) {
    setReverse((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  }

  function resetAll() {
    setForward(DEFAULT_FORWARD);
    setReverse(DEFAULT_REVERSE);
    setCopied(false);
  }

  async function copyResult() {
    if (failed) return;
    const lines =
      mode === "forward"
        ? [
            "Room rent proportionate deduction",
            `Total hospital bill: ${money(result.totalBill)}`,
            `Eligible room rent: ${moneyExact(result.eligibleRentPerDay)}/day vs actual ${moneyExact(
              Number(forward.actualRoomRentPerDay),
            )}/day`,
            `Eligible ratio: ${percent(result.ratioPercent)}`,
            `Room rent deduction: ${money(result.roomDeduction)}`,
            `Proportionate deduction on associated charges: ${money(result.associatedDeduction)}`,
            `Sum insured shortfall: ${money(result.sumInsuredShortfall)}`,
            `Copay (${percent(result.copayPercent)}): ${money(result.copayAmount)}`,
            `Non-payable items: ${money(result.nonPayables)}`,
            `Insurer pays: ${money(result.insurerPays)}`,
            `You pay: ${money(result.outOfPocket)}`,
          ]
        : [
            "Room rent — sum insured needed",
            `Target room tariff: ${moneyExact(reverseResult.desiredRoomRentPerDay)}/day`,
            `Room cap in the policy: ${percent(reverseResult.capPercent)} of sum insured per day`,
            `Sum insured required: ${money(reverseResult.requiredSumInsured)}`,
            `Next common slab at or above it: ${
              reverseResult.nextCommonSlab === null ? "above the usual retail range" : money(reverseResult.nextCommonSlab)
            }`,
            `Today's ceiling at ${money(reverseResult.currentSumInsured)}: ${moneyExact(
              reverseResult.currentCeiling,
            )}/day`,
            `Shortfall in sum insured: ${money(reverseResult.gap)}`,
          ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <BedDouble className="h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          Room Rent Proportionate Deduction Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a hospital room above your policy&apos;s room rent limit and many insurers cut the
          associated charges — nursing, operation theatre, surgeon and anaesthetist fees — in the
          same ratio that the eligible rate per day bears to the actual rate per day. This page runs
          that ratio across an itemised bill and shows the rupees you end up paying. Reverse it to
          find the sum insured a given room tariff needs.
        </p>
      </header>

      <div
        className="mb-5 inline-flex w-full gap-1 rounded-lg bg-[var(--card)] p-1 ring-1 ring-[var(--border)] sm:w-auto"
        role="group"
        aria-label="Calculation mode"
      >
        <ModeTab
          id="mode-forward"
          active={mode === "forward"}
          onClick={() => {
            setMode("forward");
            setCopied(false);
          }}
        >
          What will I pay?
        </ModeTab>
        <ModeTab
          id="mode-reverse"
          active={mode === "reverse"}
          onClick={() => {
            setMode("reverse");
            setCopied(false);
          }}
        >
          Sum insured needed
        </ModeTab>
      </div>

      {mode === "forward" ? (
        <ForwardInputs values={forward} onChange={setF} />
      ) : (
        <ReverseInputs values={reverse} onChange={setR} />
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className={PRIMARY_BTN}
          onClick={copyResult}
          disabled={failed}
          aria-label="Copy the result summary to the clipboard"
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? "Copied!" : "Copy result"}
        </button>
        <button type="button" className={GHOST_BTN} onClick={resetAll} aria-label="Reset all inputs">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
      </div>

      {failed ? (
        <div
          role="alert"
          className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {active.error}
        </div>
      ) : null}

      {mode === "forward" ? (
        <ForwardResult result={result} failed={failed} />
      ) : (
        <ReverseResult result={reverseResult} failed={failed} />
      )}

      <section className={`mt-5 ${CARD_CLASS}`}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Info className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          Which rule this uses
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{RULE_SOURCE}</p>
        <p className={HINT_CLASS}>
          Wording read on {RULE_AS_OF}. The exact clause differs between policies: some apply no
          proportionate deduction at all, some exempt named procedures or package rates, some apply
          it to diagnostics too, and some cap ICU at {DEFAULT_ICU_CAP_PERCENT}% of sum insured per
          day instead of {DEFAULT_ROOM_CAP_PERCENT}%. This page computes the standard formula on the
          numbers you type. It does not read or interpret your contract — the operative text is your
          own policy wording and schedule.
        </p>
      </section>
    </main>
  );
}

function ModeTab({ id, active, onClick, children }) {
  return (
    <button
      type="button"
      id={id}
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 flex-1 rounded-md px-4 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
        active
          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ id, label, hint, value, onChange, type = "number", min = "0", step = "1", suffix }) {
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor={id}>
        {label}
        {suffix ? <span className="font-normal text-[var(--muted-foreground)]"> {suffix}</span> : null}
      </label>
      <input
        id={id}
        type={type}
        inputMode="decimal"
        min={min}
        step={step}
        className={`${INPUT_CLASS} mt-1`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? <p className={HINT_CLASS}>{hint}</p> : null}
    </div>
  );
}

function Toggle({ id, label, hint, checked, onChange }) {
  return (
    <div className="flex min-h-11 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
      />
      <div>
        <label className={`${LABEL_CLASS} cursor-pointer`} htmlFor={id}>
          {label}
        </label>
        {hint ? <p className={HINT_CLASS}>{hint}</p> : null}
      </div>
    </div>
  );
}

function ForwardInputs({ values, onChange }) {
  return (
    <div className="grid gap-5">
      <section className={CARD_CLASS}>
        <h2 className="text-base font-semibold">Policy and room</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="sum-insured"
            label="Sum insured"
            suffix="(Rs)"
            hint="The base sum insured on the schedule, before any no-claim bonus."
            value={values.sumInsured}
            onChange={(v) => onChange("sumInsured", v)}
          />
          <div>
            <label className={LABEL_CLASS} htmlFor="cap-mode">
              Room rent limit is expressed as
            </label>
            <select
              id="cap-mode"
              className={`${INPUT_CLASS} mt-1`}
              value={values.capMode}
              onChange={(event) => onChange("capMode", event.target.value)}
            >
              <option value="percent">A percent of sum insured, per day</option>
              <option value="amount">A rupee amount, per day</option>
            </select>
            <p className={HINT_CLASS}>
              If your policy names a room category instead, enter that category&apos;s tariff at this
              hospital as a rupee amount.
            </p>
          </div>
          {values.capMode === "percent" ? (
            <Field
              id="cap-percent"
              label="Room rent cap"
              suffix="(% of sum insured per day)"
              hint={`Commonly ${DEFAULT_ROOM_CAP_PERCENT}% for a single private room and ${DEFAULT_ICU_CAP_PERCENT}% for ICU. Use the figure on your schedule.`}
              value={values.capPercent}
              step="0.05"
              onChange={(v) => onChange("capPercent", v)}
            />
          ) : (
            <Field
              id="cap-amount"
              label="Room rent cap"
              suffix="(Rs per day)"
              hint="The flat daily limit, or the eligible room category's tariff."
              value={values.capAmount}
              onChange={(v) => onChange("capAmount", v)}
            />
          )}
          <Field
            id="actual-rent"
            label="Actual room tariff"
            suffix="(Rs per day)"
            hint="What the hospital charges for the room actually occupied."
            value={values.actualRoomRentPerDay}
            onChange={(v) => onChange("actualRoomRentPerDay", v)}
          />
          <Field
            id="days"
            label="Days billed at that tariff"
            hint="Whole days on the bill."
            value={values.days}
            onChange={(v) => onChange("days", v)}
          />
          <Field
            id="copay"
            label="Copay"
            suffix="(% of the admissible amount)"
            hint="Enter 0 if your policy has no copay. Applied after the proportionate deduction."
            value={values.copayPercent}
            step="0.5"
            onChange={(v) => onChange("copayPercent", v)}
          />
        </div>
      </section>

      <section className={CARD_CLASS}>
        <h2 className="text-base font-semibold">Charges the ratio is applied to</h2>
        <p className={HINT_CLASS}>
          Associated medical expenses, as the standard definition lists them: room rent, nursing,
          operation theatre, and the fees of the practitioner, surgeon, anaesthetist or specialist
          within the same hospital.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="room-billed"
            label="Room and board on the bill"
            suffix="(Rs)"
            hint="Leave blank to use tariff x days."
            value={values.roomChargesBilled}
            onChange={(v) => onChange("roomChargesBilled", v)}
          />
          {PROPORTIONED_LINES.map(([key, label, hint]) => (
            <Field
              key={key}
              id={`line-${key}`}
              label={label}
              suffix="(Rs)"
              hint={hint}
              value={values[key]}
              onChange={(v) => onChange(key, v)}
            />
          ))}
        </div>
      </section>

      <section className={CARD_CLASS}>
        <h2 className="text-base font-semibold">Charges the ratio is not applied to</h2>
        <p className={HINT_CLASS}>
          The standard definition of associated medical expenses excludes pharmacy and consumables,
          implants and medical devices, and diagnostics — so the ratio does not touch them. These
          still count against your sum insured.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {UNPROPORTIONED_LINES.map(([key, label, hint]) => (
            <Field
              key={key}
              id={`line-${key}`}
              label={label}
              suffix="(Rs)"
              hint={hint}
              value={values[key]}
              onChange={(v) => onChange(key, v)}
            />
          ))}
          <Field
            id="line-diagnostics"
            label="Diagnostics and investigations"
            suffix="(Rs)"
            hint="Excluded by the standard definition; move it with the switch below if your wording says otherwise."
            value={values.diagnostics}
            onChange={(v) => onChange("diagnostics", v)}
          />
          <Field
            id="line-nonPayables"
            label="Non-payable items"
            suffix="(Rs)"
            hint="Gloves, admission kits, attendant charges and similar items your policy never reimburses."
            value={values.nonPayables}
            onChange={(v) => onChange("nonPayables", v)}
          />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Toggle
            id="toggle-diagnostics"
            label="My policy proportions diagnostics too"
            hint="Some older and non-standard wordings do. Moves the diagnostics line into the proportioned bucket."
            checked={values.proportionDiagnostics}
            onChange={(v) => onChange("proportionDiagnostics", v)}
          />
          <Toggle
            id="toggle-differential"
            label="The hospital bills differently by room category"
            hint="The standard definition says proportionate deduction is not applied where the hospital does not follow differential billing. Untick and the associated charges are left whole."
            checked={values.differentialBilling}
            onChange={(v) => onChange("differentialBilling", v)}
          />
        </div>
      </section>
    </div>
  );
}

function ReverseInputs({ values, onChange }) {
  return (
    <section className={CARD_CLASS}>
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <ArrowLeftRight className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
        Work backwards from the room you want
      </h2>
      <p className={HINT_CLASS}>
        A percent-of-sum-insured room cap is a straight multiplication, so it inverts exactly:
        sum insured = target tariff per day x 100 / cap percent.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          id="desired-rent"
          label="Room tariff you want fully covered"
          suffix="(Rs per day)"
          hint="Ask the hospital for the current single private room tariff."
          value={values.desiredRoomRentPerDay}
          onChange={(v) => onChange("desiredRoomRentPerDay", v)}
        />
        <Field
          id="reverse-cap-percent"
          label="Room rent cap in the policy"
          suffix="(% of sum insured per day)"
          hint={`Commonly ${DEFAULT_ROOM_CAP_PERCENT}%. A policy with no room rent cap has no such requirement at all.`}
          value={values.capPercent}
          step="0.05"
          onChange={(v) => onChange("capPercent", v)}
        />
        <Field
          id="current-si"
          label="Your current sum insured"
          suffix="(Rs, optional)"
          hint="Used to show today's ceiling and the gap. Leave 0 to skip."
          value={values.currentSumInsured}
          onChange={(v) => onChange("currentSumInsured", v)}
        />
      </div>
    </section>
  );
}

function ForwardResult({ result, failed }) {
  const show = (value, formatter = money) => (failed ? DASH : formatter(value));

  return (
    <>
      <section className={`mt-5 ${CARD_CLASS}`}>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          You pay out of pocket
        </p>
        <p className="mt-1 flex items-center gap-2 text-4xl font-bold tabular-nums sm:text-5xl">
          <IndianRupee className="h-8 w-8 shrink-0 text-[var(--primary)] sm:h-10 sm:w-10" aria-hidden="true" />
          {failed ? DASH : plain.format(result.outOfPocket)}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          on a total bill of {show(result.totalBill)}. The insurer settles {show(result.insurerPays)}
          {failed ? "" : ` — ${percent(result.reimbursementPercent)} of the bill`}.
        </p>

        {!failed && result.capExceeded && result.proportionApplies ? (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            The room is {moneyExact(result.excessPerDay)}/day over the limit, so only{" "}
            {percent(result.ratioPercent)} of the associated charges survives. That single choice
            costs {money(result.totalProportionateDeduction)}.
          </p>
        ) : null}
        {!failed && result.capExceeded && !result.proportionApplies ? (
          <p className="mt-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            The room is over the limit, but with no differential billing the standard definition
            leaves the associated charges whole. Only the room rent excess of{" "}
            {money(result.roomDeduction)} is deducted.
          </p>
        ) : null}
        {!failed && !result.capExceeded ? (
          <p className="mt-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--success)]">
            The room tariff is within the limit, so no proportionate deduction arises.
          </p>
        ) : null}

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Row label="Eligible room rent per day" value={show(result.eligibleRentPerDay, moneyExact)} />
          <Row label="Room rent limit per day" value={show(result.capPerDay, moneyExact)} />
          <Row label="Eligible ratio" value={failed ? DASH : percent(result.ratioPercent)} />
          <Row label="Days billed" value={failed ? DASH : pct.format(result.days)} />
        </dl>
      </section>

      <section className={`mt-5 ${CARD_CLASS}`}>
        <h2 className="text-base font-semibold">Where your money goes</h2>
        <p className={HINT_CLASS}>These five lines add up exactly to the out-of-pocket figure.</p>
        <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Row label="Room rent above the limit" value={show(result.roomDeduction)} />
          <Row label="Proportionate cut on associated charges" value={show(result.associatedDeduction)} />
          <Row label="Above the sum insured" value={show(result.sumInsuredShortfall)} />
          <Row
            label={`Copay${failed ? "" : ` at ${percent(result.copayPercent)}`}`}
            value={show(result.copayAmount)}
          />
          <Row label="Non-payable items" value={show(result.nonPayables)} />
          <Row label="Total you pay" value={show(result.outOfPocket)} strong />
        </dl>
      </section>

      <section className={`mt-5 ${CARD_CLASS}`}>
        <h2 className="text-base font-semibold">Bill, line by line</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">
              Each bill bucket as billed, the amount admitted, and the amount deducted
            </caption>
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Bucket
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  Billed
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  Admitted
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Deducted
                </th>
              </tr>
            </thead>
            <tbody>
              <BillRow
                label="Room and board"
                billed={show(result.roomChargesBilled)}
                admitted={show(result.roomAllowed)}
                deducted={show(result.roomDeduction)}
              />
              <BillRow
                label={
                  failed || !result.diagnosticsProportioned
                    ? "Associated medical expenses"
                    : "Associated medical expenses (incl. diagnostics)"
                }
                billed={show(result.associatedCharges)}
                admitted={show(result.associatedAllowed)}
                deducted={show(result.associatedDeduction)}
              />
              <BillRow
                label="Pharmacy, implants, diagnostics"
                billed={show(result.nonProportionateCharges)}
                admitted={show(result.nonProportionateAllowed)}
                deducted={failed ? DASH : money(0)}
              />
              <BillRow
                label="Non-payable items"
                billed={show(result.nonPayables)}
                admitted={failed ? DASH : money(0)}
                deducted={show(result.nonPayables)}
              />
              <BillRow
                label="Total"
                billed={show(result.totalBill)}
                admitted={show(result.admissible)}
                deducted={show(result.totalDeducted)}
                strong
              />
            </tbody>
          </table>
        </div>
        <p className={HINT_CLASS}>
          &quot;Admitted&quot; is before the sum insured cap and before copay; both are applied in the
          panel above.
        </p>
      </section>
    </>
  );
}

function ReverseResult({ result, failed }) {
  return (
    <>
      <section className={`mt-5 ${CARD_CLASS}`}>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          Sum insured needed for that room, with no proportionate deduction
        </p>
        <p className="mt-1 flex items-center gap-2 text-4xl font-bold tabular-nums sm:text-5xl">
          <IndianRupee className="h-8 w-8 shrink-0 text-[var(--primary)] sm:h-10 sm:w-10" aria-hidden="true" />
          {failed ? DASH : plain.format(result.requiredSumInsured)}
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {failed
            ? DASH
            : `A ${percent(result.capPercent)} per day room cap turns every rupee of sum insured into ${percent(
                result.capPercent,
              )} of daily room eligibility, so ${moneyExact(
                result.desiredRoomRentPerDay,
              )} a day needs ${money(result.requiredSumInsured)}.`}
        </p>

        {!failed && result.currentSumInsured > 0 && !result.covered ? (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            At {money(result.currentSumInsured)} today the ceiling is{" "}
            {moneyExact(result.currentCeiling)} a day, so only{" "}
            {percent(result.ratioPercentAtCurrentSi)} of the associated charges would survive —
            every rupee of them loses {percent(result.lossSharePercentAtCurrentSi)}.
          </p>
        ) : null}
        {!failed && result.currentSumInsured > 0 && result.covered ? (
          <p className="mt-3 rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--success)]">
            Your current sum insured already clears it — the ceiling today is{" "}
            {moneyExact(result.currentCeiling)} a day.
          </p>
        ) : null}

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Row label="Target room tariff" value={failed ? DASH : `${moneyExact(result.desiredRoomRentPerDay)} / day`} />
          <Row label="Room cap in the policy" value={failed ? DASH : `${percent(result.capPercent)} of SI / day`} />
          <Row label="Sum insured required" value={failed ? DASH : money(result.requiredSumInsured)} />
          <Row
            label="Next common retail slab at or above it"
            value={
              failed
                ? DASH
                : result.nextCommonSlab === null
                  ? "Above the usual retail range"
                  : money(result.nextCommonSlab)
            }
          />
          <Row label="Your current sum insured" value={failed ? DASH : money(result.currentSumInsured)} />
          <Row
            label="Room ceiling at that sum insured"
            value={failed ? DASH : `${moneyExact(result.currentCeiling)} / day`}
          />
          <Row label="Shortfall in sum insured" value={failed ? DASH : money(result.gap)} strong />
        </dl>
        <p className={HINT_CLASS}>
          The slab list is the set of cover amounts commonly sold on Indian retail indemnity plans:{" "}
          {COMMON_SUM_INSURED_SLABS.map((slab) => inr.format(slab)).join(", ")}. It is arithmetic on
          that list, not a view on any product.
        </p>
      </section>
    </>
  );
}

function BillRow({ label, billed, admitted, deducted, strong }) {
  return (
    <tr className="border-b border-[var(--border)] last:border-0">
      <th scope="row" className={`py-2 pr-3 text-left ${strong ? "font-semibold" : "font-normal"}`}>
        {label}
      </th>
      <td className="py-2 pr-3 text-right tabular-nums">{billed}</td>
      <td className="py-2 pr-3 text-right tabular-nums">{admitted}</td>
      <td className={`py-2 text-right tabular-nums ${strong ? "font-semibold" : ""}`}>{deducted}</td>
    </tr>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className={`text-right text-sm tabular-nums ${strong ? "text-base font-bold" : "font-semibold"}`}>
        {value}
      </dd>
    </div>
  );
}
