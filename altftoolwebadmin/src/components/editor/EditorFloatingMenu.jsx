"use client";

import React from "react";
import { FloatingMenu } from "@tiptap/react";
import { useAltfEditor } from "./EditorProvider.jsx";
import { getSlashCommands } from "./EditorCommands.js";

const QUICK_IDS = ["h1", "h2", "bullet", "task", "image", "table", "quote"];

/**
 * EditorFloatingMenu — quick insert buttons that appear on an empty line
 * (plus a hint that “/” opens the full menu).
 */
export default function EditorFloatingMenu() {
  const { editor, readOnly } = useAltfEditor();
  if (!editor || readOnly) return null;

  const commands = getSlashCommands().filter((command) => QUICK_IDS.includes(command.id));

  return (
    <FloatingMenu
      editor={editor}
      tippyOptions={{ duration: 120, placement: "left" }}
      shouldShow={({ editor: instance, state }) => {
        if (!instance.isEditable) return false;
        const { $from, empty } = state.selection;
        return (
          empty &&
          $from.parent.type.name === "paragraph" &&
          $from.parent.content.size === 0 &&
          $from.depth === 1
        );
      }}
    >
      <div className="altft-floating" role="toolbar" aria-label="Insert block">
        {commands.map((command) => {
          const Icon = command.icon;
          return (
            <button
              key={command.id}
              type="button"
              title={command.label}
              aria-label={command.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => command.run(editor)}
              className="altft-floating__button"
            >
              <Icon size={14} />
            </button>
          );
        })}
        <span className="altft-floating__hint" aria-hidden="true">
          /&nbsp;for more
        </span>
      </div>
    </FloatingMenu>
  );
}
