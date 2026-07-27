"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Settings2,
  ChevronDown,
  Maximize2,
  Contrast,
  Wind,
  Keyboard,
  Globe,
  Star,
  History,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Field } from "@altftool/ui";
import Toggle from "./Toggle";
import { DEFAULT_PAGE_PREFS } from "../data/preferences";

const TEXT_SIZES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];
const TEXT_SIZE_LABELS = { small: "Small", medium: "Medium", large: "Large" };

const READING_WIDTHS = [
  { value: "narrow", label: "Narrow" },
  { value: "comfortable", label: "Comfortable" },
  { value: "wide", label: "Wide" },
];

const LINE_SPACINGS = [
  { value: "compact", label: "Compact" },
  { value: "standard", label: "Standard" },
  { value: "relaxed", label: "Relaxed" },
];

/**
 * Trimmed down to exactly the personalization people actually use, grouped
 * the way a real product settings panel would be: Reading Experience,
 * Accessibility, Preferences. Panel-specific controls (collapsing the
 * Recommended Resources rail) now live on that panel itself, not buried
 * in here — this stays compact, elegant, and entirely optional.
 *
 * Collapsed, this is a small "Customize" pill button — the same size and
 * shape as the Back-to-Home / Focus Mode buttons next to it — rather than
 * a full-width bar sitting on every page. Opening it drops a floating
 * dropdown card below the button (closes on outside click or Escape)
 * instead of pushing the rest of the page's content down.
 */
const PagePreferencesPanel = ({ prefs, togglePref, updatePref, resetPrefs, bookmarkedCount = 0, onClearBookmarks, onClearHistory }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const summary = useMemo(() => {
    const parts = [`${TEXT_SIZE_LABELS[prefs.textSize] || "Medium"} text`];
    if (prefs.focusMode) parts.push("Focus Mode");
    if (prefs.highContrast) parts.push("High contrast");
    if (prefs.reduceMotion) parts.push("Reduced motion");
    return parts.join(" · ");
  }, [prefs]);

  const isCustomized = Object.keys(DEFAULT_PAGE_PREFS).some(
    (key) => prefs[key] !== DEFAULT_PAGE_PREFS[key],
  );

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <section className="support-prefs-panel" aria-label="Page preferences" ref={panelRef}>
      <button
        type="button"
        className="support-prefs-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        title={summary}
      >
        <span>
          <Settings2 className="h-4 w-4" />
          Customize
          {isCustomized && <span className="support-prefs-trigger-dot" aria-hidden="true" />}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`support-prefs-body ${open ? "support-prefs-body-open" : ""}`} aria-hidden={!open}>
        <p className="support-prefs-group-label">Reading Experience</p>

        <Field label="Text size" className="support-prefs-textsize-field">
          <div className="support-textsize-segmented" role="radiogroup" aria-label="Text size">
            {TEXT_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                role="radio"
                aria-checked={prefs.textSize === size.value}
                className={`support-textsize-option ${prefs.textSize === size.value ? "support-textsize-option-active" : ""}`}
                onClick={() => updatePref("textSize", size.value)}
              >
                <span className={`support-textsize-sample support-textsize-sample-${size.value}`}>Aa</span>
                <span className="support-textsize-caption">{size.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Reading width" className="support-prefs-textsize-field">
          <div className="support-textsize-segmented" role="radiogroup" aria-label="Reading width">
            {READING_WIDTHS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={prefs.readingWidth === opt.value}
                className={`support-textsize-option ${prefs.readingWidth === opt.value ? "support-textsize-option-active" : ""}`}
                onClick={() => updatePref("readingWidth", opt.value)}
              >
                <span className="support-textsize-caption">{opt.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Line spacing" className="support-prefs-textsize-field">
          <div className="support-textsize-segmented" role="radiogroup" aria-label="Line spacing">
            {LINE_SPACINGS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={prefs.lineSpacing === opt.value}
                className={`support-textsize-option ${prefs.lineSpacing === opt.value ? "support-textsize-option-active" : ""}`}
                onClick={() => updatePref("lineSpacing", opt.value)}
              >
                <span className="support-textsize-caption">{opt.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Toggle
          id="pref-focus-mode"
          icon={Maximize2}
          label="Focus Mode"
          description="Hide the recommended resources panel and widen the article."
          checked={prefs.focusMode}
          onChange={() => togglePref("focusMode")}
        />

        <p className="support-prefs-group-label support-prefs-group-label-spaced">Accessibility</p>
        <Toggle
          id="pref-high-contrast"
          icon={Contrast}
          label="High contrast"
          description="Increase text and border contrast throughout this page."
          checked={prefs.highContrast}
          onChange={() => togglePref("highContrast")}
        />
        <Toggle
          id="pref-reduce-motion"
          icon={Wind}
          label="Reduce motion"
          description="Turn off transitions and animations, in addition to your system setting."
          checked={prefs.reduceMotion}
          onChange={() => togglePref("reduceMotion")}
        />
        <div className="support-toggle-row support-prefs-static-row">
          <div className="support-toggle-row-main">
            <span className="support-toggle-icon" aria-hidden="true">
              <Keyboard className="h-4 w-4" />
            </span>
            <div className="support-toggle-copy">
              <p className="support-toggle-label">Keyboard navigation</p>
              <p className="support-toggle-description">
                Every control on this page is reachable by Tab, with visible focus outlines — press{" "}
                <kbd className="alt-ui-kbd">/</kbd> to jump to search.
              </p>
            </div>
          </div>
        </div>

        <p className="support-prefs-group-label support-prefs-group-label-spaced">Preferences</p>
        <div className="support-toggle-row support-prefs-static-row">
          <div className="support-toggle-row-main">
            <span className="support-toggle-icon" aria-hidden="true">
              <Globe className="h-4 w-4" />
            </span>
            <div className="support-toggle-copy">
              <p className="support-toggle-label">Language</p>
              <p className="support-toggle-description">English (US) — more languages are on the way.</p>
            </div>
          </div>
        </div>

        <div className="support-toggle-row support-prefs-static-row">
          <div className="support-toggle-row-main">
            <span className="support-toggle-icon" aria-hidden="true">
              <Star className="h-4 w-4" />
            </span>
            <div className="support-toggle-copy">
              <p className="support-toggle-label">Bookmarks</p>
              <p className="support-toggle-description">
                {bookmarkedCount > 0
                  ? `${bookmarkedCount} bookmarked ${bookmarkedCount === 1 ? "page" : "pages"} — visible under Favorite Settings on the home page.`
                  : "Star any guide's header to save it here."}
              </p>
            </div>
          </div>
          {bookmarkedCount > 0 && onClearBookmarks && (
            <button type="button" className="support-prefs-inline-clear" onClick={onClearBookmarks}>
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>

        <Toggle
          id="pref-remember-last"
          icon={History}
          label="Reading history"
          description="Remember settings you've opened so they show up under Continue Where You Left Off."
          checked={prefs.rememberLastVisited}
          onChange={() => togglePref("rememberLastVisited")}
        />
        {onClearHistory && (
          <button type="button" className="support-prefs-inline-clear support-prefs-inline-clear-standalone" onClick={onClearHistory}>
            <Trash2 className="h-3.5 w-3.5" /> Clear reading history
          </button>
        )}

        {isCustomized && (
          <button type="button" className="support-prefs-reset" onClick={resetPrefs}>
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to defaults
          </button>
        )}
      </div>
    </section>
  );
};

export default PagePreferencesPanel;
