"use client";

import { Extension } from "@tiptap/core";

/**
 * AnchorIds — keeps `id` attributes on headings so deep links and
 * table-of-contents anchors survive editing. Missing ids are generated
 * from the heading text at export time (see EditorUtils.ensureHeadingIds).
 */
export const AnchorIds = Extension.create({
  name: "anchorIds",

  addGlobalAttributes() {
    return [
      {
        types: ["heading"],
        attributes: {
          id: {
            default: null,
            parseHTML: (element) => element.getAttribute("id"),
            renderHTML: (attributes) => (attributes.id ? { id: attributes.id } : {}),
          },
        },
      },
    ];
  },
});

export default AnchorIds;
