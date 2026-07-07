"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCkeditorAssetsReady } from "@/components/admin/CkeditorAssets";

// CKEditor 5 silently switches the editor to read-only mode
// (editor.enableReadOnlyMode(Symbol('invalidLicense'))) and then throws one of
// these errors whenever the license check fails: expired/invalid keys, trial or
// development session limits, usage limits reported by the CKEditor license
// endpoint, domain limits, or a wrong distribution channel. All of them must
// trigger the raw-HTML fallback, otherwise admins are stuck with an editor
// that looks fine but ignores every keystroke.
const LICENSE_ERROR_PATTERN =
  /license-key-(expired|invalid|trial-limit|development-limit|evaluation-limit|usage-limit|domain-limit|plugin-not-allowed|feature-not-allowed|invalid-distribution-channel|missing)|invalid-license-key|license key is (expired|invalid)/i;

// Raw-HTML fallback editor. Owns its text locally so parent re-renders (draft
// autosave ticks, debounced form sync) can never clobber in-flight keystrokes,
// while still adopting genuine external updates (Writing Helper inserts,
// content blocks, quick fixes).
function PlainHtmlFallbackEditor({ value, onChange }) {
  const [text, setText] = useState(value || "");
  const sentValuesRef = useRef([value || ""]);

  useEffect(() => {
    const next = value || "";
    // Ignore echoes of our own edits coming back through the debounced sync.
    if (sentValuesRef.current.includes(next)) return;
    setText(next);
    sentValuesRef.current = [next, ...sentValuesRef.current].slice(0, 10);
  }, [value]);

  return (
    <textarea
      value={text}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        sentValuesRef.current = [next, ...sentValuesRef.current].slice(0, 10);
        onChange(next);
      }}
      spellCheck={false}
      placeholder="Type or paste your HTML content here..."
      aria-label="Blog HTML source editor"
      className="min-h-[480px] w-full rounded-xl border border-border bg-surface p-4 font-mono text-[13px] leading-6 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
    />
  );
}

