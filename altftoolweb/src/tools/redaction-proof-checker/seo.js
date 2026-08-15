const seo = {
  title: "Redaction Checker: Is Text Still Under the Black",
  metaDescription:
    "Opens a redacted PDF, PNG, JPEG or WebP up to 50 MB in your browser and reports text still extractable under the marks, Redact annotations and metadata.",
  steps: [
    "Select the final redacted export you intend to share — PDF, PNG, JPEG or WebP up to 50 MB — rather than the editable source.",
    "Press Check evidence to parse the text layer, annotation subtypes, attachments and scripts with PDF.js, or scan pixels for transparency, dark bands and EXIF.",
    "Read the verdict, page counts and findings, then Download report writes <name>-redaction-check.json holding counts and rule ids, never the matched values.",
  ],
  intro:
    "This checker opens a redacted PDF or image in your browser and looks for the evidence that a redaction failed — text still extractable under a black box, redaction annotations that were drawn but never applied, embedded attachments, document scripts and identifying metadata. PDFs are parsed with PDF.js page by page for their text layer, annotation subtypes, image paint operators, attachments and JavaScript actions; images are decoded to pixels and scanned for transparency, near-black bands and EXIF, XMP, GPS or PNG text-chunk markers. It is for anyone about to release a document they have blacked out, and it returns one of three verdicts: high-risk evidence found, manual review required, or no obvious automated signal.",
  useCases: [
    "You blacked out an Aadhaar number and a phone number in a PDF before emailing it to a landlord, and want to confirm the digits are not still sitting in the text layer under the rectangle",
    "A colleague sends you a redacted contract to countersign and you want to check whether the black boxes are applied redactions or just movable square annotations someone dragged on top",
    "You are posting a screenshot of a bank statement and need to know whether the PNG still carries GPS coordinates or an XMP block from the device that captured it",
  ],
  benefits: [
    ["Separates drawn marks from applied redactions", "A Redact annotation still present in the file is flagged high-risk, because the mark can exist while the content underneath was never removed."],
    ["Reports counts, never the matched values", "Pattern hits are summarised as a match count and page numbers — the Aadhaar, PAN, email, phone or UPI string itself is not written into the report or the JSON download."],
    ["Names its own blind spots", "Every result ships with the limitations that apply: no OCR of image pixels, no recovery of overwritten pixels, no inspection inside password-protected content."],
  ],
  faqs: [
    [
      "Does a black rectangle over text actually remove it?",
      "Often not. In a PDF, drawing a filled square or a Redact annotation over words can leave the original characters in the text layer, where anyone can select, copy or search them. Redaction is only permanent once the editor applies or burns in the marks and you save a fresh flattened copy — this checker looks for exactly that failure by extracting the text under the marks.",
    ],
    [
      "What kinds of sensitive text does it look for?",
      "Six pattern families: Aadhaar-like 12-digit numbers, PAN-format identifiers (five letters, four digits, one letter), email addresses, Indian mobile numbers, UPI handles on the common bank suffixes, and credential words such as password, OTP, API key and private key. Any hit in extractable text raises the high-risk verdict, reported as a count and page list rather than the value itself.",
    ],
    [
      "If it says nothing was found, is my file safe to share?",
      "No — a clean result is not proof of safe redaction, and the tool says so in its own output. It does not OCR pixels, reverse a blur, recover overwritten image data, or judge whether visible information is sensitive. Zoom to 100% and review every page yourself, ideally with a second reviewer, before you release anything consequential.",
    ],
    [
      "What files can I check, and does anything leave my browser?",
      "PDF, PNG, JPEG and WebP, and nothing is uploaded — parsing and pixel inspection run in the page. Large images are scaled so the longest edge is at most 1600 pixels before the pixel scan, which is why transparency and dark-band figures are reported against the inspected pixels rather than the original resolution.",
    ],
  ],
};

export default seo;
