"use client";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "cursor-pointer",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50";

  const variants = {
    primary: "bg-(--primary) text-(--primary-foreground) hover:opacity-90",
    outline:
  "border border-border bg-transparent text-(--foreground) hover:bg-(--muted)",
    ghost: "hover:bg-(--muted)",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
