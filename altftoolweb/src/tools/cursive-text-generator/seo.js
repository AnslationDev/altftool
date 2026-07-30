const seo = {
  intro:
    "The Cursive Text Generator rewrites your letters as Unicode Mathematical Script characters — the 𝒜–𝒵 and 𝒶–𝓏 range starting at code points U+1D49C and U+1D4B6 — so the result is real text you can paste anywhere rather than an image or an installed font. Eleven letters that Unicode placed in the older Letterlike Symbols block instead (ℬ ℰ ℱ ℋ ℐ ℒ ℳ ℛ ℯ ℊ ℴ) are substituted automatically, which is the step most converters get wrong and leave as blanks. Digits, spaces and punctuation pass through unchanged.",
  useCases: [
    "Your Instagram bio needs a name that stands out from the block of default sans-serif text, and the app gives you no font options at all.",
    "You are naming a Discord server or channel and want the title in script letters that survive being copied into a message.",
    "A wedding or event invite is being sent as plain text in a message or email, and you want the couple's names set in cursive without attaching a graphic.",
  ],
  benefits: [
    ["No blank boxes in the alphabet", "The eleven script letters that live outside the main block are mapped explicitly, so B, E, F, H, I, L, M, R, e, g and o render instead of showing as tofu squares."],
    ["It is text, not a font", "Because each character is a distinct Unicode code point, the styling travels with the string into apps that let you pick no font at all."],
    ["Everything else left alone", "Numbers, emoji, punctuation and spacing are passed through untouched, so handles and hashtags keep working after conversion."],
  ],
  faqs: [
    [
      "Why do some characters show as empty boxes on my phone?",
      "Because the device font lacks a glyph for that code point, not because the text is broken. Mathematical Script characters live in the Supplementary Multilingual Plane, and older Android builds and some desktop fonts do not cover the whole range — the same string usually renders fine on iOS and on current browsers.",
    ],
    [
      "Will cursive text work in my Instagram bio or username?",
      "In bios, captions and comments it generally works because those fields accept arbitrary Unicode. Usernames and handles are a different matter — most platforms restrict them to ASCII letters, numbers, dots and underscores, so styled characters get rejected.",
    ],
    [
      "Can screen readers read this text?",
      "Often not well. Assistive software may read Mathematical Script letters character by character, as a different word, or skip them entirely, so keep styled text to short decorative labels and put anything that must be understood in ordinary letters.",
    ],
    [
      "Do numbers get converted too?",
      "No — 0 to 9 come through as normal digits, because Unicode defines no script-style numerals in this block. Only the 52 upper and lower case Latin letters are restyled.",
    ],
  ],
};

export default seo;
