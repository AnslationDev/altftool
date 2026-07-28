const seo = {
  title: "Emoji Remover — Strip Emoji & Symbols From Text",
  h1: "Emoji Remover",
  metaDescription:
    "Remove emoji, flags, skin tones and keycaps from text in one pass — whole Unicode sequences, no broken fragments. Nothing leaves your browser.",
  intro:
    "Emoji Remover strips emoji, flags, skin-tone modifiers, keycaps and leftover variation selectors out of pasted text while leaving the actual words untouched. It matches whole emoji sequences as defined by Unicode TR51, using JavaScript regular expressions built on Unicode property escapes — \\p{Extended_Pictographic}, \\p{Regional_Indicator} and \\p{Emoji_Modifier} — chained across U+200D zero width joiners, so a flag or a four-person family is deleted in one piece instead of being shredded into orphaned code points. Everything runs in your own browser tab and recalculates as you type: no upload, no server call, no account. It handles up to 500,000 characters in a single pass.",
  useCases: [
    "Cleaning emoji out of scraped comments, reviews or CSV exports before they reach a database column that chokes on four-byte characters",
    "Stripping decoration from AI-written marketing copy so it fits a plain-text email, an SMS gateway or a print layout",
    "Auditing a caption, bio or username — the tool lists every distinct emoji it found next to the character count before and after",
  ],
  benefits: [
    [
      "Whole sequences, never fragments",
      "A flag is two regional indicators; a family is four pictographs joined by three zero width joiners. The matcher consumes the entire TR51 sequence, so you never end up with a half flag or an invisible orphaned joiner in the output.",
    ],
    [
      "Three replacement modes",
      "Delete each emoji outright, swap it for a single space so surrounding words don't collide, or drop in an [emoji] placeholder when you need to see where the decoration used to sit.",
    ],
    [
      "Keeps ©, ® and ™ by default",
      "Those three are technically Extended_Pictographic but read as punctuation far more often than as emoji, so they stay put unless you untick the option or they carry an explicit emoji variation selector.",
    ],
    [
      "Cleans up the residue too",
      "Optional passes remove stray U+FE0E/U+FE0F variation selectors, non-emoji Unicode symbols like ★ ▣ ☞, double spaces, leading and trailing whitespace, and lines left blank.",
    ],
  ],
  faqs: [
    [
      "How do I remove emoji from text?",
      "Paste the text into the box — the cleaned version appears immediately in the output field below, with no button to press. Choose whether each emoji is deleted, replaced with a space, or replaced with [emoji], then click Copy result. The whole thing runs in your browser as you type.",
    ],
    [
      "Why does removing emoji with a normal find-and-replace leave weird characters behind?",
      "Because most emoji are not single characters. The family emoji is four pictographs glued together by three U+200D zero width joiners, and a flag is two regional-indicator letters — strip one code point and the invisible joiners or half a flag survive. This tool matches the complete Unicode TR51 sequence, so nothing is left half-deleted.",
    ],
    [
      "Is this emoji remover free?",
      "Yes — free, with no signup, no account and no usage cap. The only limit is 500,000 characters in a single pass; past that the tool asks you to shorten the input.",
    ],
    [
      "Does the emoji remover upload my text anywhere?",
      "No. Matching and replacement run entirely in your browser using JavaScript regular expressions — there is no network request in this tool, so pasted drafts, customer comments and private notes never leave the tab.",
    ],
    [
      "How many characters does one emoji actually count as?",
      "Between 1 and 11 UTF-16 code units. A simple face is 2, a skin-toned wave is 4, a flag is 4, a keycap like 5️⃣ is 3, and the four-person family emoji is 11. That is why the character count can drop far more than the emoji count suggests — the tool shows both, plus the percentage removed.",
    ],
    [
      "Can I replace emoji with a space instead of deleting them?",
      "Yes. There are three modes: delete it, replace with a space, or replace with [emoji]. The space option is the safer choice when emoji sit between words, because deleting outright can push two words together.",
    ],
    [
      "Does it remove symbols like ★, ✓ and ▣ as well?",
      "Only if you tick \"Other symbols\". By default it removes Extended_Pictographic emoji only; that extra option also clears characters in the Unicode \"other symbol\" (So) category, which is usually what still makes pasted text look decorated after the emoji are gone.",
    ],
    [
      "Will it delete ©, ® and ™ from my text?",
      "Not by default — the \"Keep ©, ® and ™\" option is on, because those three are almost always intended as punctuation rather than emoji. Untick it if you want them stripped along with everything else.",
    ],
  ],
  steps: [
    "Paste or type your text into the input box — the cleaned version appears instantly below as you type, with no button to press.",
    "Pick what replaces each emoji (delete it, a space, or [emoji]) and tick any extra cleanup you want: other symbols, leftover variation selectors, double spaces, line trimming, blank lines, or keeping ©, ® and ™.",
    "Check the count of emoji removed, the distinct emoji found and the characters before/after, then click Copy result to put the cleaned text on your clipboard.",
  ],
};

export default seo;
