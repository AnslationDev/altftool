const seo = {
  title: "Barcode Generator — Free Code 128, EAN-13, UPC & QR",
  h1: "Barcode Generator",
  metaDescription:
    "Free barcode generator for Code 128, EAN-13, UPC-A, ITF-14 and QR. Export PNG, SVG, PDF or EPS, or bulk-generate from a CSV — all in your browser.",
  intro:
    "The Barcode Generator renders 20 symbologies entirely in your browser. Nineteen linear formats — Code 128 (plus its A, B and C subsets), EAN-13, EAN-8, EAN-5, EAN-2, UPC-A, Code 39, ITF, ITF-14, MSI with Mod 10/11/1010/1110 check digits, Pharmacode and Codabar — are drawn by the JsBarcode library, while QR codes are drawn by qrcode.react at error-correction level M. Every edit re-renders after a 120 ms debounce into both a visible canvas and a hidden SVG twin, and that SVG is the vector source for the SVG and EPS downloads; PDFs are written with jsPDF on a page sized to the barcode. Bulk CSV jobs are parsed with PapaParse and zipped with JSZip locally, so nothing you type or upload is sent to a server.",
  useCases: [
    "Printing retail and packaging labels — EAN-13, EAN-8, UPC-A or ITF-14 with the check digit handled for you, exported as vector SVG or EPS so the bars stay sharp at any print size",
    "Labelling inventory, cartons, shelves and asset tags in bulk — upload a CSV of codes and get back a ZIP of PNGs, one file per row, with the format set per row",
    "Encoding a URL, a Wi-Fi join string or a short block of text (up to 500 characters) as a QR code, then copying it to the clipboard for a slide, poster or packing slip",
  ],
  benefits: [
    [
      "20 symbologies in one dropdown",
      "Code 128 and its A/B/C subsets, EAN-13, EAN-8, EAN-5, EAN-2, UPC-A, Code 39, ITF, ITF-14, four MSI check-digit variants, Pharmacode, Codabar and QR. Each format carries its own character limit and a plain-English note on what it accepts, and JsBarcode validates your input live as you type.",
    ],
    [
      "Vector output, not just PNG",
      "Download as PNG, SVG, PDF or EPS. The SVG and EPS files are true vectors built from the rendered bar rectangles — the EPS is written as PostScript with the bars as rectfill paths — so labels stay crisp at any print size. EPS is offered for the 1D formats; QR exports as PNG, SVG or PDF.",
    ],
    [
      "CSV in, ZIP of barcodes out",
      "The Bulk Generate panel takes a CSV, TSV or TXT file: first column is the value, an optional second column (or a format header) sets the symbology per row. Every row renders offscreen to PNG and the set downloads as barcodes.zip, with any rows that failed listed by reason.",
    ],
    [
      "Nothing is uploaded",
      "JsBarcode, qrcode.react, jsPDF, JSZip and PapaParse all run client-side — there is no server call, no account and no watermark. Your last 12 barcodes are kept only in this browser's localStorage, and each one can be deleted individually.",
    ],
  ],
  faqs: [
    [
      "Is this barcode generator free, and do I need an account?",
      "It's free with no account and no watermark. The barcode libraries load into your browser and everything renders on your own device, so there's no upload step and no server call. The only data kept is a history of your last 12 barcodes, stored in this browser's localStorage, which you can delete entry by entry.",
    ],
    [
      "What barcode formats does it support?",
      "Twenty: Code 128 plus its A, B and C subsets, EAN-13, EAN-8, EAN-5, EAN-2, UPC-A, Code 39, ITF (Interleaved 2 of 5), ITF-14, MSI with Mod 10, Mod 11, Mod 1010 and Mod 1110 check digits, Pharmacode and Codabar, plus QR codes. Input limits vary by format — 80 characters for Code 128, 13 digits for EAN-13, 12 for UPC-A, 14 for ITF-14 and 500 characters for QR.",
    ],
    [
      "Does it calculate the EAN-13 or UPC check digit automatically?",
      "Yes. Enter 12 digits for EAN-13 or 11 for UPC-A and JsBarcode appends the check digit; enter the full 13 or 12 digits and it verifies the one you supplied, flagging a mismatch in the preview. The MSI variants (Mod 10, Mod 11, Mod 1010, Mod 1110) append their check digits automatically as well.",
    ],
    [
      "How do I generate hundreds of barcodes at once?",
      "Drop a CSV into the Bulk Generate panel. The first column is the value and an optional second column — or a column headed format — sets the symbology for that row; anything unrecognised falls back to the format selected above. Each row renders to PNG and the whole batch downloads as barcodes.zip with files named like 001-CODE128-A123B456C789.png. A sample CSV is one click away, and QR is the only format bulk mode skips.",
    ],
    [
      "Can I download a barcode as a vector file for printing?",
      "Yes — pick SVG or EPS for true vector output, or PDF. The SVG comes from a hidden SVG copy of the barcode rendered alongside the canvas, the EPS is generated from that same SVG as PostScript with each bar as a filled rectangle and text set in Helvetica, and the PDF is built with jsPDF on a page sized exactly to the barcode. EPS is available for the 1D symbologies only.",
    ],
    [
      "What can I customise — size, colour, margins?",
      "Three size presets, any hex colours, and margin control. Small draws 1.5 px bars at 70 px tall, medium 2 px at 100 px, large 3 px at 140 px (QR renders at 180, 260 or 340 px square). You can set the bar colour and background to any hex value, set a margin from 0 to 40 px, add a quiet zone that adds 20 px more on top of that, and toggle whether the human-readable text prints under the bars.",
    ],
    [
      "Why does it say my data isn't valid for the selected format?",
      "Because that symbology has stricter rules than the text you entered. Numeric-only formats (EAN, UPC, ITF, MSI) reject letters, ITF needs an even number of digits, Code 39 accepts A–Z, 0–9, the characters -.$/+% and space, Codabar needs an A–D start and stop character, and Pharmacode takes a number from 3 to 131070. JsBarcode's validator reports the problem live, and the Use example button loads a value that's valid for whichever format is selected.",
    ],
    [
      "Can I copy the barcode straight into another app?",
      "Yes — Copy Image writes a PNG to your clipboard using the Clipboard API's ClipboardItem, so you can paste it into a document, slide, design file or email. If your browser doesn't support image clipboard writes the tool says so, and you can use Download instead.",
    ],
  ],
  steps: [
    "Enter or paste your value in step 1, choose a symbology from the grouped dropdown (or press Use example to load a value that's valid for it), and check the live preview — invalid data is flagged immediately with the reason.",
    "Open step 2 to set the size preset, bar and background colours, margin from 0 to 40 px, the optional 20 px quiet zone, and whether the human-readable text prints under the bars.",
    "Pick PNG, SVG, PDF or EPS and click Download — or use Copy Image to put a PNG on your clipboard, Save to History to keep the settings, or upload a CSV in Bulk Generate to get the whole batch as a ZIP.",
  ],
};

export default seo;
