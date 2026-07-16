"use client";

import { Node, mergeAttributes } from "@tiptap/core";

/**
 * FirebaseVideo — renders direct video URLs (Firebase Storage, any MP4/WebM)
 * as a native, responsive <video> element instead of an iframe.
 *
 * Parses both shapes that exist in already-saved posts:
 *   <video src="…">                                  (bare tag)
 *   <div style="position:relative…"><video …></div>  (old CKEditor output)
 * and always serializes back to the wrapped, responsive form so the
 * public blog renderer keeps working unchanged.
 */
export const FirebaseVideo = Node.create({
  name: "firebaseVideo",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video[src]",
        getAttrs: (element) => ({ src: element.getAttribute("src") }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        "data-altft-video": "true",
        style:
          "position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5rem 0;border-radius:12px;",
      },
      [
        "video",
        mergeAttributes(HTMLAttributes, {
          controls: "",
          style: "position:absolute;top:0;left:0;width:100%;height:100%;border:0;",
          preload: "metadata",
          controlslist: "nodownload",
        }),
        "Your browser does not support the video tag.",
      ],
    ];
  },

  addCommands() {
    return {
      setFirebaseVideo:
        (src) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { src } }),
    };
  },
});

export default FirebaseVideo;
