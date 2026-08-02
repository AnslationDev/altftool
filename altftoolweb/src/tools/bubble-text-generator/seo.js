const seo = {
  intro:
    "The Bubble Text Generator maps ordinary letters and digits onto Unicode's Enclosed Alphanumerics characters — Ⓐ at U+24B6, ⓐ at U+24D0, ① at U+2460 — so \"hello\" becomes ⓗⓔⓛⓛⓞ as real text you can copy and paste anywhere. Type or paste in any text and every letter and digit is converted to its circled equivalent; punctuation and other symbols pass through unchanged. Because the output is characters and not an image, it survives a paste into a bio, username or chat message.",
  useCases: [
    "You want your Instagram bio name to stand out from every other account on the page without adding an image or a special font file.",
    "You are setting up Discord channel names and want each one prefixed with circled letters that still read cleanly in the sidebar.",
    "You need a quick bubble-lettering headline for a caption or comment and want plain, pasteable text rather than an image.",
  ],
  benefits: [
    ["Output is text, not a screenshot", "The circled letters are real Unicode, so they paste into usernames, bios, captions and search fields that reject images or custom fonts."],
    ["Converts letters and digits in one pass", "Type once and every A-Z, a-z and 0-9 character in your input is swapped for its circled equivalent — everything else is left as-is."],
    ["Copy, download or revisit past results", "Copy the circled text straight to your clipboard, download it as a .txt file, or reopen it from the tool's built-in recent-results history."],
  ],
  faqs: [
    [
      "What is bubble text and how does it work?",
      "Bubble text is ordinary text swapped for Unicode's enclosed alphanumeric characters, where each letter is replaced by its circled equivalent — capital A becomes Ⓐ (U+24B6), lowercase a becomes ⓐ (U+24D0), and 1 becomes ① (U+2460). No font is installed; the characters themselves are different.",
    ],
    [
      "Will bubble letters show up on iPhone, Android and Discord?",
      "Yes, because Enclosed Alphanumerics has been in Unicode since version 1.1 and is covered by the system fonts on iOS, Android, Windows, macOS and Linux, so the circled letters this tool produces render correctly almost everywhere.",
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
