import React from "react";
import { cn } from "../lib/cn.js";

export function Spinner({ className, label = "Loading", size = "md" }) {
  return (
    <span
      aria-label={label}
      role="status"
      className={cn("alt-ui-spinner", `alt-ui-spinner--${size}`, className)}
    />
  );
}
