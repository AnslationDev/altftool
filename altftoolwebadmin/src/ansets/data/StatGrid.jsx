"use client";

import Link from "next/link";
import { cn } from "@altftool/ui";

/**
 * Tone -> token. Keeping this table here means a KPI can say what it MEANS
 * ("this count is bad news") instead of naming a colour, which is how the
 * hand-rolled tiles ended up with `text-[var(--danger)]` hardcoded in one page
 * and a raw Tailwind red in another.
 */
/**
 * A stat VALUE is text, so every tone here has to clear AA as text in both
 * themes. --warning and --danger are tuned for fills and borders (2.15:1 and
 * 3.76:1 on the light surface), which is why the text-safe aliases are used
 * instead — a "3 failed logins" tile has to be readable, not just coloured.
 */
const TONE_TOKEN = {
  default: "var(--foreground)",
  primary: "var(--primary-text)",
  success: "var(--success-text)",
  warning: "var(--warning-text)",
  danger: "var(--danger-text)",
};

/**
 * One KPI.
 *
 * @param {string}   label   Short uppercase caption.
 * @param {ReactNode} value  The number/text. Rendered tabular so columns line up.
 * @param {string}   [hint]  Optional supporting line under the value.
 * @param {"default"|"primary"|"success"|"warning"|"danger"} [tone]
 * @param {import("react").ElementType} [icon]
 * @param {string}   [href]    Turns the tile into a drill-down link (Next Link).
 * @param {Function} [onClick] Turns the tile into a button when there's no `href`.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
  href,
  onClick,
  className,
}) {
  const interactive = Boolean(href || onClick);
  // Same shell for all three cases so a page can add `href` later without a
  // visual jump: div -> button/Link only changes the tag and adds the hover
  // affordance, same border/radius/padding/shadow from master.md's card scale.
  const Wrapper = href ? Link : interactive ? "button" : "div";
  const wrapperProps = href ? { href } : interactive ? { type: "button", onClick } : {};

  return (
    <Wrapper
      className={cn(
        "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-sm",
        interactive &&
          "block w-full text-left transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]",
        className,
      )}
      {...wrapperProps}
    >
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon className="h-4 w-4 shrink-0 text-[var(--muted)]" aria-hidden="true" />
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {label}
        </p>
      </div>

      <p
        className="mt-1.5 text-2xl font-semibold tabular-nums"
        style={{ color: TONE_TOKEN[tone] ?? TONE_TOKEN.default }}
      >
        {value}
      </p>

      {hint ? <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">{hint}</p> : null}
    </Wrapper>
  );
}

/**
 * Responsive KPI row. `items` is the data — the grid decides the layout, so
 * every screen's KPI strip breaks at the same points.
 *
 * @param {Array<{key?:string,label:string,value:ReactNode,hint?:string,tone?:string,icon?:any,href?:string,onClick?:Function}>} items
 * @param {2|3|4} [columns] Columns at the widest breakpoint.
 */
export function StatGrid({ items = [], columns = 4, className }) {
  if (!items.length) return null;

  const wide = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns] ?? "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={cn("grid grid-cols-2 gap-3", wide, className)}>
      {items.map((item) => {
        // `key` has to come off the object before the spread: React 19 treats a
        // spread that still contains `key` as an error (it cannot tell whether
        // that `key` was meant for reconciliation or is just a data field), and
        // every screen on this anset passes `key` as part of its item shape.
        const { key, ...tileProps } = item;
        return <StatTile key={key ?? item.label} {...tileProps} />;
      })}
    </div>
  );
}

export default StatGrid;
