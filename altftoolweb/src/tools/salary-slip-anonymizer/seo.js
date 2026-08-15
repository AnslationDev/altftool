const seo = {
  title: "Salary Slip Anonymizer: Redact Payslip PDF Locally",
  metaDescription:
    "Draw boxes over payslip details, then rebuild the file rasterized so no text layer survives. PDF, PNG, JPEG and more up to 40 MB, all in your browser.",
  steps: [
    "Use Choose PDF or image to load a slip — PDF, PNG, JPEG, WebP, BMP or AVIF, maximum 40 MB, PDFs up to 30 pages.",
    "Add a manual preset — Employee name & ID, Address, Bank, PAN & account details or Salary amounts — then drag and resize each rectangle to fit.",
    "Tick the acknowledgement, pick 96, 144 or 216 DPI, press Create rasterized PDF, then Download final copy, saved with an -anonymized suffix.",
  ],
  intro:
    "Salary Slip Anonymizer lets you draw opaque boxes over the private parts of a payslip and then rasterizes every page to an image before rebuilding the file, so the covered text is destroyed rather than hidden behind a shape. It accepts PDF, PNG, JPEG, WebP, BMP and AVIF files up to 40 MB (PDFs up to 30 pages), rendering pages with pdf.js and re-assembling the output with pdf-lib entirely inside your browser. Four one-click presets — employee name and ID, address, bank/PAN/account details, and salary amounts — put boxes on the usual regions so you only have to nudge them.",
  useCases: [
    "A landlord wants proof of employment before signing a lease, and you are happy to show your name and employer but not your bank account number or PAN.",
    "You are posting a payslip screenshot in a salary-negotiation or visa forum thread and need the amounts covered in a way that cannot be selected and copied back out.",
    "A recruiter asks for a recent slip as evidence of your notice period and grade, and you want to hand over the document with the take-home figure blacked out.",
  ],
  benefits: [
    [
      "The redaction is destructive, not cosmetic",
      "Each page is rendered to a canvas, painted over, and re-embedded as a PNG image — the exported file keeps no source text layer and no source objects, so nothing can be selected, searched or lifted from under a box.",
    ],
    [
      "Presets for the four regions that actually matter",
      "Identity, address, bank/PAN/account and salary-amount presets drop pre-sized boxes on the standard payslip layout; you drag or type exact percentage coordinates from there.",
    ],
    [
      "You choose the legibility/size trade-off",
      "Export at 96, 144 or 216 DPI, capped at a 6000 px longest edge, so a slip meant for on-screen review stays small while one going to a verification desk stays sharp.",
    ],
  ],
  faqs: [
    [
      "Can the blacked-out text be recovered from the exported file?",
      "No. The tool does not draw a rectangle on top of live text — it rasterizes the page to pixels, fills the masked areas with an opaque colour, and builds a new PDF from those images, so the export carries no text layer or original objects to recover. That is the difference between this and adding a black shape in a PDF viewer, where the words underneath usually survive.",
    ],
    [
      "What file types and sizes can I redact?",
      "PDF, PNG, JPEG, WebP, BMP and AVIF, up to 40 MB per file, and PDFs of up to 30 pages in one session. A PDF comes back as a flattened PDF; an image comes back as a PNG.",
    ],
    [
      "Which export DPI should I pick?",
      "144 DPI is the balanced default and is fine for most slips; pick 216 DPI when small print has to stay readable after printing, and 96 DPI when the file is only going to be viewed on screen and you want it light. Whatever you choose, no page is rendered longer than 6000 pixels on its longest edge.",
    ],
    [
      "Is my payslip uploaded anywhere?",
      "No. Rendering, masking and export all happen in your own browser using a local pdf.js worker and pdf-lib, so the document never leaves the device. Closing the tab discards the file and the masks you drew.",
    ],
  ],
};

export default seo;
