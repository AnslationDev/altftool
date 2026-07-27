"use client";

import { useMemo, useState } from "react";
import { Check, CircleCheckBig, CircleX, Copy, RotateCcw, UsersRound } from "lucide-react";

import {
  ASSET_CLASSES,
  RELIGIONS,
  buildLegalHeirChecklist,
  computeReadiness,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_HEIRS = {
  widows: "1",
  sons: "2",
  daughters: "1",
  predeceasedChildBranches: "0",
};

const HEIR_FIELDS = [
  { key: "widows", id: "lhc-widows", label: "Surviving widows", maleOnly: true },
  { key: "sons", id: "lhc-sons", label: "Surviving sons", maleOnly: false },
  { key: "daughters", id: "lhc-daughters", label: "Surviving daughters", maleOnly: false },
  {
    key: "predeceasedChildBranches",
    id: "lhc-branches",
    label: "Pre-deceased children leaving their own heirs",
    maleOnly: false,
  },
];

const DEFAULTS = {
  religionId: "hindu",
  gender: "male",
  assets: ["serviceBenefits", "bankAndSecurities", "immovable"],
  estateValue: "1500000",
  courtFeePercent: "3",
  courtFeeCap: "75000",
};

export default function ToolHome() {
  const [religionId, setReligionId] = useState(DEFAULTS.religionId);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [willExists, setWillExists] = useState(false);
  const [executorNamed, setExecutorNamed] = useState(false);
  const [inPresidencyTownJurisdiction, setInPresidencyTownJurisdiction] = useState(false);
  const [assets, setAssets] = useState(DEFAULTS.assets);
  const [heirs, setHeirs] = useState(DEFAULT_HEIRS);
  const [motherAlive, setMotherAlive] = useState(true);
  const [husbandAlive, setHusbandAlive] = useState(false);
  const [estateValue, setEstateValue] = useState(DEFAULTS.estateValue);
  const [courtFeePercent, setCourtFeePercent] = useState(DEFAULTS.courtFeePercent);
  const [courtFeeCap, setCourtFeeCap] = useState(DEFAULTS.courtFeeCap);
  const [haveIds, setHaveIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const setHeir = (key) => (event) =>
    setHeirs((current) => ({ ...current, [key]: event.target.value }));

  const toggleAsset = (id) =>
    setAssets((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const toggleHave = (id) =>
    setHaveIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildLegalHeirChecklist({
        religionId,
        gender,
        willExists,
        executorNamed,
        inPresidencyTownJurisdiction,
        assets,
        heirs: {
          widows: heirs.widows === "" ? 0 : Number(heirs.widows),
          sons: heirs.sons === "" ? 0 : Number(heirs.sons),
          daughters: heirs.daughters === "" ? 0 : Number(heirs.daughters),
          predeceasedChildBranches:
            heirs.predeceasedChildBranches === "" ? 0 : Number(heirs.predeceasedChildBranches),
          motherAlive,
          husbandAlive,
        },
        estateValue: estateValue === "" ? 0 : Number(estateValue),
        courtFeePercent: courtFeePercent === "" ? 0 : Number(courtFeePercent),
        courtFeeCap: courtFeeCap === "" ? 0 : Number(courtFeeCap),
      }),
    [
      religionId,
      gender,
      willExists,
      executorNamed,
      inPresidencyTownJurisdiction,
      assets,
      heirs,
      motherAlive,
      husbandAlive,
      estateValue,
      courtFeePercent,
      courtFeeCap,
    ],
  );

  const hasError = Boolean(result.error);

  const readiness = useMemo(
    () => computeReadiness(hasError ? [] : result.documents, haveIds),
    [hasError, result, haveIds],
  );

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Legal Heir Certificate Document Checklist",
      `Personal law: ${result.religion.law}`,
      `Instruments needed: ${result.neededInstruments.map((entry) => entry.label).join(", ")}`,
    ];
    if (result.shares) {
      lines.push("", `Class I shares — ${result.shares.totalShares} equal shares:`);
      result.shares.rows.forEach((row) =>
        lines.push(`• ${row.label}: ${row.perPersonPercent}% each`),
      );
    }
    lines.push("", result.shareNote);
    if (result.needsSuccessionCertificate) {
      lines.push("", `Estimated court fee: ${money(result.courtFee.payable)}`);
    }
    lines.push("", "Required documents:");
    result.requiredDocuments.forEach((doc) =>
      lines.push(`[${haveIds.includes(doc.id) ? "x" : " "}] ${doc.label}`),
    );
    return lines.join("\n");
  }, [hasError, result, haveIds]);

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
    setReligionId(DEFAULTS.religionId);
    setGender(DEFAULTS.gender);
    setWillExists(false);
    setExecutorNamed(false);
    setInPresidencyTownJurisdiction(false);
    setAssets(DEFAULTS.assets);
    setHeirs(DEFAULT_HEIRS);
    setMotherAlive(true);
    setHusbandAlive(false);
    setEstateValue(DEFAULTS.estateValue);
    setCourtFeePercent(DEFAULTS.courtFeePercent);
    setCourtFeeCap(DEFAULTS.courtFeeCap);
    setHaveIds([]);
    setCopied(false);
  };

  const isMale = gender === "male";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <UsersRound className="h-4 w-4" aria-hidden="true" />
          Certificates India
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Legal Heir Certificate Document Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A legal heir certificate releases service benefits; it is not a document of title. This
          works out which instrument each asset actually needs — legal heir certificate, succession
          certificate, probate or letters of administration — and lists the papers for each.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lhc-religion">
              Personal law that applied to the deceased
            </label>
            <select
              id="lhc-religion"
              className={`mt-2 ${INPUT_CLASS}`}
              value={religionId}
              onChange={(event) => setReligionId(event.target.value)}
            >
              {RELIGIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lhc-gender">
              The deceased was
            </label>
            <select
              id="lhc-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={gender}
              onChange={(event) => setGender(event.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What did the estate include?
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {ASSET_CLASSES.map((option) => (
              <label
                key={option.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                htmlFor={`lhc-a-${option.id}`}
              >
                <input
                  id={`lhc-a-${option.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={assets.includes(option.id)}
                  onChange={() => toggleAsset(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">Was there a Will?</legend>
          <div className="mt-2 grid gap-2">
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              htmlFor="lhc-will"
            >
              <input
                id="lhc-will"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={willExists}
                onChange={(event) => setWillExists(event.target.checked)}
              />
              <span>Yes, a Will exists</span>
            </label>
            {willExists && (
              <>
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  htmlFor="lhc-executor"
                >
                  <input
                    id="lhc-executor"
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={executorNamed}
                    onChange={(event) => setExecutorNamed(event.target.checked)}
                  />
                  <span>An executor is named and willing to act</span>
                </label>
                <label
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  htmlFor="lhc-presidency"
                >
                  <input
                    id="lhc-presidency"
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={inPresidencyTownJurisdiction}
                    onChange={(event) => setInPresidencyTownJurisdiction(event.target.checked)}
                  />
                  <span>
                    The Will was made in, or covers property in, Kolkata, Chennai or Mumbai
                  </span>
                </label>
              </>
            )}
          </div>
        </fieldset>

        <h2 className="mt-6 text-base font-semibold">Surviving heirs</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {HEIR_FIELDS.filter((field) => !field.maleOnly || isMale).map((field) => (
            <div key={field.key}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={heirs[field.key]}
                onChange={setHeir(field.key)}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2">
          {isMale ? (
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              htmlFor="lhc-mother"
            >
              <input
                id="lhc-mother"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={motherAlive}
                onChange={(event) => setMotherAlive(event.target.checked)}
              />
              <span>The mother of the deceased survives</span>
            </label>
          ) : (
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              htmlFor="lhc-husband"
            >
              <input
                id="lhc-husband"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={husbandAlive}
                onChange={(event) => setHusbandAlive(event.target.checked)}
              />
              <span>The husband of the deceased survives</span>
            </label>
          )}
        </div>

        <h2 className="mt-6 text-base font-semibold">Court fee on a succession certificate</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="lhc-estate">
              Value of deposits and securities (INR)
            </label>
            <input
              id="lhc-estate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={estateValue}
              onChange={(event) => setEstateValue(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lhc-feepct">
              Your state&apos;s ad valorem rate (%)
            </label>
            <input
              id="lhc-feepct"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={courtFeePercent}
              onChange={(event) => setCourtFeePercent(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lhc-feecap">
              State cap on the fee, 0 for none (INR)
            </label>
            <input
              id="lhc-feecap"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="5000"
              value={courtFeeCap}
              onChange={(event) => setCourtFeeCap(event.target.value)}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          The rate and cap are fixed by state amendment to Schedule I Article 12 of the Court Fees
          Act, 1870 — take yours from the district court&apos;s own fee table.
        </p>
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
              Instruments you need
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : String(result.neededInstruments.length)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the answer."
                : result.neededInstruments.map((entry) => entry.label).join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the legal heir checklist"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy checklist"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Personal law", hasError ? DASH : result.religion.law],
            [
              "Class I shares in total",
              hasError ? DASH : result.shares ? String(result.shares.totalShares) : "Not computed",
            ],
            [
              "Succession certificate needed",
              hasError ? DASH : result.needsSuccessionCertificate ? "Yes" : "No",
            ],
            ["Probate needed", hasError ? DASH : result.needsProbate ? "Yes" : "No"],
            [
              "Letters of administration needed",
              hasError ? DASH : result.needsLettersOfAdministration ? "Yes" : "No",
            ],
            [
              "Estimated court fee",
              hasError
                ? DASH
                : result.needsSuccessionCertificate
                  ? `${money(result.courtFee.payable)}${result.courtFee.capped ? " (capped)" : ""}`
                  : "Not applicable",
            ],
            ["Documents in hand", hasError ? DASH : `${readiness.have} of ${readiness.total}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Which instrument, and why</h2>
          <ul className="mt-3 grid gap-3">
            {result.instruments.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  {entry.needed ? (
                    <CircleCheckBig className="h-5 w-5 text-[var(--success)]" />
                  ) : (
                    <CircleX className="h-5 w-5 text-[var(--muted-foreground)]" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {entry.label}
                    <span className="ml-2 text-xs font-medium text-[var(--muted-foreground)]">
                      {entry.needed ? "Needed" : "Not needed"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Issued by {entry.issuedBy}.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                    {entry.reason}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Shares on an intestacy</h2>
          {result.shares ? (
            <>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                The estate divides into {result.shares.totalShares} equal shares of 1/
                {result.shares.totalShares} each.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[340px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Heir
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Group
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        Each
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.shares.rows.map((row) => (
                      <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2.5 pr-3">
                          <span className="font-semibold">{row.label}</span>
                          <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                            {row.note}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-right align-top font-semibold">
                          {row.groupPercent}%
                        </td>
                        <td className="py-2.5 text-right align-top font-semibold">
                          {row.perPersonPercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
          <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.shareNote}
          </p>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Documents to assemble</h2>
            <p className="text-sm font-semibold text-[var(--muted-foreground)]">
              {readiness.percent}% ready
            </p>
          </div>
          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`${readiness.percent} percent of the required documents are ready`}
          >
            <span
              className={`block h-full ${readiness.ready ? "bg-[var(--success)]" : "bg-[var(--primary)]"}`}
              style={{ width: `${readiness.percent}%` }}
            />
          </div>
          <ul className="mt-4 grid gap-3">
            {result.requiredDocuments.map((doc) => (
              <li key={doc.id}>
                <label
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  htmlFor={`lhc-d-${doc.id}`}
                >
                  <input
                    id={`lhc-d-${doc.id}`}
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={haveIds.includes(doc.id)}
                    onChange={() => toggleHave(doc.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{doc.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          {result.optionalDocuments.length > 0 && (
            <>
              <h2 className="mt-6 text-base font-semibold">Worth having ready</h2>
              <ul className="mt-3 grid gap-3">
                {result.optionalDocuments.map((doc) => (
                  <li
                    key={doc.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                  >
                    <p className="text-sm font-semibold">{doc.label}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                      {doc.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. A nominee holds the money as trustee for the heirs
        rather than owning it, so a nomination does not settle who is entitled. Court fees, forms and
        local practice vary — consult a lawyer before filing, particularly where an heir disputes the
        list or the estate includes immovable property.
      </p>
    </main>
  );
}
