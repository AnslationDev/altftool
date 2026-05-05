"use client";



import { useState } from "react";
import { StatusDot } from "./Badge";

export function InfoRow({
  label,
  value,
  copyable = false,  
  mono = false,       
  truncate = false,    
  status,              
  highlight = false,  
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!copyable || !value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked in some browsers
    }
  };

  const displayValue =
    value === null || value === undefined || value === "" ? (
      <span className="text-[(--muted-foreground)] italic text-sm">N/A</span>
    ) : (
      String(value)
    );

  return (
    <div
      className={[
        // Base row styles
        "flex items-center justify-between gap-3 py-2.5",
        // Bottom border except last child
        "border-b border-[(--border)] last:border-0",
        // Hover styles when copyable
        copyable
          ? "cursor-pointer hover:bg-[(--primary)]/5 rounded-lg px-2 -mx-2 transition-colors duration-150"
          : "",
        className,
      ].join(" ")}
      onClick={handleCopy}
      title={copyable ? "Click to copy" : undefined}
    >
      {/* Left: label */}
      <span className="text-sm text-[(--muted-foreground)] font-secondary flex-shrink-0 min-w-[100px]">
        {label}
      </span>

      {/* Right: value + optional status dot + copy icon */}
      <div className="flex items-center gap-2 min-w-0 justify-end">

        {/* Status dot (green = available, red = blocked) */}
        {status !== undefined && <StatusDot available={status} />}

        {/* Value text */}
        <span
          className={[
            "text-md font-medium text-right",
            mono ? "font-mono" : "font-secondary",
            truncate ? "truncate max-w-[160px]" : "",
            highlight
              ? "text-[(--primary)]"
              : "text-[(--card-foreground)]",
          ].join(" ")}
        >
          {copied ? (
            <span className="text-green-400 text-xs">✓ Copied!</span>
          ) : (
            displayValue
          )}
        </span>

   
        {copyable && !copied && (
          <svg
            className="w-3 h-3 text-[(--muted-foreground)] flex-shrink-0 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>
    </div>
  );
}