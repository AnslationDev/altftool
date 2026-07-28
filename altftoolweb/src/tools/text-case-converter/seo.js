const seo = {
  title: "Text Case Converter — 15 Formats, Free Online",
  h1: "Text Case Converter — 15 Case Formats at Once",
  metaDescription:
    "Paste once and get all 15 cases: upper, lower, sentence, title, headline, camel, Pascal, CONSTANT, snake, kebab, dot and path. Free; nothing is uploaded.",
  intro:
    "The Text Case Converter takes one block of text and renders 15 case formats side by side — uppercase, lowercase, sentence case, Title Case, Headline Case, camelCase, PascalCase, CONSTANT_CASE, snake_case, kebab-case, slug-case, dot.case, path/case, Inverse Case and Alternating Case. It works by splitting your input on every run of non-alphanumeric characters (the regex /[^A-Za-z0-9]+/) into a clean word list, then rejoining those words with the separator and capitalisation each format requires; the uppercase and lowercase cards apply JavaScript's native toUpperCase() and toLowerCase() to the raw string instead, so punctuation and spacing survive intact. Headline Case follows an AP-style list of 19 short words that stay lowercase unless they open or close the line, while sentence case lowercases everything and then re-capitalises the first word character and anything following a period, question mark or exclamation mark. Every conversion is recomputed in a React useMemo inside your own browser as you type — the tool makes no network requests, so the text you paste is never uploaded.",
  useCases: [
    "Turn a headline into slug-case for a URL or snake_case for a database column without retyping it word by word.",
    "Name variables, CSS classes and constants consistently by pasting the plain-English label and copying the camelCase, PascalCase or CONSTANT_CASE result.",
    "Repair an ALL-CAPS block pasted from a PDF or spreadsheet by dropping it into sentence case or Headline Case.",
  ],
  benefits: [
    [
      "All 15 formats at once",
      "One paste produces uppercase, lowercase, sentence, Title, Headline, camel, Pascal, CONSTANT, snake, kebab, slug, dot, path, inverse and alternating together — each on its own card with its own copy button.",
    ],
    [
      "AP-style headline rules built in",
      "Headline Case keeps 19 common short words — a, an, and, as, at, but, by, for, in, nor, of, on, or, per, the, to, vs, via, with — lowercase unless they are the first or last word, which plain Title Case does not do.",
    ],
    [
      "Copy one or export everything",
      "Per-card copy uses the Clipboard API with a document.execCommand fallback for older browsers, and Download formats saves all 15 results as a UTF-8 text file named altftool-text-cases.txt.",
    ],
    [
      "Nothing leaves your device",
      "Conversions are plain JavaScript string operations running in the page — no upload, no API call, no account — and they keep working if your connection drops after the page loads.",
    ],
  ],
  faqs: [
    [
      "How do I convert text to camel case?",
      "Paste your text into the source box and copy the camelCase card. The converter splits the text on any non-letter/number character, lowercases each word, capitalises every word after the first and joins them with no separator — so \"build better tools\" becomes \"buildBetterTools\".",
    ],
    [
      "What is the difference between title case and headline case?",
      "Title Case capitalises every single word; Headline Case keeps 19 small words lowercase in the middle of the line. Those words are a, an, and, as, at, but, by, for, in, nor, of, on, or, per, the, to, vs, via and with, and each is still capitalised if it happens to be the first or last word — so \"a guide to better tools\" becomes \"A Guide to Better Tools\".",
    ],
    [
      "Can it convert camelCase back to snake_case?",
      "Not without a small edit first. Word boundaries are detected from non-alphanumeric characters only, so \"userIdValue\" is read as a single word and becomes \"useridvalue\". Add a space or hyphen between the parts — \"user Id Value\" — and snake_case, kebab-case, dot.case and the rest all resolve correctly to user_id_value, user-id-value and user.id.value.",
    ],
    [
      "Is my text uploaded or stored anywhere?",
      "No. The tool issues no network requests at all; every transformation is JavaScript executing in your browser tab, and the results live in React state that disappears when you close the page. Copying writes to your system clipboard, and Download formats builds the file locally from a Blob URL.",
    ],
    [
      "How does sentence case handle several sentences?",
      "It lowercases the entire string first, then capitalises the opening word character and any word character following a period, question mark or exclamation mark. Because everything is lowercased first, proper nouns and acronyms lose their capitals — \"NASA\" comes back as \"Nasa\" and \"iPhone\" as \"iphone\" mid-sentence, so restore those by hand.",
    ],
    [
      "Is there a character limit?",
      "There is no fixed limit in the tool. All 15 formats are recalculated on every keystroke as in-browser string operations, so the only ceiling is your device's memory — extremely long pastes will simply feel less responsive because each edit recomputes the full set.",
    ],
    [
      "What are inverse case and alternating case?",
      "Inverse Case flips each character's existing case, so \"AltFTool\" becomes \"aLTftOOL\". Alternating Case ignores the original casing and instead lowercases every even-numbered character and uppercases every odd-numbered one, counting spaces and punctuation in the index, so \"hello\" becomes \"hElLo\".",
    ],
    [
      "Can I download all the converted versions at once?",
      "Yes. Download formats writes a plain-text file called altftool-text-cases.txt containing all 15 results as \"Label: value\" lines, generated locally with UTF-8 encoding. Copy all formats places the same block on your clipboard instead.",
    ],
  ],
  steps: [
    "Type or paste your text into the Source text box — a sample line is loaded by default, and Reset restores it at any time.",
    "Scan the 15 result cards below, each showing your text in that format in monospace type.",
    "Click the copy icon on the card you need, or use Copy all formats to take every version as \"Label: value\" lines, or Download formats to save them as altftool-text-cases.txt.",
  ],
};

export default seo;
