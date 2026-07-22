"use client";

import { useMemo, useState } from "react";
import {
  Settings2,
  ChevronDown,
  LayoutGrid,
  Image as ImageIcon,
  History,
  Maximize2,
  PanelRightClose,
  RotateCcw,
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

/**
 * The genuinely functional toggle/dropdown controls on this page. These
 * change how the Support Settings PAGE itself behaves (not a real OS
 * setting — a website can't flip a real Bluetooth switch), persisted via
 * usePagePreferences (localStorage). Collapsed by default to keep the page
 * from feeling cluttered on first visit; the trigger row always shows a
 * live one-line summary of the current settings, collapsed or not.
 */
const PagePreferencesPanel = ({ prefs, togglePref, updatePref, resetPrefs }) => {
  const [open, setOpen] = useState(false);

  const summary = useMemo(() => {
    const parts = [`${TEXT_SIZE_LABELS[prefs.textSize] || "Medium"} text`];
    parts.push(prefs.showStepImages ? "Images on" : "Images off");
    if (prefs.compactCards) parts.push("Compact cards");
    if (prefs.focusMode) parts.push("Focus Mode");
    return parts.join(" · ");
  }, [prefs]);

  const isCustomized = Object.keys(DEFAULT_PAGE_PREFS).some(
    (key) => prefs[key] !== DEFAULT_PAGE_PREFS[key],
  );

  return (
    <section className="support-prefs-panel" aria-label="Page preferences">
      <button
        type="button"
        className="support-prefs-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span>
          <Settings2 className="h-4 w-4" />
          <span className="support-prefs-trigger-text">
            Customize This Page
            <span className="support-prefs-summary">{summary}</span>
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`support-prefs-body ${open ? "support-prefs-body-open" : ""}`}
        aria-hidden={!open}
      >
        <p className="support-prefs-group-label">Display</p>
        <Toggle
          id="pref-compact-cards"
          icon={LayoutGrid}
          label="Compact card view"
          description="Show more cards per row on the landing page's popular & recommended rows."
          checked={prefs.compactCards}
          onChange={() => togglePref("compactCards")}
        />

        <Field label="Text size" className="support-prefs-textsize-field">
          <div className="support-textsize-segmented" role="radiogroup" aria-label="Text size">
            {TEXT_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                role="radio"
                aria-checked={prefs.textSize === size.value}
                className={`support-textsize-option ${
                  prefs.textSize === size.value ? "support-textsize-option-active" : ""
                }`}
                onClick={() => updatePref("textSize", size.value)}
              >
                <span className={`support-textsize-sample support-textsize-sample-${size.value}`}>Aa</span>
                <span className="support-textsize-caption">{size.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <p className="support-prefs-group-label support-prefs-group-label-spaced">Behavior</p>
        <Toggle
          id="pref-show-images"
          icon={ImageIcon}
          label="Show step-by-step images"
          description="Show the reference screenshot on settings that include one."
          checked={prefs.showStepImages}
          onChange={() => togglePref("showStepImages")}
        />
        <Toggle
          id="pref-remember-last"
          icon={History}
          label="Remember my recently used settings"
          description="Keep the Recently Used row filled in on your next visit."
          checked={prefs.rememberLastVisited}
          onChange={() => togglePref("rememberLastVisited")}
        />

        <p className="support-prefs-group-label support-prefs-group-label-spaced">Reading Experience</p>
        <Toggle
          id="pref-focus-mode"
          icon={Maximize2}
          label="Focus Mode"
          description="Hide the sponsored panel and widen the article — same as the Focus Mode button above any page."
          checked={prefs.focusMode}
          onChange={() => togglePref("focusMode")}
        />
        <Toggle
          id="pref-sponsored-collapsed"
          icon={PanelRightClose}
          label="Collapse sponsored panel"
          description="Shrink the sponsored panel to a thin strip on the right."
          checked={prefs.sponsoredCollapsed}
          onChange={() => togglePref("sponsoredCollapsed")}
        />

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
