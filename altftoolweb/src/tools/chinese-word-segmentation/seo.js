const seo = {
  title: "Chinese Word Segmentation With Intl.Segmenter (zh-Hans)",
  metaDescription:
    "Tokenise Chinese, Hindi and Latin text by script using the browser's ICU segmenter, up to 12,000 characters, with per-token labels and TXT or JSON export.",
  intro:
    "Chinese is written without spaces, so before you can count words or process a sentence you have to decide where each word ends — this tool does that using the browser's built-in Intl.Segmenter with word granularity and the zh-Hans locale. It first splits your text into runs by script, detecting Chinese, Hindi, Latin and numeric characters, then segments each run with the right locale, so a mixed sentence is tokenised correctly rather than being forced through one rule. Each token is listed with its script, character length and an optional gloss you supply, and the whole result exports as TXT or JSON.",
  useCases: [
    "You have a block of Chinese product copy and need an honest word count, not a character count, for a translation quote",
    "You are preparing a vocabulary list from a Chinese article and want the sentence broken into words you can look up one by one",
    "You are handling a bilingual dataset where Chinese, English and Hindi appear in the same field, and need each row tokenised without writing a script",
  ],
  benefits: [
    ["Segments by script, not by guess", "Text is split into runs of Chinese, Hindi, Latin, numeric and punctuation characters first, so each run is tokenised with its own locale rules."],
    ["Uses a real ICU segmenter", "Intl.Segmenter is the browser's built-in Unicode segmentation, the same engine used for text selection, with a regex word-match fallback where it is unavailable."],
    ["Attach your own glosses", "Paste a simple list of term = meaning pairs and every matching token carries its meaning through into the token table and the JSON export."],
  ],
  faqs: [
    [
      "Why does Chinese text need word segmentation at all?",
      "Because written Chinese has no spaces between words, and a word can be one, two or more characters long. Without segmentation, a program cannot tell whether two adjacent characters form a single word or two separate ones, which breaks word counts, search indexing and translation memory.",
    ],
    [
      "Which languages can it split?",
      "Chinese with the zh-Hans locale, Hindi with hi-IN, and English or other Latin-script text with en-US, plus separate handling for numbers and punctuation. When more than one of these appears it is reported as mixed language, and each run is still segmented under its own rules.",
    ],
    [
      "Is there a limit on how much text I can paste?",
      "Yes, input is capped at 12,000 characters, and anything beyond that is trimmed with a truncation notice rather than silently dropped. Recent analyses are kept in a local history of up to 12 entries.",
    ],
    [
      "How accurate is the segmentation compared with a tool like jieba?",
      "It matches the segmentation the browser itself uses, which handles ordinary running text well but has no domain dictionary, so proper nouns, brand names and technical terms may be split apart. Dictionary-based segmenters can do better on those cases; this one has the advantage of needing no model download and running on your text locally.",
    ],
  ],
};

export default seo;
