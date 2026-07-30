"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Smartphone } from "lucide-react";

import {
  MAX_VERSION,
  MIN_VERSION,
  PROFILES,
  buildAndroidChecklist,
  formatAndroidChecklist,
} from "../lib";

const DASH = "—";

const todayIso = () => new Date().toISOString().slice(0, 10);

const DEFAULTS = {
  androidVersion: "15",
  profile: "everyday",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

export default function ToolHome() {
  const [androidVersion, setAndroidVersion] = useState(DEFAULTS.androidVersion);
  const [profile, setProfile] = useState(DEFAULTS.profile);
  const [patchDate, setPatchDate] = useState("");
  const [today, setToday] = useState(todayIso);
  const [done, setDone] = useState([]);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildAndroidChecklist({
        androidVersion: Number(androidVersion),
        profile,
        patchDate,
        today,
        done,
      }),
    [androidVersion, profile, patchDate, today, done],
  );

  const hasError = Boolean(result.error);
  const summary = useMemo(
    () => (hasError ? "" : formatAndroidChecklist(result)),
    [result, hasError],
  );

  const toggleItem = (key) => () => {
    setDone((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
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
    setAndroidVersion(DEFAULTS.androidVersion);
    setProfile(DEFAULTS.profile);
    setPatchDate("");
    setToday(todayIso());
    setDone([]);
    setCopied(false);
  };

  const activeProfile = PROFILES.find((item) => item.id === profile);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Smartphone className="h-4 w-4" aria-hidden="true" />
          Device hardening
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Android Hardening Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Android security settings, filtered to the version you are actually running and weighted
          by how much each one helps — so the SIM PIN and the sideloading permission come before the
          sharing visibility toggle.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ahc-version">
              Android version
            </label>
            <input
              id="ahc-version"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min={MIN_VERSION}
              max={MAX_VERSION}
              step="1"
              value={androidVersion}
              onChange={(event) => setAndroidVersion(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Settings → About phone → Android version.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ahc-profile">
              How is this phone used?
            </label>
            <select
              id="ahc-profile"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profile}
              onChange={(event) => setProfile(event.target.value)}
            >
              {PROFILES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {activeProfile ? (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {activeProfile.blurb}
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ahc-patch">
              Security patch level (optional)
            </label>
            <input
              id="ahc-patch"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={patchDate}
              onChange={(event) => setPatchDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ahc-today">
              Today
            </label>
            <input
              id="ahc-today"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={today}
              onChange={(event) => setToday(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {result.error}
          </p>
          <section className={`mt-6 ${CARD}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Hardening score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Items that apply", "Completed", "Patch level"].map((label) => (
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
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Hardening score
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {result.hardeningScore}%
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {result.doneCount} of {result.totalItems} items done, weighted by impact
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the Android hardening checklist"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy checklist"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset the checklist"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${result.hardeningScore}%` }}
              />
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Android version", `${result.version}`],
                ["Situation", result.profile.label],
                [
                  "Security patch",
                  result.patch
                    ? `${result.patch.days} days old — ${result.patch.missedBulletins} monthly bulletin${result.patch.missedBulletins === 1 ? "" : "s"} behind (${result.patch.status.label})`
                    : "Not entered",
                ],
                [
                  "Settings your version does not have",
                  `${result.unavailable.length}`,
                ],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-medium leading-6">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {result.nextUp.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Do these three first</h2>
              <ol className="mt-3 grid gap-3">
                {result.nextUp.map((item, index) => (
                  <li key={item.key} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{item.title}</span>
                      <span className="mt-0.5 block text-sm leading-6 text-[var(--muted-foreground)]">
                        {item.how}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {result.versionNotes.length > 0 && (
            <section className="mt-6 rounded-xl bg-[var(--warning-soft)] p-5">
              <h2 className="text-sm font-semibold text-[var(--warning)]">
                About Android {result.version}
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[var(--foreground)]">
                {result.versionNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          )}

          {result.groups.map((group) => (
            <section key={group.id} className={`mt-6 ${CARD}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">{group.title}</h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {group.doneCount}/{group.items.length} done
                </span>
              </div>
              <ul className="mt-3 grid gap-3">
                {group.items.map((item) => (
                  <li
                    key={item.key}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <label
                      htmlFor={`ahc-${item.key}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3"
                    >
                      <input
                        id={`ahc-${item.key}`}
                        type="checkbox"
                        checked={item.done}
                        onChange={toggleItem(item.key)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                      />
                      <span>
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{item.title}</span>
                          {item.newIn ? (
                            <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                              Android {item.newIn}+
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-sm leading-6">{item.how}</span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {item.why}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {result.unavailable.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">
                Protections your Android version does not have
              </h2>
              <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
                {result.unavailable.map((item) => (
                  <li
                    key={item.title}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                  >
                    <span>{item.title}</span>
                    <span className="font-semibold whitespace-nowrap text-[var(--muted-foreground)]">
                      needs Android {item.minVersion}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Menu names differ between manufacturers and skins. If you may be at risk
        from someone who has physical access to your phone, contact a specialist support
        organisation before changing settings — sudden changes can be noticed.
      </p>
    </main>
  );
}
