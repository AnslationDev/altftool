import React from "react";
import { cn } from "../lib/cn.js";

export const Card = React.forwardRef(function Card(
  { className, interactive = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "alt-ui-card",
        interactive && "alt-ui-card--hover",
        className,
      )}
      {...props}
    />
  );
});

export function Badge({ className, tone = "neutral", ...props }) {
  return (
    <span
      className={cn("alt-ui-badge", `alt-ui-badge--${tone}`, className)}
      {...props}
    />
  );
}

export function StatusBadge({
  tone = "neutral",
  className,
  children,
  ...props
}) {
  return (
    <Badge tone={tone} className={className} {...props}>
      {children}
    </Badge>
  );
}
