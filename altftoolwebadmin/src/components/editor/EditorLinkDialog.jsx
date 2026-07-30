"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, Globe, TriangleAlert, X } from "lucide-react";
import { useAltfEditor } from "./EditorProvider.jsx";

function validateUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) return { ok: false, reason: "URL required" };
  if (value.startsWith("#") || value.startsWith("/")) {
    return { ok: true, kind: "internal", href: value };
  }
  if (/^mailto:/i.test(value)) return { ok: true, kind: "mailto", href: value };
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return { ok: false, reason: "Invalid hostname" };
    const internal =
      typeof window !== "undefined" &&
      (url.hostname === window.location.hostname ||
        url.hostname === "altftool.com" ||
        url.hostname.endsWith(".altftool.com"));
    return { ok: true, kind: internal ? "internal" : "external", href: withProtocol };
  } catch {
    return { ok: false, reason: "Not a valid URL" };
  }
}

/**
 * EditorLinkDialog — insert/edit links with validation, internal/external
 * detection, and an "open in new tab" toggle.
 */
export default function EditorLinkDialog({ open, onClose }) {
  const { editor } = useAltfEditor();
  const [url, setUrl] = useState("");
  const [newTab, setNewTab] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open || !editor) return undefined;
    const attrs = editor.getAttributes("link");
    setUrl(attrs.href || "");
    setNewTab(attrs.target === "_blank");
    window.setTimeout(() => inputRef.current?.focus(), 30);

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, editor, onClose]);

  if (!open || !editor) return null;

  const validation = validateUrl(url);

  function apply(event) {
    event?.preventDefault?.();
    if (!validation.ok) return;
    const attrs = {
      href: validation.href,
      target: newTab ? "_blank" : null,
      rel: newTab ? "noopener noreferrer" : null,
    };
    // With no selection (and not already on a link) setLink has no text to
    // mark, so nothing gets inserted. Insert the URL itself as the link text
    // instead, so the link actually appears.
    if (editor.state.selection.empty && !editor.isActive("link")) {
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: validation.href, marks: [{ type: "link", attrs }] })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink(attrs).run();
    }
    onClose();
  }

  function remove() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    onClose();
  }

  return (
    <div className="altft-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label="Insert link"
        className="altft-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={apply}
      >
        <div className="altft-dialog__header">
          <h3>Link</h3>
          <button type="button" aria-label="Close" onClick={onClose}>
            <X size={15} />
          </button>
        </div>

        <label className="altft-dialog__label" htmlFor="altft-link-url">
          URL
        </label>
        <input
          id="altft-link-url"
          ref={inputRef}
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.com or /blogs/my-post or #anchor"
          spellCheck={false}
          className="altft-dialog__input"
        />

        <p className={`altft-dialog__hint ${validation.ok ? "" : "is-error"}`}>
          {validation.ok ? (
            <>
              {validation.kind === "external" ? <ExternalLink size={12} /> : <Globe size={12} />}
              {validation.kind === "external"
                ? "External link"
                : validation.kind === "mailto"
                  ? "Email link"
                  : "Internal link"}
            </>
          ) : (
            <>
              <TriangleAlert size={12} />
              {url.trim() ? validation.reason : "Enter a URL"}
            </>
          )}
        </p>

        <label className="altft-dialog__checkbox">
          <input
            type="checkbox"
            checked={newTab}
            onChange={(event) => setNewTab(event.target.checked)}
          />
          Open in new tab
        </label>

        <div className="altft-dialog__actions">
          {editor.isActive("link") && (
            <button type="button" className="is-danger" onClick={remove}>
              Remove link
            </button>
          )}
          <span className="altft-dialog__spacer" />
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="is-primary" disabled={!validation.ok}>
            <Check size={13} /> Apply
          </button>
        </div>
      </form>
    </div>
  );
}
