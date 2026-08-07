"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Network, Plug, RotateCcw, TriangleAlert } from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  GROUPS,
  PROTOCOLS,
  ROUTER_TIERS,
  SEGMENTATION_EXTRAS,
  planIotSubnet,
  planSegmentation,
  scoreChecklist,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;

const DEFAULTS = {
  tierId: "guest-isolated",
  protocolId: "cloud-wifi",
  extras: ["upnp-off"],
  deviceCount: "12",
  headroom: "50",
};

export default function ToolHome() {
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [tierId, setTierId] = useState(DEFAULTS.tierId);
  const [protocolId, setProtocolId] = useState(DEFAULTS.protocolId);
  const [extras, setExtras] = useState(() => DEFAULTS.extras.slice());
  const [deviceCount, setDeviceCount] = useState(DEFAULTS.deviceCount);
  const [headroom, setHeadroom] = useState(DEFAULTS.headroom);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const score = useMemo(() => scoreChecklist(done), [done]);
  const segmentation = useMemo(
    () => planSegmentation({ tierId, protocolId, extraIds: extras }),
    [tierId, protocolId, extras]
  );
  const subnet = useMemo(
    () =>
      planIotSubnet({
        deviceCount: deviceCount.trim() === "" ? Number.NaN : Number(deviceCount),
        headroomPercent: headroom.trim() === "" ? Number.NaN : Number(headroom),
      }),
    [deviceCount, headroom]
  );

  const toggleStep = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const toggleExtra = (id) => {
    setExtras((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setTierId(DEFAULTS.tierId);
    setProtocolId(DEFAULTS.protocolId);
    setExtras(DEFAULTS.extras.slice());
    setDeviceCount(DEFAULTS.deviceCount);
    setHeadroom(DEFAULTS.headroom);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (score.error) return "";
    const lines = [
      "Smart Plug and Bulb Security",
      `Checklist score: ${score.percent}% — ${score.bandLabel}`,
      `Controls done: ${score.completed} of ${score.total}`,
      `Critical controls missing: ${score.missingCritical.length}`,
    ];
    if (!segmentation.error) {
      lines.push(
        `Segmentation: ${segmentation.score}/100 — ${segmentation.bandLabel}`,
        `Works with the internet down: ${segmentation.worksOffline ? "yes" : "no"}`
      );
    }
    if (!subnet.error) {
      lines.push(
        `IoT subnet: ${subnet.example} — ${subnet.usableHosts} usable addresses for ${subnet.needed} planned devices`
      );
    }
    lines.push("");
    if (score.remaining.length === 0) {
      lines.push("Nothing left — every control is ticked.");
    } else {
      lines.push("Still to do:");
      for (const item of score.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""}`);
      }
    }
    return lines.join("\n");
  }, [score, segmentation, subnet]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2500);
    }
  };

  const hasScore = !score.error;
  const hasSegmentation = !segmentation.error;
  const hasSubnet = !subnet.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Plug className="h-4 w-4" aria-hidden="true" />
          Home IoT security
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Smart Plug and Bulb Security Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Cheap plugs and bulbs hold little data of their own. The risk is that they are the
          least-patched thing on your network and that they stop working when a vendor closes a
          server. Segment them, prefer local control, and keep the accounts clean.
        </p>
      </header>

      <section
        className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        aria-labelledby="score-heading"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p
              id="score-heading"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Setup score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasScore ? `${score.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasScore ? score.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasScore ? score.bandHint : "Fix the problem shown below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={
                copied
                  ? "Smart plug security result copied to clipboard"
                  : copyError
                    ? "Copy failed, try again"
                    : "Copy the smart plug security result"
              }
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : copyError ? "Copy failed" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the guide" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
          <span className="sr-only" aria-live="polite" role="status">
            {copied
              ? "Result copied to clipboard."
              : copyError
                ? "Copy failed. Select and copy the result manually."
                : ""}
          </span>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-live="polite"
          aria-label={hasScore ? `Setup score ${score.percent} out of 100` : "Score unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasScore ? score.percent : 0}%` }}
          />
        </div>

        {score.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {score.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Controls completed", hasScore ? `${score.completed} of ${score.total}` : DASH],
            [
              "Weighted points",
              hasScore ? `${NUM.format(score.points)} / ${NUM.format(score.maxPoints)}` : DASH,
            ],
            [
              "Critical controls missing",
              hasScore ? `${score.missingCritical.length} of ${CRITICAL_COUNT}` : DASH,
            ],
            ["Score band", hasScore ? score.bandLabel : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasScore && score.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Score held at {CRITICAL_CAP_PERCENT}% while a critical control is open. Tick every
              control marked critical to score higher.
            </span>
          </p>
        ) : null}

        {hasScore && score.nextActions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Do these next
            </p>
            <ol className="mt-2 space-y-1 text-sm">
              {score.nextActions.map((item) => (
                <li key={item.id} className="flex gap-2">
                  <span className="font-semibold text-[var(--primary)]">+{item.weight}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          <h2 className="text-base font-semibold">Segmentation plan for your router</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tell it what your hardware can do and how your devices are controlled, and it scores the
          separation you get plus the plan that fits.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="router-tier">
              What your router can do
            </label>
            <select
              id="router-tier"
              className={`mt-2 ${INPUT_CLASS}`}
              value={tierId}
              onChange={(event) => {
                setTierId(event.target.value);
                setCopied(false);
              }}
            >
              {ROUTER_TIERS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="protocol">
              How the devices are controlled
            </label>
            <select
              id="protocol"
              className={`mt-2 ${INPUT_CLASS}`}
              value={protocolId}
              onChange={(event) => {
                setProtocolId(event.target.value);
                setCopied(false);
              }}
            >
              {PROTOCOLS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {SEGMENTATION_EXTRAS.map((entry) => (
            <li key={entry.id}>
              <label
                htmlFor={`extra-${entry.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
              >
                <input
                  id={`extra-${entry.id}`}
                  type="checkbox"
                  checked={extras.includes(entry.id)}
                  onChange={() => toggleExtra(entry.id)}
                  className="h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                />
                <span className="text-sm font-semibold">{entry.label}</span>
                <span className="ml-auto text-xs font-semibold text-[var(--muted-foreground)]">
                  +{entry.value}
                </span>
              </label>
            </li>
          ))}
        </ul>

        {segmentation.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {segmentation.error}
          </p>
        ) : null}

        <div className="mt-5 rounded-xl bg-[var(--background)] p-4 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Segmentation score
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
            {hasSegmentation ? `${segmentation.score}/100` : DASH}
          </p>
          <p className="mt-1 text-sm font-semibold">
            {hasSegmentation ? segmentation.bandLabel : DASH}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {hasSegmentation ? segmentation.bandHint : "Choose your router and protocol above."}
          </p>

          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              [
                "From network separation",
                hasSegmentation ? NUM.format(segmentation.isolationPoints) : DASH,
              ],
              [
                "From the control protocol",
                hasSegmentation ? NUM.format(segmentation.protocolPoints) : DASH,
              ],
              ["From extra controls", hasSegmentation ? NUM.format(segmentation.extraPoints) : DASH],
              [
                "Keeps working with the internet down",
                hasSegmentation ? (segmentation.worksOffline ? "Yes" : "No") : DASH,
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {hasSegmentation ? (
            <>
              <p className="mt-4 text-sm leading-6">{segmentation.plan}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {segmentation.protocolNote}
              </p>
            </>
          ) : null}

          {hasSegmentation && segmentation.missingExtras.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Still available to you
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {segmentation.missingExtras.map((entry) => (
                  <li key={entry.id} className="flex gap-2">
                    <span className="font-semibold text-[var(--primary)]">+{entry.value}</span>
                    <span>{entry.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="device-count">
              Devices on the IoT network
            </label>
            <input
              id="device-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={deviceCount}
              onChange={(event) => setDeviceCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="headroom">
              Room to grow (%)
            </label>
            <input
              id="headroom"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="500"
              step="10"
              value={headroom}
              onChange={(event) => setHeadroom(event.target.value)}
            />
          </div>
        </div>

        {subnet.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {subnet.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            ["Subnet that fits", hasSubnet ? subnet.example : DASH],
            ["Usable addresses", hasSubnet ? NUM.format(subnet.usableHosts) : DASH],
            ["Addresses planned for", hasSubnet ? NUM.format(subnet.needed) : DASH],
            ["Spare after growth", hasSubnet ? NUM.format(subnet.spare) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {hasSubnet ? (
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{subnet.dhcpAdvice}</p>
        ) : null}
      </section>

      <section className="mt-6 space-y-4">
        {GROUPS.map((group) => {
          const items = CHECKLIST.filter((item) => item.group === group);
          const groupStat = hasScore ? score.groups.find((entry) => entry.name === group) : null;
          return (
            <div key={group} className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {groupStat ? `${groupStat.done}/${groupStat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`step-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`step-${item.id}`}
                        type="checkbox"
                        checked={done.includes(item.id)}
                        onChange={() => toggleStep(item.id)}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{item.title}</span>
                          {item.critical ? (
                            <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                              Critical
                            </span>
                          ) : null}
                          <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                            +{item.weight}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Mistakes worth avoiding</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Buying twenty cloud-only plugs from a brand you had never heard of, then discovering
            none of them work during an outage.
          </li>
          <li>
            Leaving UPnP on, which lets a budget device open its own hole through the router without
            telling you.
          </li>
          <li>
            Putting the IoT devices on a guest network but forgetting client isolation, so they can
            still attack each other.
          </li>
          <li>
            Binning or reselling a plug without a factory reset, leaving your Wi-Fi passphrase in
            its flash.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you tick stays in this browser tab &mdash; nothing is stored or sent. Scores rank
        your own configuration rather than certifying it, and router menus differ by brand, so match
        the description to the setting your firmware actually offers.
      </p>
    </main>
  );
}
