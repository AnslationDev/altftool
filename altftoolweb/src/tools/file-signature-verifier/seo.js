const seo = {
  title: "Check a File's Magic Bytes Against Its Extension",
  metaDescription:
    "Reads only the first 64 bytes locally and compares them with the extension and browser MIME across 22 signature families — PNG, %PDF-, PK ZIP, ELF.",
  steps: [
    "Press Choose file under Local file and pick any file on your machine; the complete file is never uploaded or opened.",
    "Press Run local inspection — only the leading 64 bytes are read and matched against the signature table.",
    "Read the verdict with the Extension check, MIME check and Bytes read rows plus the Leading signature bytes in hex, then press Download report to save file-signature-review.json.",
  ],
  intro:
    "This tool reads the first 64 bytes of a file you pick on your own machine and compares that leading magic-byte signature against the file's extension and the MIME type the browser reports for it, then tells you whether the three agree. It recognises 22 common signature families — PNG (89 50 4E 47 0D 0A 1A 0A), JPEG (FF D8 FF), %PDF-, the PK ZIP headers behind DOCX/XLSX/APK/EPUB, gzip, 7z, RAR, OLE compound files, ELF, MZ executables, Mach-O, SQLite, WebAssembly, FLAC, Ogg, WAV, MP3, Matroska/WebM and ISO base media (ftyp). The verdict is consistent, mismatch, detected or unrecognised, plus the leading bytes in hex.",
  useCases: [
    "Someone emailed you an invoice.pdf and you want to check the header actually starts with %PDF- rather than MZ or PK before you double-click it",
    "A download saved as .jpg will not open in your image editor, and you want to see whether the bytes say GIF, WebP or something else entirely",
    "You are sorting a folder of files with no extensions or a generic .bin suffix and need to know which are SQLite databases, which are ZIP containers and which are executables",
  ],
  benefits: [
    [
      "Checks three sources against each other",
      "Signature, filename extension and browser MIME are compared pairwise, so it can flag a known extension whose expected header is missing, not just a header it recognises.",
    ],
    [
      "Reads a bounded slice, never the whole file",
      "Only the leading 64 bytes are examined, so a multi-gigabyte file is inspected as fast as a small one and the body is never opened.",
    ],
    [
      "Shows the raw evidence",
      "You get the first 16 bytes printed as uppercase hex alongside the verdict, so you can confirm the call yourself or paste it into a ticket.",
    ],
  ],
  faqs: [
    [
      "How many bytes does it actually read from my file?",
      "The first 64 bytes, and no more. Every signature in the table lives inside that window — the longest offset used is the ftyp marker at byte 4 of an ISO base media container — so a bounded read is enough to identify the type without touching the rest of the file.",
    ],
    [
      "Does a matching signature mean the file is safe?",
      "No. A matching header only tells you the leading bytes are what the extension implies; it says nothing about whether the rest of the file is valid, unmodified or free of malware. This is an informational triage check, not an antivirus scan — run a proper security tool before opening anything you did not expect.",
    ],
    [
      "Why does my .docx report as a ZIP container?",
      "Because it is one. DOCX, XLSX, PPTX, JAR, APK and EPUB are all ZIP archives and all begin with the same PK signature (50 4B 03 04), so the tool groups them under one entry and treats any of those extensions as a match. To tell them apart you have to read the archive's internal directory, which this bounded check does not do.",
    ],
    [
      "What does it mean when the browser MIME check says mismatch?",
      "It means the MIME string the browser attached to the file belongs to a different signature family than the bytes suggest. Browser MIME is derived largely from the extension and is often absent or wrong, so treat it as a weaker signal than the magic bytes; generic values such as application/octet-stream are ignored rather than counted as a conflict.",
    ],
  ],
};

export default seo;
