import React from "react";

export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

export const Spinner = ({ className, size = "md" }) => (
  <span
    aria-hidden="true"
    className={cn("alt-ui-spinner", `alt-ui-spinner--${size}`, className)}
  />
);

export const Button = React.forwardRef(function Button(
  {
    children,
    className,
    variant = "primary",
    size = "md",
    type = "button",
    loading = false,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "alt-ui-button",
        `alt-ui-button--${variant}`,
        `alt-ui-button--${size}`,
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
});

export const IconButton = React.forwardRef(function IconButton(
  { className, variant = "secondary", size = "icon", children, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn("alt-ui-icon-button", className)}
      {...props}
    >
      {children}
    </Button>
  );
});

export const Input = React.forwardRef(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn("alt-ui-input", className)}
      {...props}
    />
  );
});

export const Label = React.forwardRef(function Label(
  { className, ...props },
  ref,
) {
  return <label ref={ref} className={cn("alt-ui-label", className)} {...props} />;
});

export function Field({ label, children, className, helpText }) {
  return (
    <div className={cn("alt-ui-field", className)}>
      {label ? <Label>{label}</Label> : null}
      {children}
      {helpText ? <p className="alt-ui-help">{helpText}</p> : null}
    </div>
  );
}

export const Card = React.forwardRef(function Card(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("alt-ui-card", className)} {...props} />;
});

export function Badge({ className, tone = "neutral", ...props }) {
  return (
    <span
      className={cn("alt-ui-badge", `alt-ui-badge--${tone}`, className)}
      {...props}
    />
  );
}
