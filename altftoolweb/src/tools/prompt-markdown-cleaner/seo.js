const seo = {
  intro:
    "The Prompt Markdown Cleaner strips stray markdown syntax, straightens smart quotes and deletes invisible Unicode characters from text before you paste it into an AI model. It maps typographic punctuation (U+2018–U+201D curly quotes, em dashes, ellipses, non-breaking spaces) back to plain ASCII and removes zero-width spaces, BOMs and soft hyphens that ride along in copy-paste. It runs entirely in the browser, for anyone who moves text between Word, Google Docs, chat apps and an LLM all day.",
  useCases: [
    "A writer pasting a Google Docs draft into ChatGPT who wants the curly quotes and bold markers gone so the model does not echo the formatting back",
    "A developer whose prompt contains an invisible zero-width space that keeps breaking an exact-match instruction or a code snippet",
    "A prompt engineer normalising a prompt library so every template uses straight ASCII quotes and consistent whitespace",
  ],
  benefits: [
    ["Four independent passes", "Invisible characters, smart punctuation, markdown syntax and whitespace can each be toggled separately."],
    ["Change accounting", "See exactly how many characters each pass fixed, so nothing is altered silently."],
    ["Private by design", "All cleaning happens locally in the browser; the text is never uploaded."],
  ],
  faqs: [
    [
      "Why do quotes turn curly when I copy text from Word or Google Docs?",
      "Word processors autocorrect straight ASCII quotes to typographic 'smart' quotes (Unicode U+2018/U+2019 and U+201C/U+201D) as you type. When that text is pasted into a prompt, code sample or config file, the curly characters are different code points from ' and \", which can break string matching and code. This tool maps them back to their ASCII equivalents.",
    ],
    [
      "What are zero-width characters and why should I remove them from a prompt?",
      "Zero-width characters such as the zero-width space (U+200B), zero-width joiner (U+200D) and byte-order mark (U+FEFF) occupy no visible width but are real characters in the string. They commonly arrive via copy-paste from web pages and can silently break exact-match instructions, identifiers and JSON. The cleaner deletes them and reports how many it found.",
    ],
    [
      "Does stripping markdown delete the content inside code blocks?",
      "No. Fenced code blocks keep their inner code — only the ``` fence markers and language tag are removed. Links are converted to 'text (url)' so the destination is preserved, and images are reduced to their alt text.",
    ],
    [
      "Is the text I paste sent to a server?",
      "No. The cleaning is a pure string transformation that runs in your browser tab; nothing is transmitted or stored. You can verify this by loading the page and then going offline — the tool keeps working.",
    ],
  ],
};

export default seo;
