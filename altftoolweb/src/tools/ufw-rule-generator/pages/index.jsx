"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";
import {
  ACTIONS,
  APP_PROFILES,
  COMMON_SERVICES,
  DIRECTIONS,
  PROTOCOLS,
  buildUfwPlan,
  buildUfwRule,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  action: "allow",
  direction: "default",
  interfaceName: "",
  target: "port",
  port: "22",
  protocol: "tcp",
  appProfile: "OpenSSH",
  fromHost: "",
  toHost: "",
  comment: "ssh from office",
  defaultIncoming: "deny",
  defaultOutgoing: "allow",
  sshPort: "22",
  logging: "low",
  enableFirewall: true,
};

export default function ToolHome() {
  const [state, setState] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) =>
    setState((prev) => ({
      ...prev,
      [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));

  const applyService = (id) => {
    const service = COMMON_SERVICES.find((item) => item.id === id);
    if (!service) return;
    setState((prev) => ({ ...prev, target: "port", port: service.port, protocol: service.proto }));
  };

  const rule = useMemo(() => buildUfwRule(state), [state]);

  const plan = useMemo(
    () =>
      buildUfwPlan({
        ruleCommands: rule.command ? [rule.command] : [],
        defaultIncoming: state.defaultIncoming,
        defaultOutgoing: state.defaultOutgoing,
        sshPort: state.sshPort,
        logging: state.logging,
        enableFirewall: state.enableFirewall,
      }),
    [rule.command, state.defaultIncoming, state.defaultOutgoing, state.sshPort, state.logging, state.enableFirewall],
  );

  const copyResult = async () => {
    if (!rule.command) return;
    try {
      await navigator.clipboard.writeText(`sudo ${rule.command}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setState(DEFAULTS);
    setCopied(false);
  };

  const activeProfile = APP_PROFILES.find((item) => item.id === state.appProfile);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Linux firewall
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">UFW Rule Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a valid ufw rule for a port, a range or an application profile, with source
          restrictions and comments — and get the apply order that will not lock you out of SSH.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ufw-action">
              Action
            </label>
            <select id="ufw-action" className={`mt-2 ${INPUT_CLASS}`} value={state.action} onChange={set("action")}>
              {ACTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{ACTIONS.find((a) => a.id === state.action)?.meaning}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ufw-direction">
              Direction
            </label>
            <select id="ufw-direction" className={`mt-2 ${INPUT_CLASS}`} value={state.direction} onChange={set("direction")}>
              {DIRECTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ufw-target">
              Rule targets
            </label>
            <select id="ufw-target" className={`mt-2 ${INPUT_CLASS}`} value={state.target} onChange={set("target")}>
              <option value="port">A port or range</option>
              <option value="app">An application profile</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ufw-iface">
              Interface (optional)
            </label>
            <input
              id="ufw-iface"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="eth0"
              value={state.interfaceName}
              onChange={set("interfaceName")}
            />
          </div>

          {state.target === "port" ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="ufw-port">
                  Port, list or range
                </label>
                <input
                  id="ufw-port"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  value={state.port}
                  onChange={set("port")}
                />
                <p className={HINT_CLASS}>22, or 80,443, or 6000:6010. Lists and ranges need an explicit protocol.</p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ufw-proto">
                  Protocol
                </label>
                <select id="ufw-proto" className={`mt-2 ${INPUT_CLASS}`} value={state.protocol} onChange={set("protocol")}>
                  {PROTOCOLS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="ufw-app">
                Application profile
              </label>
              <select id="ufw-app" className={`mt-2 ${INPUT_CLASS}`} value={state.appProfile} onChange={set("appProfile")}>
                {APP_PROFILES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id}
                  </option>
                ))}
              </select>
              {activeProfile ? (
                <p className={HINT_CLASS}>
                  Opens {activeProfile.ports}. Installed by the {activeProfile.from} package — run{" "}
                  <code className="font-mono">ufw app list</code> to confirm it exists on the host.
                </p>
              ) : null}
            </div>
          )}

          <div>
            <label className={LABEL_CLASS} htmlFor="ufw-from">
              From (source address or CIDR)
            </label>
            <input
              id="ufw-from"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="any"
              value={state.fromHost}
              onChange={set("fromHost")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ufw-to">
              To (destination address, optional)
            </label>
            <input
              id="ufw-to"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="any"
              value={state.toHost}
              onChange={set("toHost")}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ufw-comment">
              Comment
            </label>
            <input
              id="ufw-comment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={state.comment}
              onChange={set("comment")}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold">Quick fill from a well-known service</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMMON_SERVICES.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => applyService(service.id)}
                className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                {service.label} {service.port}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Your ufw rule
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated ufw rule"
              className={GHOST_BTN}
              disabled={Boolean(rule.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy rule"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {rule.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {rule.error}
          </p>
        ) : null}

        <div className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-4">
          <code className="block whitespace-pre font-mono text-sm font-semibold text-[var(--primary)]">
            {rule.error ? "—" : `sudo ${rule.command}`}
          </code>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Syntax form</dt>
            <dd className="text-right font-semibold">{rule.error ? "—" : rule.form}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="shrink-0 text-[var(--muted-foreground)]">What it does</dt>
            <dd className="text-right font-semibold">{rule.error ? "—" : rule.meaning}</dd>
          </div>
        </dl>
      </section>

      {!rule.error && rule.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Check before applying</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {rule.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--danger)]">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Safe apply order</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ufw-defin">
              Incoming default policy
            </label>
            <select id="ufw-defin" className={`mt-2 ${INPUT_CLASS}`} value={state.defaultIncoming} onChange={set("defaultIncoming")}>
              <option value="deny">deny</option>
              <option value="reject">reject</option>
              <option value="allow">allow</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ufw-defout">
              Outgoing default policy
            </label>
            <select id="ufw-defout" className={`mt-2 ${INPUT_CLASS}`} value={state.defaultOutgoing} onChange={set("defaultOutgoing")}>
              <option value="allow">allow</option>
              <option value="deny">deny</option>
              <option value="reject">reject</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ufw-sshport">
              SSH port to protect first
            </label>
            <input
              id="ufw-sshport"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={state.sshPort}
              onChange={set("sshPort")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ufw-logging">
              Logging level
            </label>
            <select id="ufw-logging" className={`mt-2 ${INPUT_CLASS}`} value={state.logging} onChange={set("logging")}>
              <option value="off">off</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="full">full</option>
            </select>
          </div>
          <label htmlFor="ufw-enable" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm sm:col-span-2">
            <input
              id="ufw-enable"
              type="checkbox"
              className="accent-[var(--primary)]"
              checked={state.enableFirewall}
              onChange={set("enableFirewall")}
            />
            Include `ufw enable` at the end
          </label>
        </div>

        {plan.error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
        ) : (
          <ol className="mt-4 space-y-3 text-sm">
            {plan.lines.map(([command, why], index) => (
              <li key={command}>
                <div className="overflow-x-auto rounded-md bg-[var(--muted)] px-3 py-2">
                  <code className="whitespace-pre font-mono text-[var(--foreground)]">{command}</code>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Step {index + 1}. {why}
                </p>
              </li>
            ))}
          </ol>
        )}

        {!plan.error ? (
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
            {plan.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Generated locally for reference. Firewall changes can cut off your own access — keep a
        console session or an out-of-band recovery path open while you apply them.
      </p>
    </main>
  );
}
