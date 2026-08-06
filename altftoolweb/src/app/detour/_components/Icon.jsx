import * as LucideIcons from "lucide-react";

/*
 * Renders a lucide icon by name.
 *
 * The taxonomy stores icons as strings, and a name that does not exist in
 * lucide renders as nothing at all — no error, no console warning, just a gap
 * where an icon should be. That failure is silent enough to survive review, so
 * this falls back to a visible placeholder instead: a missing icon should look
 * wrong, not look like a spacing bug.
 *
 * A unit test asserts every name in the taxonomy resolves, so the fallback
 * should never fire in practice.
 */

const FALLBACK = "Circle";

export default function Icon({ name, className, style, ...rest }) {
  const Component = LucideIcons[name] ?? LucideIcons[FALLBACK];
  if (!Component) return null;

  return (
    <Component
      className={className}
      style={style}
      aria-hidden="true"
      {...rest}
    />
  );
}
