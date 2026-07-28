"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import { ACCOUNT_TYPES, KYC_MODES, buildAccountChecklist } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm font-medium";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function ToolHome() {
  const [accountTypeId, setAccountTypeId] = useState("savings");
  const [kycMode, setKycMode] = useState("branch");
  const [hasPan, setHasPan] = useState(true);
  const [ovdHasCurrentAddress, setOvdHasCurrentAddress] = useState(true);
  const [isFirstAccount, setIsFirstAccount] = useState(true);
  const [collectedIds, setCollectedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildAccountChecklist({
        accountTypeId,
        kycMode,
        hasPan,
        ovdHasCurrentAddress,
        isFirstAccount,
        collectedIds,
      }),
    [accountTypeId, kycMode, hasPan, ovdHasCurrentAddress, isFirstAccount, collectedIds],
  );

  const toggleCollected = (id) => {
    setCollectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Account opening checklist — ${result.account.label}`,
      `KYC route: ${result.mode.label}`,
      `${result.mandatoryCount} required documents, ${result.optionalCount} optional`,
      "",
      ...result.groups.flatMap((group) => [
        `## ${group.title}`,
        ...group.items.map(
          (item) => `[${item.collected ? "x" : " "}] ${item.label}${item.mandatory ? "" : " (optional)"}`,
        ),
        "",
      ]),
      ...(result.warnings.length > 0 ? ["## Watch out for", ...result.warnings.map((w) => `- ${w}`)] : []),
    ].join("\n");
  }, [result]);

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
    setAccountTypeId("savings");
    setKycMode("branch");
    setHasPan(true);
    setOvdHasCurrentAddress(true);
    setIsFirstAccount(true);
    setCollectedIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          KYC documents
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bank Account Opening Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick the account type and the KYC route, and get the papers the RBI Master Direction
          actually requires — with the officially valid document list and the substitutes.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="acc-type">
              Account type
            </label>
            <select
              id="acc-type"
              className={`mt-2 ${INPUT_CLASS}`}
              value={accountTypeId}
              onChange={(event) => {
                setAccountTypeId(event.target.value);
                setCollectedIds([]);
              }}
            >
              {ACCOUNT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="acc-mode">
              How KYC will be done
            </label>
            <select
              id="acc-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={kycMode}
              onChange={(event) => setKycMode(event.target.value)}
            >
              {KYC_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            About the applicant
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["acc-pan", "The applicant holds a PAN", hasPan, setHasPan],
              [
                "acc-addr",
                "The OVD shows the current address",
                ovdHasCurrentAddress,
                setOvdHasCurrentAddress,
              ],
              ["acc-first", "First account with this bank", isFirstAccount, setIsFirstAccount],
            ].map(([id, label, value, setter]) => (
              <label key={id} className={CHECK_ROW} htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                  className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Documents ready
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Required documents", "Optional extras", "Still missing"].map((item) => (
                <div key={item} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{item}</dt>
                  <dd className="text-right font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Documents ready
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {result.readiness}%
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.collectedCount} of {result.mandatoryCount} required documents ticked
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the document checklist"
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

            <div className="mt-5">
              <div
                className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="img"
                aria-label={`${result.readiness} percent of required documents collected`}
              >
                <span
                  className="block h-full bg-[var(--primary)]"
                  style={{ width: `${Math.max(0, Math.min(100, result.readiness))}%` }}
                />
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Account", result.account.label],
                ["KYC route", result.mode.label],
                ["Required documents", String(result.mandatoryCount)],
                ["Optional extras", String(result.optionalCount)],
                ["Still missing", String(result.missingCount)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
              {result.account.note} {result.mode.note}
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">What to take with you</h2>
            <div className="mt-4 space-y-5">
              {result.groups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {group.title}
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <label className={CHECK_ROW} htmlFor={`chk-${item.id}`}>
                          <input
                            id={`chk-${item.id}`}
                            type="checkbox"
                            checked={item.collected}
                            onChange={() => toggleCollected(item.id)}
                            className="mt-0.5 h-5 w-5 accent-[var(--primary)]"
                          />
                          <span>
                            {item.label}
                            {item.mandatory ? null : (
                              <span className="ml-2 rounded-md bg-[var(--muted)] px-1.5 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
                                optional
                              </span>
                            )}
                            <span className="mt-0.5 block text-xs font-normal text-[var(--muted-foreground)]">
                              {item.why}
                            </span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {result.warnings.length > 0 ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Watch out for</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
                {result.warnings.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--danger)]">
                      !
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.smallAccountLimits ? (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">Small Account limits</h2>
              <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
                {[
                  ["Credits in a financial year", INR.format(result.smallAccountLimits.annualCredit)],
                  [
                    "Withdrawals and transfers a month",
                    INR.format(result.smallAccountLimits.monthlyDebit),
                  ],
                  ["Balance at any time", INR.format(result.smallAccountLimits.balance)],
                  [
                    "Validity",
                    `${result.smallAccountLimits.validityMonths} months, extendable by another ${result.smallAccountLimits.validityMonths} on proof that an OVD has been applied for`,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Officially valid documents</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-[var(--muted-foreground)]">
              {result.ovdList.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {result.deemedOvdList.length > 0 ? (
              <>
                <h2 className="mt-6 text-base font-semibold">
                  Accepted for address when the OVD is out of date
                </h2>
                <ul className="mt-3 space-y-1.5 text-sm text-[var(--muted-foreground)]">
                  {result.deemedOvdList.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden="true" className="text-[var(--primary)]">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {result.proprietorshipProofs.length > 0 ? (
              <>
                <h2 className="mt-6 text-base font-semibold">
                  Any two of these prove the firm&apos;s activity
                </h2>
                <ul className="mt-3 space-y-1.5 text-sm text-[var(--muted-foreground)]">
                  {result.proprietorshipProofs.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden="true" className="text-[var(--primary)]">
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal, tax or financial advice. Banks add requirements of their own
        and the KYC rules are amended often — confirm the list with the branch before you travel to
        it. Nothing you tick here is stored or sent anywhere.
      </p>
    </main>
  );
}
