"use client";

import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import { EditorSlashMenuList } from "../EditorSlashMenu.jsx";
import { getSlashCommands } from "../EditorCommands.js";

/**
 * SlashCommands — type "/" on an empty line (or anywhere) to open the
 * insert menu. Backed by the shared command registry, rendered without
 * tippy: a portal positioned at the caret rect.
 */
export const SlashCommands = Extension.create({
  name: "slashCommands",

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        allowSpaces: false,
        startOfLine: false,
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run();
          props.run(editor);
        },
        items: ({ query }) => {
          const q = query.toLowerCase();
          return getSlashCommands().filter(
            (item) =>
              item.label.toLowerCase().includes(q) ||
              item.keywords.some((keyword) => keyword.includes(q)),
          );
        },
        render: () => {
          let renderer = null;
          let container = null;

          // Defer DOM removal so React finishes unmounting the portal first —
          // removing the container synchronously throws NotFoundError inside
          // React's commit phase.
          const cleanup = () => {
            const r = renderer;
            const c = container;
            renderer = null;
            container = null;
            if (!r && !c) return;
            window.setTimeout(() => {
              try {
                r?.destroy();
              } finally {
                c?.remove();
              }
            }, 0);
          };

          const position = (clientRect) => {
            if (!container || !clientRect) return;
            const rect = clientRect();
            if (!rect) return;
            const menuHeight = Math.min(320, container.offsetHeight || 320);
            const below = rect.bottom + 6;
            const flip = below + menuHeight > window.innerHeight;
            container.style.left = `${Math.min(rect.left, window.innerWidth - 288)}px`;
            container.style.top = flip
              ? `${Math.max(8, rect.top - menuHeight - 6)}px`
              : `${below}px`;
          };

          return {
            onStart: (props) => {
              container = document.createElement("div");
              container.className = "altft-slash-portal";
              document.body.appendChild(container);
              renderer = new ReactRenderer(EditorSlashMenuList, {
                props,
                editor: props.editor,
              });
              container.appendChild(renderer.element);
              position(props.clientRect);
            },
            onUpdate: (props) => {
              renderer?.updateProps(props);
              position(props.clientRect);
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                cleanup();
                return true;
              }
              return renderer?.ref?.onKeyDown?.(props) ?? false;
            },
            onExit: cleanup,
          };
        },
      }),
    ];
  },
});

export default SlashCommands;
