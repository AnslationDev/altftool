"use client";

import { useState } from "react";
import { Button } from "@altftool/ui";
import { Hash, Copy, Check, RefreshCw } from "lucide-react";
import { computeHash } from "../utils/helpers";

export default function HashGenerator({ fileData }) {
  const [customInput, setCustomInput] = useState("");
  const [customHash, setCustomHash] = useState("");
  const [copied, setCopied] = useState(false);

  const fileHash = fileData?.meta?.hash || "—";

  const handleCustomHash = () => {
    if (customInput.trim()) {
      setCustomHash(computeHash(customInput));
    }
  };

  const handleCopy = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-(--border) overflow-hidden">
      <div className="px-3 py-2 bg-(--muted) border-b border-(--border) flex items-center gap-1.5">
        <Hash size="14" className="text-(--muted-foreground)" />
        <span className="text-xs font-semibold text-(--foreground)">File Hash</span>
      </div>
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs font-mono bg-(--muted) px-2 py-1.5 rounded-lg truncate text-(--foreground)">
            {fileHash}
          </code>
          <button onClick={() => handleCopy(fileHash)} aria-label="Copy file hash" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) sm:h-9 sm:w-9">
            {copied ? <Check size="14" className="text-(--primary)" /> : <Copy size="14" />}
          </button>
        </div>

        <div className="border-t border-(--border) pt-3">
          <p className="text-xs font-semibold text-(--foreground) mb-2">Generate Hash for Text</p>
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCustomHash(); }}
              placeholder="Type or paste text..."
              aria-label="Text to hash"
              className="flex-1 min-h-11 px-3 py-1.5 text-sm rounded-lg border border-(--border) bg-(--card) text-(--foreground) transition focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25 sm:min-h-9"
            />
            <Button variant="primary" size="sm" onClick={handleCustomHash} aria-label="Generate hash">
              <RefreshCw size="14" />
            </Button>
          </div>
          {customHash && (
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-(--muted) px-2 py-1.5 rounded-lg text-(--foreground)">{customHash}</code>
              <button onClick={() => handleCopy(customHash)} aria-label="Copy generated hash" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-(--muted) text-(--muted-foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) sm:h-9 sm:w-9">
                <Copy size="14" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
