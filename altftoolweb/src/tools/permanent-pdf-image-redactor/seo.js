const seo = {
  title: "Permanent PDF & Image Redaction: Flatten Locally",
  metaDescription:
    "Draw masks and export a flattened PDF or PNG with no selectable text left. Up to 40 pages, 50 MB, at 96, 144 or 216 DPI, all in your browser.",
  steps: [
    "Press Choose PDF or image and load a PDF, PNG, JPEG, WebP, GIF, BMP or AVIF file up to 50 MB, with PDFs up to 40 pages.",
    "Drag on the page to add a mask under Cover sensitive areas, or press Add centered mask, then pick a PDF raster quality of 96, 144 or 216 DPI.",
    "Press Export flattened PDF, inspect every page in the preview, then download the file, which is named after the source with -redacted appended.",
  ],
  intro:
    "This redactor removes sensitive content from a PDF or image by rasterizing every page to a canvas, painting fully opaque rectangles over the areas you mark, and rebuilding the file from those flattened pixels — so the finished PDF contains no selectable text, no original page objects and nothing underneath the boxes to recover. A black rectangle drawn in a PDF editor usually sits on top of text that is still in the file and can be copied straight out; this rebuilds the page instead. Everything happens in your browser, and you choose the export resolution: 96, 144 or 216 DPI.",
  useCases: [
    "Sharing a bank statement for a rental or loan application with the account number and balance genuinely removed, not just covered",
    "Publishing a screenshot of a support ticket where a customer's email address and phone number appear in the header",
    "Sending a signed contract to a third party with the counterparty's address, signature block and reference numbers blacked out",
  ],
  benefits: [
    ["Flattens instead of overlaying", "Pages are re-rendered as images with the masks baked in, so there is no text layer left to select, search or copy back out."],
    ["Pixel-accurate box placement", "Rectangles are stored as fractions of the page, so a box drawn on the preview lands in exactly the same place on a higher-resolution export."],
    ["Choose your output resolution", "144 DPI is the balanced default; 216 DPI keeps small print legible and 96 DPI keeps the file small for email."],
  ],
  faqs: [
    [
      "Why can people still read text under a black box in most PDFs?",
      "Because a drawn rectangle is just another object placed on top — the text characters remain in the file and can be copied, searched or extracted by removing the shape. True redaction has to delete or destroy the underlying content, which is why this tool rasterizes the page and rebuilds it from pixels.",
    ],
    [
      "What files and sizes can I redact here?",
      "PDFs up to 40 pages, plus PNG, JPEG, WebP, GIF, BMP and AVIF images, with a 50 MB limit per file. PDFs export as a new flattened PDF and images export as PNG.",
    ],
    [
      "Will the exported PDF still be searchable?",
      "No. Every page becomes an image, so text selection, copy-paste and full-text search stop working across the whole document — that is the trade-off for making the redaction permanent. Keep your original if you still need a searchable copy.",
    ],
    [
      "Does any of my file get uploaded?",
      "No. The PDF is parsed and rendered locally with pdf.js, the masks are painted on an in-page canvas, and the new document is assembled in the browser, so the file never leaves your device. For legally sensitive disclosure, still have the exported file checked by whoever is responsible for it.",
    ],
  ],
};

export default seo;
