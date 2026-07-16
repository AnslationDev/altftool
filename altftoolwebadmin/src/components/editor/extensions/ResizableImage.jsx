"use client";

import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import React, { useCallback, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Captions,
  ImageUp,
  Trash2,
  Type,
} from "lucide-react";

/**
 * ResizableImage — Image node with:
 *   drag-to-resize handles · alignment · alt text · caption (figure/figcaption)
 *   lazy loading · responsive output · replace · delete
 *
 * Serializes to:
 *   <figure data-align="center" style="…"><img …/><figcaption>…</figcaption></figure>
 * or a bare <img> when no caption is set (keeps old posts' markup shape).
 */

function ImageView({ node, updateAttributes, deleteNode, selected, editor }) {
  const { src, alt, title, width, align, caption } = node.attrs;
  const wrapperRef = useRef(null);
  const fileRef = useRef(null);
  const [resizing, setResizing] = useState(false);

  const startResize = useCallback(
    (event, direction) => {
      event.preventDefault();
      event.stopPropagation();
      const wrapper = wrapperRef.current;
      const img = wrapper?.querySelector("img");
      if (!img || !wrapper) return;
      const startX = event.clientX;
      const startWidth = img.getBoundingClientRect().width;
      const parentWidth =
        wrapper.closest(".ProseMirror")?.getBoundingClientRect().width || 800;
      setResizing(true);

      // Resize live via a plain style write (cheap, no document mutation), then
      // commit the final width to the node ONCE on mouse-up. Updating the
      // attribute on every mousemove flooded the debounced onChange and pushed
      // one undo entry per pixel dragged.
      let nextWidth = Math.round(startWidth);
      const onMove = (moveEvent) => {
        const delta = (moveEvent.clientX - startX) * (direction === "left" ? -1 : 1);
        nextWidth = Math.round(Math.min(parentWidth, Math.max(80, startWidth + delta)));
        wrapper.style.width = `${nextWidth}px`;
      };
      const onUp = () => {
        setResizing(false);
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        updateAttributes({ width: nextWidth });
      };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [updateAttributes],
  );

  const replaceImage = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => updateAttributes({ src: String(reader.result) });
      reader.readAsDataURL(file);
    },
    [updateAttributes],
  );

  const editAlt = useCallback(() => {
    const next = window.prompt("Alt text (describes the image for SEO & screen readers):", alt || "");
    if (next !== null) updateAttributes({ alt: next });
  }, [alt, updateAttributes]);

  const toggleCaption = useCallback(() => {
    if (caption === null || caption === undefined) {
      updateAttributes({ caption: "" });
    } else {
      updateAttributes({ caption: null });
    }
  }, [caption, updateAttributes]);

  const editable = editor?.isEditable;

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      as="figure"
      data-align={align || "center"}
      className={`altft-image ${selected ? "is-selected" : ""} ${resizing ? "is-resizing" : ""}`}
      style={{ width: width ? `${width}px` : undefined }}
      data-drag-handle
    >
      <div className="altft-image__frame" contentEditable={false}>
        <img
          src={src}
          alt={alt || ""}
          title={title || undefined}
          loading="lazy"
          draggable={false}
        />

        {editable && selected && (
          <>
            {/* resize handles */}
            <span
              role="presentation"
              className="altft-image__handle altft-image__handle--left"
              onMouseDown={(event) => startResize(event, "left")}
            />
            <span
              role="presentation"
              className="altft-image__handle altft-image__handle--right"
              onMouseDown={(event) => startResize(event, "right")}
            />

            {/* mini toolbar */}
            <span className="altft-image__toolbar" contentEditable={false}>
              {[
                { icon: AlignLeft, value: "left", label: "Align left" },
                { icon: AlignCenter, value: "center", label: "Align center" },
                { icon: AlignRight, value: "right", label: "Align right" },
              ].map(({ icon: Icon, value, label }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  aria-label={label}
                  className={align === value ? "is-active" : ""}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => updateAttributes({ align: value })}
                >
                  <Icon size={13} />
                </button>
              ))}
              <span className="altft-image__toolbar-divider" />
              <button
                type="button"
                title={alt ? `Alt: ${alt}` : "Add alt text (missing!)"}
                aria-label="Edit alt text"
                className={alt ? "" : "is-warning"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={editAlt}
              >
                <Type size={13} />
              </button>
              <button
                type="button"
                title={caption === null || caption === undefined ? "Add caption" : "Remove caption"}
                aria-label="Toggle caption"
                className={caption !== null && caption !== undefined ? "is-active" : ""}
                onMouseDown={(event) => event.preventDefault()}
                onClick={toggleCaption}
              >
                <Captions size={13} />
              </button>
              <button
                type="button"
                title="Replace image"
                aria-label="Replace image"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => fileRef.current?.click()}
              >
                <ImageUp size={13} />
              </button>
              <span className="altft-image__toolbar-divider" />
              <button
                type="button"
                title="Delete image"
                aria-label="Delete image"
                className="is-danger"
                onMouseDown={(event) => event.preventDefault()}
                onClick={deleteNode}
              >
                <Trash2 size={13} />
              </button>
            </span>
          </>
        )}
      </div>

      {caption !== null && caption !== undefined && (
        <figcaption contentEditable={false}>
          <input
            type="text"
            value={caption}
            placeholder="Write a caption…"
            aria-label="Image caption"
            disabled={!editable}
            onChange={(event) => updateAttributes({ caption: event.target.value })}
          />
        </figcaption>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={replaceImage}
      />
    </NodeViewWrapper>
  );
}

