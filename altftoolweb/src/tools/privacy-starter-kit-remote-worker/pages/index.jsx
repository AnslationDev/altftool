"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Laptop, RotateCcw, ShieldAlert } from "lucide-react";
import { AREAS, HOUSEHOLDS, MAX_DEVICES, SETUPS, assessRemoteKit } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_DONE = ["dev-encrypt", "acc-mfa", "dev-updates"];
const DEFAULTS = { setup: "company-managed", household: "family", devices: "16", trusted: "6" };

export default function ToolHome() {
  const [done, setDone] = useState(DEFAULT_DONE);
  const [setup, setSetup] = useState(DEFAULTS.setup);
  const [household, setHousehold] = useState(DEFAULTS.household);
  const [devices, setDevices] = useState(DEFAULTS.devices);
  const [trusted, setTrusted] = useState(DEFAULTS.trusted);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessRemoteKit({
        doneIds: done,
        setup,
        household,
        homeDevices: devices.trim() === "" ? NaN : Number(devices),
        trustedDevices: trusted.trim() === "" ? NaN : Number(trusted),
      }),
    [done, setup, household, devices, trusted],
  );
  const ok = !result.error;

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Remote Worker Privacy Starter Kit",
      `Baseline score: ${Math.round(result.percent)}% (${result.band.label})`,
      `Controls done: ${result.completed} of ${result.total} that apply to you`,
      `Critical controls still open: ${result.openCritical.length}`,
      `Home network: ${result.homeDevices} devices, ${result.trustedDevices} sharing the work network`,
      `Segmentation: ${Math.round(result.segmentationPercent)}% of devices moved off the work network`,
      "",
      "Still open:",
      ...result.remaining.map((item) => `- ${item.title}${item.critical ? " (critical)" : ""}`),
    ].join("\n");
  }, [ok, result]);

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
    setDone(DEFAULT_DONE);
    setSetup(DEFAULTS.setup);
    setHousehold(DEFAULTS.household);
    setDevices(DEFAULTS.devices);
    setTrusted(DEFAULTS.trusted);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Laptop className="h-4 w-4" aria-hidden="true" />
          Home office
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Remote Worker Privacy Starter Kit
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A home-office baseline that adapts to your situation: the checklist drops the controls
          that do not apply to a company laptop or to living alone, and scores you only on what is
          left. It also measures how much of your home network still shares a link with work.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-setup">
              Work machine
            </label>
            <select
              id="rw-setup"
              className={`mt-2 ${INPUT_CLASS}`}
              value={setup}
              onChange={(event) => {
                setSetup(event.target.value);
                setCopied(false);
              }}
            >
              {SETUPS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-household">
              Household
            </label>
            <select
              id="rw-household"
              className={`mt-2 ${INPUT_CLASS}`}
              value={household}
              onChange={(event) => {
                setHousehold(event.target.value);
                setCopied(false);
              }}
            >
              {HOUSEHOLDS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-devices">
              Devices on your home network
            </label>
            <input
              id="rw-devices"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_DEVICES}
              step="1"
              value={devices}
              onChange={(event) => {
                setDevices(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Phones, TVs, speakers, cameras, printers, consoles and everyone else&apos;s gadgets.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rw-trusted">
              Of those, how many share the work laptop&apos;s network
            </label>
            <input
              id="rw-trusted"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_DEVICES}
              step="1"
              value={trusted}
              onChange={(event) => {
                setTrusted(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Anything on the same SSID or LAN as the machine you work on.
            </p>
          </div>
        </div>
      </section>

      {!ok && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Baseline score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${Math.round(result.percent)}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.band.label} — ${result.band.note}`
                : "Fix the inputs above to see your baseline."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the home-office baseline result"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && (
          <div className="mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Baseline score ${Math.round(result.percent)} percent`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, result.percent))}%` }}
              />
            </div>
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Controls that apply to you",
              ok ? `${result.completed} of ${result.total} done` : DASH,
            ],
            ["Points earned", ok ? `${result.points} of ${result.maxPoints}` : DASH],
            ["Critical controls still open", ok ? `${result.openCritical.length}` : DASH],
            [
              "Devices kept off the work network",
              ok
                ? `${NUM.format(result.segregatedDevices)} of ${NUM.format(result.homeDevices)} (${Math.round(result.segmentationPercent)}%)`
                : DASH,
            ],
            [
              "Controls skipped as not applicable",
              ok ? `${result.notApplicable.length}` : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && result.nextStep && (
          <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-sm">
            <span className="font-semibold">Do next: </span>
            {result.nextStep.title}
          </p>
        )}
      </section>

      {ok && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your baseline</h2>
          {AREAS.map((area) => {
            const areaStat = result.areaBreakdown.find((entry) => entry.area === area);
            const items = result.applicable.filter((item) => item.area === area);
            if (items.length === 0) return null;
            return (
              <div key={area} className="mt-5 first:mt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    {area}
                  </h3>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {areaStat ? `${areaStat.done}/${areaStat.total} done` : DASH}
                  </span>
                </div>
                <ul className="mt-2 space-y-2">
                  {items.map((item) => {
                    const checked = done.includes(item.id);
                    return (
                      <li key={item.id} className="rounded-lg border border-[var(--border)] p-3">
                        <div className="flex items-start gap-3">
                          <input
                            id={`rw-${item.id}`}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(item.id)}
                            className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                          />
                          <div className="min-w-0">
                            <label
                              htmlFor={`rw-${item.id}`}
                              className="block cursor-pointer text-sm font-semibold"
                            >
                              {item.title}
                            </label>
                            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.action}</p>
                            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Why: {item.why}</p>
                            {item.critical && !checked && (
                              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                                <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                                Open critical
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          {result.notApplicable.length > 0 && (
            <div className="mt-6 rounded-lg border border-[var(--border)] p-3">
              <h3 className="text-sm font-semibold">Skipped for your situation</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                {result.notApplicable.map((item) => (
                  <li key={item.id}>{item.title}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance only, and not a substitute for your employer's security policy. On a
        company-managed device, follow your IT team's instructions first — some settings here are
        controlled centrally and should not be changed locally.
      </p>
    </main>
  );
}
