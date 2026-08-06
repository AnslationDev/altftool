// Animal Hub layout primitives — container, section, section header, grid,
// divider. Generic by contract: nothing here knows about animals; feature
// components compose these with data from the service layer.
//
// All primitives are server-safe (no state, no effects) and style themselves
// exclusively through ah- classes defined in styles/animalhub.css.

import clsx from "clsx";

/**
 * Centered content column. `size`: "default" (site container width),
 * "narrow" (reading measure, ~46rem), "wide" (near full-bleed).
 */
export function AhContainer({ size = "default", as: Tag = "div", className, children, ...rest }) {
  return (
    <Tag
      className={clsx(
        "ah-container",
        size === "narrow" && "ah-container--narrow",
        size === "wide" && "ah-container--wide",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Vertical rhythm wrapper for one page band. `tint` gives the band a soft
 * full-width background with hairline top/bottom rules; `flush` removes the
 * vertical padding when a parent controls spacing.
 */
export function AhSection({ as: Tag = "section", tint = false, flush = false, className, children, ...rest }) {
  return (
    <Tag
      className={clsx(
        "ah-section",
        tint && "ah-section--tint",
        flush && "ah-section--flush",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Left-aligned editorial section header: eyebrow kicker over a display title,
 * optional lead paragraph, optional `action` node (link/button) anchored to
 * the title baseline on wide viewports. Deliberately never centered.
 */
export function AhSectionHeader({
  eyebrow,
  title,
  titleAs: TitleTag = "h2",
  titleSize = "md",
  lead,
  action,
  className,
}) {
  return (
    <div className={clsx("ah-section-head", className)}>
      <div className="ah-section-head__main">
        {eyebrow ? <span className="ah-eyebrow ah-eyebrow--rule">{eyebrow}</span> : null}
        <TitleTag className={clsx("ah-display", `ah-display--${titleSize}`)}>{title}</TitleTag>
        {lead ? <p className="ah-lead">{lead}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

/**
 * Responsive grid. Default is content-driven: columns auto-fill at a minimum
 * track width (override per use with `min`, e.g. "18rem"). `variant` pins an
 * explicit shape instead: "cols-2" | "cols-3" | "cols-4" | "feature" —
 * "feature" promotes the first child to a 2×2 cover-story tile on wide
 * viewports.
 */
export function AhGrid({ as: Tag = "div", variant, min, className, style, children, ...rest }) {
  return (
    <Tag
      className={clsx("ah-grid", variant && `ah-grid--${variant}`, className)}
      style={min ? { "--ah-grid-min": min, ...style } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Hairline rule between page moments. With `label`, renders a centered
 * small-caps label between two hairlines (an editorial "chapter" break).
 */
export function AhDivider({ label, className }) {
  if (!label) {
    return <hr className={clsx("ah-divider", className)} />;
  }
  return (
    <div className={clsx("ah-divider ah-divider--labeled", className)} role="separator">
      <span className="ah-divider__label">{label}</span>
    </div>
  );
}
