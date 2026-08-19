const seo = {
  title: "Remove Markdown Formatting, Keep Code Blocks",
  metaDescription:
    "Strip CommonMark and GFM markup — headings, emphasis, links, tables, fences — while code spans and fenced blocks keep their contents unchanged.",
  steps: [
    "Paste your Markdown into the “Markdown prompt” box; the line underneath counts how many of the 200,000 allowed characters you have used.",
    "Choose how list markers come out under Bullet markers — “Keep as -”, “Convert to •” or “Remove the marker” — and set the five switches: Keep the text inside code, Keep link URLs in brackets, Keep image alt text, Keep numbers on ordered lists, Collapse runs of blank lines.",
    "The Plain text panel updates live beside “Markup removed” as a percentage, with Markdown length, Plain length, Characters removed, Words and Lines and a “What was found” table counting each construct; “Copy plain text” copies the result.",
  ],
  intro:
    "Prompt Markdown to Plain removes Markdown markup from a prompt while keeping the words, handling the CommonMark block and inline constructs — ATX and setext headings, fenced code, blockquotes, lists, tables, thematic breaks, emphasis, links, images, autolinks and backslash escapes — plus the GitHub extensions for strikethrough and tables. Code fences and code spans are lifted out before anything else runs, so markup that only exists inside an example is never stripped by mistake. It is for anyone pasting a prompt into a field that shows raw asterisks and hashes instead of rendering them.",
  useCases: [
    "Flatten a prompt for a form, SMS gateway or voice assistant that displays Markdown characters literally instead of rendering them.",
    "Strip formatting from a system prompt before pasting it into a plain-text config value or an environment variable.",
    "Turn a Markdown documentation section into clean prose for a customer email, keeping code samples intact.",
    "Cut the character count of a prompt by removing markup that the target never renders anyway.",
  ],
  benefits: [
    ["Code stays intact", "Fenced blocks and code spans are protected first, so **asterisks** inside an example survive."],
    ["Respects escapes", "A backslash-escaped character is resolved the way CommonMark does it, before emphasis is parsed."],
    ["Shows what it found", "Counts every heading, link, table row and code block removed, so nothing disappears silently."],
  ],
  faqs: [
    [
      "How do I remove Markdown formatting from text?",
      "Resolve the constructs in the right order: lift out code fences and code spans first, then handle block markup such as headings, lists, blockquotes and tables, then inline markup such as emphasis and links, and resolve backslash escapes before emphasis rather than after. A single find-and-replace pass over asterisks will corrupt any code sample in the text.",
    ],
    [
      "Will this delete my code blocks?",
      "No. The contents of fenced blocks and inline code spans are preserved by default and only the fences and backticks are removed. You can switch that off if you want the code dropped entirely, which is useful when you only need the prose.",
    ],
    [
      "Why do the asterisks come back if I run it twice?",
      "Because plain text is ambiguous. If your Markdown contained an escaped \\*word\\*, the correct plain-text output is *word* — and running the stripper again on that output will read those asterisks as emphasis. Run it once on your Markdown source, not repeatedly on its own output.",
    ],
    [
      "What happens to tables and links?",
      "Table rows keep their cells separated by a pipe with the alignment row dropped, so the data stays readable as text. Links are reduced to their label by default, or rendered as 'label (url)' if you turn on keeping URLs — useful when the reader still needs the address.",
    ],
  ],
};

export default seo;
