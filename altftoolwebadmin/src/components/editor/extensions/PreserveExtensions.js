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

const COMMENT_TAG = "altft-comment"; // block-level marker (own line)
const COMMENT_TAG_INLINE = "altft-comment-i"; // inline marker (mid-text)

// A comment is "block-level" when it sits between tags / on its own line —
// preceded by a closing `>` (or start) and followed by an opening `<` (or end),
// allowing whitespace. Anything embedded inside inline text (e.g.
// `<p>foo <!--x--> bar</p>`) is INLINE: turning it into a block node there
// would split the paragraph and reshape the document.
function isBlockLevelComment(before, after) {
  return /(^|>)\s*$/.test(before) && /^\s*(<|$)/.test(after);
}

/** Convert raw HTML comments into parseable placeholder tags. */
export function htmlToEditor(html) {
  const source = String(html || "");
  return source.replace(/<!--([\s\S]*?)-->/g, (match, body, offset) => {
    const tag = isBlockLevelComment(source.slice(0, offset), source.slice(offset + match.length))
      ? COMMENT_TAG
      : COMMENT_TAG_INLINE;
    return `<${tag} data-body="${encodeURIComponent(body)}"></${tag}>`;
  });
}

/** Convert placeholder tags (block + inline) back into real HTML comments. */
export function editorToHtml(html) {
  let out = String(html || "");
  [COMMENT_TAG, COMMENT_TAG_INLINE].forEach((tag) => {
    out = out.replace(
      new RegExp(`<${tag} data-body="([^"]*)"></${tag}>`, "g"),
      (match, body) => `<!--${decodeURIComponent(body)}-->`,
    );
  });
  return out;
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

/**
 * HtmlCommentInline — the inline sibling of HtmlComment. Comments embedded
 * mid-paragraph tunnel through as an inline atom so they never split the
 * surrounding text on load (see isBlockLevelComment).
 */
export const HtmlCommentInline = Node.create({
  name: "htmlCommentInline",
  group: "inline",
  inline: true,
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
        tag: COMMENT_TAG_INLINE,
        getAttrs: (element) => ({ body: element.getAttribute("data-body") || "" }),
      },
    ];
  },

  renderHTML({ node }) {
    return [COMMENT_TAG_INLINE, { "data-body": node.attrs.body }];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      dom.className = "altft-editor-comment altft-editor-comment--inline";
      let label = "";
      try {
        label = decodeURIComponent(node.attrs.body || "").trim();
      } catch {
        label = node.attrs.body || "";
      }
      dom.textContent = `<!-- ${label.length > 32 ? `${label.slice(0, 32)}…` : label} -->`;
      dom.title = "Inline HTML comment — preserved exactly in the saved content";
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
