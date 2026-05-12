"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collectSystemData,
  createEmptySnapshot,
} from "@/tools/device-browser-dashboard/utils/detectors";

export const useSystemData = () => {
  const [data, setData] = useState(() => createEmptySnapshot());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const snapshot = await collectSystemData();
      setData(snapshot);
    } catch (scanError) {
      setError(scanError?.message || "Device scan failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const scanTimer = window.setTimeout(() => {
      refresh();
    }, 60);

    return () => window.clearTimeout(scanTimer);
  }, [refresh]);

  useEffect(() => {
    let resizeTimer;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const scheduleRefresh = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        refresh();
      }, 180);
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };

    window.addEventListener("resize", scheduleRefresh);
    window.addEventListener("orientationchange", scheduleRefresh);
    window.addEventListener("online", scheduleRefresh);
    window.addEventListener("offline", scheduleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);
    connection?.addEventListener?.("change", scheduleRefresh);

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", scheduleRefresh);
      window.removeEventListener("orientationchange", scheduleRefresh);
      window.removeEventListener("online", scheduleRefresh);
      window.removeEventListener("offline", scheduleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
      connection?.removeEventListener?.("change", scheduleRefresh);
    };
  }, [refresh]);

  return {
    data,
    error,
    loading,
    refresh,
  };
};
