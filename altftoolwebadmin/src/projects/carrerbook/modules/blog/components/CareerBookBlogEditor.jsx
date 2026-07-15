"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useCkeditorAssetsReady } from "@/components/admin/CkeditorAssets";

export default function CareerBookBlogEditor({ value, onChange, error }) {
  const editorAssetsReady = useCkeditorAssetsReady();
  const ckeditorLicenseKey = process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY;

  if (typeof window === "undefined") return null;

  const CK = window.CKEDITOR;
  const CKP = window.CKEDITOR_PREMIUM_FEATURES;

  if (!editorAssetsReady || !CK) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-500">
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
    WordCount,
  } = CK;

  const {
    CaseChange,
    ExportInlineStyles,
    FormatPainter,
    ImportWord,
    LineHeight,
    MultiLevelList,
    PasteFromOfficeEnhanced,
    SlashCommand,
    TableOfContents,
    Template,
  } = CKP || {};

  const hasPremiumLicense = Boolean(ckeditorLicenseKey);
  const premiumPluginMap = hasPremiumLicense
    ? {
        importWord: ImportWord,
        formatPainter: FormatPainter,
        caseChange: CaseChange,
        lineHeight: LineHeight,
        multiLevelList: MultiLevelList,
        tableOfContents: TableOfContents,
        insertTemplate: Template,
      }
    : {};
  const premiumPlugins = [
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
  ].filter(Boolean).filter(() => hasPremiumLicense);

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

  const toolbarItems = [
    "undo",
    "redo",
    "|",
    "sourceEditing",
    "|",
    "showBlocks",
    "importWord",
    "formatPainter",
    "caseChange",
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
    "mediaEmbed",
    "insertTable",
    "tableOfContents",
    "insertTemplate",
    "highlight",
    "blockQuote",
    "codeBlock",
    "htmlEmbed",
    "|",
    "alignment",
    "lineHeight",
    "|",
    "bulletedList",
    "numberedList",
    "multiLevelList",
    "todoList",
    "outdent",
    "indent",
  ].filter((item) => !premiumPluginMap[item] || Boolean(premiumPluginMap[item]));

  return (
    <div className={`careerbook-ckeditor overflow-hidden rounded-xl border bg-white ${error ? "border-red-300" : "border-slate-200"}`}>
      <CKEditor
        editor={ClassicEditor}
        data={value || ""}
        config={{
          licenseKey: ckeditorLicenseKey || "GPL",
          extraPlugins: [uploadPlugin],
          plugins: [
            Alignment,
            Autoformat,
            AutoImage,
            AutoLink,
            BalloonToolbar,
            BlockQuote,
            Bold,
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
            WordCount,
            ...premiumPlugins,
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
          placeholder: "Type or paste your content here...",
        }}
        onChange={(event, editor) => onChange(editor.getData())}
      />
      <style jsx global>{`
        .careerbook-ckeditor .ck.ck-editor {
          width: 100%;
        }
        .careerbook-ckeditor .ck.ck-toolbar {
          border: 0;
          border-bottom: 1px solid #cbd5e1;
          border-radius: 0;
        }
        .careerbook-ckeditor .ck.ck-editor__main > .ck-editor__editable {
          min-height: 398px;
          border: 0;
          border-radius: 0;
          box-shadow: none;
        }
        .careerbook-ckeditor .ck.ck-editor__main > .ck-editor__editable.ck-focused {
          border: 0;
          box-shadow: inset 0 0 0 1px #14b8a6;
        }
      `}</style>
    </div>
  );
}
