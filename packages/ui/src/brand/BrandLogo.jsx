import React, { useId } from "react";
import { ALTF_BRAND } from "./brand.js";
import { cn } from "../lib/cn.js";

export function BrandMark({
  className,
  decorative = false,
  label = ALTF_BRAND.name,
  monochrome = false,
  size = "md",
  ...props
}) {
  const gradientId = `altf-brand-${useId().replaceAll(":", "")}`;

  return (
    <svg
      viewBox={ALTF_BRAND.markViewBox}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : label}
      role={decorative ? undefined : "img"}
      className={cn(
        "alt-ui-brand-mark",
        `alt-ui-brand-mark--${size}`,
        className,
      )}
      {...props}
    >
      {monochrome ? null : (
        <defs>
          <linearGradient
            id={gradientId}
            x1="22"
            y1="4"
            x2="127"
            y2="169"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--anslation-ds-brand-500)" />
            <stop offset="1" stopColor="var(--anslation-ds-secondary)" />
          </linearGradient>
        </defs>
      )}
      <path
        d={ALTF_BRAND.markPath}
        fill={monochrome ? "currentColor" : `url(#${gradientId})`}
      />
    </svg>
  );
}

export function BrandLogo({
  className,
  compact = false,
  decorative = false,
  label = ALTF_BRAND.name,
  monochrome = false,
  size = "md",
  ...props
}) {
  return (
    <span
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? "true" : undefined}
      role={decorative ? undefined : "img"}
      className={cn(
        "alt-ui-brand-logo",
        `alt-ui-brand-logo--${size}`,
        compact && "alt-ui-brand-logo--compact",
        monochrome && "alt-ui-brand-logo--monochrome",
        className,
      )}
      {...props}
    >
      <BrandMark decorative monochrome={monochrome} size={size} />
      {compact ? null : (
        <span className="alt-ui-brand-logo__wordmark" aria-hidden="true">
          Alt F
        </span>
      )}
    </span>
  );
}
