"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Globe, RotateCcw, Router, ShieldCheck, TriangleAlert } from "lucide-react";

import {
  CHECKLIST,
  CRITICAL_CAP_PERCENT,
  DEFAULT_DONE,
  DEVICE,
  GROUPS,
  PROFILES,
  WAN_SERVICES,
  scoreChecklist,
  wanExposureIndex,
} from "../lib";

const DASH = "—";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const CRITICAL_COUNT = CHECKLIST.filter((item) => item.critical).length;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const ERROR_BOX =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";
const TOGGLE_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm transition hover:border-[var(--primary)]";
const CHECKBOX =
  "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function exposureTone(exposure) {
  if (exposure >= 60) return "bg-[var(--danger)]";
  if (exposure >= 30) return "bg-[var(--warning)]";
  return "bg-[var(--success)]";
}

const INITIAL_WAN = { aicloud: true, upnp: true, ddns: true };

export default function ToolHome() {
  const [done, setDone] = useState(() => DEFAULT_DONE.slice());
  const [profileId, setProfileId] = useState(PROFILES[0].id);
  const [wan, setWan] = useState(() => ({ ...INITIAL_WAN }));
  const [portForwards, setPortForwards] = useState("2");
  const [cgnat, setCgnat] = useState(false);
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => scoreChecklist(done, profileId), [done, profileId]);
  const exposure = useMemo(
    () =>
      wanExposureIndex({
        ...wan,
        cgnat,
        portForwards: portForwards.trim() === "" ? 0 : Number(portForwards),
      }),
    [wan, cgnat, portForwards]
  );

  const hasScore = !score.error;
  const hasExposure = !exposure.error;

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    setCopied(false);
  };

  const toggleWan = (id) => {
    setWan((current) => ({ ...current, [id]: !current[id] }));
  };

  const tickAll = () => {
    setDone(CHECKLIST.map((item) => item.id));
    setCopied(false);
  };

  const clearAll = () => {
    setDone([]);
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setProfileId(PROFILES[0].id);
    setWan({ ...INITIAL_WAN });
    setPortForwards("2");
    setCgnat(false);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!hasScore) return "";
    const lines = [
      "Asus Router Hardening Checklist",
      `Profile: ${score.profile.name}`,
      `Hardening score: ${score.percent}% — ${score.bandLabel}`,
      `Steps done: ${score.completed} of ${score.total}`,
      `Critical steps still open: ${score.missingCritical.length} of ${CRITICAL_COUNT}`,
      hasExposure ? `Internet exposure index: ${exposure.index}/100 — ${exposure.bandLabel}` : "",
      "",
      "Remaining exposure by area:",
    ].filter(Boolean);
    for (const axis of score.axes) {
      lines.push(`- ${axis.name}: ${axis.exposure}% open (${axis.open}/${axis.total} steps)`);
    }
    lines.push("");
    if (score.remaining.length === 0) {
      lines.push("Nothing left — every step is done.");
    } else {
      lines.push("Still to do:");
      for (const item of score.remaining) {
        lines.push(`- ${item.title}${item.critical ? " (critical)" : ""} — ${item.path}`);
      }
    }
    return lines.join("\n");
  }, [score, hasScore, exposure, hasExposure]);

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Router className="h-4 w-4" aria-hidden="true" />
          {DEVICE.vendor} hardening audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Asus Router Hardening Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {CHECKLIST.length} steps for ASUSWRT routers, weighted by how much exposure each removes,
          with the exact menu path for every one. The exposure index below scores what your router
          currently publishes to the internet.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rh-profile">
              What is this router carrying?
            </label>
            <select
              id="rh-profile"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profileId}
              onChange={(event) => {
                setProfileId(event.target.value);
                setCopied(false);
              }}
            >
              {PROFILES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              {hasScore ? score.profile.description : DASH}
            </p>
          </div>
          <div>
            <p className={LABEL_CLASS}>Where the admin page lives</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">{DEVICE.adminUrl}</span> or{" "}
              {DEVICE.gateways.join(" / ")} from a browser on the Wi-Fi. App: {DEVICE.app}.
            </p>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="rh-score">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              id="rh-score"
              className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
            >
              Hardening score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasScore ? `${score.percent}%` : DASH}
            </p>
            <p className="mt-1 text-sm font-semibold">{hasScore ? score.bandLabel : DASH}</p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasScore ? score.bandHint : "Fix the problem below to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the router hardening result"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={hasScore ? `Hardening score ${score.percent} out of 100` : "Score unavailable"}
        >
          <span
            className="block h-full bg-[var(--primary)]"
            style={{ width: `${hasScore ? score.percent : 0}%` }}
          />
        </div>

        {score.error ? (
          <p role="alert" className={`mt-4 ${ERROR_BOX}`}>
            {score.error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Steps done", hasScore ? `${score.completed} of ${score.total}` : DASH],
            [
              "Weighted points for this profile",
              hasScore ? `${NUM.format(score.earned)} / ${NUM.format(score.available)}` : DASH,
            ],
            [
              "Critical steps still open",
              hasScore ? `${score.missingCritical.length} of ${CRITICAL_COUNT}` : DASH,
            ],
            [
              "Biggest remaining exposure",
              hasScore && score.worstAxis
                ? `${score.worstAxis.name} (${score.worstAxis.exposure}% open)`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasScore && score.capped ? (
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Score held at {CRITICAL_CAP_PERCENT}% while a critical step is open. Those are the ones
              an attacker can use today, whatever else is tightened.
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

      {hasScore ? (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-base font-semibold">Remaining exposure by area</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Weighted for the {score.profile.name.toLowerCase()} profile. A longer bar means more is
            still open.
          </p>
          <ul className="mt-4 space-y-3">
            {score.axes.map((axis) => (
              <li key={axis.name}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold">{axis.name}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {axis.exposure}% open &middot; {axis.open}/{axis.total} steps
                    {axis.emphasis > 1
                      ? " · weighted up"
                      : axis.emphasis < 1
                        ? " · weighted down"
                        : ""}
                  </span>
                </div>
                <div
                  className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${axis.name}: ${axis.exposure} percent still open`}
                >
                  <span
                    className={`block h-full ${exposureTone(axis.exposure)}`}
                    style={{ width: `${axis.exposure}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Globe className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          What is your router publishing to the internet?
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Tick what is switched on. Services that hand over an interactive session on the router
          score highest; services that only make you findable score lowest.
        </p>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {WAN_SERVICES.map((service) => (
            <li key={service.id}>
              <label htmlFor={`wan-${service.id}`} className={TOGGLE_ROW}>
                <input
                  id={`wan-${service.id}`}
                  type="checkbox"
                  checked={wan[service.id] === true}
                  onChange={() => toggleWan(service.id)}
                  className={CHECKBOX}
                />
                <span className="min-w-0">
                  <span className="block font-semibold">{service.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                    +{service.weight} points
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rh-forwards">
              Port forwards configured
            </label>
            <input
              id="rh-forwards"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="200"
              step="1"
              value={portForwards}
              onChange={(event) => setPortForwards(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="rh-cgnat" className={`mt-2 sm:mt-8 ${TOGGLE_ROW}`}>
              <input
                id="rh-cgnat"
                type="checkbox"
                checked={cgnat}
                onChange={(event) => setCgnat(event.target.checked)}
                className={CHECKBOX}
              />
              <span className="min-w-0">
                <span className="block font-semibold">My ISP uses CGNAT</span>
                <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                  No public IPv4 of your own. Inbound risk drops sharply but does not vanish.
                </span>
              </span>
            </label>
          </div>
        </div>

        {exposure.error ? (
          <p role="alert" className={`mt-4 ${ERROR_BOX}`}>
            {exposure.error}
          </p>
        ) : null}

        <p className="mt-4 text-4xl font-semibold text-[var(--primary)]">
          {hasExposure ? `${exposure.index}/100` : DASH}
        </p>
        <p className="mt-1 text-sm font-semibold">{hasExposure ? exposure.bandLabel : DASH}</p>
        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Exposure points",
              hasExposure ? `${NUM.format(exposure.points)} of ${exposure.maxPoints}` : DASH,
            ],
            ["Services published", hasExposure ? `${exposure.published.length}` : DASH],
            [
              "Port forwards counted",
              hasExposure ? `${exposure.countedForwards} of ${exposure.portForwards}` : DASH,
            ],
            [
              "Worst single item",
              hasExposure ? (exposure.worst ? exposure.worst.label : "None") : DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[60%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {hasExposure && exposure.worst ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">Close it here: </span>
            {exposure.worst.fix}
          </p>
        ) : null}
        {hasExposure ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{exposure.advice}</p>
        ) : null}
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={tickAll} className={GHOST_BTN} aria-label="Mark every step as done">
          <Check className="h-4 w-4" aria-hidden="true" />
          Mark all done
        </button>
        <button type="button" onClick={clearAll} className={GHOST_BTN} aria-label="Clear every ticked step">
          Clear all
        </button>
      </div>

      <section className="mt-4 space-y-4">
        {GROUPS.map((group) => {
          const items = CHECKLIST.filter((item) => item.group === group);
          const stat = hasScore ? score.groups.find((entry) => entry.name === group) : null;
          return (
            <div key={group} className={CARD}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {stat ? `${stat.done}/${stat.total} done` : DASH}
                </span>
              </div>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <label
                      htmlFor={`rh-${item.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`rh-${item.id}`}
                        type="checkbox"
                        checked={done.includes(item.id)}
                        onChange={() => toggle(item.id)}
                        className={CHECKBOX}
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
                            +{item.weight} &middot; {item.axis}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.detail}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          <span className="font-semibold">Where: </span>
                          {item.path}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          <span className="font-semibold">If you skip it: </span>
                          {item.risk}
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

      <section className={`mt-6 ${CARD}`}>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <ShieldCheck className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          Mistakes worth avoiding
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            Assuming a firmware update removes a compromise &mdash; a planted SSH key is a stored
            setting and survives the upgrade, so a factory reset is what clears it.
          </li>
          <li>
            Leaving AiCloud on from the day you set the router up, having never once used it to
            reach a file.
          </li>
          <li>
            Opening Web Access from WAN to fix something remotely and never switching it back off.
          </li>
          <li>
            Relying on AiProtection alone; a subscription filter does not close an admin page that is
            published to the internet.
          </li>
          <li>
            Restoring an old configuration backup after a reset, which puts every unsafe setting
            straight back.
          </li>
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything you tick stays in this browser tab &mdash; nothing is uploaded, and the page never
        asks for your real router password. {DEVICE.note} The exposure index is a comparison aid, not
        a scan of your network: it reflects only what you tell it. Menu wording changes between
        ASUSWRT releases, so follow the description rather than an exact label, and check ASUS&rsquo;s
        own security advisories for your model. General security guidance, not professional advice
        for a business network.
      </p>
    </main>
  );
}
