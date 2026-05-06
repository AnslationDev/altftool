"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";

export default function LeadTreeBlogEditor({ value, onChange }) {

  if (typeof window === "undefined") return null;

  const ckeditorLicenseKey = process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY;
  if (!ckeditorLicenseKey) {
    return (
      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Type or paste your content here..."
        className="min-h-[360px] w-full rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    );
  }

  const CK = window.CKEDITOR;
  const CKP = window.CKEDITOR_PREMIUM_FEATURES;

  if (!CK) {
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
  const premiumToolbarItems = hasPremiumLicense
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

  return (
    <CKEditor
      editor={ClassicEditor}
      data={value}

      config={{
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
        ],

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
              name: "video",
              attributes: true,
              classes: true,
              styles: true
            },
            {
              name: "source",
              attributes: true
            }
          ]
        },

        toolbar: {
          shouldNotGroupWhenFull: false,

          items: [
            "undo",
            "redo",
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
          ]
        },

        placeholder: "Type or paste your content here..."
      }}

      onChange={(event, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
}
