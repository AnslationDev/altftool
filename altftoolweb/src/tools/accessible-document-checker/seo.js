const seo = {
  intro:
    "This checker opens a PDF, DOCX, XLSX or PPTX in the browser and reports the accessibility markers actually present in the file: a document title, a default language, heading or outline structure, table header rows, alternative-text metadata on images, and bookmarks. For PDFs it scans the raw bytes for /StructTreeRoot with /Marked true, /Lang, /Title, /Alt entries against image objects and /Outlines; for Office files it unzips the package and reads docProps/core.xml and the document XML for language, heading styles, table header markers and drawing descriptions. Each result comes back as present, needs review, or manual — it never claims conformance it cannot observe.",
  useCases: [
    "A report is about to be published on a government or university site and you need to know whether the PDF was exported tagged or flat before it goes live",
    "A supplier sends a DOCX and you want to check it carries real heading styles and image descriptions rather than bold text sized to look like headings",
    "You are triaging a folder of legacy documents and need to find the ones with no language tag or no title so you know where remediation should start",
  ],
  benefits: [
    ["Four formats, one check", "PDF, Word, Excel and PowerPoint are inspected with format-appropriate markers instead of a single generic file scan."],
    ["Three-state results, not pass or fail", "Findings are present, review or manual, so items a static scan genuinely cannot judge — reading order, decorative intent — are marked as needing a human rather than silently passed."],
    ["Bounded and local", "The file is parsed in the page under explicit size limits and never uploaded, which matters for unpublished or confidential documents."],
  ],
  faqs: [
    [
      "What file types and sizes can I check?",
      "PDF, DOCX, XLSX and PPTX, up to 20 MB per file. Office packages are additionally bounded at 3,000 entries and 80 MB uncompressed, with each XML part read to 2 MB, so a very large deck or workbook is inspected partially and flagged as truncated rather than parsed unsafely.",
    ],
    [
      "Does a clean result mean the document is accessible?",
      "No. It means the structural markers it looks for were found. Reading order, heading hierarchy, whether alt text is actually meaningful, table semantics, colour contrast and form labelling all need a human and assistive technology. The checker marks those as manual precisely so they are not mistaken for passes.",
    ],
    [
      "Why does my tagged PDF still show tagged structure as needing review?",
      "Because PDF markers can sit inside compressed object streams that a raw byte scan cannot see, so absence of a marker is not proof of absence of the feature. An encrypted PDF has the same effect. Confirm in a PDF editor's accessibility checker before concluding the tags are missing.",
    ],
    [
      "Is my document uploaded anywhere?",
      "No. Office files are unzipped with a JavaScript ZIP reader and PDFs are decoded as bytes, all inside your browser tab. Nothing is transmitted, so you can check draft contracts, unreleased reports or student records without them leaving the machine.",
    ],
  ],
};

export default seo;
