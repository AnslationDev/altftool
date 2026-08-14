const seo = {
  title: "Upside Down Text Generator: Flip, Bubble, Block",
  metaDescription:
    "Flips a–z, A–Z, 0–9 and punctuation to rotated Unicode look-alikes (a→ɐ, E→Ǝ), with Bubble, Block, Mirror and Leetspeak from the same box.",
  steps: [
    "Type or paste into the \"Normal Input Text\" box — characters with no mapping, such as emoji or accents, pass through unchanged.",
    "Choose a style: Upside Down, Bubble Text, Block Text, Mirror/Reverse or Leetspeak; in Upside Down mode, untick \"Reverse Character Order\" to flip glyphs in place.",
    "The \"Styled Flipped Output\" box updates as you type — press Copy to take the plain Unicode text into a bio, username or message.",
  ],
  intro:
    "Upside Down Text rewrites what you type into rotated Unicode look-alikes — 'a' becomes 'ɐ', 'E' becomes 'Ǝ', '?' becomes '¿' — and reverses the character order so the result reads correctly when the whole line looks flipped. It covers a–z, A–Z, 0–9 and common punctuation, and adds four more styles from the same box: Bubble Text (ⓐ), Block Text (🄰), Mirror/Reverse, and Leetspeak (a→4, e→3, o→0). The output is plain text you can paste anywhere that accepts Unicode, so it survives in bios, usernames and messages without any image or font.",
  useCases: [
    "Making a chat handle or gaming tag stand out in a list where everyone else is using plain letters.",
    "Writing a social bio or comment where a flipped or circled line is meant to read as a visual joke rather than shouting in caps.",
    "Checking how a flipped or full-width string actually renders in a particular app before committing it as a display name, since some platforms strip or refuse these characters.",
  ],
  benefits: [
    [
      "Rotation and reversal are separate",
      "A toggle lets you flip the glyphs while keeping the original left-to-right order, which is what you want when a platform reverses the string for you.",
    ],
    [
      "Five styles from one input",
      "Upside Down, Bubble, Block, Mirror and Leetspeak all read from the same text box, so you can compare them without retyping.",
    ],
    [
      "Nothing is dropped silently",
      "Any character with no mapping — an emoji, an accent, a symbol outside the table — is passed through unchanged instead of being deleted or replaced with a box.",
    ],
  ],
  faqs: [
    [
      "How does upside down text actually work?",
      "It substitutes each character for a different Unicode character that happens to look like the rotated version, then reverses the string. There is no rotation happening — 'ɐ' is U+0250, a real letter used in phonetic notation, not an 'a' turned 180 degrees.",
    ],
    [
      "Will flipped text work in my Instagram bio, Discord name or WhatsApp message?",
      "Usually yes, because the output is ordinary Unicode text rather than an image. Some platforms strip unusual characters from display names or fall back to a box glyph if the device font lacks one, so paste it in and check before you save.",
    ],
    [
      "Why should I turn the 'reverse' option off?",
      "Turn it off when the destination already reverses or renders the line for you, or when you want each letter flipped in place while the reading order stays normal. With it on, the characters are flipped and then the whole string is reversed so the sentence reads correctly upside down.",
    ],
    [
      "Which characters can be flipped?",
      "All 26 lowercase and 26 uppercase letters, the digits 0–9, and punctuation including . , ' \" ? ! ( ) [ ] { } < > & _ ; ` - +. A few have no true flipped counterpart, so H, I, O, S, X, Z, 0 and 8 map to themselves, and anything unmapped is left as-is.",
    ],
  ],
};

export default seo;
