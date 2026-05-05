import Link from "next/link";

const VARIANTS = {
  primary: [
    "bg-[var(--primary)] text-white",
    "hover:-translate-y-0.5 hover:brightness-90",
    "focus:ring-[var(--primary)]",
  ].join(" "),

  outline: [
    "border border-[var(--secondary-border)]",
    "bg-(--secondary-bg)",

    "hover:bg-[var( --secondary-hover)] ",
    "shadow-[0px_1px_8.2px_0px_#9DA3AF40]",
  ].join(" "),
};

export default function CTAButton({
  text,
  href,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}) {
  if (!text) return null;

  const classes = [
    "inline-flex items-center justify-center",
    "h-12 px-8",
    "rounded-md",
    "text-lg font-medium",
    "transition-all duration-200",
    "focus:outline-none focus:ring-1 focus:ring-offset-1",
    VARIANTS[variant],
    className,
  ].join(" ");

  // 👉 ACTION BUTTON
  if (!href) {
    return (
      <button type={type} onClick={onClick} className={classes}>
        {text}
      </button>
    );
  }

  // 👉 NAVIGATION BUTTON
  return (
    <Link href={href} className={classes}>
      {text}
    </Link>
  );
}
