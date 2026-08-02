import { useCallback, useEffect, useRef, useState } from "react";

import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULT_RESET_MS = 1500;

/**
 * Shared copy state for tool pages with keyed button feedback and an aria-live
 * announcement. Clipboard failures remain visible instead of reporting a
 * false success.
 */
export function useCopyToClipboard({ resetMs = DEFAULT_RESET_MS } = {}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const timerRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (key, text, { label } = {}) => {
      if (!text) return false;

      const copied = await safeCopyText(text);
      if (!mountedRef.current) return copied;
      if (timerRef.current) clearTimeout(timerRef.current);

      if (!copied) {
        setCopiedKey(null);
        setAnnouncement(
          label ? `Could not copy ${label}.` : "Could not copy to clipboard.",
        );
        return false;
      }

      setCopiedKey(key);
      setAnnouncement(
        label ? `${label} copied to clipboard.` : "Copied to clipboard.",
      );
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setCopiedKey((current) => (current === key ? null : current));
        }
      }, resetMs);
      return true;
    },
    [resetMs],
  );

  const isCopied = useCallback((key) => copiedKey === key, [copiedKey]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setCopiedKey(null);
    setAnnouncement("");
  }, []);

  return { copy, isCopied, announcement, reset };
}
