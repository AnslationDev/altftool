"use client";

import * as React from "react";

/**
 * Radix portals (Dialog, Select, ...) mount to document.body by default,
 * which escapes the .imgprompt-scope wrapper that all of this route's
 * design tokens (--imgprompt-*) are scoped to — content portaled straight
 * to <body> would inherit none of them and render invisible/unstyled.
 * This hook finds that wrapper once mounted so portal-based UI can target
 * it explicitly and stay themed.
 */
export function usePortalContainer() {
  const [container, setContainer] = React.useState(null);
  React.useEffect(() => {
    setContainer(document.querySelector(".imgprompt-scope"));
  }, []);
  return container;
}
