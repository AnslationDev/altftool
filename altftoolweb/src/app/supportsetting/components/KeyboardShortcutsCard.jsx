"use client";

import { Kbd, SectionHeader } from "@altftool/ui";

const SHORTCUTS = [
  { keys: ["/"], description: "Focus the search box" },
  { keys: ["Esc"], description: "Close the search or mobile sidebar" },
  { keys: ["F"], description: "Toggle Focus Mode while viewing a support page" },
];

/**
 * Purely documents shortcuts that are genuinely wired up in
 * SupportClient's keydown handler — nothing here is decorative.
 */
const KeyboardShortcutsCard = () => (
  <section className="support-utility-section" aria-label="Keyboard shortcuts">
    <SectionHeader title="Keyboard Shortcuts" description="Move around this page faster." />
    <ul className="support-shortcut-list">
      {SHORTCUTS.map((shortcut) => (
        <li key={shortcut.description} className="support-shortcut-item">
          <span className="support-shortcut-keys">
            {shortcut.keys.map((key) => (
              <Kbd key={key}>{key}</Kbd>
            ))}
          </span>
          <span>{shortcut.description}</span>
        </li>
      ))}
    </ul>
  </section>
);

export default KeyboardShortcutsCard;
