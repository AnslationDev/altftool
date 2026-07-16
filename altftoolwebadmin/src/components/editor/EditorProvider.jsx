"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Youtube from "@tiptap/extension-youtube";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";
import { Markdown } from "tiptap-markdown";

import { FontSize } from "./extensions/FontSize";
import { LineHeight } from "./extensions/LineHeight";
import { ListKeymap } from "./extensions/ListKeymap";
import { ResizableImage } from "./extensions/ResizableImage.jsx";
import { AnchorIds } from "./extensions/AnchorIds";
import { SlashCommands } from "./extensions/SlashCommands";
import { FirebaseVideo } from "./extensions/VideoExtension";
import { HtmlComment, HtmlCommentInline, RawIframe } from "./extensions/PreserveExtensions";
import { cleanPastedHtml, exportHtml, htmlToEditor } from "./EditorUtils";
import "./editor.css";

const EditorContext = createContext(null);

export function useAltfEditor() {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useAltfEditor must be used inside <EditorProvider>");
  return context;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * EditorProvider — owns the Tiptap instance, the extension stack, content
 * sync (HTML in/out with comment & embed preservation), autosave drafts,
 * and read-only state. UI modules consume it via useAltfEditor().
 *
 * Future-ready: AI actions / collaboration / versioning plug in as extra
 * extensions or context consumers — no rewrite needed.
 */
export default function EditorProvider({
  value,
  onChange,
  placeholder = "Type “/” for commands, or just start writing…",
  readOnly = false,
  draftKey = null,
  children,
}) {
  const sentValuesRef = useRef([value || ""]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [draftState, setDraftState] = useState({ available: false, html: "", savedAt: null });
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const emitTimer = useRef(null);
  // True while a debounced edit is queued but not yet emitted. Used to stop the
  // external-value sync from clobbering in-flight local edits (e.g. an autosave
  // round-trip that echoes transformed HTML back through the value prop).
  const pendingEmitRef = useRef(false);

  const emit = useCallback((html) => {
    sentValuesRef.current = [html, ...sentValuesRef.current].slice(0, 10);
    onChangeRef.current?.(html);
  }, []);

  // The expensive work per edit — a full sanitize + heading-anchor DOM pass
  // plus firing onChange (which makes the host re-run its Publish Gate / live
  // preview). Running this on EVERY keystroke froze large documents, so we
  // DEBOUNCE it: keystrokes only reschedule the timer, and the heavy pass runs
  // once typing pauses. Flushed immediately on blur / unmount so nothing is lost.
  const emitFromInstance = useCallback(
    (instance) => {
      if (!instance || instance.isDestroyed) return;
      pendingEmitRef.current = false;
      const html = exportHtml(instance);
      emit(html);
      if (draftKey) {
        try {
          window.localStorage.setItem(
            `ALTFT_EDITOR_DRAFT:${draftKey}`,
            JSON.stringify({ html, savedAt: Date.now() }),
          );
          setSaveState("saved");
        } catch {
          setSaveState("idle");
        }
      }
    },
    [emit, draftKey],
  );

  const insertImageFiles = useCallback(async (editorInstance, files) => {
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      // eslint-disable-next-line no-await-in-loop
      const dataUrl = await readFileAsDataUrl(file);
      editorInstance.chain().focus().setImage({ src: dataUrl }).run();
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextStyle,
      Color,
      FontSize,
      FontFamily,
      LineHeight,
      ListKeymap,
      Subscript,
      Superscript,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      ResizableImage,
      FirebaseVideo,
      RawIframe,
      HtmlComment,
      HtmlCommentInline,
      AnchorIds,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ nocookie: true, modestBranding: true, HTMLAttributes: {} }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      SlashCommands,
      GlobalDragHandle.configure({ dragHandleWidth: 22, scrollTreshold: 80 }),
      Markdown.configure({ html: true, transformCopiedText: false, transformPastedText: false }),
    ],
    content: htmlToEditor(value || ""),
    editorProps: {
      attributes: {
        "aria-label": "Blog content editor",
        role: "textbox",
        "aria-multiline": "true",
        spellcheck: "true",
      },
      transformPastedHTML: (html) => cleanPastedHtml(html),
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files || []);
        if (files.some((file) => file.type.startsWith("image/"))) {
          event.preventDefault();
          insertImageFiles(editorApiRef.current.editor, files);
          return true;
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files || []);
        if (files.some((file) => file.type.startsWith("image/"))) {
          event.preventDefault();
          insertImageFiles(editorApiRef.current.editor, files);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: instance }) => {
      // Cheap per-keystroke work only. React bails out of the re-render once
      // saveState is already "saving", so this stays free while typing.
      if (draftKey) setSaveState("saving");
      pendingEmitRef.current = true;
      window.clearTimeout(emitTimer.current);
      emitTimer.current = window.setTimeout(() => emitFromInstance(instance), 300);
    },
  });

  const editorApiRef = useRef({});
  editorApiRef.current.editor = editor;

  // Run any pending debounced emit right now (before save, on blur, on unmount).
  const flush = useCallback(() => {
    window.clearTimeout(emitTimer.current);
    emitFromInstance(editorApiRef.current.editor);
  }, [emitFromInstance]);

  // Flush the pending edit whenever the editor loses focus (e.g. the user
  // clicks Save / Publish or tabs away) and on unmount, so the host always
  // has the latest sanitized HTML even though typing is debounced.
  useEffect(() => {
    if (!editor) return undefined;
    const onBlur = () => flush();
    editor.on("blur", onBlur);
    return () => {
      editor.off("blur", onBlur);
      window.clearTimeout(emitTimer.current);
      emitFromInstance(editor);
    };
  }, [editor, flush, emitFromInstance]);

  // Debug/testing hook — lets the console (and E2E tests) reach the instance
  // and force a pending debounced emit.
  useEffect(() => {
    if (typeof window !== "undefined" && editor) {
      window.__ALTFT_EDITOR__ = editor;
      window.__ALTFT_FLUSH__ = flush;
      window.__ALTFT_EXPORT__ = () => exportHtml(editor);
    }
  }, [editor, flush]);

  // Re-render all consumers on EVERY transaction (including selection-only
  // ones) so toolbar active-states and can() checks are never stale. Without
  // this, clicking into bold text or drag-selecting table cells would leave
  // the toolbar showing the previous state.
  const [transactionTick, setTransactionTick] = useState(0);
  useEffect(() => {
    if (!editor) return undefined;
    const bump = () => setTransactionTick((tick) => (tick + 1) % 1_000_000);
    editor.on("transaction", bump);
    return () => editor.off("transaction", bump);
  }, [editor]);

  /* ------------- adopt external value changes without clobbering ------------- */

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const next = value || "";
    if (sentValuesRef.current.includes(next)) return;
    if (editor.isFocused) return;
    // A debounced local edit is still queued — adopting the prop now would
    // overwrite the user's latest typing. Let the pending emit settle first.
    if (pendingEmitRef.current) return;
    if (exportHtml(editor) === next) return;
    editor.commands.setContent(htmlToEditor(next), false);
  }, [value, editor]);

  /* --------------------------------- read-only -------------------------------- */

  useEffect(() => {
    if (editor && !editor.isDestroyed) editor.setEditable(!readOnly);
  }, [readOnly, editor]);

  /* ------------------------------ draft recovery ------------------------------ */

  useEffect(() => {
    if (!draftKey || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`ALTFT_EDITOR_DRAFT:${draftKey}`);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft?.html && draft.html !== (value || "")) {
        setDraftState({ available: true, html: draft.html, savedAt: draft.savedAt });
      }
    } catch {
      /* corrupt draft — ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  const restoreDraft = useCallback(() => {
    if (!editor || !draftState.html) return;
    editor.commands.setContent(htmlToEditor(draftState.html), false);
    emit(draftState.html);
    setDraftState((state) => ({ ...state, available: false }));
  }, [editor, draftState.html, emit]);

  const discardDraft = useCallback(() => {
    if (draftKey) {
      try {
        window.localStorage.removeItem(`ALTFT_EDITOR_DRAFT:${draftKey}`);
      } catch {
        /* noop */
      }
    }
    setDraftState((state) => ({ ...state, available: false }));
  }, [draftKey]);

  /* ------------------------- image picker (global event) ----------------------- */

  const fileInputRef = useRef(null);

  useEffect(() => {
    const openPicker = () => fileInputRef.current?.click();
    window.addEventListener("altft-editor:pick-image", openPicker);
    return () => window.removeEventListener("altft-editor:pick-image", openPicker);
  }, []);

  const api = useMemo(
    () => ({
      editor,
      readOnly,
      emit,
      flush,
      insertImageFiles,
      openImagePicker: () => fileInputRef.current?.click(),
      draft: { ...draftState, restore: restoreDraft, discard: discardDraft },
      saveState,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, readOnly, emit, flush, insertImageFiles, draftState, restoreDraft, discardDraft, saveState, transactionTick],
  );

  return (
    <EditorContext.Provider value={api}>
      {children}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={async (event) => {
          const files = Array.from(event.target.files || []);
          event.target.value = "";
          if (files.length && editor) await insertImageFiles(editor, files);
        }}
      />
    </EditorContext.Provider>
  );
}
