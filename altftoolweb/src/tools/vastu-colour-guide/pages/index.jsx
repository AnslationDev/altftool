"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Compass, Copy, RotateCcw } from "lucide-react";

import {
  ALL_ZONES,
  DIRECTIONS,
  ROOMS,
  guidanceFromCompass,
  vastuGuidance,
} from "../lib";

const NUM1 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const n1 = (v) => (Number.isFinite(v) ? NUM1.format(v) : "—");

const DEFAULTS = {
  mode: "direction",
  zone: "SE",
  room: "kitchen",
  bearing: "130",
  declination: "0",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const ALIGNMENT_STYLE = {
  preferred: "bg-[var(--success-soft)] text-[var(--success)]",
  acceptable: "bg-[var(--info-soft)] text-[var(--info)]",
  avoid: "bg-[var(--warning-soft)] text-[var(--warning)]",
  neutral: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => {
    if (form.mode === "compass") {
      return guidanceFromCompass({
        magneticBearing: form.bearing === "" ? NaN : Number(form.bearing),
        declination: form.declination === "" ? 0 : Number(form.declination),
        room: form.room,
      });
    }
    return vastuGuidance({ zone: form.zone, room: form.room });
  }, [form]);

  const ok = !result.error;
  const usingCompass = form.mode === "compass";

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      "Vastu Colour Guide",
      `${result.roomLabel} in the ${result.zoneName} (${result.sanskrit})`,
    ];
    if (usingCompass) {
      lines.push(
        `Compass: ${n1(result.magneticBearing)}° magnetic, declination ${n1(result.declination)}° → ${n1(result.trueBearing)}° true`,
        `Sector: ${n1(result.sectorFrom)}° to ${n1(result.sectorTo)}°`,
      );
    }
    lines.push(
      `Guardian ${result.deity} · Element ${result.element} · Planet ${result.planet}`,
      `Placement: ${result.alignmentLabel}`,
      `Suggested colours: ${result.colours.map((c) => `${c.name} (${c.hex})`).join(", ")}`,
      `Traditionally avoided here: ${result.avoid.join(", ")}`,
      "",
      result.zoneNote,
      result.roomNote,
    );
    if (result.remedy) lines.push("", result.remedy);
    return lines.join("\n");
  }, [ok, result, usingCompass]);

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
    setForm(DEFAULTS);
    setCopied(false);
  };

  const swatchStyle = (hex) => ({ backgroundColor: hex });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Compass className="h-4 w-4" aria-hidden="true" />
          Traditional reference
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Vastu Colour Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The colours Vastu Shastra traditionally associates with each of the eight directions and
          the centre of a plan, with the guardian, element and planet for each — and a compass
          lookup that corrects a magnetic bearing to true north before choosing the sector.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vc-room">
              Room
            </label>
            <select id="vc-room" className={`mt-2 ${INPUT_CLASS}`} value={form.room} onChange={set("room")}>
              {ROOMS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="vc-mode">
              How do you know the direction?
            </label>
            <select id="vc-mode" className={`mt-2 ${INPUT_CLASS}`} value={form.mode} onChange={set("mode")}>
              <option value="direction">I already know it</option>
              <option value="compass">From a compass bearing</option>
            </select>
          </div>

          {usingCompass ? (
            <>
              <div>
                <label className={LABEL_CLASS} htmlFor="vc-bearing">
                  Compass bearing (degrees, magnetic)
                </label>
                <input
                  id="vc-bearing"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="360"
                  step="1"
                  value={form.bearing}
                  onChange={set("bearing")}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Taken from the centre of the plan toward the room. Stand away from steel, wiring
                  and appliances.
                </p>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="vc-declination">
                  Magnetic declination (degrees, east positive)
                </label>
                <input
                  id="vc-declination"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="decimal"
                  min="-30"
                  max="30"
                  step="0.1"
                  value={form.declination}
                  onChange={set("declination")}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Look up the current value for your town. Across India it runs from about 1° west
                  to 3° east and drifts slightly every year.
                </p>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="vc-zone">
                Direction of the room
              </label>
              <select id="vc-zone" className={`mt-2 ${INPUT_CLASS}`} value={form.zone} onChange={set("zone")}>
                {ALL_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.sanskrit})
                  </option>
                ))}
              </select>
            </div>
          )}
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
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Direction of this room
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? result.zoneName : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.sanskrit} · ${result.element} · ${result.planet}`
                : "Complete the fields above to see the guidance"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the vastu colour guidance"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok ? (
          <p
            className={`mt-4 inline-block rounded-md px-3 py-2 text-sm font-semibold ${ALIGNMENT_STYLE[result.alignment]}`}
          >
            {result.alignmentLabel}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Room", ok ? result.roomLabel : "—"],
            ["Guardian (dikpala)", ok ? result.deity : "—"],
            ["Element (bhuta)", ok ? result.element : "—"],
            ["Planet (graha)", ok ? result.planet : "—"],
            ["Associated with", ok ? result.theme : "—"],
            [
              "Traditionally preferred for this room",
              ok ? (result.preferredZoneNames.length ? result.preferredZoneNames.join(", ") : "No fixed direction") : "—",
            ],
            ["Avoid in this direction", ok ? result.avoid.join(", ") : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && usingCompass ? (
          <dl className="mt-4 divide-y divide-[var(--border)] rounded-md bg-[var(--muted)] px-3 text-sm">
            {[
              ["Magnetic bearing", `${n1(result.magneticBearing)}°`],
              ["Declination applied", `${n1(result.declination)}°`],
              ["True bearing", `${n1(result.trueBearing)}°`],
              ["Sector", `${n1(result.sectorFrom)}° to ${n1(result.sectorTo)}°`],
              ["Distance to the nearest boundary", `${n1(result.degreesToBoundary)}°`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {ok && usingCompass && result.isBorderline ? (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              This bearing sits {n1(result.degreesToBoundary)}° from a sector boundary, so a small
              compass error would put the room in the neighbouring direction. Re-take the reading
              away from metal and check the declination value.
            </span>
          </p>
        ) : null}

        {ok && result.remedy ? (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{result.remedy}</span>
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Colours for the {result.zoneName}</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {result.colours.map((c) => (
              <li key={c.hex} className="rounded-lg border border-[var(--border)] p-3">
                <span
                  className="block h-14 w-full rounded-md ring-1 ring-[var(--border)]"
                  style={swatchStyle(c.hex)}
                  role="img"
                  aria-label={`Swatch of ${c.name}`}
                />
                <p className="mt-2 text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{c.hex}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.zoneNote} {result.roomNote}
          </p>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">All eight directions</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Direction</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Guardian</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Element</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Planet</th>
                <th scope="col" className="py-2 font-semibold">Colours</th>
              </tr>
            </thead>
            <tbody>
              {DIRECTIONS.map((d) => (
                <tr key={d.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                    {d.name}
                    <span className="block text-xs font-normal text-[var(--muted-foreground)]">{d.sanskrit}</span>
                  </td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{d.deity}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{d.element}</td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{d.planet}</td>
                  <td className="py-2">
                    <span className="flex gap-1">
                      {d.colours.map((c) => (
                        <span
                          key={c.hex}
                          className="inline-block h-5 w-5 rounded-sm ring-1 ring-[var(--border)]"
                          style={swatchStyle(c.hex)}
                          role="img"
                          aria-label={`${d.name}: ${c.name}`}
                        />
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Vastu Shastra is a traditional architectural practice, and this page records what the
        tradition holds rather than making any claim about results. Nothing here is structural,
        legal, financial or health advice — take a qualified architect or engineer&rsquo;s view on
        anything that changes the building itself.
      </p>
    </main>
  );
}
