"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fingerprint, RotateCcw, Wifi } from "lucide-react";

import { OS_BEHAVIOUR, RANDOM_SECOND_NIBBLES, explainMac } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const DEFAULT_MAC = "3A:2F:19:8C:41:0D";
const EXAMPLES = ["3A:2F:19:8C:41:0D", "AC:DE:48:00:11:22", "02:00:00:00:00:01", "FF:FF:FF:FF:FF:FF"];

export default function ToolHome() {
  const [value, setValue] = useState(DEFAULT_MAC);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => explainMac(value), [value]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "MAC address analysis",
      `Address: ${result.normalised}`,
      `Verdict: ${result.headline}`,
      `First octet: 0x${result.firstOctet.toString(16).toUpperCase().padStart(2, "0")} (${result.firstOctetBinary})`,
      `U/L bit: ${result.locallyAdministered ? "1 — locally administered" : "0 — universally administered"}`,
      `I/G bit: ${result.multicast ? "1 — group / multicast" : "0 — individual (unicast)"}`,
      `Manufacturer OUI: ${result.oui || "none — not an IEEE-assigned address"}`,
      `Stable identifier for this device: ${result.stableIdentifier ? "yes" : "no"}`,
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
    setValue(DEFAULT_MAC);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wifi className="h-4 w-4" aria-hidden="true" />
          Home IoT security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">MAC Randomisation Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste any MAC address and it reads the two flag bits IEEE 802 defines in the first octet
          to tell you whether the address is a real factory identity or one your phone made up for
          this network &mdash; and which of your router&rsquo;s per-device rules that breaks.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <label className={LABEL_CLASS} htmlFor="mac-input">
          MAC address
        </label>
        <input
          id="mac-input"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="3A:2F:19:8C:41:0D"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setCopied(false);
          }}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Colon, hyphen, Cisco dotted or bare hex all work. Nothing you type leaves this page.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setValue(example);
                setCopied(false);
              }}
              className={CHIP_BTN}
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Verdict
            </p>
            <p className="mt-1 break-words text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? result.headline : DASH}
            </p>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
              {ok ? result.meaning : "Enter a valid MAC address to see the classification."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the MAC address analysis"
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
              aria-label="Reset to the example address"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Canonical form", ok ? result.normalised : DASH],
            [
              "First octet",
              ok
                ? `0x${result.firstOctet.toString(16).toUpperCase().padStart(2, "0")} = ${result.firstOctetBinary}`
                : DASH,
            ],
            [
              "U/L bit (0x02)",
              ok
                ? result.locallyAdministered
                  ? "1 — locally administered, software assigned"
                  : "0 — universally administered, IEEE assigned"
                : DASH,
            ],
            [
              "I/G bit (0x01)",
              ok ? (result.multicast ? "1 — group / multicast" : "0 — individual (unicast)") : DASH,
            ],
            ["Second hex digit", ok ? result.secondNibble : DASH],
            ["Manufacturer OUI", ok ? result.oui || "None" : DASH],
            [
              "Stable identifier for this device",
              ok ? (result.stableIdentifier ? "Yes" : "No") : DASH,
            ],
            [
              "Router rules this would break",
              ok ? `${result.brokenByRandomisation} of ${result.totalImpacts}` : DASH,
            ],
          ].map(([label, figure]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[60%] break-words text-right font-semibold">{figure}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.ouiNote}
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-base font-semibold">How to spot a randomised address by eye</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          An operating system builds a private Wi-Fi address by setting the U/L bit and clearing the
          I/G bit. That forces the second hex digit to one of{" "}
          <span className="font-mono font-semibold text-[var(--foreground)]">
            {RANDOM_SECOND_NIBBLES.join(", ")}
          </span>
          . So <span className="font-mono">3A:…</span> and <span className="font-mono">7E:…</span>{" "}
          are made up, while <span className="font-mono">AC:…</span> and{" "}
          <span className="font-mono">F0:…</span> come from a manufacturer block. It is a
          convention, not a guarantee: a spoofed address can be anything.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What randomisation changes on your home network</h2>
        <ul className="mt-3 space-y-2">
          {(ok ? result.impacts : []).map((entry) => (
            <li
              key={entry.id}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{entry.label}</span>
                <span
                  className={
                    entry.breaksWhenRandom
                      ? "rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]"
                      : "rounded-full bg-[var(--warning-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--warning)]"
                  }
                >
                  {entry.breaksWhenRandom ? "Breaks" : "Gets messy"}
                </span>
              </span>
              <span className="mt-1 block leading-6 text-[var(--muted-foreground)]">
                {entry.detail}
              </span>
            </li>
          ))}
        </ul>
        {!ok ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Enter a valid address to see the effect on per-device rules.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Defaults by platform</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Platform
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Default
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Behaviour
                </th>
              </tr>
            </thead>
            <tbody>
              {OS_BEHAVIOUR.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2 pr-3 font-semibold">{row.platform}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.defaultState}</td>
                  <td className="py-2 leading-6 text-[var(--muted-foreground)]">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Treating a MAC allow-list as security. Addresses travel unencrypted in every frame and
            can be copied in seconds.
          </li>
          <li>
            Turning randomisation off on every network to make the router tidy, which hands venue
            Wi-Fi a permanent identifier for you.
          </li>
          <li>
            Debugging &ldquo;the parental control stopped working&rdquo; for an hour before noticing
            the phone rotated to a new address.
          </li>
          <li>
            Assuming a locally administered address means something malicious &mdash; virtual
            machines and container bridges use them routinely.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Analysis happens entirely in this browser tab: no address is stored, sent or looked up
        against any registry. Manufacturer identification needs the IEEE OUI database, which this
        page deliberately does not query. Platform defaults change between releases, so confirm the
        setting on the device in front of you.
      </p>
    </main>
  );
}