export default function BlogEditor({ value, onChange }) {
  const editorAssetsReady = useCkeditorAssetsReady();
  const editorRef = useRef(null);
  const editorConfigRef = useRef(null);
  const editorConfigKeyRef = useRef("");
  const latestEditorDataRef = useRef(value || "");
  const sentValuesRef = useRef([]);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [editorReady, setEditorReady] = useState(false);
  const [usePlainTextFallback, setUsePlainTextFallback] = useState(false);
  // Track license failures so we can fall back to a raw-HTML editor instead of
  // leaving admins with a read-only editor (see LICENSE_ERROR_PATTERN above).
  const [licenseFailed, setLicenseFailed] = useState(false);
  const [editorInitialValue] = useState(value || "");
  const ckeditorLicenseKey = process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY;

  // Switch to the raw-HTML fallback without losing whatever was typed in the
  // rich editor after the last onChange flush.
  const fallbackFlushedRef = useRef(false);
  const activateLicenseFallback = useCallback(() => {
    if (!fallbackFlushedRef.current) {
      fallbackFlushedRef.current = true;
      try {
        const data = editorRef.current?.getData?.();
        if (typeof data === "string" && data !== latestEditorDataRef.current) {
          latestEditorDataRef.current = data;
          onChangeRef.current?.(data);
        }
      } catch {
        // Editor may already be destroyed — the last synced value is kept.
      }
    }
    setLicenseFailed(true);
    setUsePlainTextFallback(true);
  }, []);

  const focusEditor = useCallback((e) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Only focus if the user clicked directly on the outer wrapper/empty area,
    // not on the toolbar, dropdown, editable area, dialog, or other CKEditor components.
    if (e && e.target !== e.currentTarget) return;

    try {
      editor.editing.view.focus();
    } catch {
      // Focusing should never break typing or fallback rendering.
    }
  }, []);

  useEffect(() => {
    if (!editorReady || !editorRef.current) return;

    const editor = editorRef.current;
    const nextValue = value || "";

    // Double-layer protection against cursor jumping during active user input:
    // 1. Skip if the editor is currently focused (typing, formatting, or editing inline elements).
    // 2. Skip if the next value matches a recent change typed by the user.
    if (editor.editing.view.document.isFocused) {
      latestEditorDataRef.current = nextValue;
      return;
    }
    if (sentValuesRef.current.includes(nextValue)) {
      latestEditorDataRef.current = nextValue;
      return;
    }

    if (nextValue === latestEditorDataRef.current) return;

    if (editor.getData() === nextValue) {
      latestEditorDataRef.current = nextValue;
      return;
    }

    editor.setData(nextValue);
    latestEditorDataRef.current = nextValue;
  }, [editorReady, value]);

  // If the CDN assets fail to load (network block, ad-blocker, CSP) the page
  // would otherwise show "Loading editor..." forever. Always arm a timeout
  // fallback so admins can keep writing in the raw-HTML editor.
  useEffect(() => {
    if (licenseFailed) return undefined; // keep raw-HTML fallback once license fails
    if (!ckeditorLicenseKey || editorAssetsReady) {
      setUsePlainTextFallback(false);
      return undefined;
    }

    const markFallback = () => setUsePlainTextFallback(true);
    const timeout = window.setTimeout(markFallback, 8000);

    window.addEventListener("altftool:ckeditor-error", markFallback);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("altftool:ckeditor-error", markFallback);
    };
  }, [ckeditorLicenseKey, editorAssetsReady, licenseFailed]);

  // Detect a failed CKEditor license check (thrown as an uncaught
  // CKEditorError) and switch to the raw-HTML editor so content stays editable.
  useEffect(() => {
    const isLicenseError = (msg = "") => LICENSE_ERROR_PATTERN.test(String(msg));

    const onError = (event) => {
      if (isLicenseError(event?.message || event?.error?.message)) {
        // Handled: we swap in the fallback editor, so keep the uncaught
        // CKEditorError out of the console.
        event.preventDefault?.();
        activateLicenseFallback();
      }
    };
    const onRejection = (event) => {
      if (isLicenseError(event?.reason?.message || event?.reason)) {
        event.preventDefault?.();
        activateLicenseFallback();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [activateLicenseFallback]);

  if (typeof window === "undefined") return null;

  if (!ckeditorLicenseKey || usePlainTextFallback) {
    return (
      <div data-ckeditor-ready="true">
        {licenseFailed ? (
          <div
            role="status"
            className="mb-3 rounded-lg border border-warning bg-warning-soft px-3 py-2 text-xs leading-5 text-foreground"
          >
            The rich editor was disabled by a CKEditor license check (expired,
            invalid, or trial/usage limit reached). You can still edit the{" "}
            <strong>raw HTML</strong> below — it is saved exactly as typed. Set a
            valid production <code>NEXT_PUBLIC_CKEDITOR_LICENSE_KEY</code> to
            restore the visual editor.
          </div>
        ) : null}
        <PlainHtmlFallbackEditor value={value} onChange={onChange} />
      </div>
    );
  }

  const CK = window.CKEDITOR;
  const CKP = window.CKEDITOR_PREMIUM_FEATURES;

  if (!editorAssetsReady || !CK) {
    return <div className="border p-4">Loading editor...</div>;
  }

  /* ---------------- CKEDITOR CORE PLUGINS ---------------- */

  const {
    ClassicEditor,
    Autosave,
    Essentials,
    Paragraph,
    Alignment,
    AutoImage,
    Autoformat,
    AutoLink,
    ImageBlock,
    BlockQuote,
    Bold,
    Bookmark,
    Code,
    CodeBlock,
    Emoji,
    FindAndReplace,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    Fullscreen,
    GeneralHtmlSupport,
    Heading,
    Highlight,
    HorizontalLine,
    HtmlComment,
    HtmlEmbed,
    ImageCaption,
    ImageEditing,
    ImageInsert,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    ImageUtils,
    ImageInline,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    List,
    ListProperties,
    MediaEmbed,
    Mention,
    PageBreak,
    PasteFromOffice,
    PictureEditing,
    PlainTableOutput,
    RemoveFormat,
    ShowBlocks,
    SourceEditing,
    SpecialCharacters,
    SpecialCharactersArrows,
    SpecialCharactersCurrency,
    SpecialCharactersEssentials,
    SpecialCharactersLatin,
    SpecialCharactersMathematical,
    SpecialCharactersText,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableLayout,
    TableProperties,
    TableToolbar,
    TextPartLanguage,
    TextTransformation,
    TodoList,
    Underline,
    WordCount,
    BalloonToolbar
  } = CK;

  /* -------- PREMIUM FEATURES THAT WORK WITHOUT CLOUD ------- */

  const {
    CaseChange,
    ExportWord,
    ExportInlineStyles,
    Footnotes,
    FormatPainter,
    ImportWord,
    LineHeight,
    MultiLevelList,
    PasteFromOfficeEnhanced,
    SlashCommand,
    TableOfContents,
    Template
  } = CKP || {};

  const hasPremiumLicense = Boolean(process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY);
  const premiumPlugins = hasPremiumLicense
    ? [
        ExportInlineStyles,
        FormatPainter,
        CaseChange,
        ImportWord,
        LineHeight,
        MultiLevelList,
        PasteFromOfficeEnhanced,
        SlashCommand,
        TableOfContents,
        Template,
      ].filter(Boolean)
    : [];
  // Only expose premium toolbar buttons when the premium plugins actually
  // loaded — otherwise CKEditor logs "toolbarview-item-unavailable" warnings.
  const premiumToolbarItems = premiumPlugins.length > 0
    ? [
        "importWord",
        "formatPainter",
        "caseChange",
        "lineHeight",
        "multiLevelList",
        "tableOfContents",
        "insertTemplate",
      ]
    : [];

  /* ---------------- IMAGE UPLOAD ADAPTER ---------------- */

  function uploadAdapter(loader) {
    return {
      upload: () =>
        loader.file.then(
          file =>
            new Promise(resolve => {
              const reader = new FileReader();
              reader.onload = () => {
                resolve({ default: reader.result });
              };
              reader.readAsDataURL(file);
            })
        )
    };
  }

  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = loader => {
      return uploadAdapter(loader);
    };
  }

  /* ---------------- FIREBASE VIDEO EMBED PLUGIN ---------------- */
  //
  // CKEditor's MediaEmbed only knows about YouTube/Vimeo/etc. by default.
  // We register a custom provider whose `url` regex matches any Firebase
  // Storage public URL (*.firebasestorage.googleapis.com or
  // storage.googleapis.com/…/…). The `html` callback returns a native
  // <video> element so the browser renders it directly – no iframe needed.
  //
  // Matching patterns handled:
  //   https://<bucket>.firebasestorage.googleapis.com/v0/b/.../o/...?alt=media…
  //   https://firebasestorage.googleapis.com/v0/b/.../o/...?alt=media…
  //   https://storage.googleapis.com/<bucket>/…
  // -----------------------------------------------------------------------

  const firebaseMediaEmbedProvider = {
    name: "firebaseVideo",

    // Matches any URL that contains firebasestorage.googleapis.com
    // or storage.googleapis.com (covers both URL styles Firebase uses).
    url: /^https?:\/\/(?:[a-z0-9-]+\.)?(?:firebasestorage\.googleapis\.com|storage\.googleapis\.com)\/.+/i,

    html: match => {
      // `match` is the URL string (CKEditor passes the full matched URL).
      const videoUrl = match[0] ?? match;

      return (
        `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">` +
          `<video ` +
            `src="${videoUrl}" ` +
            `controls ` +
            `style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" ` +
            `preload="metadata" ` +
            `controlslist="nodownload"` +
          `>` +
            `Your browser does not support the video tag.` +
          `</video>` +
        `</div>`
      );
    }
  };

  /* ---------------- EDITOR ---------------- */

  const editorConfigKey = `${ckeditorLicenseKey}:${hasPremiumLicense ? "premium" : "standard"}`;
  if (!editorConfigRef.current || editorConfigKeyRef.current !== editorConfigKey) {
    editorConfigKeyRef.current = editorConfigKey;
    editorConfigRef.current = {
        licenseKey: ckeditorLicenseKey,

        extraPlugins: [uploadPlugin],

        plugins: [
          Autosave,
          Alignment,
          Autoformat,
          AutoImage,
          AutoLink,
          BalloonToolbar,
          BlockQuote,
          Bold,
          Bookmark,
          Code,
          CodeBlock,
          Emoji,
          Essentials,
          FindAndReplace,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          Fullscreen,
          GeneralHtmlSupport,
          Heading,
          Highlight,
          HorizontalLine,
          // Preserve HTML comments (Writing Helper + FAQ block markers) across
          // editor round-trips — without this plugin CKEditor strips comments
          // from the content, silently corrupting saved posts.
          HtmlComment,
          HtmlEmbed,
          ImageBlock,
          ImageCaption,
          ImageEditing,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          ImageUtils,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Mention,
          PageBreak,
          Paragraph,
          PasteFromOffice,
          PictureEditing,
          PlainTableOutput,
          RemoveFormat,
          ShowBlocks,
          SourceEditing,
          SpecialCharacters,
          SpecialCharactersArrows,
          SpecialCharactersCurrency,
          SpecialCharactersEssentials,
          SpecialCharactersLatin,
          SpecialCharactersMathematical,
          SpecialCharactersText,
          Strikethrough,
          Subscript,
          Superscript,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableLayout,
          TableProperties,
          TableToolbar,
          TextPartLanguage,
          TextTransformation,
          TodoList,
          Underline,
          WordCount,
          ...premiumPlugins
        ].filter(Boolean),

        // ── MediaEmbed: register our Firebase provider ──────────────────────
        //
        // `extraProviders` appends to the built-in list (YouTube, Vimeo …).
        // `removeProviders` lets you strip ones you don't need.
        // Setting `previewsInData: true` persists the rendered HTML into the
        // editor's output so the <video> tag is saved in the DB / returned by
        // editor.getData().
        mediaEmbed: {
          previewsInData: true,          // save rendered HTML to output
          extraProviders: [
            firebaseMediaEmbedProvider
          ]
        },

        // ── GeneralHtmlSupport: allow <video> tags in the editor ─────────────
        htmlSupport: {
          allow: [
            {
              name: /.*/,
              attributes: true,
              classes: true,
              styles: true
            }
          ]
        },

        toolbar: {
          shouldNotGroupWhenFull: false,

          items: [
            "undo",
            "redo",
            SourceEditing ? "sourceEditing" : null,
            "|",
            ...premiumToolbarItems.filter((item) => item === "importWord"),
            "showBlocks",
            ...premiumToolbarItems.filter((item) => item === "formatPainter" || item === "caseChange"),
            "findAndReplace",
            "fullscreen",
            "|",
            "heading",
            "|",
            "fontSize",
            "fontFamily",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "subscript",
            "superscript",
            "code",
            "removeFormat",
            "|",
            "emoji",
            "specialCharacters",
            "horizontalLine",
            "pageBreak",
            "link",
            "insertImage",
            "insertImageViaUrl",
            "mediaEmbed",          // ← this button opens the URL dialog
            "insertTable",
            ...premiumToolbarItems.filter((item) => item === "tableOfContents" || item === "insertTemplate"),
            "highlight",
            "blockQuote",
            "codeBlock",
            "htmlEmbed",
            "|",
            "alignment",
            ...premiumToolbarItems.filter((item) => item === "lineHeight"),
            "|",
            "bulletedList",
            "numberedList",
            ...premiumToolbarItems.filter((item) => item === "multiLevelList"),
            "todoList",
            "outdent",
            "indent"
          ].filter(Boolean)
        },

        placeholder: "Type or paste your content here..."
      };
  }

  return (
    <div
      data-ckeditor-ready={editorReady ? "true" : "false"}
      onClick={focusEditor}
      className="ckeditor-write-surface"
    >
      <CKEditor
        editor={ClassicEditor}
        data={editorInitialValue}
        config={editorConfigRef.current}
        onReady={(editor) => {
          editorRef.current = editor;
          latestEditorDataRef.current = editor.getData();
          setEditorReady(true);

          const editable = editor.ui?.view?.editable?.element;
          editable?.setAttribute("data-ckeditor-ready", "true");
          editable?.setAttribute("aria-label", "Blog content editor");

          // Safety net: a failed license check calls
          // editor.enableReadOnlyMode(Symbol("invalidLicense")) — silently for
          // async blocks (usage/trial limits reported by the license server)
          // and synchronously during init for expired/invalid keys. The thrown
          // CKEditorError is masked to "Script error." because the CDN bundle
          // is cross-origin, so read-only state is the only reliable signal.
          // The only feature here that legitimately uses read-only mode is
          // Source editing; any other read-only switch means the license
          // check failed — activate the editable fallback.
          const guardReadOnly = () => {
            const sourceEditing = editor.plugins.has("SourceEditing")
              ? editor.plugins.get("SourceEditing")
              : null;
            if (sourceEditing?.isSourceEditingMode) return;
            activateLicenseFallback();
          };
          // Synchronous license blocks (e.g. expired key) happen before
          // onReady, so the change event has already fired — check now.
          if (editor.isReadOnly) guardReadOnly();
          editor.on("change:isReadOnly", (evt, prop, isReadOnly) => {
            if (isReadOnly) guardReadOnly();
          });
        }}
        onAfterDestroy={() => {
          editorRef.current = null;
          setEditorReady(false);
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          sentValuesRef.current = [data, ...sentValuesRef.current].slice(0, 10);
          latestEditorDataRef.current = data;
          onChange(data);
        }}
      />
    </div>
  );
}
