"use client";

import { useCallback, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { GhostButton } from "./ui";

/**
 * Copy-to-clipboard button with a transient "Copied" confirmation.
 * @param {{ value: string, disabled?: boolean, onDone?: (msg: string) => void, label?: string }} props
 */
export default function CopyButton({ value, disabled, onDone, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  const handleCopy = useCallback(async () => {
    if (!value) {
      onDone?.("Nothing to copy yet");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
      onDone?.("Copied to clipboard");
    } catch {
      onDone?.("Copy failed — select the text manually");
    }
  }, [value, onDone]);

  return (
    <GhostButton
      icon={copied ? Check : Copy}
      label={copied ? "Copied" : label}
      onClick={handleCopy}
      disabled={disabled || !value}
    />
  );
}
