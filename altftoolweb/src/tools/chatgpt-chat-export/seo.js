const seo = {
  title: "Export ChatGPT Chats to PDF, DOCX & Markdown",
  metaDescription:
    "Convert a saved ChatGPT conversation to PDF, DOCX, Markdown, HTML, JSON, TXT or CSV — parsed and exported entirely in your browser, nothing uploaded.",
  intro:
    "This tool turns saved ChatGPT text into a readable document: it parses message roles and content, detects fenced code and Markdown tables, and writes the conversation as PDF, DOCX, Markdown, HTML, JSON, TXT or CSV. It accepts JSON exports, Markdown, plain text, HTML and CSV, or content pasted straight into the page. Formatting support varies by output: DOCX, Markdown and HTML keep the richest detected structure, while PDF is a plain message-text layout.",
  useCases: [
    "You worked out a solution with ChatGPT and need it as a PDF to attach to a ticket, a client email or a piece of coursework",
    "You want a long conversation as a DOCX you can edit into a report, with detected Markdown tables written as Word tables",
    "You have a supported JSON conversation export and want to search its imported messages before saving them as Markdown for your notes app",
  ],
  benefits: [
    ["Detects code and Markdown tables", "The viewer labels fenced code with one of 25 syntax labels. DOCX uses monospaced code and real tables; Markdown and HTML also retain detected blocks and tables. PDF writes message content as plain text."],
    ["Reads whatever shape your export is in", "Nested JSON is walked recursively for role/content pairs, so both single-conversation files and full history dumps resolve into a message list."],
    ["Summarizes the imported text", "A stats panel counts messages by role, words, characters, detected code blocks and Markdown tables, with an estimated reading time at 200 words per minute."],
  ],
  steps: [
    "Drop a saved conversation onto the Drag & drop your chat export panel, or click to browse files — the picker accepts .json, .md, .markdown, .txt, .html, .htm and .csv — or click Paste your chat conversation and press Parse Conversation on the text you paste in.",
    "The thread is parsed in the browser, a Parsed <n> messages confirmation appears and the Viewer tab opens; the Settings tab controls Page Size (A4 or Letter), Orientation (Portrait or Landscape), font size, line height and the Show Avatars, Show Timestamps, Hide User Messages and Hide Assistant Messages toggles.",
    "Open the Export tab and click PDF, DOCX, Markdown, HTML, TXT, JSON or CSV to save the document under the conversation title with that extension (or chat-export if the title has no usable characters); Copy to Clipboard, Print and Share sit beside them, and Clear empties the workspace.",
  ],
  faqs: [
    [
      "How do I get my ChatGPT conversation out of the app first?",
      "Use the platform's own data export, which emails you a downloadable archive containing your conversations as JSON, or copy a single thread and paste it into this page. The JSON archive is the better input, because it preserves message roles and ordering that a copy-paste can lose.",
    ],
    [
      "Which output formats can I export to?",
      "Seven: PDF, DOCX, Markdown, HTML, JSON, plain TXT and CSV. PDF uses the selected light/dark and page options. DOCX uses a fixed document style while retaining detected headings, code blocks and tables. Markdown and JSON are better suited to later text processing.",
    ],
    [
      "Does my conversation get uploaded to a server?",
      "No. The file is read with the browser's FileReader and every parse, render and export step runs locally, so the conversation content stays on your device even for the PDF and DOCX outputs.",
    ],
    [
      "Will my code snippets survive the export?",
      "Their text survives, but presentation depends on the format. The viewer labels fenced blocks, DOCX uses a monospaced block, and Markdown and HTML keep a code-block representation. PDF, TXT and CSV carry the message text without promising syntax styling.",
    ],
  ],
};

export default seo;
