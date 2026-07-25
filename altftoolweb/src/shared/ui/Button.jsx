"use client";

import { forwardRef } from "react";
import { Button as BaseButton } from "@altftool/ui";

// Compatibility export for existing route-local imports. New code should
// import Button directly from @altftool/ui.
//
// The base @altftool/ui Button already ships the design-system press scale
// (`transform: scale(0.98)` on :active), token-driven 150ms transitions, and
// the 3px brand focus ring (`--anslation-ds-focus-ring`). packages/ui is
// shared with admin and stays untouched, so this thin web-local wrapper only
// layers the reduced-motion guards on top: users who prefer reduced motion
// get an instant, transform-free press state instead of the scale animation.
const MOTION_GUARDS = [
  "motion-reduce:transition-none",
  "motion-reduce:transform-none",
  "motion-reduce:active:transform-none!",
].join(" ");

export const Button = forwardRef(function Button({ className, ...props }, ref) {
  return (
    <BaseButton
      ref={ref}
      className={className ? `${MOTION_GUARDS} ${className}` : MOTION_GUARDS}
      {...props}
    />
  );
});
