"use client";

import { useSyncExternalStore } from "react";
import { isAdsenseProductionHost } from "./adsenseConfig";

const subscribe = () => () => {};
const getServerSnapshot = () => false;

function getBrowserSnapshot() {
  return isAdsenseProductionHost(window.location.hostname);
}

export function useProductionSite(enabled = true) {
  const isProductionHost = useSyncExternalStore(
    subscribe,
    getBrowserSnapshot,
    getServerSnapshot,
  );

  return enabled && isProductionHost;
}
