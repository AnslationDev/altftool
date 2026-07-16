"use client";

import { Extension } from "@tiptap/core";

/**
 * LineHeight — block-level line-height for paragraphs and headings.
 * Usage: editor.chain().focus().setLineHeight("1.8").run()
 */
export const LineHeight = Extension.create({
  name: "lineHeight",

  addOptions() {
    return { types: ["paragraph", "heading"] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight) =>
        ({ commands }) =>
          this.options.types.every((type) =>
            commands.updateAttributes(type, { lineHeight }),
          ),
      unsetLineHeight:
        () =>
        ({ commands }) =>
          this.options.types.every((type) =>
            commands.updateAttributes(type, { lineHeight: null }),
          ),
    };
  },
});

export const LINE_HEIGHTS = ["1.2", "1.4", "1.65", "1.8", "2.0", "2.4"];

export default LineHeight;
