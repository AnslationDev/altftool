const seo = {
  title: "PDF to Base64 Converter: 25 MiB In-Browser",
  metaDescription:
    "Encode a PDF (up to 25 MiB) into a data:application/pdf;base64 URL in your browser. The %PDF- header is checked first and the exact size shown.",
  steps: [
    "Select a file with 'Choose a PDF (up to 25.0 MiB)' — the %PDF- header is verified before encoding, so a renamed non-PDF is rejected early.",
    "Press 'Convert to Base64' to encode the file locally; the report lists the PDF version, the %%EOF marker check and the exact Base64 character count.",
    "Press 'Copy data URL' for the full data:application/pdf;base64 string, or 'Download .txt' to save it as <filename>.base64.txt.",
  ],
  intro:
    "This converter turns a local PDF into a Base64 data URL — the data:application/pdf;base64,… string defined by RFC 2397, with the payload encoded per RFC 4648. Because Base64 writes every three bytes as four characters, the output is exactly one third larger than the file. It is built for developers wiring PDFs into email APIs, JSON request bodies and database columns that only accept text, and it checks the %PDF- header before encoding so a renamed file is caught early.",
  useCases: [
    "Attach an invoice PDF to a transactional email API such as SendGrid or SES, which expect the attachment content as a Base64 string.",
    "Embed a small terms-and-conditions PDF inside a JSON fixture so an automated test needs no external file.",
    "Store a signed document in a text-only column or a config file without setting up object storage.",
  ],
  benefits: [
    ["Nothing is uploaded", "The PDF is read and encoded in your browser; no bytes reach a server."],
    ["Header verification", "Reads the %PDF- marker, the declared version and the trailing %%EOF so a truncated or misnamed file is flagged."],
    ["Exact size before you convert", "Shows the character count from ceil(bytes ÷ 3) × 4 plus the 28-character data URL prefix."],
  ],
  faqs: [
    [
      "How much larger is a PDF after Base64 encoding?",
      "Exactly 33.3% larger. A 2 MiB PDF becomes 2,796,204 Base64 characters, plus the 28-character data:application/pdf;base64, prefix — so plan attachment limits against the encoded size, not the file size.",
    ],
    [
      "What is the largest PDF I can convert here?",
      "25 MiB. Both the raw bytes and the roughly 34 MB text output have to be held in memory at once, and a JavaScript string is capped near 512 MiB in V8, so larger files risk crashing the tab.",
    ],
    [
      "How can I tell a real PDF from a renamed file?",
      "Every PDF starts with the five bytes %PDF- followed by a version such as 1.7, per ISO 32000-1 section 7.5.2, and ends with the %%EOF marker. This tool reads both and refuses to encode a file that fails the header check.",
    ],
    [
      "Is a Base64 PDF encrypted or protected in any way?",
      "No. Base64 is an encoding, not encryption — anyone with the string can decode it back to the original PDF in one step. Use real encryption or a signed URL if the document is confidential.",
    ],
  ],
};

export default seo;
