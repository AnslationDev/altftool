const seo = {
  intro:
    "The Slug Generator turns any title into a clean, lowercase URL slug by applying Unicode NFKD normalisation, stripping every character that is not a letter, digit, underscore, space or hyphen, then collapsing runs of spaces and underscores into single hyphens. It is built for anyone who has to hand a CMS, router or file system a safe path segment — bloggers, developers and content editors — and it shows the finished slug the moment you type the title. Because NFKD splits accented letters into a base letter plus a combining mark that then gets removed, \"Café Münchén\" comes out as cafe-munchen rather than a percent-encoded mess.",
  useCases: [
    "You are publishing a post titled \"Café Münchén: A 2024 Guide!\" and need the permalink to be plain ASCII so it survives copy-paste into email and chat without percent-encoding.",
    "You are adding a route to a Next.js or Laravel app and want the folder name, the URL segment and the database key to match exactly instead of each being typed by hand.",
    "You are cleaning up a spreadsheet of product names before an import and need to confirm that two similar titles do not collapse into the same slug and silently overwrite each other.",
  ],
  benefits: [
    ["Accents flattened, not escaped", "NFKD decomposition drops diacritics so ü becomes u instead of turning into a %C3%BC escape sequence."],
    ["Predictable separator handling", "Spaces and underscores both become hyphens, and any run of hyphens collapses to one, so double spaces never leave a double dash."],
    ["Instant preview before you commit", "The slug updates as you type, so you can shorten or reword the title while you can still see the result."],
  ],
  faqs: [
    [
      "What characters does the slug generator remove?",
      "Everything except letters, digits, the underscore, whitespace and the hyphen. Punctuation such as commas, colons, exclamation marks, quotes and em dashes is deleted outright, whitespace and underscores are converted to hyphens, and repeated hyphens are squeezed down to a single one.",
    ],
    [
      "Does it handle accented or non-English letters?",
      "Accented Latin letters are reduced to their base letter — é becomes e, ü becomes u — because the text is run through Unicode NFKD normalisation before the filter, which separates the base letter from its combining mark and then strips the mark. Scripts with no Latin base, such as Chinese or Arabic, have no ASCII equivalent to fall back on and are removed, so give those titles a transliterated version instead.",
    ],
    [
      "Why did an em dash join my two words together?",
      "Because a dash-like character that is not the plain ASCII hyphen is deleted rather than replaced, so \"naïve—dash\" becomes naivedash. Put a space on each side of the dash in the source title and you will get naive-dash instead.",
    ],
    [
      "Is a hyphen or an underscore better in a URL?",
      "Hyphens. Google has long treated the hyphen as a word separator in URLs and the underscore as a word joiner, which is why this tool converts every underscore into a hyphen and never emits one in the output.",
    ],
  ],
};

export default seo;
