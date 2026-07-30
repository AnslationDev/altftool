const seo = {
  intro:
    "The Bubble Text Generator maps ordinary letters and digits onto Unicode's Enclosed Alphanumerics characters — Ⓐ at U+24B6, ⓐ at U+24D0, ① at U+2460 — so \"hello\" becomes ⓗⓔⓛⓛⓞ as real text you can copy and paste anywhere. It offers 22 styles across circled, filled, squared, parenthesised, tiny, fullwidth, double-struck, cursive, fraktur, strikethrough and emoji-framed variants, and can also render your text as a transparent PNG or SVG in one of 11 rounded display fonts. Because the output is characters and not an image, it survives a paste into a bio, username or chat message.",
  useCases: [
    "You want your Instagram bio name to stand out from every other account on the page without adding an image or a special font file.",
    "You are setting up Discord channel names and want each one prefixed with squared or circled letters that still read cleanly in the sidebar.",
    "You need a bubble-lettering headline for a thumbnail or sticker and want it as a transparent PNG rather than pasteable text.",
  ],
  benefits: [
    ["Output is text, not a screenshot", "Every style is real Unicode, so it pastes into usernames, bios, captions and search fields that reject images or custom fonts."],
    ["22 styles from one input", "Type once and compare classic circles, filled circles, squares, negative squares, parentheses, subscripts, fullwidth, fraktur and more side by side."],
    ["Text and image output in the same tool", "When a platform strips unusual characters you can fall back to the PNG or SVG export rendered in a rounded display font."],
  ],
  faqs: [
    [
      "What is bubble text and how does it work?",
      "Bubble text is ordinary text swapped for Unicode's enclosed alphanumeric characters, where each letter is replaced by its circled equivalent — capital A becomes Ⓐ (U+24B6), lowercase a becomes ⓐ (U+24D0), and 1 becomes ① (U+2460). No font is installed; the characters themselves are different.",
    ],
    [
      "Will bubble letters show up on iPhone, Android and Discord?",
      "Yes, because Enclosed Alphanumerics has been in Unicode since version 1.1 and is covered by the system fonts on iOS, Android, Windows, macOS and Linux. The filled and squared styles use Enclosed Alphanumeric Supplement characters, which are newer and occasionally render as boxes on very old devices.",
    ],
    [
      "Can I use bubble text in an Instagram or TikTok username?",
      "Usually in the display name and bio, but not always in the @handle — most platforms restrict handles to plain ASCII letters, numbers, underscores and periods. Paste the styled version into the name or bio field instead, and keep the handle plain.",
    ],
    [
      "Why do screen readers read bubble text strangely?",
      "Because assistive technology sees separate enclosed symbols rather than ordinary letters, a bubble-text sentence can be read out character by character or skipped. Use it for short decorative touches and keep any information that matters — your actual name, contact details, instructions — in plain text.",
    ],
  ],
};

export default seo;
