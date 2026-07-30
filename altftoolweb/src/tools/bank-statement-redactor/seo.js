const seo = {
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
};

export default seo;
