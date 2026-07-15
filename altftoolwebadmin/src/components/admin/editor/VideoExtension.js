import { Node, mergeAttributes } from "@tiptap/core";

export const FirebaseVideo = Node.create({
  name: "firebaseVideo",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
        getAttrs: (element) => ({
          src: element.getAttribute("src"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        style:
          "position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5rem 0;",
        class: "video-wrapper-container",
      },
      [
        "video",
        mergeAttributes(HTMLAttributes, {
          controls: "",
          style:
            "position:absolute;top:0;left:0;width:100%;height:100%;border:0;",
          preload: "metadata",
          controlslist: "nodownload",
        }),
      ],
    ];
  },
});
