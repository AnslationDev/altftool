"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FireExtinguisher, RotateCcw } from "lucide-react";

import { HAZARD_LEVELS, RISK_AREAS, selectExtinguisher } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = {
  areaId: "homeKitchen",
  floorAreaSqFt: "120",
  hazard: "light",
  hasFlammableLiquids: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

export default function ToolHome() {
  const [areaId, setAreaId] = useState(DEFAULTS.areaId);
  const [floorAreaSqFt, setFloorAreaSqFt] = useState(DEFAULTS.floorAreaSqFt);
  const [hazard, setHazard] = useState(DEFAULTS.hazard);
  const [hasFlammableLiquids, setHasFlammableLiquids] = useState(DEFAULTS.hasFlammableLiquids);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      selectExtinguisher({
        areaId,
        floorAreaSqFt: floorAreaSqFt === "" ? 0 : Number(floorAreaSqFt),
        hazard,
        hasFlammableLiquids,
      }),
    [areaId, floorAreaSqFt, hazard, hasFlammableLiquids],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    const lines = [
      `Fire extinguisher selection — ${result.area.name}`,
      `Fire classes present: ${result.classes.map((entry) => entry.label).join("; ")}`,
      "",
      `Primary: ${result.primary.name} — ${result.primary.recommendedSize}`,
      result.primary.note,
      ...(result.also.length > 0
        ? ["", "Also worth having:", ...result.also.map((agent) => `${agent.name} — ${agent.recommendedSize}`)]
        : []),
      ...(result.avoid.length > 0
        ? ["", "Do NOT use here:", ...result.avoid.map((agent) => `${agent.name} — ${agent.danger}`)]
        : []),
      "",
      "NFPA 10 coverage:",
      result.classAApplies
        ? `Class A: at least ${result.extinguisherCount} extinguisher(s), total ${result.aRatingNeeded}-A rating, no more than ${result.travelA.feet} ft (${result.travelA.metres} m) travel distance`
        : "Class A rating not applicable to this risk",
      result.bRatingNeeded === null
        ? "No Class B minimum applies"
        : `Class B: at least a ${result.bRatingNeeded}-B unit within ${result.travelB.feet} ft (${result.travelB.metres} m) of the hazard`,
      "",
      result.guidance,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setAreaId(DEFAULTS.areaId);
    setFloorAreaSqFt(DEFAULTS.floorAreaSqFt);
    setHazard(DEFAULTS.hazard);
    setHasFlammableLiquids(DEFAULTS.hasFlammableLiquids);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FireExtinguisher className="h-4 w-4" aria-hidden="true" />
          Home safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Fire Extinguisher Selector</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The right agent depends on the fire class, and the wrong one makes things worse — water on
          oil, CO2 on a fryer, powder over your electronics. Pick the risk and get the agent, the
          size, the agents to avoid, and the NFPA 10 coverage maths.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="fe-area">
              What are you protecting?
            </label>
            <select
              id="fe-area"
              className={`mt-2 ${INPUT_CLASS}`}
              value={areaId}
              onChange={(event) => setAreaId(event.target.value)}
            >
              {RISK_AREAS.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fe-sqft">
              Floor area (sq ft)
            </label>
            <input
              id="fe-sqft"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="1"
              max="200000"
              step="10"
              value={floorAreaSqFt}
              onChange={(event) => setFloorAreaSqFt(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fe-hazard">
              Hazard level
            </label>
            <select
              id="fe-hazard"
              className={`mt-2 ${INPUT_CLASS}`}
              value={hazard}
              onChange={(event) => setHazard(event.target.value)}
            >
              {HAZARD_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label
          htmlFor="fe-liquids"
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
        >
          <input
            id="fe-liquids"
            type="checkbox"
            className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={hasFlammableLiquids}
            onChange={(event) => setHasFlammableLiquids(event.target.checked)}
          />
          <span>Flammable liquids are stored or used here (fuel, thinners, solvents, paint)</span>
        </label>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Buy this first
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.primary.name}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to get a recommendation."
                : `Suggested size: ${result.primary.recommendedSize}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the extinguisher recommendation"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError ? (
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{result.primary.note}</p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Fire classes present",
              hasError ? DASH : result.classes.map((entry) => entry.id).join(", "),
            ],
            [
              "Extinguishers for this floor area",
              hasError ? DASH : result.classAApplies ? NUM.format(result.extinguisherCount) : "Class A rule not applicable",
            ],
            [
              "Total Class A rating (NFPA 10)",
              hasError ? DASH : result.aRatingNeeded === null ? "Not applicable" : `${NUM.format(result.aRatingNeeded)}-A`,
            ],
            [
              "Floor area per unit of A",
              hasError ? DASH : result.sqftPerAUnit === null ? "Not applicable" : `${NUM.format(result.sqftPerAUnit)} sq ft`,
            ],
            [
              "Minimum Class B rating",
              hasError ? DASH : result.bRatingNeeded === null ? "No Class B minimum" : `${NUM.format(result.bRatingNeeded)}-B`,
            ],
            [
              "Max travel distance, Class A",
              hasError ? DASH : `${NUM.format(result.travelA.feet)} ft (${DEC.format(result.travelA.metres)} m)`,
            ],
            [
              "Max travel distance, Class B",
              hasError ? DASH : `${NUM.format(result.travelB.feet)} ft (${DEC.format(result.travelB.metres)} m)`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.guidance}
          </p>
        ) : null}
      </section>

      {!hasError && result.also.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth having alongside it</h2>
          <div className="mt-3 grid gap-3">
            {result.also.map((agent) => (
              <div key={agent.id} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-sm font-semibold">
                  {agent.name}
                  <span className="ml-2 font-normal text-[var(--muted-foreground)]">
                    {agent.recommendedSize}
                  </span>
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{agent.note}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Rated for class {agent.classes.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!hasError && result.avoid.length > 0 ? (
        <section
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
        >
          <p className="font-semibold">Do not use these here:</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {result.avoid.map((agent) => (
              <li key={agent.id}>
                <span className="font-semibold">{agent.name}</span> — {agent.danger}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Fire classes at a glance</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Agent
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Rated for
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Common sizes
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Water / water mist", "A", "6 L, 9 L"],
                ["Foam (AFFF)", "A, B", "6 L, 9 L"],
                ["ABC dry powder", "A, B, C, electrical", "1-9 kg"],
                ["BC dry powder", "B, C, electrical", "2-6 kg"],
                ["Carbon dioxide", "B, electrical", "2-6.8 kg"],
                ["Wet chemical", "A, F / K", "2-6 L"],
                ["Clean agent", "A, B, electrical", "2-6 kg"],
                ["Class D powder", "D (metals)", "9-12 kg"],
                ["Fire blanket", "F / K, clothing", "1.0-1.8 m square"],
              ].map(([agent, classes, sizes]) => (
                <tr key={agent} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">{agent}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{classes}</td>
                  <td className="py-2 whitespace-nowrap text-[var(--muted-foreground)]">{sizes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational information, not a compliance assessment. Workplaces, commercial kitchens and
        multi-occupancy buildings are governed by local fire codes and by your fire officer, and the
        printed A and B ratings differ between EN 3 and UL listings — read the label on the model you
        buy. Only tackle a fire if it is small, you have a clear way out behind you, and you have
        already raised the alarm.
      </p>
    </main>
  );
}
