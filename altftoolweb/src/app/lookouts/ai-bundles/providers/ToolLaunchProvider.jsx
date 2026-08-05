"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import ToolLaunchModal from "../components/ToolLaunchModal";

const ToolLaunchContext = createContext(null);

/**
 * Gates every outbound tool link behind a "Log in / Sign up" interstitial
 * that auto-redirects to the tool's site after a few seconds. Centralized
 * here (rather than per-card state) since tool links live in five separate
 * components — ToolCard, CommunityFavoritesSection, CompareModal,
 * FeaturedCollectionsSection, and HeroSearchPreview.
 */
export function ToolLaunchProvider({ children }) {
  const [pendingTool, setPendingTool] = useState(null);

  const launchTool = useCallback((tool) => {
    setPendingTool(tool);
  }, []);

  const cancelLaunch = useCallback(() => {
    setPendingTool(null);
  }, []);

  const value = useMemo(() => ({ launchTool }), [launchTool]);

  return (
    <ToolLaunchContext.Provider value={value}>
      {children}
      <ToolLaunchModal tool={pendingTool} onClose={cancelLaunch} />
    </ToolLaunchContext.Provider>
  );
}

export function useToolLaunch() {
  const ctx = useContext(ToolLaunchContext);
  if (!ctx) throw new Error("useToolLaunch must be used within ToolLaunchProvider");
  return ctx;
}
