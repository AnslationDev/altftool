import React from "react";
import { cn } from "../lib/cn.js";
import { Spinner } from "../feedback/Spinner.jsx";

export const Button = React.forwardRef(function Button(
  {
    children,
    className,
    variant = "primary",
    size = "md",
    type = "button",
    loading = false,
    loadingLabel = "Loading",
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
      aria-busy={loading || undefined}
      suppressHydrationWarning
      className={cn(
        "alt-ui-button",
        `alt-ui-button--${variant}`,
        `alt-ui-button--${size}`,
        className,
      )}
      {...props}
    >
      {loading ? <Spinner label={loadingLabel} size="sm" /> : null}
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
