"use client";

import { useRef, useEffect } from "react";

export default function EditorPanel({ label, value, onChange, placeholder = "Paste or type text here...", color = "primary" }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center justify-between px-3 py-2 border-b border-(--border) bg-(--muted) rounded-t-xl`}>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color === "primary" ? "var(--primary)" : "var(--secondary)" }}
          />
          <span className="text-xs font-semibold text-(--foreground)">{label}</span>
        </div>
        <span className="text-[10px] text-(--muted-foreground)">{value.length} chars</span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="flex-1 w-full min-h-[180px] px-3 py-3 text-sm font-mono bg-(--card) text-(--foreground) resize-none transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-(--primary)/25 rounded-b-xl leading-relaxed motion-reduce:transition-none"
        spellCheck={false}
      />
    </div>
  );
}
