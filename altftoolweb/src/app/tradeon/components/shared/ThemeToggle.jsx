// src/app/tradeon/components/shared/ThemeToggle.jsx
"use client";

import { useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTradeonTheme } from "../../hooks/tradeonTheme";
import { useClickOutside } from "../../hooks/useClickOutside";

const THEME_OPTIONS = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

export default function ThemeToggle({ className = "" }) {
  const { theme, themeMode, setTheme } = useTradeonTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useClickOutside(() => setOpen(false), open);
  const isDark = theme === "dark";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`tdn-btn tdn-btn-icon ${className}`}
        aria-label="Choose appearance"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Appearance"
      >
        {themeMode === "system" ? <Monitor size={17} /> : isDark ? <Moon size={17} /> : <Sun size={17} />}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Appearance"
          className="absolute right-0 top-full z-[210] mt-2 w-40 rounded-lg p-1 shadow-[var(--tdn-shadow-lg)]"
          style={{ background: "var(--tdn-surface-solid)", border: "1px solid var(--tdn-border-strong)" }}
        >
          {THEME_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={themeMode === value}
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className="flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 text-left text-sm"
              style={{
                color: themeMode === value ? "var(--tdn-iris-2)" : "var(--tdn-fg)",
                background: themeMode === value ? "color-mix(in srgb, var(--tdn-iris) 10%, transparent)" : "transparent",
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
              {themeMode === value && <Check className="ml-auto" size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
