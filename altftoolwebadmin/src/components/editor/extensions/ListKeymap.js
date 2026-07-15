"use client";

import { Extension } from "@tiptap/core";

/**
 * ListKeymap — Tab / Shift+Tab nesting for bullet & ordered lists.
 * (Tiptap only binds these for task items by default.) When the caret is
 * not inside a list item the commands return false, so Tab keeps its
 * normal browser behaviour.
 */
export const ListKeymap = Extension.create({
  name: "listTabKeymap",

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive("listItem")) {
          return this.editor.commands.sinkListItem("listItem");
        }
        return false;
      },
      "Shift-Tab": () => {
        if (this.editor.isActive("listItem")) {
          return this.editor.commands.liftListItem("listItem");
        }
        return false;
      },
    };
  },
});

export default ListKeymap;
