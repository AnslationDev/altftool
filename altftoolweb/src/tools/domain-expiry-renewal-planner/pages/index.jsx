"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Check, Copy, RotateCcw } from "lucide-react";

import { MAX_AUTO_RENEW_GRACE_DAYS, formatDomainPlan, planDomainRenewal } from "../lib";

const DASH = "—";

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const todayIso = () => new Date().toISOString().slice(0, 10);

const plusDaysIso = (iso, days) => {
  const parsed = Date.parse(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed)) return iso;
  return new Date(parsed + days * 86400000).toISOString().slice(0, 10);
};

const prettyDate = (iso) => {
  const parsed = Date.parse(`${iso}T00:00:00Z`);
  return Number.isNaN(parsed) ? iso : DATE_FMT.format(parsed);
};

const relative = (days) => {
  if (days === 0) return "today";
  if (days > 0) return `in ${days} day${days === 1 ? "" : "s"}`;
  return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`;
};

const FLAGS = [
  ["autoRenew", "Auto-renew is on and the card on file is valid"],
  ["registrarLock", "Registrar transfer lock (clientTransferProhibited) is set"],
  ["contactCurrent", "The registrant email is monitored and current"],
  ["twoFactor", "The registrar account has two-factor authentication"],
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const RISK_TONE = { high: "danger", medium: "warning", low: "warning", none: "success" };

export default function ToolHome() {
  const [domain, setDomain] = useState("example.com");
  const [today, setToday] = useState(todayIso);
  const [expiryDate, setExpiryDate] = useState(() => plusDaysIso(todayIso(), 45));
  const [registeredOn, setRegisteredOn] = useState("");
  const [graceDays, setGraceDays] = useState("30");
  const [renewalPrice, setRenewalPrice] = useState("15");
  const [redemptionFee, setRedemptionFee] = useState("100");
  const [flags, setFlags] = useState({
    autoRenew: true,
    registrarLock: true,
    contactCurrent: false,
    twoFactor: false,
  });
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      planDomainRenewal({
        expiryDate,
        today,
        registeredOn,
        graceDays: graceDays.trim() === "" ? Number.NaN : Number(graceDays),
        renewalPrice: Number(renewalPrice),
        redemptionFee: Number(redemptionFee),
        ...flags,
      }),
    [expiryDate, today, registeredOn, graceDays, renewalPrice, redemptionFee, flags],
  );

  const hasError = Boolean(plan.error);
  const summary = useMemo(
    () => (hasError ? "" : formatDomainPlan(plan, domain)),
    [plan, hasError, domain],
  );

  const toggleFlag = (key) => (event) => {
    const next = event.target.checked;
    setFlags((current) => ({ ...current, [key]: next }));
  };

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
    const fresh = todayIso();
    setDomain("example.com");
    setToday(fresh);
    setExpiryDate(plusDaysIso(fresh, 45));
    setRegisteredOn("");
    setGraceDays("30");
    setRenewalPrice("15");
    setRedemptionFee("100");
    setFlags({ autoRenew: true, registrarLock: true, contactCurrent: false, twoFactor: false });
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          DNS and certificates
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Domain Expiry and Renewal Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Losing a domain is a chain of windows, not a single date. This dates the registrar grace,
          the 30-day redemption period, the 5-day pending delete and the drop, plus the transfer
          locks that decide whether you can move it at all.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="der-domain">
              Domain name (for the copied plan)
            </label>
            <input
              id="der-domain"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="der-expiry">
              Registry expiry date
            </label>
            <input
              id="der-expiry"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="der-today">
              Today
            </label>
            <input
              id="der-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="der-registered">
              Registered or last transferred on (optional)
            </label>
            <input
              id="der-registered"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={registeredOn}
              onChange={(event) => setRegisteredOn(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="der-grace">
              Registrar renewal grace after expiry (days)
            </label>
            <input
              id="der-grace"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_AUTO_RENEW_GRACE_DAYS}
              step="1"
              value={graceDays}
              onChange={(event) => setGraceDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="der-price">
              Normal renewal price
            </label>
            <input
              id="der-price"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={renewalPrice}
              onChange={(event) => setRenewalPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="der-redemption">
              Registrar redemption / restore fee
            </label>
            <input
              id="der-redemption"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={redemptionFee}
              onChange={(event) => setRedemptionFee(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Which of these are already true?
          </legend>
          <div className="mt-3 grid gap-2">
            {FLAGS.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`der-${key}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-6"
              >
                <input
                  id={`der-${key}`}
                  type="checkbox"
                  checked={flags[key]}
                  onChange={toggleFlag(key)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
          <section className={`mt-6 ${CARD}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Days until the name drops
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Current phase", "Days to expiry", "Risk score"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className={`mt-6 ${CARD}`} aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Days until the name drops
                </p>
                <p
                  className="mt-1 text-4xl font-semibold"
                  style={{ color: `var(--${plan.phaseInfo.tone})` }}
                >
                  {plan.daysUntilDrop > 0 ? plan.daysUntilDrop : "0"}
                </p>
                <p className="mt-1 text-sm font-semibold">{plan.phaseInfo.label}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {plan.phaseInfo.meaning}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the domain renewal plan"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy plan"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset the planner"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Expiry date", `${prettyDate(plan.expiry)} (${relative(plan.daysToExpiry)})`],
                ["Registrar renewal grace", `${plan.graceDays} days after expiry`],
                ["Name drops on", prettyDate(plan.dropDate)],
                [
                  "Risk score",
                  `${plan.riskScore}/100 — ${plan.riskBand === "none" ? "nothing outstanding" : `${plan.riskBand} risk`}`,
                ],
                plan.costs
                  ? [
                      "Renew now vs restore later",
                      plan.costs.restoreLater
                        ? `${plan.costs.renewNow} now, or about ${plan.costs.restoreLater} after redemption — ${plan.costs.multiple}× as much`
                        : `${plan.costs.renewNow} now`,
                    ]
                  : null,
              ]
                .filter(Boolean)
                .map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="font-medium leading-6">{value}</dd>
                  </div>
                ))}
            </dl>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <span
                className="block h-full"
                style={{
                  width: `${plan.riskScore}%`,
                  backgroundColor: `var(--${RISK_TONE[plan.riskBand]})`,
                }}
              />
            </div>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Lifecycle timeline</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Stage
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Date
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plan.timeline.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold">{item.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 whitespace-nowrap">{prettyDate(item.date)}</td>
                      <td className="py-2.5 text-right whitespace-nowrap text-[var(--muted-foreground)]">
                        {relative(item.daysAway)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Reminder emails your registrar must send</h2>
            <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
              {plan.reminders.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span>{item.label}</span>
                  <span className="font-semibold whitespace-nowrap">
                    {prettyDate(item.date)}{" "}
                    <span className="font-normal text-[var(--muted-foreground)]">
                      ({relative(item.daysAway)})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Required by the Expired Registration Recovery Policy. They go to the registrant
              address on file — which is why a stale contact is one of the highest-weighted risks
              here.
            </p>
          </section>

          {plan.transfer && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Transfer status</h2>
              <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
                {[
                  [
                    "60-day inter-registrar lock",
                    plan.transfer.locked
                      ? `Locked until ${prettyDate(plan.transfer.lockEnd)} — ${plan.transfer.lockDaysLeft} days to go`
                      : `Cleared on ${prettyDate(plan.transfer.lockEnd)}`,
                  ],
                  [
                    "5-day grace period",
                    plan.transfer.inAddGrace
                      ? `Still open until ${prettyDate(plan.transfer.addGraceEnd)} — a deletion in this window is refundable`
                      : `Closed on ${prettyDate(plan.transfer.addGraceEnd)}`,
                  ],
                  [
                    "Start any transfer by",
                    `${prettyDate(plan.transfer.safeTransferBy)} (${relative(plan.transfer.safeTransferDaysLeft)}) to leave room for the five-day approval window`,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="font-medium leading-6">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {plan.risks.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">What could still cost you this domain</h2>
              <ul className="mt-3 grid gap-3">
                {plan.risks.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                        +{item.weight} risk
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
                      {item.detail}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Do this</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
              {plan.actions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and based on generic top-level domain policy. Country-code TLDs set
        their own lifecycles and some have no redemption period at all — confirm the exact grace
        periods, fees and lock rules with your registrar.
      </p>
    </main>
  );
}
