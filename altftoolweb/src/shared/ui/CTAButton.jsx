import Link from "next/link";

const VARIANTS = {
  primary: [
    "bg-(--primary) text-(--primary-foreground)",
    "shadow-[0_1px_2px_rgba(15,23,42,0.08),inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_70%,#000)]",
    "hover:bg-(--primary-hover) hover:-translate-y-px hover:shadow-[0_8px_18px_rgba(23,105,224,0.18),inset_0_0_0_1px_color-mix(in_srgb,var(--primary-hover)_70%,#000)]",
    "active:translate-y-0 active:bg-(--primary-active)",
  ].join(" "),

  outline: [
    "border border-(--border) text-(--foreground)",
    "bg-(--card)",
    "shadow-sm",
    "hover:border-(--anslation-ds-border-strong) hover:bg-(--anslation-ds-soft) hover:-translate-y-px",
    "active:translate-y-0",
  ].join(" "),
};

export default function CTAButton({
  text,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  children,
}) {
  const label = children ?? text;
  if (!label) return null;

  const classes = [
    "inline-flex items-center justify-center gap-2",
    "h-12 px-7",
    "rounded-[var(--anslation-ds-radius)]",
    "text-base font-semibold tracking-[-0.005em]",
    "transition-all duration-150 ease-out",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0",
    "cursor-pointer select-none",
    VARIANTS[variant] || VARIANTS.primary,
    className,
  ].join(" ");

  // ACTION button
  if (!href) {
    return (
      <button type={type} onClick={onClick} className={classes}>
        {label}
      </button>
    );
  }

  // NAVIGATION button
  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}
