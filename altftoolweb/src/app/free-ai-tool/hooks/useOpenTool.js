"use client";

import { useAuth } from "../providers/AuthProvider";
import { recordToolOpen } from "../lib/toolStats";

/** Shared click handler for every tool card: gate behind sign-in, log the
 *  open for weekly-opens/trending stats, then open the tool in a new tab. */
export function useOpenTool() {
  const { requireAuth } = useAuth();

  return (tool) => {
    requireAuth(() => {
      recordToolOpen(tool);
      window.open(tool.url, "_blank", "noopener,noreferrer");
    });
  };
}
