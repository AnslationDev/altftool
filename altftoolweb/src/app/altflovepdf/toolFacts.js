/**
 * Hand-written, verified facts for every Altf❤️PDF tool.
 *
 * Every sentence here was checked against the tool's own implementation in
 * src/app/altflovepdf/tools/*.jsx before it was written:
 *   - `answer`  — a self-contained answer to "what does this tool do?", safe to
 *                 quote without any surrounding context (answer engines lift
 *                 exactly this kind of sentence).
 *   - `input` / `output` — the file types the tool's <input accept="…"> really
 *                 takes and the artefact it really produces.
 *   - `notDoes` — honest limits. These exist so the pages stop over-claiming;
 *                 do NOT soften them, and never add a capability that the
 *                 component does not implement.
 *
 * Nothing in this file may be invented. If a fact cannot be verified in the
 * tool source, omit it rather than guessing.
 */

/** Facts shared by every tool in the family (all run fully client-side). */
export const FAMILY_FACTS = {
  processing:
    "In your browser. Files are read with the File API and processed on your own device — nothing is uploaded to AltFTool.",
  price: "Free. No account, no install, no watermark on the output.",
  requirements: "Any modern desktop or mobile browser with JavaScript enabled.",
};

export const TOOL_FACTS = {
  // ---------------------------------------------------------------- Page Tools
  "merge-pdf": {
    answer:
      "Merge PDF combines several PDF files into one document directly in your browser — the files are never uploaded to a server. Add the PDFs, drag them into the order you want, and download the single merged file.",
    input: "Two or more PDF files",
    output: "One merged PDF",
    notDoes: [
      "Does not merge Word, Excel or image files — convert them to PDF first.",
      "Does not remove passwords: an encrypted PDF must be unlocked before it can be merged.",
    ],
  },
  "split-pdf": {
    answer:
      "Split PDF extracts the pages you choose from a PDF and saves them as separate files, entirely inside your browser. Enter page ranges to pull out specific sections, or split every page and download the results as a ZIP.",
    input: "One PDF file",
    output: "One PDF per range, or a ZIP of single-page PDFs",
    notDoes: [
      "Does not split by bookmark, chapter or detected content — you choose the page ranges.",
      "Does not change the pages it extracts; text, images and fonts are copied as-is.",
    ],
  },
  "rotate-pdf": {
    answer:
      "Rotate PDF turns pages 90°, 180° or 270° and saves the new orientation into the file, all on your own device. Click individual page thumbnails to rotate only those pages, or rotate the whole document at once.",
    input: "One PDF file",
    output: "The same PDF with updated page rotation",
    notDoes: [
      "Does not re-encode or re-compress the pages, so nothing is lost in quality.",
      "Does not straighten skewed scans — it applies fixed 90° steps only.",
    ],
  },
  "organize-pdf": {
    answer:
      "Organize Pages lets you reorder and delete pages in a PDF by dragging thumbnails, then download the rebuilt document. Everything happens in your browser, so the file never leaves your device.",
    input: "One PDF file",
    output: "A rebuilt PDF with your page order",
    notDoes: [
      "Does not edit the content inside a page — use Redact, Watermark or Sign for that.",
      "Deleted pages are removed from the downloaded copy; your original file is untouched.",
    ],
  },
  "crop-pdf": {
    answer:
      "Crop Pages trims the margins of a PDF by setting how much to cut from the top, bottom, left and right, and it runs entirely in your browser. The crop is applied to the page boxes, so the output stays a real, selectable PDF.",
    input: "One PDF file",
    output: "A PDF with cropped page boxes",
    notDoes: [
      "Does not delete the cropped-away content from the file — it changes the visible page area.",
      "Does not auto-detect margins; you enter the crop values yourself.",
    ],
  },
  "insert-blank-pages": {
    answer:
      "Insert Blank Pages adds empty pages to a PDF at the start, at the end, or after a page you pick, and does it locally in your browser. The blank pages match the size of the surrounding pages.",
    input: "One PDF file",
    output: "A PDF with the blank pages inserted",
    notDoes: [
      "Does not add ruled, grid or lined pages — the inserted pages are plain and empty.",
    ],
  },

  // ------------------------------------------------------------ Convert & Export
  "image-to-pdf": {
    answer:
      "Image to PDF turns JPG, PNG and WebP pictures into a single PDF document without uploading them anywhere — the conversion runs in your browser. Add several images and each one becomes a page, in the order you arrange them.",
    input: "JPG, PNG, WebP and other browser-readable image files",
    output: "One PDF containing one page per image",
    notDoes: [
      "Does not run OCR, so text inside the pictures stays a picture and is not searchable.",
      "Does not accept HEIC/RAW camera files that the browser itself cannot decode.",
    ],
  },
  "pdf-to-image": {
    answer:
      "PDF to Image renders each page of a PDF as a JPEG picture on your own device, using the browser's PDF engine. Pick the render scale, then download the pages as images.",
    input: "One PDF file",
    output: "One JPEG image per page",
    notDoes: [
      "Does not extract the pictures that are embedded inside the PDF — use Extract Images for that.",
      "Does not keep text selectable; the output is a flat raster image.",
    ],
  },
  "pdf-to-text": {
    answer:
      "PDF to Text pulls the plain text out of a PDF in your browser and lets you copy or download it. It reads the text layer that the PDF already contains, so it works on digitally created documents.",
    input: "One PDF file with a text layer",
    output: "Plain text you can copy or save",
    notDoes: [
      "Does not perform OCR — a scanned or photographed PDF with no text layer returns nothing.",
      "Does not preserve columns, tables or styling; the result is unformatted text.",
    ],
  },
  "extract-images": {
    answer:
      "Extract Images finds the pictures embedded inside a PDF and lets you download them individually, all without uploading the document. It reads the PDF's own image objects rather than screenshotting the pages.",
    input: "One PDF file",
    output: "The embedded images, downloaded separately",
    notDoes: [
      "Does not create images from pages that contain only text or vector drawings.",
      "Does not upscale or clean up the extracted pictures — you get them at their stored resolution.",
    ],
  },
  "webpage-to-pdf": {
    answer:
      "Webpage to PDF converts a saved HTML file or pasted HTML markup into a PDF inside your browser. Inside the companion AltFTool Chrome extension it can also capture the visible area of the current tab and save that as a PDF.",
    input: ".html or .htm files, pasted HTML markup, or a captured browser tab (extension only)",
    output: "A PDF in A4, Letter or original size",
    notDoes: [
      "Does not fetch a live web address on this page — save the page as HTML first, or use the Chrome extension to capture the open tab.",
      "Does not load images, fonts or stylesheets that the HTML links to from another server.",
    ],
  },
  "grayscale-pdf": {
    answer:
      "Grayscale PDF converts a colour PDF to black-and-white by re-rendering every page in greyscale on your device, then rebuilding the file. Use the quality and scale controls to balance sharpness against file size.",
    input: "One PDF file",
    output: "A greyscale PDF",
    notDoes: [
      "Does not keep the text selectable — pages are re-rendered as greyscale images.",
      "Does not convert to true 1-bit black-and-white; it produces grey tones.",
    ],
  },
  "pdf-to-excel": {
    answer:
      "PDF to Excel reads the text out of a PDF's pages, arranges it into rows and columns, and saves it as an .xlsx spreadsheet — all in your browser. It works best on documents whose tables are real text rather than pictures.",
    input: "One PDF file with a text layer",
    output: "An .xlsx workbook, one sheet per page",
    notDoes: [
      "Does not run OCR, so scanned tables come out empty.",
      "Does not rebuild merged cells, formulas, colours or borders — only the cell values.",
    ],
  },
  "pdf-to-word": {
    answer:
      "PDF to Word extracts the text from a PDF and writes it into an editable .docx file, entirely inside your browser. The conversion uses the PDF's existing text layer, so digitally created documents convert cleanly.",
    input: "One PDF file with a text layer",
    output: "An editable .docx Word document",
    notDoes: [
      "Does not run OCR — a scanned PDF produces an empty document.",
      "Does not reproduce the original layout, images, tables or fonts; you get the text as paragraphs.",
    ],
  },
  "compress-pdf": {
    answer:
      "Compress PDF shrinks a PDF by re-rendering each page as a JPEG at the DPI and quality you choose, then rebuilding the document — all on your own device. Lower DPI and quality give a much smaller file.",
    input: "One PDF file",
    output: "A smaller PDF (pages stored as JPEG images)",
    notDoes: [
      "Does not keep text selectable or searchable, because the pages become images.",
      "Does not help much on PDFs that are already scans at low resolution.",
    ],
  },
  "repair-pdf": {
    answer:
      "Repair PDF tries to recover a PDF that will not open by cleaning up the file's byte structure and rebuilding its internal index in your browser. If the document can be parsed at all, you get a re-saved, openable copy.",
    input: "One damaged or unopenable PDF file",
    output: "A rebuilt PDF, when recovery succeeds",
    notDoes: [
      "Does not guarantee recovery — severely truncated or overwritten files cannot be rebuilt.",
      "Does not restore content that is genuinely missing from the file.",
    ],
  },

  // ------------------------------------------------------------ Enhance & Security
  "page-numbers": {
    answer:
      "Page Numbers stamps numbering onto a PDF at the position, size and starting value you choose, running entirely in your browser. The numbers are written into the page content, so they stay put in any PDF reader.",
    input: "One PDF file",
    output: "A PDF with page numbers stamped on",
    notDoes: [
      "Does not update numbers already printed in the original document.",
      "Does not add roman numerals or per-section restarts.",
    ],
  },
  "header-footer": {
    answer:
      "Header / Footer adds your own text along the top or bottom margin of every page of a PDF, on your device. Choose the text, position and size, then download the stamped file.",
    input: "One PDF file",
    output: "A PDF with header and/or footer text",
    notDoes: [
      "Does not replace headers or footers that are already part of the original pages.",
      "Does not insert images or logos — use Watermark PDF for that.",
    ],
  },
  "watermark-pdf": {
    answer:
      "Watermark PDF lays a text or image watermark over every page of a PDF, with control over opacity, size, rotation and position — and it never uploads your document. The watermark is drawn into the page content on your device.",
    input: "One PDF file, plus an image if you use an image watermark",
    output: "A watermarked PDF",
    notDoes: [
      "Does not remove an existing watermark.",
      "Does not lock the watermark against removal by PDF editing software.",
    ],
  },
  "redact-pdf": {
    answer:
      "Redact PDF blacks out parts of a page by drawing boxes over them and re-rendering the page as a flattened image, so the covered words are genuinely gone from the downloaded file rather than merely hidden. It all happens in your browser.",
    input: "One PDF file",
    output: "A redacted PDF with the marked pages flattened",
    notDoes: [
      "Does not keep text on a redacted page selectable or searchable — that page becomes an image.",
      "Does not find sensitive text for you; you draw each box yourself.",
    ],
  },
  "sign-pdf": {
    answer:
      "Sign PDF lets you draw, type or upload a signature and place it anywhere on a PDF page, entirely inside your browser. The signature is drawn into the page and the signed file downloads straight to your device.",
    input: "One PDF file, plus an optional signature image",
    output: "A PDF with your signature placed on it",
    notDoes: [
      "Does not apply a cryptographic digital signature or certificate — it places a visible signature image.",
      "Does not send the document to anyone else for counter-signing.",
    ],
  },
  "edit-metadata": {
    answer:
      "Edit Metadata changes a PDF's title, author, subject and keyword fields and saves a new copy, working entirely on your device. Use it to correct the document properties that show up in readers and search.",
    input: "One PDF file",
    output: "The same PDF with updated document properties",
    notDoes: [
      "Does not change text on the pages themselves.",
      "Does not strip embedded XMP data added by other software.",
    ],
  },
  "protect-pdf": {
    answer:
      "Protect PDF encrypts a document with AES-256 and a password you choose, and it does the encryption in your browser so the password and the file never leave your device. Readers then need the password to open the PDF.",
    input: "One PDF file plus a password you choose",
    output: "An AES-256 encrypted PDF",
    notDoes: [
      "Does not store or recover your password — if you forget it, the file cannot be opened.",
      "Does not protect a PDF that is already encrypted; unlock it first.",
    ],
  },
  "unlock-pdf": {
    answer:
      "Unlock PDF removes the password from a PDF you can already open, and decrypts it locally in your browser so neither the file nor the password is uploaded. The result is an unencrypted copy you can edit and merge.",
    input: "One password-protected PDF plus its password",
    output: "A decrypted PDF with no password",
    notDoes: [
      "Does not crack, guess or brute-force an unknown password — you must know it.",
      "Does not bypass DRM or rights-management systems.",
    ],
  },
  "flatten-pdf": {
    answer:
      "Flatten PDF bakes fillable form fields and annotations into the page itself, so the values become permanent page content that cannot be edited back. It runs in your browser and downloads the flattened copy.",
    input: "One PDF file with form fields or annotations",
    output: "A flattened PDF with no editable fields",
    notDoes: [
      "Cannot be undone — keep the original if you still need the editable form.",
      "Does not remove hidden metadata; use Edit Metadata for that.",
    ],
  },
  "pdf-info": {
    answer:
      "PDF Info reads a PDF on your device and reports its page count, page sizes, PDF version, document properties and whether it is encrypted. Nothing is uploaded — the file is only inspected in your browser.",
    input: "One PDF file",
    output: "An on-screen report about the file",
    notDoes: [
      "Does not modify the file in any way.",
      "Does not tell you a protected file's password.",
    ],
  },
  "compare-pdf": {
    answer:
      "Compare PDF opens two PDFs side by side in your browser and highlights where the rendered pages differ, so you can spot changes between versions. Both files stay on your device.",
    input: "Two PDF files",
    output: "An on-screen visual comparison",
    notDoes: [
      "Does not produce a word-level tracked-changes report — the comparison is visual.",
      "Does not save a merged or annotated diff file.",
    ],
  },

  // ---------------------------------------------------------------- Image Tools
  "image-resizer": {
    answer:
      "Image Resizer changes an image's dimensions by exact pixel size, by percentage, or to fit inside a box, and it does the resizing in your browser. The resized picture downloads straight to your device.",
    input: "Any image your browser can open (JPG, PNG, WebP, GIF, BMP…)",
    output: "A resized JPG, PNG or WebP",
    notDoes: [
      "Does not add detail when enlarging — upscaling a small photo will look soft.",
      "Does not batch-resize a whole folder in one pass.",
    ],
  },
  "image-compress": {
    answer:
      "Image Compress reduces a picture's file size by re-encoding it at a quality level you choose, entirely inside your browser. You see the resulting size before you download, so you can trade quality against bytes.",
    input: "Any image your browser can open",
    output: "A smaller re-encoded image",
    notDoes: [
      "Does not compress losslessly — lowering quality does discard image data.",
      "Does not convert to AVIF or JPEG XL.",
    ],
  },
  "image-crop": {
    answer:
      "Image Crop lets you drag a selection box over a picture and keep only that area, with the crop applied on your own device. The cropped image downloads immediately, with no upload step.",
    input: "Any image your browser can open",
    output: "The cropped image",
    notDoes: [
      "Does not detect faces or subjects for you — you draw the crop area.",
      "Does not rotate or straighten; use Rotate Image for that.",
    ],
  },
  "rotate-image": {
    answer:
      "Rotate Image turns a picture by 90°, 180° or 270° and flips it horizontally or vertically, all inside your browser. The rotated result is re-encoded on your device and downloaded directly.",
    input: "Any image your browser can open",
    output: "The rotated or flipped image",
    notDoes: [
      "Does not correct small tilts at arbitrary angles — rotation is in 90° steps.",
      "Does not only edit the EXIF orientation flag; the pixels themselves are rotated.",
    ],
  },
  "remove-background": {
    answer:
      "Remove Background cuts the subject out of a photo and exports it as a transparent PNG, running an image-segmentation model directly on your device with WebAssembly. The picture is never uploaded; only the model files are downloaded, once, on first use.",
    input: "Any image your browser can open",
    output: "A PNG with a transparent background",
    notDoes: [
      "Does not need an API key or account, because there is no server-side AI call.",
      "First run downloads the model files, so it is slower than later runs.",
      "Does not reliably cut out fine detail such as loose hair or glass.",
    ],
  },
  "meme-generator": {
    answer:
      "Meme Generator adds top and bottom caption text to an image with adjustable font size, colour and outline, and renders the finished meme in your browser. Download the result as a picture with the captions burned in.",
    input: "Any image your browser can open",
    output: "An image with the captions rendered into it",
    notDoes: [
      "Does not host a template library — you supply the picture.",
      "Does not create animated GIF memes.",
    ],
  },
  "exif-remover": {
    answer:
      "EXIF Metadata Remover strips GPS coordinates, camera model, timestamps and other embedded EXIF tags from a JPEG or PNG by re-encoding the picture on your device. The visible image is unchanged; only the hidden metadata is dropped.",
    input: "JPEG or PNG images",
    output: "The same picture with its EXIF metadata removed",
    notDoes: [
      "Does not remove a visible watermark or anything printed into the pixels.",
      "Does not process HEIC, RAW or video files.",
    ],
  },
  "format-convert": {
    answer:
      "Format Convert changes an image between PNG, JPG and WebP using your browser's own encoder, with a quality slider for the lossy formats. Conversion happens on your device and the new file downloads straight away.",
    input: "Any image your browser can open",
    output: "PNG, JPG or WebP",
    notDoes: [
      "Does not output GIF, AVIF, TIFF or SVG.",
      "Does not keep animation — an animated source is converted as a single still frame.",
    ],
  },

  // ------------------------------------------------------------------- Advanced
  "pdf-preview": {
    answer:
      "PDF Preview opens a PDF in a clean in-page reader so you can page through it without any desktop software. The file is rendered locally in your browser and is never uploaded.",
    input: "One PDF file",
    output: "An on-screen preview (no file is written)",
    notDoes: [
      "Does not let you edit, annotate or save changes.",
      "Does not open password-protected PDFs without the password.",
    ],
  },
  "html-to-pdf": {
    answer:
      "HTML to PDF converts a saved .html file or HTML markup you paste in into a PDF, rendering and paginating it inside your browser. Choose the page size and orientation, then download the generated PDF.",
    input: ".html or .htm files, or pasted HTML markup",
    output: "A paginated PDF",
    notDoes: [
      "Does not fetch a live URL — save the page as an HTML file first.",
      "Does not load stylesheets, fonts or images hosted on another server.",
    ],
  },
  "batch-process": {
    answer:
      "Batch Process applies the same operation — compression, rotation or greyscale — to several PDFs in one run, processing every file locally in your browser. Queue the documents, pick the action, and download the finished set.",
    input: "Several PDF files",
    output: "The processed PDFs",
    notDoes: [
      "Does not mix operations in one run — pick a single action per batch.",
      "Large batches are limited by your device's memory, since nothing is offloaded to a server.",
    ],
  },
};

/** Facts for one tool, or null when none have been written yet. */
export function getToolFacts(slug) {
  return TOOL_FACTS[slug] || null;
}
