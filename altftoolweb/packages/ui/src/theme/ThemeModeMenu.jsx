"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { cn } from "../lib/cn.js";
import { IconButton } from "../primitives/actions.jsx";

export const THEME_MODE_OPTIONS = Object.freeze([
  { value: "system", label: "System theme", icon: Monitor },
  { value: "light", label: "Light mode", icon: Sun },
  { value: "dark", label: "Dark mode", icon: Moon },
]);

export function ThemeModeSelector({
  autoFocusSelected = false,
  className,
  value = "system",
  onChange,
  size = "md",
}) {
  const optionRefs = useRef([]);

  useEffect(() => {
    if (!autoFocusSelected) return;
    const selectedIndex = THEME_MODE_OPTIONS.findIndex(
      (option) => option.value === value,
    );
    optionRefs.current[selectedIndex < 0 ? 0 : selectedIndex]?.focus();
  }, [autoFocusSelected, value]);

  const selectAtIndex = (index) => {
    const normalizedIndex =
      (index + THEME_MODE_OPTIONS.length) % THEME_MODE_OPTIONS.length;
    const option = THEME_MODE_OPTIONS[normalizedIndex];
    onChange?.(option.value);
    optionRefs.current[normalizedIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Theme mode"
      className={cn("alt-ui-theme-selector", className)}
    >
      {THEME_MODE_OPTIONS.map((option, index) => {
        const OptionIcon = option.icon;
        const selected = option.value === value;

        return (
          <button
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange?.(option.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                selectAtIndex(index + 1);
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                selectAtIndex(index - 1);
              } else if (event.key === "Home") {
                event.preventDefault();
                selectAtIndex(0);
              } else if (event.key === "End") {
                event.preventDefault();
                selectAtIndex(THEME_MODE_OPTIONS.length - 1);
              }
            }}
            className={cn(
              "alt-ui-theme-option",
              `alt-ui-theme-option--${size}`,
              selected && "alt-ui-theme-option--selected",
            )}
          >
            <OptionIcon aria-hidden="true" />
            {selected ? (
              <Check
                className="alt-ui-theme-option__check"
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function ThemeModeMenu({
  align = "right",
  className,
  hydrated = true,
  onChange,
  value = "system",
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const currentValue = hydrated ? value : "system";
  const currentOption =
    THEME_MODE_OPTIONS.find((option) => option.value === currentValue) ||
    THEME_MODE_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  useEffect(() => {
    if (!open) return undefined;

    const closeOnPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className={cn("alt-ui-theme-menu", className)} ref={menuRef}>
      <IconButton
        ref={triggerRef}
        type="button"
        variant="secondary"
        aria-label={`Theme: ${currentOption.label}`}
        aria-haspopup="true"
        aria-expanded={open}
        title={`Theme: ${currentOption.label}`}
        onClick={() => setOpen((current) => !current)}
      >
        <CurrentIcon aria-hidden="true" />
      </IconButton>

      {open ? (
        <div
          aria-label="Theme mode"
          className={cn(
            "alt-ui-theme-menu__popover",
            `alt-ui-theme-menu__popover--${align}`,
          )}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setOpen(false);
            }
          }}
        >
          <ThemeModeSelector
            autoFocusSelected
            value={currentValue}
            onChange={(nextValue) => {
              onChange?.(nextValue);
              setOpen(false);
              window.requestAnimationFrame(() => triggerRef.current?.focus());
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
