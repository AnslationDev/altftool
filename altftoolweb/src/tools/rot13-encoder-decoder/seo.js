const seo = {
  title: "ROT13 Encoder Decoder - Self-Inverse Letter Shift",
  metaDescription:
    "Shifts every letter 13 places to encode or decode text — the same operation both ways. Case kept; digits and punctuation untouched. Copy in one click.",
  steps: [
    "Type or paste text into the Input Text box (labelled Text to Decode in decode mode).",
    "Click Encode Text or Decode Text — both apply the identical 13-letter shift, because ROT13 is self-inverse.",
    "Read the Result panel, use the clipboard button on it to copy the output, or press Clear to start over.",
  ],
  intro:
    "ROT13 replaces every letter with the one 13 places further along the alphabet, so A becomes N, N becomes A, and 'Hello World' becomes 'Uryyb Jbeyq'. This tool applies that substitution live as you type and copies the result in one click, keeping case and leaving digits, spaces and punctuation untouched. Because 13 is exactly half of 26, encoding and decoding are the same operation — run any text through twice and you get the original back.",
  useCases: [
    "You want to post a puzzle answer or film spoiler in a forum thread without it being readable to anyone scrolling past.",
    "A CTF or crossword clue looks like garbled English and you want to check whether it is plain ROT13 before trying harder ciphers.",
    "You are writing a quiz or escape-room handout and need a simple, self-inverse cipher that players can crack with a paper alphabet wheel.",
  ],
  benefits: [
    ["Same button both ways", "One transform handles encoding and decoding, so you never have to work out which direction you are going."],
    ["Only letters change", "Numbers, punctuation, emoji and line breaks pass through unaltered, so code snippets and formatting survive the round trip."],
    ["Case is preserved", "Uppercase stays uppercase and lowercase stays lowercase, so names and sentence casing read normally after decoding."],
  ],
  faqs: [
    [
      "What does ROT13 do?",
      "It rotates each letter 13 positions through the 26-letter alphabet: A to N, B to O, and so on, wrapping Z back around to M. Anything that is not an A-Z or a-z letter is left exactly as it was.",
    ],
    [
      "How do I decode ROT13?",
      "Apply ROT13 again. Since 13 + 13 = 26, a second pass returns every letter to where it started, which is why this tool needs no separate decode algorithm.",
    ],
    [
      "Is ROT13 secure?",
      "No. ROT13 is a fixed substitution with no key, so anyone can reverse it instantly and it offers zero protection for passwords, personal data or anything confidential. It exists to hide text from casual glances — spoilers, punchlines, puzzle answers — not from anyone actually looking.",
    ],
    [
      "What is the difference between ROT13 and a Caesar cipher?",
      "ROT13 is a Caesar cipher with the shift fixed at 13. A general Caesar cipher can use any shift from 1 to 25, and only the shift of 13 has the property that encryption and decryption are the identical operation.",
    ],
  ],
};

export default seo;
