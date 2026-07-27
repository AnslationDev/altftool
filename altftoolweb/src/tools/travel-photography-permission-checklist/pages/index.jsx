"use client";

import { useMemo, useState } from "react";
import { Camera, Check, Copy, RotateCcw } from "lucide-react";
import { SEVERITY, SUBJECTS, assessSubjects, checkDroneFlight } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  subjectIds: ["people-street", "museum", "religious-interior"],
  droneOpen: false,
  regime: "easa",
  heightM: "100",
  distanceToPeopleM: "40",
  distanceToBuiltUpM: "200",
  massG: "249",
  lowSpeedMode: false,
  overPeople: false,
  night: false,
  controlledAirspace: false,
};

const BAND_TEXT = {
  prohibited: "text-[var(--danger)]",
  permit: "text-[var(--foreground)]",
  consent: "text-[var(--foreground)]",
  restricted: "text-[var(--primary)]",
  clear: "text-[var(--success)]",
};

const SEVERITY_STYLE = {
  prohibited: "bg-[var(--danger-soft)] text-[var(--danger)]",
  permit: "bg-[var(--muted)] text-[var(--foreground)]",
  consent: "bg-[var(--muted)] text-[var(--foreground)]",
  restricted: "bg-[var(--muted)] text-[var(--primary)]",
  allowed: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-medium";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

export default function ToolHome() {
  const [subjectIds, setSubjectIds] = useState(DEFAULTS.subjectIds);
  const [droneOpen, setDroneOpen] = useState(DEFAULTS.droneOpen);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [heightM, setHeightM] = useState(DEFAULTS.heightM);
  const [toPeople, setToPeople] = useState(DEFAULTS.distanceToPeopleM);
  const [toBuiltUp, setToBuiltUp] = useState(DEFAULTS.distanceToBuiltUpM);
  const [massG, setMassG] = useState(DEFAULTS.massG);
  const [lowSpeedMode, setLowSpeedMode] = useState(DEFAULTS.lowSpeedMode);
  const [overPeople, setOverPeople] = useState(DEFAULTS.overPeople);
  const [night, setNight] = useState(DEFAULTS.night);
  const [controlledAirspace, setControlledAirspace] = useState(DEFAULTS.controlledAirspace);
  const [copied, setCopied] = useState(false);

  const assessment = useMemo(() => assessSubjects({ subjectIds }), [subjectIds]);
  const hasError = Boolean(assessment.error);

  const drone = useMemo(() => {
    if (!droneOpen) return null;
    return checkDroneFlight({
      regime,
      heightM,
      distanceToPeopleM: toPeople,
      distanceToBuiltUpM: toBuiltUp,
      massG,
      lowSpeedMode,
      overPeople,
      night,
      controlledAirspace,
    });
  }, [
    droneOpen,
    regime,
    heightM,
    toPeople,
    toBuiltUp,
    massG,
    lowSpeedMode,
    overPeople,
    night,
    controlledAirspace,
  ]);

  const droneError = Boolean(drone && drone.error);

  const toggleSubject = (id) => {
    setSubjectIds((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
    );
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Photography Permission Checklist",
      `Risk score: ${assessment.riskScore} across ${assessment.chosenCount} situations`,
      assessment.verdict,
      "",
      ...assessment.actions.map((item) => `- [${item.severityLabel}] ${item.label}: ${item.action}`),
    ];
    if (drone && !drone.error) {
      lines.push(
        "",
        `Drone (${drone.regime.toUpperCase()}): ${drone.compliant ? "within the numeric limits" : "outside the limits"}`,
        ...drone.breaches.map((b) => `- ${b}`),
      );
    }
    return lines.join("\n");
  }, [assessment, hasError, drone]);

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
    setSubjectIds(DEFAULTS.subjectIds);
    setDroneOpen(DEFAULTS.droneOpen);
    setRegime(DEFAULTS.regime);
    setHeightM(DEFAULTS.heightM);
    setToPeople(DEFAULTS.distanceToPeopleM);
    setToBuiltUp(DEFAULTS.distanceToBuiltUpM);
    setMassG(DEFAULTS.massG);
    setLowSpeedMode(DEFAULTS.lowSpeedMode);
    setOverPeople(DEFAULTS.overPeople);
    setNight(DEFAULTS.night);
    setControlledAirspace(DEFAULTS.controlledAirspace);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Before you shoot
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Photography Permission Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what you plan to photograph. Each situation is graded by consequence rather than
          lumped together, so a permit problem and an arrest risk do not look the same. The drone
          section checks a planned flight against the published numeric limits of the EASA Open
          category and FAA Part 107.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            What are you pointing a camera at?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SUBJECTS.map((subject) => {
              const active = subjectIds.includes(subject.id);
              return (
                <label
                  key={subject.id}
                  htmlFor={`ph-${subject.id}`}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 font-semibold"
                      : "border-[var(--border)] bg-[var(--background)]"
                  }`}
                >
                  <input
                    id={`ph-${subject.id}`}
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={active}
                    onChange={() => toggleSubject(subject.id)}
                  />
                  <span>{subject.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {assessment.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Permission risk score
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--foreground)]" : BAND_TEXT[assessment.band]
              }`}
            >
              {hasError ? DASH : assessment.riskScore}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : assessment.verdict}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the photography permission checklist"
              className={GHOST_BTN}
              disabled={hasError}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Situations selected", hasError ? DASH : String(assessment.chosenCount)],
            ["Usually prohibited", hasError ? DASH : String(assessment.counts.prohibited)],
            ["Need a permit or fee", hasError ? DASH : String(assessment.counts.permit)],
            ["Need someone's consent", hasError ? DASH : String(assessment.counts.consent)],
            [
              "Scoring used",
              `prohibited ${SEVERITY.prohibited} · permit ${SEVERITY.permit} · consent ${SEVERITY.consent} · restricted ${SEVERITY.restricted}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">In order of consequence</h2>
          <ul className="mt-3 space-y-4 text-sm">
            {assessment.actions.map((item) => (
              <li key={item.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{item.label}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLE[item.severity]}`}
                  >
                    {item.severityLabel}
                  </span>
                </div>
                <p className="mt-1 leading-6 text-[var(--muted-foreground)]">{item.rule}</p>
                <p className="mt-1 leading-6">{item.action}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Drone flight check</h2>
          <button
            type="button"
            onClick={() => setDroneOpen((value) => !value)}
            aria-expanded={droneOpen}
            className={GHOST_BTN}
          >
            {droneOpen ? "Hide" : "Check a flight"}
          </button>
        </div>

        {droneOpen ? (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS} htmlFor="ph-regime">
                  Which rulebook applies?
                </label>
                <select
                  id="ph-regime"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={regime}
                  onChange={(event) => setRegime(event.target.value)}
                >
                  <option value="easa">EASA Open category (EU, EEA, and aligned states)</option>
                  <option value="faa">FAA Part 107 (United States)</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ph-height">
                  Planned height above ground (m)
                </label>
                <input
                  id="ph-height"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="5"
                  value={heightM}
                  onChange={(event) => setHeightM(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ph-mass">
                  Take-off mass (g)
                </label>
                <input
                  id="ph-mass"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="1"
                  value={massG}
                  onChange={(event) => setMassG(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ph-people">
                  Distance to uninvolved people (m)
                </label>
                <input
                  id="ph-people"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="5"
                  value={toPeople}
                  onChange={(event) => setToPeople(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="ph-builtup">
                  Distance to built-up areas (m)
                </label>
                <input
                  id="ph-builtup"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={toBuiltUp}
                  onChange={(event) => setToBuiltUp(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className={CHECK_CLASS} htmlFor="ph-lowspeed">
                <input
                  id="ph-lowspeed"
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={lowSpeedMode}
                  onChange={(event) => setLowSpeedMode(event.target.checked)}
                />
                Low-speed mode active
              </label>
              <label className={CHECK_CLASS} htmlFor="ph-overpeople">
                <input
                  id="ph-overpeople"
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={overPeople}
                  onChange={(event) => setOverPeople(event.target.checked)}
                />
                Flying over uninvolved people
              </label>
              <label className={CHECK_CLASS} htmlFor="ph-night">
                <input
                  id="ph-night"
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={night}
                  onChange={(event) => setNight(event.target.checked)}
                />
                Flying at night
              </label>
              <label className={CHECK_CLASS} htmlFor="ph-airspace">
                <input
                  id="ph-airspace"
                  type="checkbox"
                  className="h-5 w-5 accent-[var(--primary)]"
                  checked={controlledAirspace}
                  onChange={(event) => setControlledAirspace(event.target.checked)}
                />
                Inside controlled airspace
              </label>
            </div>

            {droneError ? (
              <p
                role="alert"
                className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {drone.error}
              </p>
            ) : (
              <>
                <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
                  {[
                    [
                      "Height ceiling for this regime",
                      droneError ? DASH : `${NUM.format(drone.ceilingM)} m`,
                    ],
                    [
                      "Headroom left",
                      droneError ? DASH : `${NUM.format(drone.headroomM)} m`,
                    ],
                    [
                      "Within the numeric limits",
                      droneError ? DASH : drone.compliant ? "Yes" : "No",
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-[var(--muted-foreground)]">{label}</dt>
                      <dd className="text-right font-semibold">{value}</dd>
                    </div>
                  ))}
                </dl>

                {drone.breaches.length > 0 ? (
                  <div className="mt-4 space-y-2" role="alert">
                    {drone.breaches.map((breach) => (
                      <p
                        key={breach}
                        className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium leading-6 text-[var(--danger)]"
                      >
                        {breach}
                      </p>
                    ))}
                  </div>
                ) : null}

                {drone.notes.length > 0 ? (
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {drone.notes.map((note) => (
                      <li key={note} className="flex gap-2">
                        <Check
                          className="mt-1 h-4 w-4 shrink-0 text-[var(--primary)]"
                          aria-hidden="true"
                        />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. National and municipal rules change, individual sites
        set their own conditions, and a posted sign or an instruction from staff outranks anything
        here. Where a country criminalises photographing people without consent, as the UAE does,
        the consequences are criminal rather than administrative — check official guidance for your
        destination before you travel.
      </p>
    </main>
  );
}
