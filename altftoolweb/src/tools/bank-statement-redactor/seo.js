const seo = {
  title: "Bank Statement Redactor: Flattened PDF, In-Browser",
  metaDescription:
    "Masks are baked into rasterised pages, so covered text is gone, not hidden. Flags account numbers, IBAN, IFSC and card numbers. Runs in your browser.",
  intro:
    "The Bank Statement Redactor rasterises every page of a PDF or image statement to a canvas, paints opaque masks over the regions you mark, and rebuilds the file from those flattened pixels — so the covered text is gone from the output, not just hidden under a black rectangle. It scans the PDF text layer for account numbers, IBAN, IFSC, SWIFT, card numbers, UPI IDs and transaction references and offers each as a one-click mask, alongside eight statement presets and free-hand boxes. It is for anyone who has to hand a statement to a landlord, lender, employer or accountant without handing over the whole account.",
  useCases: [
    "A rental agency wants proof of salary credits, and you need the balance column and every unrelated transaction covered before you email the PDF.",
    "You are attaching a statement to a support ticket or an insurance claim and must remove the account number, IFSC and card references first.",
    "You need the same masked region applied to all 12 pages of a statement, not redrawn page by page.",
  ],
  benefits: [
    [
      "Flattened output, not an overlay",
      "Pages are re-rendered to a raster canvas with the masks baked in and reassembled as a new PDF, so the original text cannot be selected, copied, or recovered from beneath the box.",
    ],
    [
      "Detection that names what it found",
      "Pattern matching over the PDF text layer flags account numbers, IBAN, IFSC, SWIFT, card numbers, UPI IDs, PAN and UTR references by category and severity, with a redact-all-high-risk action.",
    ],
    [
      "Editing built for statements",
      "Presets for the account holder name, address, account number, routing codes, card references, balance column and transaction rows, plus arrow-key nudging, undo and redo, and copy-a-mask-to-every-page.",
    ],
  ],
  faqs: [
    [
      "Can the redacted text be recovered from the exported file?",
      "No. Each page is rasterised to pixels with the mask already drawn, then embedded as an image in a fresh PDF, so there is no text layer left underneath. This is the difference from drawing a shape in a PDF viewer, where the text often survives beneath it.",
    ],
    [
      "What files and sizes can I load?",
      "PDF plus PNG, JPEG, WebP, BMP and AVIF images, up to 40 MB and 30 PDF pages per session. Export raster quality is adjustable, defaulting to 144 DPI with a 6000-pixel maximum edge.",
    ],
    [
      "Is my bank statement uploaded to a server?",
      "No. Rendering, detection and export all run inside your browser tab using pdf.js and pdf-lib, and the finished file is created as a local blob download. Nothing is transmitted.",
    ],
    [
      "Does automatic detection catch everything?",
      "No — treat it as a first pass. Detection only reads the PDF text layer, so scanned or photographed statements return nothing to scan, and the tool requires you to acknowledge the export and confirm a final visual inspection before download for exactly this reason.",
    ],
  ],
  steps: [
    "Drop a file on Drag & drop statement here, or browse files, paste one with Ctrl+V, or use the picker, which accepts PDF, PNG, JPEG, WebP, BMP and AVIF. Anything over 40 MB is refused, as are PDFs longer than 30 pages; once a file loads the card shows its name, size and page count beside a Validated & Ready badge, and Replace document swaps in a different file.",
    "Pick a Redaction Mask Style — Permanent Black Box, White Out Box, Gaussian Blur, Pixelation Block, Mask with XXXXXX, [REDACTED] Label or Custom Placeholder — then place boxes from Statement Region Presets (Account holder name, Postal address, Account number, IFSC / routing code, IBAN / SWIFT, Card references, Balance amounts, Transaction rows) or draw one with Custom Mask. Sensitive Data Radar lists what the PDF text layer matched and offers Mask High Risk and Redact Selected; a selected box can be repositioned by percentage, repeated with Apply position to all N pages, or removed with Delete or Clear page masks.",
    "Choose the Raster Resolution (DPI Quality) — Standard (96 DPI), Balanced (144 DPI, the default) or Ultra High (216 DPI) — tick the box confirming you reviewed every page, then press Generate Permanently Flattened Document. Inspect the rebuilt file in the Mandatory Final Inspection preview, tick that box too, and Download Redacted Copy saves it as <filename>-redacted.pdf, or <filename>-redacted.png when the source was an image.",
  ],
};

export default seo;
