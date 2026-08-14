const seo = {
  title: "Prompt Whitespace Normalizer: Strip U+200B, NBSP",
  metaDescription:
    "Collapses double spaces, tabs and stacked blank lines and removes U+00A0, U+200B and U+FEFF, with a count of characters removed and tokens saved.",
  steps: [
    "Paste into 'Prompt to clean' — CRLF endings, U+00A0 no-break spaces, U+200B zero-width spaces and the U+FEFF byte-order mark all come through.",
    "Set Tabs to 'Replace each run with one space', 'Expand to spaces' or 'Keep tabs as they are', and cap Maximum consecutive blank lines.",
    "Read Characters removed with the estimated tokens saved, toggle Show whitespace to reveal the marks, then take the Cleaned prompt with Copy result.",
  ],
  intro:
    "Prompt Whitespace Normalizer rewrites a pasted prompt so that every run of repeated spaces, tab, stacked blank line and invisible Unicode character is reduced to clean, predictable text. It handles the characters that copy-paste drags in without showing them: U+00A0 no-break space, U+200B zero-width space, U+FEFF byte-order mark, Windows CRLF line endings and the U+2000-U+200A quad and hair spaces. Useful for anyone maintaining prompt libraries, system messages or few-shot examples where stray characters change tokenisation and inflate cost.",
  useCases: [
    "Clean a system prompt copied out of a Word or Google Doc before pasting it into an API request body.",
    "Strip zero-width joiners and no-break spaces that a PDF paste leaves inside few-shot examples.",
    "Flatten a prompt template with four stacked blank lines between sections down to a single blank line.",
    "Normalise CRLF line endings to LF so the same prompt file diffs cleanly across Windows and macOS teammates.",
  ],
  benefits: [
    ["Catches invisible characters", "Reports how many zero-width and exotic-space code points the paste contained, not just the visible mess."],
    ["Reversible switches", "Each rule — tabs, indentation, blank lines, trailing space — is an independent toggle you can leave off."],
    ["Runs locally", "Text is normalised in the browser, so confidential prompts are never uploaded anywhere."],
  ],
  faqs: [
    [
      "Does extra whitespace actually cost me tokens?",
      "Yes. Most byte-pair tokenizers encode runs of spaces and newlines as their own tokens, so a prompt with stacked blank lines and double spaces costs slightly more than the same prompt cleaned up. As a rough guide, one token is about four characters of English text, so removing 400 stray characters saves roughly 100 tokens per call.",
    ],
    [
      "What is a zero-width space and why is it in my prompt?",
      "A zero-width space is U+200B, an invisible code point used for line-break hints in web pages and word processors. Copying from a website, a PDF or a rich-text editor can carry it — along with U+200C, U+200D and the U+FEFF byte-order mark — into your prompt, where it takes up tokens and can split a word mid-token.",
    ],
    [
      "Will cleaning whitespace change my prompt's meaning?",
      "The default settings only touch whitespace and invisible formatting characters, so wording, punctuation and line order stay exactly as written. If your prompt contains indentation-sensitive content such as Python code or YAML, turn off 'Remove leading indentation' and set tabs to 'Keep' before cleaning.",
    ],
    [
      "How do I keep paragraph breaks but remove the extra ones?",
      "Set 'Maximum consecutive blank lines' to 1. Any run of two or more blank lines collapses to a single blank line, which preserves paragraph separation while removing the padding that accumulates when sections are edited and moved around.",
    ],
  ],
};

export default seo;
