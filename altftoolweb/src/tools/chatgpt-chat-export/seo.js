const seo = {
  intro:
    "This tool turns a saved ChatGPT conversation into a readable, shareable document: it parses the export, rebuilds the message thread with code blocks, tables and links intact, and writes it back out as PDF, DOCX, Markdown, HTML, JSON, TXT or CSV. It accepts JSON exports, Markdown, plain text, HTML and CSV, or content pasted straight into the page, and detects the format from the file extension or the first characters. Eight visual themes and adjustable fonts, sizes and page settings control how the finished document looks.",
  useCases: [
    "You worked out a solution with ChatGPT and need it as a PDF to attach to a ticket, a client email or a piece of coursework",
    "You want a long conversation as a DOCX you can edit into a report, with the assistant's tables preserved as real Word tables rather than pipe characters",
    "You exported your full ChatGPT history as JSON and need one specific thread pulled out, searched and saved as Markdown for your notes app",
  ],
  benefits: [
    ["Keeps code and tables as structure", "Fenced code blocks keep their language and syntax highlighting across 25 recognised languages, and Markdown tables become real tables in DOCX and PDF."],
    ["Reads whatever shape your export is in", "Nested JSON is walked recursively for role/content pairs, so both single-conversation files and full history dumps resolve into a message list."],
    ["Shows what is actually in the thread", "A stats panel counts messages by role, words, characters, code blocks, tables, images and links, with reading time at 200 words per minute."],
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
      "Seven: PDF, DOCX, Markdown, HTML, JSON, plain TXT and CSV. PDF and DOCX are the presentation formats with themes and page settings; Markdown and JSON are the ones to pick if you plan to re-import the conversation somewhere else.",
    ],
    [
      "Does my conversation get uploaded to a server?",
      "No. The file is read with the browser's FileReader and every parse, render and export step runs locally, so the conversation content stays on your device even for the PDF and DOCX outputs.",
    ],
    [
      "Will my code snippets survive the export?",
      "Yes. Fenced blocks are detected with their language tag, mapped through aliases (js to javascript, py to python, rs to rust and so on), and rendered in a monospace block in every output format rather than being flattened into prose.",
    ],
  ],
};

export default seo;
