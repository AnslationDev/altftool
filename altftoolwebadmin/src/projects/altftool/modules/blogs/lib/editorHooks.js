"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useAutosave — debounced autosave with status reporting.
 *
 * Returns { status, savedAt, saveNow } where status ∈
 * "idle" | "dirty" | "saving" | "saved" | "error".
 *
 * @param data        the value to persist (object/string)
 * @param onSave      async (data) => void
 * @param options     { delay=1500, enabled=true, isDirty }
 */
export function useAutosave(data, onSave, { delay = 1500, enabled = true, isDirty } = {}) {
  const [status, setStatus] = useState("idle");
  const [savedAt, setSavedAt] = useState(null);
  const timer = useRef(null);
  const latest = useRef(data);
  const mounted = useRef(false);
  latest.current = data;

  const run = useCallback(async () => {
    setStatus("saving");
    try {
      await onSave(latest.current);
      setStatus("saved");
      setSavedAt(new Date());
    } catch {
      setStatus("error");
    }
  }, [onSave]);

  const saveNow = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    return run();
  }, [run]);

  useEffect(() => {
    // Skip the very first render so loading a blog doesn't trigger a save.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!enabled) return;
    if (typeof isDirty === "function" && !isDirty(data)) return;

    setStatus("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(run, delay);
    return () => timer.current && clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, enabled, delay]);

  return { status, savedAt, saveNow };
}

/**
 * useUnsavedGuard — warns before leaving the page while there are unsaved
 * changes (browser navigation / refresh / close).
 */
export function useUnsavedGuard(dirty) {
  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

/**
 * useEditorShortcuts — register keyboard shortcuts for the editor.
 *
 * @param map e.g. { "mod+s": save, "mod+enter": publish, "mod+k": palette }
 *            "mod" = ⌘ on macOS, Ctrl elsewhere.
 */
export function useEditorShortcuts(map = {}) {
  useEffect(() => {
    const handler = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      const combo = `${mod ? "mod+" : ""}${e.shiftKey ? "shift+" : ""}${key === " " ? "space" : key}`;
      const fn = map[combo];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [map]);
}

/** Compact, relative "saved" label for the autosave indicator. */
export function formatSavedLabel(savedAt) {
  if (!savedAt) return "";
  const secs = Math.round((Date.now() - savedAt.getTime()) / 1000);
  if (secs < 5) return "Saved just now";
  if (secs < 60) return `Saved ${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `Saved ${mins}m ago`;
  return `Saved at ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
