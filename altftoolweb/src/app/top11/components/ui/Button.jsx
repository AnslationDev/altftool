"use client";

const STYLES = {
  dark: "bg-slate-950 text-white hover:bg-blue-600",
  light: "bg-white text-slate-950 hover:bg-blue-50",
  outline: "border border-slate-300 bg-white text-slate-900 hover:border-slate-950",
};

/**
 * Shared pill button. `as` lets the same styling render a next/link instead of
 * a <button> — navigation in this section is real routing, and a link must be
 * an anchor so it prefetches and survives middle-click.
 */
export default function Button({
  children,
  variant = "dark",
  className = "",
  as: Component = "button",
  type = "button",
  ...rest
}) {
  const isButton = Component === "button";

  return (
    <Component
      {...(isButton ? { type } : {})}
      {...rest}
      className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${STYLES[variant]} ${className}`}
    >
      {children}
    </Component>
  );
}
