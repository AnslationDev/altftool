"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, RotateCcw, Wind } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

import { BAGUA, ELEMENT_INFO, ELEMENTS, ROOMS, baguaByGrid, roomGuidance } from "../lib";

const DEFAULTS = { room: "kitchen", area: "kan" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const HARMONY_STYLE = {
  aligned: "bg-[var(--success-soft)] text-[var(--success)]",
  supportive: "bg-[var(--info-soft)] text-[var(--info)]",
  clash: "bg-[var(--warning-soft)] text-[var(--warning)]",
  neutral: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

// The Black Sect grid, laid out row 3 (far wall) first so it reads like a plan.
const GRID_ROWS = [3, 2, 1];

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const { copy: copyToClipboard, isCopied, announcement } = useCopyToClipboard();

  const set = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const result = useMemo(() => roomGuidance(form), [form]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "Feng Shui Room Guide",
      `${result.roomLabel} in the ${result.trigram} area — ${result.lifeArea}`,
      `Classical direction: ${result.areaDirection} · Black Sect: ${result.areaGrid}`,
      `Room element ${result.roomElementLabel} · Area element ${result.areaElementLabel}`,
      `Relationship: ${result.harmonyLabel}`,
      "",
      result.advice,
      "",
      `Lead colour (${result.percentLead}%): ${ELEMENT_INFO[result.leadElement].label} — ${result.leadColours.map((c) => c.name).join(", ")}`,
      `Support (${result.percentSupport}%): ${ELEMENT_INFO[result.supportElement].label} — ${result.supportColours.map((c) => c.name).join(", ")}`,
      `Keep to accents only: ${result.reduceElementLabel}`,
      `Shapes: ${result.shape}`,
      `Materials: ${result.materials}`,
      "",
      "Layout rules:",
      ...result.rules.map((r) => `- ${r}`),
    ].join("\n");
  }, [ok, result]);

  const copyResult = () => {
    copyToClipboard("guidance", summary, { label: "the feng shui guidance" });
  };

  const reset = () => {
    setForm(DEFAULTS);
  };

  const swatchStyle = (hex) => ({ backgroundColor: hex });

  const palette = (label, share, element, colours) => (
    <div className="rounded-lg border border-[var(--border)] p-3">
      <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
        {label} · {share}%
      </p>
      <p className="mt-1 text-sm font-semibold">{ELEMENT_INFO[element].label}</p>
      <div className="mt-2 flex gap-1">
        {colours.map((c) => (
          <span
            key={c.hex}
            className="block h-10 flex-1 rounded-sm ring-1 ring-[var(--border)]"
            style={swatchStyle(c.hex)}
            role="img"
            aria-label={`${ELEMENT_INFO[element].label}: ${c.name}`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-[var(--muted-foreground)]">
        {colours.map((c) => c.name).join(" · ")}
      </p>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Wind className="h-4 w-4" aria-hidden="true" />
          Traditional reference
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Feng Shui Room Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a room and the bagua area it sits in. The guide works out how the two elements stand
          to each other in the five-element cycle, names the mediating element when they clash, and
          lists the layout rules for that room.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-room">
              Room
            </label>
            <select id="fs-room" className={`mt-2 ${INPUT_CLASS}`} value={form.room} onChange={set("room")}>
              {ROOMS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fs-area">
              Bagua area it falls in
            </label>
            <select id="fs-area" className={`mt-2 ${INPUT_CLASS}`} value={form.area} onChange={set("area")}>
              {BAGUA.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.life} ({b.trigram})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Use the grid below if you are laying the bagua from your front door.
            </p>
          </div>
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

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Element relationship
            </p>
            <p className="mt-1 text-3xl leading-tight font-semibold text-[var(--primary)] sm:text-4xl">
              {ok ? result.harmonyLabel : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${result.roomLabel} in ${result.lifeArea} (${result.trigram})`
                : "Choose a room and a bagua area"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label={
                isCopied("guidance")
                  ? "Copied the feng shui guidance to clipboard"
                  : "Copy the feng shui guidance for this room"
              }
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {isCopied("guidance") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("guidance") ? "Copied!" : "Copy result"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok ? (
          <p className={`mt-4 rounded-md px-3 py-2 text-sm ${HARMONY_STYLE[result.harmony]}`}>{result.advice}</p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Room element", ok ? `${result.roomElementLabel} · ${result.roomIsYin ? "yin, restful" : "yang, active"}` : "—"],
            ["Area element", ok ? result.areaElementLabel : "—"],
            ["Classical direction", ok ? result.areaDirection : "—"],
            ["Black Sect position", ok ? result.areaGrid : "—"],
            ["Mediating element", ok ? (result.mediatorLabel ?? "Not needed — no clash") : "—"],
            ["Keep to accents", ok ? `${result.reduceElementLabel} (it controls the area's element)` : "—"],
            ["Shapes to favour", ok ? result.shape : "—"],
            ["Materials", ok ? result.materials : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            {result.areaNote}
          </p>
        ) : null}
      </section>

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Colour split for this room</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {palette("Lead", result.percentLead, result.leadElement, result.leadColours)}
            {palette("Support", result.percentSupport, result.supportElement, result.supportColours)}
            {palette("Accent only", result.percentRest, result.reduceElement, result.reduceColours)}
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
            The third palette is the element that controls the area&rsquo;s own element, so the
            tradition keeps it to small accents here rather than whole walls.
          </p>
        </section>
      ) : null}

      {ok ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Layout rules for a {result.roomLabel.toLowerCase()}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {result.rules.map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-start gap-2 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Where a rule and a fixed feature disagree — a load-bearing wall, a soil pipe, a window
              you cannot move — the tradition adapts rather than demolishes.
            </span>
          </p>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The bagua grid, from your front door</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Stand in the main doorway looking in. The bottom row is the wall you are standing on.
        </p>
        <div className="mt-3 overflow-x-auto">
          <div className="grid min-w-[320px] grid-cols-3 gap-2">
            {GRID_ROWS.map((row) =>
              [1, 2, 3].map((col) => {
                const cell = baguaByGrid(row, col);
                const active = ok && cell.id === result.areaId;
                return (
                  <button
                    key={cell.id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, area: cell.id }))}
                    aria-pressed={active}
                    className={`min-h-11 rounded-lg border p-2 text-left text-xs transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      active
                        ? "border-[var(--primary)] bg-[var(--muted)]"
                        : "border-[var(--border)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="block font-semibold">{cell.life}</span>
                    <span className="mt-0.5 block text-[var(--muted-foreground)]">
                      {cell.trigram} · {ELEMENT_INFO[cell.element].label}
                    </span>
                    <span className="mt-0.5 block text-[var(--muted-foreground)]">{cell.direction}</span>
                  </button>
                );
              }),
            )}
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted-foreground)]">
          The compass direction on each cell is the classical school&rsquo;s anchor for the same
          trigram. Choose one system and follow it throughout rather than mixing them.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The five-element cycle</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Element</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Colours</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Shapes</th>
                <th scope="col" className="py-2 font-semibold">Quality</th>
              </tr>
            </thead>
            <tbody>
              {ELEMENTS.map((id) => (
                <tr key={id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                    {ELEMENT_INFO[id].label}
                    <span className="block text-xs font-normal text-[var(--muted-foreground)]">
                      {ELEMENT_INFO[id].chinese}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <span className="flex gap-1">
                      {ELEMENT_INFO[id].colours.map((c) => (
                        <span
                          key={c.hex}
                          className="inline-block h-5 w-5 rounded-sm ring-1 ring-[var(--border)]"
                          style={swatchStyle(c.hex)}
                          role="img"
                          aria-label={`${ELEMENT_INFO[id].label}: ${c.name}`}
                        />
                      ))}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{ELEMENT_INFO[id].shape}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{ELEMENT_INFO[id].quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Generating cycle: Wood feeds Fire, Fire makes Earth, Earth yields Metal, Metal carries
          Water, Water grows Wood. Controlling cycle, two steps ahead: Wood breaks Earth, Fire melts
          Metal, Earth dams Water, Metal cuts Wood, Water quenches Fire.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Feng shui is a traditional practice and this page records what it holds rather than making
        any claim about outcomes. Nothing here is health, financial or structural advice — speak to
        a qualified architect or engineer about anything that alters the building.
      </p>
    </main>
  );
}
