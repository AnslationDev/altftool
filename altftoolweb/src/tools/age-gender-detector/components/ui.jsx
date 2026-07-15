"use client";

/**
 * Shared presentation primitives for the Step Counter tool.
 * One card contract + one section-heading pattern = the whole page
 * reads as a single, deliberate system.
 */

export const CARD =
  "rounded-[12px] border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-sm)]";

export const CARD_HOVER =
  "transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--primary)_45%,var(--border))] hover:shadow-[var(--anslation-ds-shadow-md)] motion-reduce:hover:translate-y-0";

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:[box-shadow:var(--anslation-ds-focus-ring)]";

export function SectionHeading({ eyebrow, title, aside, as: Tag = "h2" }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-(--primary-hover) dark:text-(--primary)">
            {eyebrow}
          </p>
        ) : null}
        <Tag className="text-base font-bold tracking-tight text-(--foreground) sm:text-lg">
          {title}
        </Tag>
      </div>
      {aside}
    </div>
  );
}

export function CardHeading({ icon, title, aside }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        {icon}
        <h2 className="text-sm font-bold tracking-tight text-(--foreground)">{title}</h2>
      </div>
      {aside}
    </div>
  );
}
