import { Stamp } from "./Shell";

/*
 * A month as a shape.
 *
 * The point of drawing thirty squares rather than listing thirty rows is that
 * a shape shows you the four days in a row with nothing on them, and a list
 * does not. It only works with a key — coloured squares nobody can decode are
 * decoration — so the legend is part of the component rather than something a
 * caller might forget.
 */
export default function MonthGrid({ plan, className = "" }) {
  return (
    <div className={className}>
      <div className="psn-month">
        {plan.days.map((day) => (
          <div
            key={day.day}
            data-rest={day.rest ? "true" : "false"}
            data-kind={day.rest ? undefined : day.kind}
            className="psn-day flex flex-col items-center justify-center rounded-md p-1"
            title={
              day.rest
                ? `Day ${day.day} — rest`
                : `Day ${day.day} — ${day.pillar.label} · ${day.shot?.title}`
            }
          >
            <span className="psn-seed text-[10px] text-muted-foreground">
              {day.day}
            </span>
            <span className="sr-only">
              {day.rest
                ? `Day ${day.day}, rest day`
                : `Day ${day.day}, ${day.kind}, ${day.pillar.label}, ${day.shot?.title}`}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Legend kind="video" label="Video" />
        <Legend kind="still" label="Still" />
        <Legend kind="rest" label="Rest day" />
        <span className="text-xs text-muted-foreground">
          Hover a square for the pillar and shot.
        </span>
      </div>
    </div>
  );
}

function Legend({ kind, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        aria-hidden="true"
        data-rest={kind === "rest" ? "true" : "false"}
        data-kind={kind === "rest" ? undefined : kind}
        className="psn-day h-3.5 w-3.5 rounded-[3px]"
        style={{ aspectRatio: "auto" }}
      />
      {label}
    </span>
  );
}
