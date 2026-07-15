"use client";

import React from "react";
import { CloudCheck, CloudUpload, Eye, Timer } from "lucide-react";
import { useAltfEditor } from "./EditorProvider.jsx";
import { readingTime } from "./EditorUtils.js";

/**
 * EditorStatusBar — word/char count, reading time, autosave state,
 * read-only badge, and the current view mode.
 */
export default function EditorStatusBar({ mode = "Visual" }) {
  const { editor, readOnly, saveState } = useAltfEditor();
  if (!editor) return null;

  const words = editor.storage.characterCount?.words?.() ?? 0;
  const characters = editor.storage.characterCount?.characters?.() ?? 0;

  return (
    <div className="altft-statusbar" aria-live="polite">
      <span>
        {words.toLocaleString()} words · {characters.toLocaleString()} characters
        <span className="altft-statusbar__dot" aria-hidden="true" />
        <Timer size={11} aria-hidden="true" /> {readingTime(words)} min read
      </span>
      <span className="altft-statusbar__right">
        {readOnly && (
          <span className="altft-statusbar__badge">
            <Eye size={11} /> Read-only
          </span>
        )}
        {saveState === "saving" && (
          <span className="altft-statusbar__badge">
            <CloudUpload size={11} /> Saving draft…
          </span>
        )}
        {saveState === "saved" && (
          <span className="altft-statusbar__badge is-ok">
            <CloudCheck size={11} /> Draft saved
          </span>
        )}
        <span className="altft-statusbar__mode">{mode}</span>
      </span>
    </div>
  );
}
