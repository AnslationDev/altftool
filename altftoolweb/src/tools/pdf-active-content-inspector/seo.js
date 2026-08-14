const seo = {
  title: "PDF Active Content Inspector: JS & OpenAction Cues",
  metaDescription:
    "Counts /JavaScript, /OpenAction, /Launch, /SubmitForm, /EmbeddedFile and more across nine categories in a PDF up to 20 MB. Nothing is decoded or run.",
  steps: [
    "Press Choose PDF and pick one local file, maximum 20 MB, carrying a %PDF- header in its first 1,024 bytes.",
    "The bounded pass counts markers across nine categories; check Selected cues, Tokens inspected and Streams skipped for truncation warnings.",
    "Press Export counts to save pdf-active-content-cue-counts.json, which holds tallies but no scripts, URLs or filename.",
  ],
  intro:
    "The PDF Active Content Inspector counts the structural name markers that indicate a PDF can do something beyond display text — /JavaScript and /JS, /OpenAction and /AA, /Launch, /SubmitForm and /ImportData, /URI and /GoToR, /EmbeddedFile, /AcroForm and /XFA, /RichMedia and /Named — grouped into nine categories. It is a bounded lexical pass that reads the file's token structure only: stream bodies, comments and string values are skipped, and no script, action, URL, attachment or media is ever decoded, followed or executed. It is a triage aid for security, IT and document-handling teams, not a parser, sandbox or antivirus scanner.",
  useCases: [
    "An unexpected invoice PDF arrived and, before opening it, you want to know whether it carries an open-action or JavaScript marker at all.",
    "You are publishing PDFs from a supplier onto a public site and need a quick per-file check for embedded-file and submit-form markers that your policy does not allow.",
    "A helpdesk ticket needs evidence attached, and you export the counts-only JSON report so the marker tallies travel with the ticket without the document itself.",
  ],
  benefits: [
    [
      "Marker counts grouped by what they imply",
      "Findings arrive as nine named categories — JavaScript, automatic actions, launch actions, form submission, external references, attachments, forms, rich media and named commands — instead of a raw string-grep hit list.",
    ],
    [
      "Nothing is decoded or resolved",
      "Only the presence and count of names is reported; target paths, script bodies, URLs and embedded files are never extracted or displayed, so inspecting a hostile file cannot leak its payload into your screen or clipboard.",
    ],
    [
      "Tells you when it could not see everything",
      "If an /Encrypt or object-stream marker appears, the token ceiling of 450,000 is reached, or a stream or string is malformed, the result says so explicitly rather than reporting a clean file.",
    ],
  ],
  faqs: [
    [
      "Does a clean result mean the PDF is safe?",
      "No. Absence of a marker is not proof of safety — compressed object streams, encrypted content, filters, incremental revisions and malformed syntax can all hide cues from a lexical pass. Treat a clean result as one weak signal and use a real antivirus or sandbox for a verdict.",
    ],
    [
      "What are the biggest active-content risks in a PDF?",
      "The markers that let a document act on its own: /OpenAction and /AA fire an action when the file is opened or on an event, /JavaScript carries script, /Launch attempts to start an external program, /SubmitForm can send form data outward, and /EmbeddedFile carries another file inside the PDF.",
    ],
    [
      "What size PDF can it inspect?",
      "Up to 20 MB, and the file must contain a %PDF- header within its first 1,024 bytes. Scanning also stops at 450,000 tokens, and a warning is shown when that ceiling truncates the counts.",
    ],
    [
      "Does finding a JavaScript marker mean the PDF is malicious?",
      "No. Marker presence says nothing about intent, reachability or whether your viewer would even run it — form validation, calculated fields and accessibility features legitimately use these names. It tells you the file deserves a closer look, not that it is dangerous.",
    ],
  ],
};

export default seo;
