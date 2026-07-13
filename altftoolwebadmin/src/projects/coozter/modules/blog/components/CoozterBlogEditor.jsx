"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useCkeditorAssetsReady } from "@/components/admin/CkeditorAssets";

const toolbarItems = [
  "undo",
  "redo",
  "|",
  "sourceEditing",
  "showBlocks",
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
  "specialCharacters",
  "horizontalLine",
  "pageBreak",
  "link",
  "insertImage",
  "insertImageViaUrl",
  "mediaEmbed",
  "insertTable",
  "highlight",
  "blockQuote",
  "codeBlock",
  "htmlEmbed",
  "|",
  "alignment",
  "|",
  "bulletedList",
  "numberedList",
  "todoList",
  "outdent",
  "indent",
];

export default function CoozterBlogEditor({ value, onChange, error }) {
  const editorAssetsReady = useCkeditorAssetsReady();

  if (typeof window === "undefined") return null;

  const CK = window.CKEDITOR;

  if (!editorAssetsReady || !CK) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-sm font-semibold text-[var(--muted)]">
        Loading editor...
      </div>
    );
  }

  const {
    ClassicEditor,
    Alignment,
    AutoImage,
    Autoformat,
    AutoLink,
    BalloonToolbar,
    BlockQuote,
    Bold,
    Bookmark,
    Code,
    CodeBlock,
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
    TextTransformation,
    TodoList,
    Underline,
  } = CK;

  function uploadAdapter(loader) {
    return {
      upload: () =>
        loader.file.then(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ default: reader.result });
              reader.readAsDataURL(file);
            }),
        ),
    };
  }

  function uploadPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => uploadAdapter(loader);
  }

  const firebaseMediaEmbedProvider = {
    name: "firebaseVideo",
    url: /^https?:\/\/(?:[a-z0-9-]+\.)?(?:firebasestorage\.googleapis\.com|storage\.googleapis\.com)\/.+/i,
    html: (match) => {
      const videoUrl = match[0] ?? match;
      return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;"><video src="${videoUrl}" controls style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" preload="metadata" controlslist="nodownload">Your browser does not support the video tag.</video></div>`;
    },
  };

  return (
    <div className={`coozter-ckeditor overflow-hidden rounded-lg border bg-[var(--surface)] ${error ? "border-[var(--danger)]" : "border-[var(--border)]"}`}>
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={{
          licenseKey: process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY || "GPL",
          extraPlugins: [uploadPlugin],
          plugins: [
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
            TextTransformation,
            TodoList,
            Underline,
          ].filter(Boolean),
          mediaEmbed: {
            previewsInData: true,
            extraProviders: [firebaseMediaEmbedProvider],
          },
          htmlSupport: {
            allow: [{ name: /.*/, attributes: true, classes: true, styles: true }],
          },
          toolbar: {
            shouldNotGroupWhenFull: false,
            items: toolbarItems,
          },
          placeholder: "Type or paste your blog content here...",
        }}
        onChange={(event, editor) => onChange(editor.getData())}
      />
      <style jsx global>{`
        .coozter-ckeditor {
          --ck-color-base-background: var(--surface);
          --ck-color-base-foreground: var(--surface-soft);
          --ck-color-base-border: var(--border);
          --ck-color-text: var(--foreground);
          --ck-color-toolbar-background: var(--surface);
          --ck-color-toolbar-border: var(--border);
          --ck-color-button-default-background: var(--surface);
          --ck-color-button-default-hover-background: var(--surface-soft);
          --ck-color-button-default-active-background: var(--surface-soft);
          --ck-color-focus-border: var(--primary);
          --ck-color-link-default: var(--primary);
          --ck-focus-ring: 1px solid var(--primary);
        }
        .coozter-ckeditor .ck.ck-editor {
          width: 100%;
        }
        .coozter-ckeditor .ck.ck-toolbar {
          border: 0;
          border-bottom: 1px solid var(--border);
          border-radius: 0;
        }
        .coozter-ckeditor .ck.ck-editor__main > .ck-editor__editable {
          min-height: 398px;
          border: 0;
          border-radius: 0;
          box-shadow: none;
        }
        .coozter-ckeditor .ck.ck-editor__main > .ck-editor__editable.ck-focused {
          border: 0;
          box-shadow: inset 0 0 0 1px var(--primary);
        }
      `}</style>
    </div>
  );
}