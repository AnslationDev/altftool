"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent } from "@tiptap/react";
import { History } from "lucide-react";
import EditorProvider, { useAltfEditor } from "../editor/EditorProvider.jsx";
import EditorToolbar from "../editor/EditorToolbar.jsx";
import EditorBubbleMenu from "../editor/EditorBubbleMenu.jsx";
import EditorFloatingMenu from "../editor/EditorFloatingMenu.jsx";
import EditorTableMenu from "../editor/EditorTableMenu.jsx";
import EditorContextMenu from "../editor/EditorContextMenu.jsx";
import EditorCommandPalette from "../editor/EditorCommandPalette.jsx";
import EditorLinkDialog from "../editor/EditorLinkDialog.jsx";
import EditorSeoPanel from "../editor/EditorSeoPanel.jsx";
import EditorStatusBar from "../editor/EditorStatusBar.jsx";
import { htmlToEditor } from "../editor/EditorUtils.js";

/**
 * CustomBlogEditor — ALTFTool's in-house rich-text editor.
 * A thin composition over the modular editor suite in components/editor/.
 *
 * Contract (drop-in CKEditor replacement):
 *   value    — HTML string in
 *   onChange — HTML string out (sanitised, anchor-ready, comments intact)
 *   error    — optional danger border (form validation)
 *   readOnly — optional read-only mode
 *   draftKey — optional key enabling local autosave + draft recovery
 */

function EditorShell({ error, onEmitFromSource }) {
  const { editor, readOnly, draft, emit } = useAltfEditor();
  const containerRef = useRef(null);
  const [isSourceView, setIsSourceView] = useState(false);
  const [sourceDraft, setSourceDraft] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [seoRefresh, setSeoRefresh] = useState(0);

  /* fullscreen: lock scroll + Esc */
  useEffect(() => {
    if (!isFullscreen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isFullscreen]);

  /* ⌘K / Ctrl+K → command palette (link dialog when text is selected) */
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (!containerRef.current?.contains(document.activeElement)) return;
        event.preventDefault();
        if (editor && !editor.state.selection.empty) {
          setLinkOpen(true);
        } else {
          setPaletteOpen(true);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor]);

  /* refresh the SEO audit while the panel is open */
  useEffect(() => {
    if (!seoOpen || !editor) return undefined;
    const refresh = () => setSeoRefresh((tick) => tick + 1);
    editor.on("update", refresh);
    return () => editor.off("update", refresh);
  }, [seoOpen, editor]);

  const toggleSource = useCallback(() => {
    if (!editor) return;
    if (isSourceView) {
      editor.commands.setContent(htmlToEditor(sourceDraft), false);
      setIsSourceView(false);
    } else {
      setSourceDraft(onEmitFromSource.current?.latest ?? "");
      setIsSourceView(true);
    }
  }, [editor, isSourceView, sourceDraft, onEmitFromSource]);

  if (!editor) {
    return (
      <div className="flex min-h-[480px] items-center justify-center rounded-xl border border-border bg-surface text-sm font-semibold text-muted">
        Loading editor…
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-ckeditor-ready="true"
      className={`altft-editor altft-shell flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 ${
        error ? "border-danger" : "border-border"
      } ${isFullscreen ? "fixed inset-0 z-[100] h-screen w-screen rounded-none" : "min-h-[540px]"} ${
        focusMode ? "is-focus" : ""
      } ${readOnly ? "is-readonly" : ""}`}
    >
      <EditorToolbar
        onOpenLink={() => setLinkOpen(true)}
        onToggleSource={toggleSource}
        isSourceView={isSourceView}
        onToggleFullscreen={() => setIsFullscreen((state) => !state)}
        isFullscreen={isFullscreen}
        onToggleFocusMode={() => setFocusMode((state) => !state)}
        focusMode={focusMode}
        onOpenPalette={() => setPaletteOpen(true)}
        onToggleSeo={() => setSeoOpen((state) => !state)}
        seoOpen={seoOpen}
      />

      {!isSourceView && <EditorTableMenu />}

      {draft.available && (
        <div className="altft-draft" role="status">
          <History size={13} aria-hidden="true" />
          Unsaved draft found
          {draft.savedAt ? ` (${new Date(draft.savedAt).toLocaleString()})` : ""} — restore it?
          <button type="button" className="is-primary" onClick={draft.restore}>
            Restore draft
          </button>
          <button type="button" onClick={draft.discard}>
            Discard
          </button>
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden bg-surface">
        <div className="min-w-0 flex-1 overflow-y-auto">
          {isSourceView ? (
            <textarea
              value={sourceDraft}
              onChange={(event) => {
                const next = event.target.value;
                setSourceDraft(next);
                emit(next);
              }}
              spellCheck={false}
              aria-label="Blog HTML source editor"
              className="h-full min-h-[440px] w-full resize-none border-0 bg-[#0b1220] p-6 font-mono text-[13px] leading-6 text-slate-100 outline-none"
            />
          ) : (
            <EditorContent editor={editor} />
          )}
        </div>
        <EditorSeoPanel open={seoOpen && !isSourceView} onClose={() => setSeoOpen(false)} refreshKey={seoRefresh} />
      </div>

      <EditorStatusBar mode={isSourceView ? "HTML Source" : focusMode ? "Focus" : "Visual"} />

      {!isSourceView && (
        <>
          <EditorBubbleMenu onEditLink={() => setLinkOpen(true)} />
          <EditorFloatingMenu />
          <EditorContextMenu containerRef={containerRef} />
        </>
      )}

      <EditorLinkDialog open={linkOpen} onClose={() => setLinkOpen(false)} />
      <EditorCommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

export default function CustomBlogEditor({
  value,
  onChange,
  placeholder,
  error = false,
  readOnly = false,
  draftKey = null,
}) {
  // Track the latest emitted HTML so the source view opens with fresh content.
  const latestRef = useRef({ latest: value || "" });

  const handleChange = useCallback(
    (html) => {
      latestRef.current.latest = html;
      onChange?.(html);
    },
    [onChange],
  );

  useEffect(() => {
    latestRef.current.latest = value || "";
  }, [value]);

  return (
    <EditorProvider
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      readOnly={readOnly}
      draftKey={draftKey}
    >
      <EditorShell error={error} onEmitFromSource={latestRef} />
    </EditorProvider>
  );
}
