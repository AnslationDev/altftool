"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy, Orbit, RotateCcw } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import { PLANETS, cycleTimeline, getAllRetrogradeStates } from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD_CLASS = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const PHASE_LABEL = {
  retrograde: "Retrograde",
  "pre-shadow": "Pre-retrograde shadow",
  "post-shadow": "Post-retrograde shadow",
  direct: "Direct",
};

const dayFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const stampFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});
const num2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const num4 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});
const num0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function fmtDay(value) {
  return value ? dayFmt.format(new Date(value)) : DASH;
}

function fmtStamp(value) {
  return value ? `${stampFmt.format(new Date(value))} UT` : DASH;
}

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Read today's UTC date on the client only. The server snapshot is null, so the
 * server and the hydration pass render the same "reading the clock" markup and
 * React swaps in the real date immediately afterwards. The client snapshot is a
 * string that is stable for the whole day, which is what useSyncExternalStore
 * requires. No date is ever read during the pure calculation in lib.js.
 */
const subscribeToNothing = () => () => {};
const readTodayUtc = () => toDateInput(new Date());
const readNoDate = () => null;

function Row({ label, value, hint }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-sm text-[var(--muted-foreground)]">
        {label}
        {hint ? <span className="ml-1 text-xs opacity-70">({hint})</span> : null}
      </dt>
      <dd className="text-sm font-semibold tabular-nums text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function StatusPill({ phase }) {
  const retro = phase === "retrograde";
  const shadow = phase === "pre-shadow" || phase === "post-shadow";
  const tone = retro
    ? "bg-[var(--danger-soft)] text-[var(--danger)]"
    : shadow
      ? "bg-[var(--card)] text-[var(--muted-foreground)] ring-1 ring-[var(--border)]"
      : "bg-[var(--card)] text-[var(--success)] ring-1 ring-[var(--border)]";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {PHASE_LABEL[phase] ?? phase}
    </span>
  );
}

function Timeline({ timeline }) {
  if (!timeline) return null;
  return (
    <div className="mt-3">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--background)] ring-1 ring-[var(--border)]">
        <div className="flex h-full w-full">
          <div
            className="h-full bg-[var(--muted-foreground)]/30"
            style={{ width: `${timeline.prePercent}%` }}
          />
          <div className="h-full bg-[var(--danger)]" style={{ width: `${timeline.retroPercent}%` }} />
          <div
            className="h-full bg-[var(--muted-foreground)]/30"
            style={{ width: `${timeline.postPercent}%` }}
          />
        </div>
        {timeline.markerInsideSpan ? (
          <div
            className="absolute top-0 h-full w-0.5 bg-[var(--foreground)]"
            style={{ left: `${timeline.markerPercent}%` }}
          />
        ) : null}
      </div>
      <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
        Shadow-to-shadow span: {num0.format(timeline.totalDays)} days. The red band is the retrograde
        leg; the grey bands are the two shadow passes over the same arc.
      </p>
    </div>
  );
}

