const seo = {
  title: "Free Grammar Checker — Fix Spelling & Punctuation",
  h1: "Grammar Checker",
  metaDescription:
    "Free online grammar checker — paste text and get spelling, grammar and punctuation fixes from the LanguageTool engine, with one-click apply. No signup.",
  intro:
    "This grammar checker runs two passes over whatever you paste in. Three local regex rules fire first, catching a word repeated twice in a row, two or more consecutive spaces, and a sentence that starts with a lowercase letter after a full stop, question mark or exclamation mark. The text is then sent to LanguageTool's public API endpoint (api.languagetool.org/v2/check, language en-US) for the full spelling, grammar, punctuation and style analysis. Every match comes back with a character offset, so errors are underlined exactly where they occur — red for grammar, yellow for spacing and capitalization — with the explanation on hover, and clicking Apply splices LanguageTool's first suggested replacement straight into that character range. The check re-runs automatically 1.5 seconds after you stop typing.",
  useCases: [
    "Proofreading an email, cover letter or assignment before you send it, with each mistake underlined in place rather than listed separately",
    "Cleaning up dictated or copy-pasted text, where repeated words, double spaces and lowercase sentence starts are caught by the local rules before the API pass even returns",
    "Tightening a wordy draft with the Short rewrite, which strips filler words and trims over-long sentences",
  ],
  benefits: [
    [
      "Two checking passes",
      "Three local regex rules catch repeated words, multiple spaces and missing capitals instantly, then LanguageTool's en-US rule set adds spelling, grammar, punctuation and style matches with a category name and explanation for each one.",
    ],
    [
      "Fix in one click",
      "Each suggestion card shows the original struck through beside the proposed replacement. Apply inserts it at the exact character offsets of the error, so nothing else in your text shifts or breaks.",
    ],
    [
      "Checks while you write",
      "A 1.5-second debounce re-runs the check whenever you pause typing, and the Check button runs it on demand. Word, character and sentence counts plus your most-used word and average word length update with it.",
    ],
    [
      "Free, no account, no length cap",
      "No signup and no character limit imposed by the tool. Finished text can be copied to the clipboard, opened in your device's share sheet, or downloaded as a plain-text file.",
    ],
  ],
  faqs: [
    [
      "Is this grammar checker free?",
      "Yes — free, with no signup, no account and no character limit set by the tool itself. It calls LanguageTool's free public API, which rate-limits very heavy use, so an extremely long document may come back with only the three local rule matches. Checking it in sections avoids that.",
    ],
    [
      "Is my text uploaded anywhere?",
      "Partly, and it's worth knowing which part. The three built-in rules run in your browser, but the full check POSTs your text over HTTPS to LanguageTool's public API at api.languagetool.org. AltFTool doesn't store or log it, but as with any online checker, don't paste confidential, medical or personal material into it.",
    ],
    [
      "What mistakes does the grammar checker actually catch?",
      "Spelling, grammar, punctuation and style issues from LanguageTool's en-US rule set, plus three rules that run locally: the same word typed twice in a row, two or more spaces in a row, and a sentence beginning with a lowercase letter after a full stop, question mark or exclamation mark.",
    ],
    [
      "How do I apply a correction?",
      "Click Apply on any card in the Suggestions panel — the replacement is written into the exact character range of the error. You can also read errors in the editor itself, where grammar issues are underlined in red and spacing or capitalization issues in yellow; hover any underline to see what's wrong.",
    ],
    [
      "Does it check British English spelling?",
      "No. The request is sent with language fixed to en-US, so British spellings such as colour, organise and travelling can be flagged as errors. If you're converting between the two conventions, the British/American spelling converter on AltFTool is the right tool for that job.",
    ],
    [
      "Can I dictate text instead of typing it?",
      "Yes, in browsers that implement the Web Speech API — Chrome, Edge and Safari. The Voice button starts speech recognition and appends the transcript to the end of whatever is already in the editor. Firefox has no support for it, so the button does nothing there.",
    ],
    [
      "What do the Quick Rewrite buttons do?",
      "They apply fixed text transforms, not AI rewriting. Professional capitalizes the first letter, swaps hi, hello and hey for \"Dear recipient,\" and expands \"I want\" to \"I would like to\". Short removes the filler words actually, basically, really, very and literally, then trims any sentence longer than seven words to about its first 65 percent.",
    ],
    [
      "Can I save or copy the corrected text?",
      "Yes. Save downloads it as a plain-text file called grammar-text.txt, Copy writes it to your clipboard, and Share opens your device's native share sheet in browsers that support the Web Share API — mainly mobile. Clear empties the editor and resets every counter.",
    ],
  ],
  steps: [
    "Paste or type your text into the editor — the check runs on its own 1.5 seconds after you stop typing, or press Check to run it immediately.",
    "Read the underlined matches where they sit in your text and hover any one of them to see the explanation of what's wrong.",
    "Click Apply on a suggestion to swap in the correction, then Copy, Share or Save the cleaned-up text.",
  ],
};

export default seo;
