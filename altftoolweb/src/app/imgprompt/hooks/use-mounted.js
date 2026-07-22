"use client";

import * as React from "react";

/** Returns true only after the component has mounted on the client.
 *  Use to gate rendering of persisted/localStorage state and avoid
 *  server/client hydration mismatches. */
export function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}