export const ResizableImage = Image.extend({
  name: "image",
  draggable: true,

  addOptions() {
    return { ...this.parent?.(), allowBase64: true, inline: false };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const raw =
            element.getAttribute("width") ||
            element.style.width ||
            element.closest("figure")?.style.width;
          const parsed = Number.parseInt(raw, 10);
          return Number.isFinite(parsed) ? parsed : null;
        },
      },
      align: {
        // null = "no explicit alignment" → serialize as a bare <img> so old
        // posts keep their exact markup. Only an explicit left/right/center
        // (or a caption/width) promotes the image to a <figure> wrapper.
        default: null,
        parseHTML: (element) =>
          element.closest("figure")?.getAttribute("data-align") ||
          element.getAttribute("data-align") ||
          null,
      },
      caption: {
        default: null,
        parseHTML: (element) => {
          const figcaption = element.closest("figure")?.querySelector("figcaption");
          return figcaption ? figcaption.textContent : null;
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: "figure img[src]" },
      { tag: "img[src]" },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, title, width, align, caption } = node.attrs;
    const imgAttrs = {
      src,
      alt: alt || "",
      ...(title ? { title } : {}),
      loading: "lazy",
      ...(width ? { width } : {}),
      style: "max-width:100%;height:auto;",
    };

    const hasCaption = caption !== null && caption !== undefined && caption !== "";
    const hasAlign = align === "left" || align === "right" || align === "center";

    // Nothing special (no caption, no width, no explicit alignment) → keep the
    // original bare <img> markup instead of silently rewrapping every image in
    // a <figure> with forced centering on each save.
    if (!hasCaption && !width && !hasAlign) {
      return ["img", imgAttrs];
    }

    const figureStyle = [
      width ? `width:${width}px` : null,
      "max-width:100%",
      align === "left"
        ? "margin:1em auto 1em 0"
        : align === "right"
          ? "margin:1em 0 1em auto"
          : "margin:1em auto",
    ]
      .filter(Boolean)
      .join(";");

    const figureAttrs = { ...(align ? { "data-align": align } : {}), style: figureStyle };

    if (hasCaption) {
      return [
        "figure",
        figureAttrs,
        ["img", imgAttrs],
        ["figcaption", { style: "text-align:center;font-size:0.85em;opacity:0.75;margin-top:6px;" }, caption],
      ];
    }

    return ["figure", figureAttrs, ["img", imgAttrs]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});

export default ResizableImage;
