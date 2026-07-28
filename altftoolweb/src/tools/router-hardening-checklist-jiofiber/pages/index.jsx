"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Router, ShieldCheck, Wifi } from "lucide-react";

import {
  CHECKLIST,
  DEFAULT_DONE,
  DEVICE,
  GROUPS,
  PATTERNS,
  PROFILES,
  patternTable,
  scoreChecklist,
} from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

function exposureClass(value) {
  if (value >= 60) return "bg-[var(--danger)]";
  if (value >= 30) return "bg-[var(--warning)]";
  return "bg-[var(--success)]";
}

export default function ToolHome() {
  const [done, setDone] = useState(DEFAULT_DONE);
  const [profileId, setProfileId] = useState(PROFILES[0].id);
  const [gpus, setGpus] = useState("1");
  const [copied, setCopied] = useState(false);

  const score = useMemo(() => scoreChecklist(done, profileId), [done, profileId]);
  const crackRows = useMemo(
    () => patternTable(gpus.trim() === "" ? Number.NaN : Number(gpus)),
    [gpus],
  );
  const hasScore = !score.error;
  const hasCrackRows = Array.isArray(crackRows);

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    setDone(DEFAULT_DONE.slice());
    setProfileId(PROFILES[0].id);
    setGpus("1");
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (!hasScore) return "";
    const lines = [
      "JioFiber Router Hardening Checklist",
      `Gateway: ${DEVICE.adminUrl}`,
      `Profile: ${score.profile.name}`,
      `Hardening score: ${score.percent}% - ${score.bandLabel}`,
      `Done: ${score.completed}/${score.total}`,
      `Critical still open: ${score.missingCritical.length}`,
      "",
      score.bandHint,
    ];

    if (score.nextActions.length) {
      lines.push("", "Next actions:");
      score.nextActions.forEach((item) => {
        lines.push(`- ${item.title}: ${item.path}`);
      });
    }

    return lines.join("\n");
  }, [hasScore, score]);

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
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Router className="h-4 w-4" aria-hidden="true" />
          JioFiber router security
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          JioFiber Router Hardening Checklist
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
          Score the common JioFiber ONT settings: sticker admin password, WPA2/WPA3, WPS,
          phone-number Wi-Fi keys, guest access, UPnP, port forwards and what Jio manages remotely.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className={CARD}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={LABEL_CLASS}>Risk profile</span>
              <select
                className={`${INPUT_CLASS} mt-2`}
                value={profileId}
                onChange={(event) => setProfileId(event.target.value)}
              >
                {PROFILES.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="rounded-lg bg-[var(--background)] p-3 text-sm leading-6 text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
              <strong className="text-[var(--foreground)]">{DEVICE.vendor}</strong> usually answers at{" "}
              <span className="font-mono text-[var(--foreground)]">{DEVICE.adminUrl}</span>.
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} onClick={() => setDone(CHECKLIST.map((item) => item.id))}>
              Mark all done
            </button>
            <button type="button" className={GHOST_BTN} onClick={() => setDone([])}>
              Clear all
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {GROUPS.map((group) => {
              const items = CHECKLIST.filter((item) => item.group === group);
              return (
                <fieldset key={group} className="rounded-lg border border-[var(--border)] p-4">
                  <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">
                    {group}
                  </legend>
                  <div className="mt-3 grid gap-3">
                    {items.map((item) => (
                      <label
                        key={item.id}
                        className="flex cursor-pointer gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 accent-[var(--primary)]"
                          checked={done.includes(item.id)}
                          onChange={() => toggle(item.id)}
                        />
                        <span>
                          <span className="block text-sm font-semibold text-[var(--foreground)]">
                            {item.title}
                            {item.critical ? (
                              <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs text-[var(--danger)]">
                                critical
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                            {item.path}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </div>

        <aside className={`${CARD} self-start`} data-testid="tool-output">
          {score.error ? (
            <div className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {score.error}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Hardening score
                  </p>
                  <p className="mt-1 text-4xl font-bold">
                    {score.percent}
                    <span className="text-lg text-[var(--muted-foreground)]">%</span>
                  </p>
                </div>
                <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-sm font-semibold text-[var(--primary)]">
                  {score.bandLabel}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                {score.bandHint}
              </p>

              <div className="mt-5 space-y-3">
                {score.axes.map((axis) => (
                  <div key={axis.name}>
                    <div className="mb-1 flex justify-between text-xs font-semibold text-[var(--muted-foreground)]">
                      <span>{axis.name}</span>
                      <span>{axis.exposure}% open</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                      <div className={`h-full ${exposureClass(axis.exposure)}`} style={{ width: `${axis.exposure}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg bg-[var(--background)] p-4 ring-1 ring-[var(--border)]">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <Wifi className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                  Phone-number Wi-Fi key crack time
                </h2>
                <label className="mt-3 block">
                  <span className={LABEL_CLASS}>Attacking GPUs</span>
                  <input
                    className={`${INPUT_CLASS} mt-2`}
                    type="number"
                    min="1"
                    max="1000"
                    value={gpus}
                    onChange={(event) => setGpus(event.target.value)}
                  />
                </label>
                {hasCrackRows ? (
                  <div className="mt-3 space-y-2">
                    {crackRows.slice(0, 4).map((row) => (
                      <div key={row.id} className="flex justify-between gap-3 text-xs">
                        <span className="text-[var(--muted-foreground)]">{row.label}</span>
                        <span className="font-semibold text-[var(--foreground)]">
                          {row.human} · {NUM.format(row.bits)} bits
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--danger)]">{crackRows.error}</p>
                )}
              </div>

              <div className="mt-5">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <ShieldCheck className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                  Next actions
                </h2>
                <ul className="mt-3 space-y-3">
                  {score.nextActions.map((item) => (
                    <li key={item.id} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{item.risk}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <button type="button" className={`${PRIMARY_BTN} mt-5 w-full`} onClick={copyResult}>
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied" : "Copy checklist"}
              </button>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
