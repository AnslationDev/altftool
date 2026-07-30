const seo = {
  intro:
    "The Vaporwave Text Generator converts ordinary text into the wide 'aesthetic' look by mapping every printable ASCII character to its full-width Unicode twin — adding 0xFEE0 to each code point so A becomes Ａ and 7 becomes ７ — and turning the plain space into the ideographic space U+3000. It renders four variants at once: Full-Width, Wide Spaced with a gap between every character, Aesthetic with a random decorative symbol on each side, and Vaporwave framed by ＼ and ／, each wrapped in Japanese corner brackets 『 』. Everything it produces is real text you can copy and paste, not an image.",
  useCases: [
    "Styling a playlist title, album caption or profile bio so it reads as 90s-mall vaporwave without opening a design tool.",
    "Making one line in a Discord or group chat stand out visually when the platform strips markdown or bold formatting.",
    "Comparing all four spacings side by side to see which still fits inside a display-name character limit before you paste it.",
  ],
  benefits: [
    [
      "All four styles at once",
      "Type once and Full-Width, Wide Spaced, Aesthetic and Vaporwave all render together with their own copy buttons, so you pick by looking rather than by re-running.",
    ],
    [
      "Proper full-width characters, not fake spacing",
      "The conversion uses the real U+FF01–U+FF5E halfwidth-and-fullwidth forms and U+3000 for the space, which is why the result keeps its spacing when pasted somewhere that collapses repeated normal spaces.",
    ],
    [
      "Non-ASCII input is left intact",
      "Only code points from 0x21 to 0x7E are mapped; accented letters, emoji and other scripts pass through unchanged instead of being dropped or mangled.",
    ],
  ],
  faqs: [
    [
      "What is vaporwave text?",
      "It is ordinary text rewritten in full-width Unicode characters, which display roughly twice as wide as normal letters and produce the stretched look associated with vaporwave album art. The characters live in the Halfwidth and Fullwidth Forms block, U+FF01 to U+FF5E.",
    ],
    [
      "Can I paste this into Instagram, Discord or a username field?",
      "Usually yes, since the output is plain Unicode text rather than an image or a font. Some platforms normalise full-width characters back to ASCII in usernames or reject the ideographic space, so paste and preview before saving.",
    ],
    [
      "Does it work with numbers and punctuation?",
      "Yes. Every printable ASCII character from ! (0x21) through ~ (0x7E) has a full-width counterpart, so digits, brackets and punctuation convert along with letters — 2024 becomes ２０２４.",
    ],
    [
      "What is the difference between Full-Width and Wide Spaced?",
      "Full-Width only substitutes the characters; Wide Spaced also inserts a normal space between every character, roughly doubling the visible length again. Wide Spaced is the one to use when you want maximum stretch and the destination has no tight character limit.",
    ],
  ],
};

export default seo;