export default function ToolHome() {
  const [chosenDate, setChosenDate] = useState(null);
  const [selected, setSelected] = useState("Mercury");
  const {
    copy: copyToClipboard,
    isCopied,
    announcement,
    reset: resetCopyState,
  } = useCopyToClipboard({ resetMs: 1800 });

  const todayUtc = useSyncExternalStore(subscribeToNothing, readTodayUtc, readNoDate);
  const dateValue = chosenDate ?? todayUtc;

  const observedAt = useMemo(
    () => (dateValue ? `${dateValue}T12:00:00.000Z` : null),
    [dateValue],
  );

  const result = useMemo(
    () => (observedAt ? getAllRetrogradeStates(observedAt) : null),
    [observedAt],
  );

  const failed = Boolean(result?.error);
  const planets = failed || !result ? [] : result.planets;
  const focus = planets.find((p) => p.body === selected) ?? null;
  const focusCycle = focus?.error ? null : (focus?.cycle ?? null);
  const timeline = useMemo(
    () => (focusCycle && observedAt ? cycleTimeline(focusCycle, observedAt) : null),
    [focusCycle, observedAt],
  );

  async function copySummary() {
    if (!focus || focus.error || !focusCycle) return;
    const lines = [
      `${focus.body} on ${fmtDay(observedAt)} (12:00 UT)`,
      `Status: ${PHASE_LABEL[focus.phase]}`,
      `Apparent geocentric longitude: ${num4.format(focus.longitude)}° (${focus.position.label})`,
      `Daily motion: ${num4.format(focus.dailyMotion)}°/day`,
      `Station retrograde: ${fmtStamp(focusCycle.stationRetrograde)} at ${focusCycle.stationRetrogradePosition.label}`,
      `Station direct: ${fmtStamp(focusCycle.stationDirect)} at ${focusCycle.stationDirectPosition.label}`,
      `Pre-retrograde shadow begins: ${fmtStamp(focusCycle.preShadowStart)}`,
      `Post-retrograde shadow ends: ${fmtStamp(focusCycle.postShadowEnd)}`,
      `Retrograde arc: ${num2.format(focusCycle.arcDegrees)}° over ${num0.format(focusCycle.retrogradeDays)} days`,
      "Computed from apparent geocentric ecliptic longitude (ecliptic and equinox of date), astronomy-engine v2.",
    ];
    await copyToClipboard("summary", lines.join("\n"), {
      label: `${focus.body} retrograde summary`,
    });
  }

  function reset() {
    setChosenDate(null);
    setSelected("Mercury");
    resetCopyState();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
          <Orbit className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Is that planet retrograde right now?
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Retrograde status for all eight planets, computed live from apparent geocentric ecliptic
          longitude — stations and both shadow windows are solved from the ephemeris on every load,
          not read from a stored table.
        </p>
      </header>

      <section className={CARD_CLASS} aria-label="Controls">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="retro-planet">
              Planet
            </label>
            <select
              id="retro-planet"
              className={`${INPUT_CLASS} mt-1.5`}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {PLANETS.map((p) => (
                <option key={p.body} value={p.body}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="retro-date">
              Date (evaluated at 12:00 UT)
            </label>
            <input
              id="retro-date"
              type="date"
              className={`${INPUT_CLASS} mt-1.5`}
              value={dateValue ?? ""}
              min="1900-01-01"
              max="2100-12-31"
              onChange={(e) => setChosenDate(e.target.value || null)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copySummary}
            disabled={!focusCycle}
            aria-label={
              isCopied("summary")
                ? `${selected} retrograde summary copied to the clipboard`
                : `Copy the ${selected} retrograde summary to the clipboard`
            }
          >
            {isCopied("summary") ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {isCopied("summary") ? "Copied!" : "Copy summary"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset to today and Mercury">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
          <span aria-live="polite" role="status" className="sr-only">
            {announcement}
          </span>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className={`${CARD_CLASS} mt-4`}
        aria-label={`${selected} retrograde status`}
        aria-live="polite"
        role="status"
      >
        {!dateValue ? (
          <p className="text-sm text-[var(--muted-foreground)]">Reading the clock…</p>
        ) : failed || !focus || focus.error ? (
          <>
            <p className="text-3xl font-bold text-[var(--foreground)]">{DASH}</p>
            {focus?.error ? (
              <p
                role="alert"
                className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {focus.error}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-2xl leading-tight font-bold text-[var(--foreground)] sm:text-3xl">
                {focus.isRetrograde
                  ? `Yes — ${focus.body} is retrograde`
                  : `No — ${focus.body} is direct`}
              </p>
              <StatusPill phase={focus.phase} />
            </div>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              on {fmtDay(observedAt)} at 12:00 UT, at {focus.position.label}, moving{" "}
              {num4.format(focus.dailyMotion)}° per day.
            </p>
            {focus.phaseEndsAt ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {PHASE_LABEL[focus.phase] ?? focus.phase} phase ends {fmtDay(focus.phaseEndsAt)} — in{" "}
                {num0.format(focus.daysToPhaseEnd)} days.
              </p>
            ) : null}

            <Timeline timeline={timeline} />

            <dl className="mt-4">
              <Row
                label="Station retrograde"
                value={
                  focusCycle
                    ? `${fmtStamp(focusCycle.stationRetrograde)} · ${focusCycle.stationRetrogradePosition.label}`
                    : DASH
                }
              />
              <Row
                label="Station direct"
                value={
                  focusCycle
                    ? `${fmtStamp(focusCycle.stationDirect)} · ${focusCycle.stationDirectPosition.label}`
                    : DASH
                }
              />
              <Row
                label="Pre-retrograde shadow begins"
                hint="reaches the station-direct degree"
                value={
                  focusCycle
                    ? `${fmtStamp(focusCycle.preShadowStart)}${
                        focusCycle.preShadowDays != null
                          ? ` · ${num0.format(focusCycle.preShadowDays)} days before the station`
                          : ""
                      }`
                    : DASH
                }
              />
              <Row
                label="Post-retrograde shadow ends"
                hint="regains the station-retrograde degree"
                value={
                  focusCycle
                    ? `${fmtStamp(focusCycle.postShadowEnd)}${
                        focusCycle.postShadowDays != null
                          ? ` · ${num0.format(focusCycle.postShadowDays)} days after the station`
                          : ""
                      }`
                    : DASH
                }
              />
              <Row
                label="Retrograde arc"
                value={focusCycle ? `${num2.format(focusCycle.arcDegrees)}°` : DASH}
              />
              <Row
                label="Retrograde duration"
                value={focusCycle ? `${num0.format(focusCycle.retrogradeDays)} days` : DASH}
              />
              <Row
                label={focus.isRetrograde ? "Days until it turns direct" : "Days until it turns retrograde"}
                value={`${num0.format(
                  focus.isRetrograde ? focus.daysUntilStationDirect : focus.daysUntilStationRetrograde,
                )} days`}
              />
              <Row
                label="Apparent geocentric longitude"
                value={`${num4.format(focus.longitude)}°`}
              />
            </dl>
          </>
        )}
      </section>

      <section className={`${CARD_CLASS} mt-4`} aria-label="All eight planets">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          All eight planets{result && !failed ? ` — ${result.retrogradeCount} retrograde` : ""}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {dateValue ? `Positions for ${fmtDay(observedAt)}, 12:00 UT.` : "Reading the clock…"}
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Planet</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Status</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Position</th>
                <th scope="col" className="py-2 pr-3 font-semibold">°/day</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Station retrograde</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Station direct</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Shadow window</th>
              </tr>
            </thead>
            <tbody>
              {planets.map((p) => (
                <tr key={p.body} className="border-b border-[var(--border)] last:border-b-0 align-top">
                  <th scope="row" className="py-2.5 pr-3 font-semibold text-[var(--foreground)]">
                    {p.label}
                  </th>
                  {p.error ? (
                    <td colSpan={6} className="py-2.5 pr-3 text-[var(--danger)]">
                      {p.error}
                    </td>
                  ) : (
                    <>
                      <td className="py-2.5 pr-3"><StatusPill phase={p.phase} /></td>
                      <td className="py-2.5 pr-3 text-[var(--foreground)]">{p.position.label}</td>
                      <td className="py-2.5 pr-3 tabular-nums text-[var(--foreground)]">
                        {num4.format(p.dailyMotion)}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-[var(--foreground)]">
                        {fmtDay(p.cycle?.stationRetrograde)}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-[var(--foreground)]">
                        {fmtDay(p.cycle?.stationDirect)}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-[var(--muted-foreground)]">
                        {fmtDay(p.cycle?.preShadowStart)} – {fmtDay(p.cycle?.postShadowEnd)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {planets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-3 text-[var(--muted-foreground)]">
                    {DASH}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${CARD_CLASS} mt-4`} aria-label="What the numbers mean">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">What is actually being measured</h2>
        <div className="mt-2 space-y-3 text-sm leading-6 text-[var(--muted-foreground)]">
          <p>
            No planet ever reverses its orbit. Retrograde motion is a line-of-sight effect: Earth and
            the other planet orbit the Sun at different speeds, and when the geometry between them
            changes fast enough, the planet&rsquo;s projected position against the background sky
            drifts westward for a while. Inner planets do this near inferior conjunction; outer
            planets do it near opposition.
          </p>
          <p>
            The test used here is purely quantitative: apparent geocentric ecliptic longitude λ is
            computed for the ecliptic and equinox of date, corrected for light travel time and annual
            aberration, and the planet is called retrograde whenever dλ/dt &lt; 0. Stations are the
            instants where dλ/dt = 0, located by bracketing the sign change and bisecting to one
            minute of time. Ephemeris: astronomy-engine v2 (VSOP87 for Mercury–Neptune; Pluto from a
            numerically-integrated gravity simulation). Every model stays accurate well outside
            1900–2100, but this page still caps input dates to that range to stay inside a
            comfortably interior, well-tested window.
          </p>
          <p>
            The shadow windows are geometry, not forecast. The pre-retrograde shadow opens when the
            planet first reaches the degree at which it will later station direct; the post-retrograde
            shadow closes when it regains the degree at which it stationed retrograde. Between those
            two instants the planet covers the same arc of the ecliptic three times.
          </p>
          <p>
            Sign names are the twelve equal 30° divisions of ecliptic longitude counted from the
            March equinox — a coordinate label. This page reports positions and dates only; it makes
            no claim about what any of it means for anyone.
          </p>
        </div>
      </section>
    </div>
  );
}
