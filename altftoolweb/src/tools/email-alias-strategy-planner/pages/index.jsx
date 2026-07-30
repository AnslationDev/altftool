"use client";

import { useMemo, useState } from "react";
import { AtSign, Check, Copy, RotateCcw } from "lucide-react";

import {
  MAX_ADDRESS,
  PROVIDERS,
  REQUIREMENTS,
  TAG_SCHEMES,
  buildAliasPlan,
  formatAliasPlan,
  rankStrategies,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const DEFAULT_SERVICES = "Netflix\nZomato\nICICI Bank\nLinkedIn\nSteam";

const DEFAULTS = {
  provider: "gmail",
  baseAddress: "priya.sharma@gmail.com",
  aliasDomain: "",
  services: DEFAULT_SERVICES,
  scheme: "service",
  salt: "",
  year: "2026",
  requirements: { revocable: true, free: true, worksEverywhere: true },
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [provider, setProvider] = useState(DEFAULTS.provider);
  const [baseAddress, setBaseAddress] = useState(DEFAULTS.baseAddress);
  const [aliasDomain, setAliasDomain] = useState(DEFAULTS.aliasDomain);
  const [services, setServices] = useState(DEFAULTS.services);
  const [scheme, setScheme] = useState(DEFAULTS.scheme);
  const [salt, setSalt] = useState(DEFAULTS.salt);
  const [year, setYear] = useState(DEFAULTS.year);
  const [requirements, setRequirements] = useState(DEFAULTS.requirements);
  const [strategyId, setStrategyId] = useState("plus");
  const [copiedId, setCopiedId] = useState("");

  const ranked = useMemo(() => rankStrategies(requirements, provider), [requirements, provider]);
  const best = ranked[0];

  const plan = useMemo(
    () =>
      buildAliasPlan({
        baseAddress,
        strategyId,
        services,
        scheme,
        salt,
        year: Number(year),
        aliasDomain,
      }),
    [baseAddress, strategyId, services, scheme, salt, year, aliasDomain],
  );

  const planText = useMemo(() => formatAliasPlan(plan), [plan]);
  const hasError = Boolean(plan.error);
  const providerInfo = PROVIDERS[provider] || PROVIDERS.other;

  const toggleRequirement = (id) =>
    setRequirements((current) => ({ ...current, [id]: !current[id] }));

  const reset = () => {
    setProvider(DEFAULTS.provider);
    setBaseAddress(DEFAULTS.baseAddress);
    setAliasDomain(DEFAULTS.aliasDomain);
    setServices(DEFAULTS.services);
    setScheme(DEFAULTS.scheme);
    setSalt(DEFAULTS.salt);
    setYear(DEFAULTS.year);
    setRequirements(DEFAULTS.requirements);
    setStrategyId("plus");
    setCopiedId("");
  };

  const copy = async (id, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setCopiedId("");
    }
  };

  const requirementCount = best ? best.requirementsSelected : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <AtSign className="h-4 w-4" aria-hidden="true" />
          Email security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Email Alias Strategy Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give each service its own address so a leaked inbox names the company that leaked it.
          Pick a strategy against your real constraints, then generate the addresses and check them
          against the RFC length limits mail servers enforce.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">1. Your constraints</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="alias-provider">
              Mail provider
            </label>
            <select
              id="alias-provider"
              className={`mt-2 ${INPUT_CLASS}`}
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
            >
              {Object.values(PROVIDERS).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alias-base">
              Mailbox everything should land in
            </label>
            <input
              id="alias-base"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              autoComplete="off"
              value={baseAddress}
              onChange={(event) => setBaseAddress(event.target.value)}
            />
          </div>
        </div>

        <p className="mt-3 rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          {providerInfo.note}
        </p>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">What does the scheme have to do?</legend>
          <div className="mt-3 grid gap-2">
            {REQUIREMENTS.map((req) => (
              <label
                key={req.id}
                htmlFor={`alias-req-${req.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <input
                  id={`alias-req-${req.id}`}
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={Boolean(requirements[req.id])}
                  onChange={() => toggleRequirement(req.id)}
                />
                <span className="font-semibold">{req.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Best fit for your constraints
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {requirementCount === 0 ? "—" : best.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {requirementCount === 0
                ? "Tick at least one requirement above to rank the strategies."
                : `${best.fit}% of what you asked for${best.available ? "" : " — but not available on this provider"}`}
            </p>
          </div>
          <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Strategy</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Fit</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Hides real address</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Can be switched off</th>
                <th scope="col" className="py-2 font-semibold">Strippable</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((item) => (
                <tr
                  key={item.id}
                  className={`border-b border-[var(--border)] last:border-0 ${item.available ? "" : "opacity-60"}`}
                >
                  <td className="py-2 pr-3 font-semibold">{item.name}</td>
                  <td className="py-2 pr-3 text-right">
                    {requirementCount === 0 ? "—" : `${item.fit}%`}
                  </td>
                  <td className="py-2 pr-3">{item.hideRealAddress ? "Yes" : "No"}</td>
                  <td className="py-2 pr-3">{item.revocable ? "Yes" : "No"}</td>
                  <td className="py-2">{item.strippable ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-5 space-y-3">
          {ranked.map((item) => (
            <li key={item.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{item.name}</span>
                <code className="rounded bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                  {item.pattern}
                </code>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.summary}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.detail}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">Trade-off: </span>
                {item.tradeoff}
              </p>
              {!item.available && (
                <p className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
                  {item.unavailableReason}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">2. Generate the addresses</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="alias-strategy">
              Strategy to generate for
            </label>
            <select
              id="alias-strategy"
              className={`mt-2 ${INPUT_CLASS}`}
              value={strategyId}
              onChange={(event) => setStrategyId(event.target.value)}
            >
              {ranked.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="alias-scheme">
              Tag naming scheme
            </label>
            <select
              id="alias-scheme"
              className={`mt-2 ${INPUT_CLASS}`}
              value={scheme}
              onChange={(event) => setScheme(event.target.value)}
            >
              {Object.values(TAG_SCHEMES).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {scheme === "serviceYear" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="alias-year">
                Sign-up year
              </label>
              <input
                id="alias-year"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1990"
                max="2100"
                step="1"
                value={year}
                onChange={(event) => setYear(event.target.value)}
              />
            </div>
          )}
          {scheme === "serviceCode" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="alias-salt">
                Secret word for the code
              </label>
              <input
                id="alias-salt"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                placeholder="something only you remember"
                value={salt}
                onChange={(event) => setSalt(event.target.value)}
              />
            </div>
          )}
          {(strategyId === "catchall" || strategyId === "subdomain") && (
            <div>
              <label className={LABEL_CLASS} htmlFor="alias-domain">
                Domain to use for aliases
              </label>
              <input
                id="alias-domain"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                placeholder="yourdomain.com"
                value={aliasDomain}
                onChange={(event) => setAliasDomain(event.target.value)}
              />
            </div>
          )}
        </div>

        <p className="mt-3 text-sm text-[var(--muted-foreground)]">{TAG_SCHEMES[scheme].note}</p>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="alias-services">
            Services, one per line
          </label>
          <textarea
            id="alias-services"
            className={`mt-2 ${AREA_CLASS}`}
            rows={6}
            value={services}
            onChange={(event) => setServices(event.target.value)}
          />
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Aliases generated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? "—" : NUM.format(plan.aliases.length)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above." : `Using ${plan.strategy.name.toLowerCase()}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => copy("plan", planText)}
            aria-label="Copy every generated alias"
            className={GHOST_BTN}
            disabled={hasError}
          >
            {copiedId === "plan" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedId === "plan" ? "Copied!" : "Copy all"}
          </button>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Addresses that fail a check", hasError ? "—" : NUM.format(plan.invalidCount)],
            ["Longest address", hasError ? "—" : `${NUM.format(plan.longest)} chars`],
            [`Headroom before the ${MAX_ADDRESS}-character limit`, hasError ? "—" : `${NUM.format(plan.headroom)} chars`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && (
          <ul className="mt-5 space-y-3">
            {plan.aliases.map((item) => (
              <li key={item.service + item.address} className="rounded-lg border border-[var(--border)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  {item.service}
                </p>
                <div className="mt-1 overflow-x-auto">
                  <code className="block whitespace-pre text-sm font-semibold">{item.address}</code>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.howToFilter}</p>
                {item.problems.map((problem) => (
                  <p
                    key={problem}
                    role="alert"
                    className="mt-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
                  >
                    {problem}
                  </p>
                ))}
                <button
                  type="button"
                  onClick={() => copy(item.address, item.address)}
                  aria-label={`Copy the alias for ${item.service}`}
                  className={`mt-3 ${GHOST_BTN}`}
                >
                  {copiedId === item.address ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copiedId === item.address ? "Copied!" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Aliases identify who leaked your address; they do not encrypt anything or stop a breach.
        Keep a record of which alias belongs to which account, because losing that mapping makes
        account recovery painful, and never use a throwaway address for banking, tax or anything
        you must be able to recover.
      </p>
    </main>
  );
}
