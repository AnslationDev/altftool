const seo = {
  intro:
    "Base64 to PDF decodes a Base64 payload — raw, or wrapped in a `data:application/pdf;base64,` URL — back into a working PDF file and inspects its structure. It verifies the `%PDF-` header and version required by ISO 32000-1 §7.5.2, looks for the `startxref` pointer and closing `%%EOF` marker that mark a complete file, and reports encryption, linearization and visible page objects. It is for developers debugging an invoice API, a signed document webhook, or an email attachment that arrives as a string.",
  useCases: [
    "Open the Base64 invoice a payment gateway returns in its JSON response, without writing a decode script",
    "Check whether a PDF that arrived over an API is truncated before blaming the viewer that will not open it",
    "Confirm a document is password-protected (an /Encrypt dictionary) rather than corrupt, when a customer reports it will not print",
  ],
  benefits: [
    ["Structure checked, not assumed", "Header, startxref and %%EOF are all verified, so a truncated payload is caught before you download it."],
    ["Preview before you save", "The decoded file renders in the browser's own PDF viewer from a blob URL, so you see the pages immediately."],
    ["Fully offline", "Decoding uses the browser's built-in `atob`; the document is never uploaded, which matters for contracts and payslips."],
  ],
  faqs: [
    [
      "How do I know a Base64 string is a PDF before decoding it?",
      "Check the first seven characters: every PDF begins with the bytes `%PDF-`, which always encode to `JVBERi0` in standard Base64. If the string starts with anything else it is not a PDF — `iVBORw0KGgo` is a PNG and `JVBERi0xLjc` specifically means PDF 1.7.",
    ],
    [
      "Why does my decoded PDF open blank or refuse to open?",
      "The usual cause is truncation: the Base64 was cut off, so the cross-reference table and the closing `%%EOF` marker are missing. ISO 32000-1 requires both, and this tool flags their absence. The other common cause is that the string was double-encoded — Base64 of Base64 — in which case the decode produces the text `JVBERi0...` rather than binary.",
    ],
    [
      "How much does Base64 inflate a PDF?",
      "By exactly 33%, plus up to two padding characters: Base64 maps every 3 bytes onto 4 ASCII characters. A 1 MB PDF becomes roughly 1.33 MB of text, which is why APIs that return documents inline are usually capped at a few megabytes.",
    ],
    [
      "Can this tool tell me the page count?",
      "It counts objects marked `/Type /Page` in the raw bytes, which is exact for classic PDFs. From PDF 1.5 onwards the page tree can live inside a compressed object stream (`/ObjStm`), where those tokens are not visible without full decompression — in that case the tool reports the count as hidden rather than guessing a wrong number.",
    ],
  ],
};

export default seo;
