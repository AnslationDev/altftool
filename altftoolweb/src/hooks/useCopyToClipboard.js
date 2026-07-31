import { useCallback, useEffect, useRef, useState } from "react";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEFAULT_RESET_MS = 1500;

/**
 * Copy-to-clipboard state management shared across tool pages.
 *
 * Consolidates a pattern that had been hand-rolled independently across many
 * tools, each with a slightly different subset of these bugs: a shared
 * timeout/boolean flag racing across multiple copy buttons on one page (a
 * second click clearing the first button's "Copied!" state early), a static
 * aria-label/aria-live gap that never told screen-reader users a copy
 * succeeded, and fire-and-forget `clipboard.writeText()` calls that showed
 * "Copied!" even when the write actually failed.
 *
 * Usage:
 *   const { copy, isCopied, announcement } = useCopyToClipboard();
 *   <button onClick={() => copy("summary", text)}>{isCopied("summary") ? "Copied!" : "Copy"}</button>
 *   <span aria-live="polite" role="status" className="sr-only">{announcement}</span>
 *
 * @param {object} [options]
 * @param {number} [options.resetMs] - How long a key stays "copied" before reverting.
 * @returns {{
 *   copy: (key: string, text: string, opts?: { label?: string }) => Promise<boolean>,
 *   isCopied: (key: string) => boolean,
 *   announcement: string,
 *   reset: () => void,
 * }}
 */
export function useCopyToClipboard({ resetMs = DEFAULT_RESET_MS } = {}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copy = useCallback(
    async (key, text, { label } = {}) => {
      if (!text) return false;
      const ok = await safeCopyText(text);
      if (!mountedRef.current) return ok;

      if (timerRef.current) clearTimeout(timerRef.current);

      if (ok) {
        setCopiedKey(key);
        setAnnouncement(label ? `${label} copied to clipboard.` : "Copied to clipboard.");
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) setCopiedKey((current) => (current === key ? null : current));
        }, resetMs);
      } else {
        setCopiedKey(null);
        setAnnouncement(label ? `Could not copy ${label}.` : "Could not copy to clipboard.");
      }

      return ok;
    },
    [resetMs],
  );

  const isCopied = useCallback((key) => copiedKey === key, [copiedKey]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCopiedKey(null);
    setAnnouncement("");
  }, []);

  return { copy, isCopied, announcement, reset };
}
