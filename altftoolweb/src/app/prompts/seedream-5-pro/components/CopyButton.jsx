"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "../lib/clipboard";
import { useToast } from "./Toast";

/**
 * Full-width "Copy Prompt" action. Copies the prompt text, fires a toast, and
 * shows a brief inline "Copied!" confirmation on the button itself.
 */
export default function CopyButton({
  text,
  label = "Copy Prompt",
  copiedLabel = "Copied!",
  toastMessage = "Copied to clipboard",
  size = "md",
  className = "",
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = useCallback(async () => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
      toast(toastMessage, { type: "success" });
    } else {
      toast("Couldn't copy — please copy manually", { type: "error" });
    }
  }, [text, toast, toastMessage]);

  const sizing =
    size === "lg" ? "py-3.5 text-[15px]" : "py-2.5 text-sm";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group/copy inline-flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-4 font-semibold text-(--color-primary-foreground) shadow-sm transition-all hover:bg-(--color-primary-hover) hover:shadow-md active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) ${sizing} ${className}`}
    >
      {copied ? (
        <>
          <Check size={16} strokeWidth={2.5} />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy size={16} strokeWidth={2.25} />
          {label}
        </>
      )}
    </button>
  );
}
