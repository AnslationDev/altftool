const seo = {
  intro:
    "The Small Caps Generator rewrites ordinary text as ꜱᴍᴀʟʟ ᴄᴀᴘꜱ by swapping each of the 26 Latin letters for its Unicode small-capital lookalike, so the result is real characters you can paste anywhere rather than an image or a font. It is aimed at people styling a social bio, a display name or a post headline on platforms that strip formatting. Digits, emoji, punctuation and spacing pass through untouched, so \"launch day 2026\" keeps its numbers intact.",
  useCases: [
    "You want your Instagram or X bio headline to stand out from the lines around it, but the app offers no bold or heading option inside the bio field.",
    "You are naming a Discord channel or a game clan tag and want a distinct look that survives being copied into other servers.",
    "You are writing a caption where a short phrase should read as a subheading, and you need styling that stays styled after the platform strips markdown.",
  ],
  benefits: [
    ["Real characters, not a font", "The output is Unicode text, so the styling travels with the copy-paste instead of depending on the reader having a font installed."],
    ["Case-insensitive input", "Uppercase and lowercase source letters map to the same small-cap glyph, so you can paste an existing headline without lowercasing it first."],
    ["Everything else left alone", "Numbers, emoji, punctuation, line breaks and any non-Latin script are passed through unchanged rather than being dropped."],
  ],
  faqs: [
    [
      "Is small caps text a font or actual characters?",
      "Actual characters. Each letter is replaced with a separate Unicode codepoint that happens to look like a small capital, which is why the styling survives copy and paste into apps that allow no formatting at all.",
    ],
    [
      "Why do X and Q look different from the other letters?",
      "Unicode has no small-capital X, so the letter x is passed through as-is, and the substitute used for q is ǫ, an o with an ogonek. Those two are the only letters in the 26-letter map that are not a true small capital.",
    ],
    [
      "Will screen readers read small caps text correctly?",
      "Often not — many screen readers announce these codepoints letter by letter, by their phonetic names, or skip them entirely, because they belong to phonetic and Latin-extended blocks rather than the normal alphabet. Use small caps for a short accent such as a name or a tagline and keep your main body text in ordinary letters.",
    ],
    [
      "Does small caps text hurt search or hashtags?",
      "Yes for anything that has to be matched. Search boxes and hashtags compare exact codepoints, so a small-caps word will not match the same word typed normally — keep hashtags, usernames and searchable keywords in plain text.",
    ],
  ],
};

export default seo;
