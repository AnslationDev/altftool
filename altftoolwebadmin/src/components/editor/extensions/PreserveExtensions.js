"use client";

import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Content-preservation layer.
 *
 * ProseMirror normalizes HTML on load, which would silently destroy two
 * things our saved posts rely on:
 *
 * 1. HTML comments (`<!-- … -->`) — the Writing Helper and FAQ blocks use
 *    them as section markers. We tunnel comments through the editor as an
 *    atom node and restore them verbatim on output.
 * 2. <iframe> embeds (YouTube/Vimeo previews saved by the old CKEditor
 *    MediaEmbed). We keep them as an atom node so old posts round-trip.
 */

/* ------------------------------ HTML comments ------------------------------ */

const COMMENT_TAG = "altft-comment";

/** Convert raw HTML comments into parseable placeholder tags. */
export function htmlToEditor(html) {
  return String(html || "").replace(
    /<!--([\s\S]*?)-->/g,
    (match, body) => `<${COMMENT_TAG} data-body="${encodeURIComponent(body)}"></${COMMENT_TAG}>`,
  );
}

/** Convert placeholder tags back into real HTML comments. */
export function editorToHtml(html) {
  return String(html || "").replace(
    new RegExp(`<${COMMENT_TAG} data-body="([^"]*)"></${COMMENT_TAG}>`, "g"),
    (match, body) => `<!--${decodeURIComponent(body)}-->`,
  );
}

export const HtmlComment = Node.create({
  name: "htmlComment",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      body: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: COMMENT_TAG,
        getAttrs: (element) => ({ body: element.getAttribute("data-body") || "" }),
      },
    ];
  },

  renderHTML({ node }) {
    return [COMMENT_TAG, { "data-body": node.attrs.body }];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.className = "altft-editor-comment";
      let label = "";
      try {
        label = decodeURIComponent(node.attrs.body || "").trim();
      } catch {
        label = node.attrs.body || "";
      }
      dom.textContent = `<!-- ${label.length > 64 ? `${label.slice(0, 64)}…` : label} -->`;
      dom.title = "HTML comment — preserved exactly in the saved content";
      dom.contentEditable = "false";
      return { dom };
    };
  },
});

/* --------------------------------- iframes --------------------------------- */

export const RawIframe = Node.create({
  name: "rawIframe",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: null },
      height: { default: null },
      allow: { default: null },
      allowfullscreen: { default: null },
      frameborder: { default: null },
      style: { default: null },
      title: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["iframe", mergeAttributes(HTMLAttributes)];
  },
});
