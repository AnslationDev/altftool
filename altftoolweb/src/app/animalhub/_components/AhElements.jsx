// Animal Hub element primitives — button, badge, tag.
//
// Server-safe, props-only. Styled exclusively by ah- classes in
// styles/animalhub.css; tones and variants map to module tokens so both
// themes work automatically.

import Link from "next/link";
import clsx from "clsx";

/**
 * Action element. Renders a Next <Link> when `href` is given, otherwise a
 * <button>. `variant`: "solid" (brand) | "outline" | "ghost".
 * `size`: "sm" | "md" | "lg".
 */
export function AhButton({
  href,
  variant = "solid",
  size = "md",
  type = "button",
  className,
  children,
  ...rest
}) {
  const classes = clsx("ah-btn", `ah-btn--${variant}`, `ah-btn--${size}`, className);

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

/**
 * Small-caps status chip. `tone`: "neutral" (default) | "brand" | "positive"
 * | "warning" | "danger" | "info". Tones are semantic — feature code decides
 * what maps to what (e.g. a conservation status to a tone), the badge stays
 * generic.
 */
export function AhBadge({ tone = "neutral", className, children, ...rest }) {
  return (
    <span className={clsx("ah-badge", className)} data-tone={tone} {...rest}>
      {children}
    </span>
  );
}

/**
 * Quiet hairline chip for topics/attributes. Renders a link when `href` is
 * given (hover sharpens the border), otherwise a static span.
 */
export function AhTag({ href, className, children, ...rest }) {
  if (href) {
    return (
      <Link href={href} className={clsx("ah-tag", className)} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <span className={clsx("ah-tag", className)} {...rest}>
      {children}
    </span>
  );
}
