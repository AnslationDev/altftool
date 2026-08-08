const seo = {
  title: "Roman Numeral Converter with Strict 1–3999 Validation",
  metaDescription:
    "Converts both ways and rejects IIII, VX or DD with the exact rule broken — only IV, IX, XL, XC, CD, CM subtract — plus a place-value breakdown.",
  steps: [
    "Type a value into Number (1 – 3999), or type a numeral such as MMXXIV into the Roman numeral field.",
    "Both fields convert live in either direction; an invalid numeral names the rule it breaks instead of showing a bare error.",
    "Read the Place-value breakdown splitting the number into thousands, hundreds, tens and units, and press Copy on either field.",
  ],
  intro:
    "The Roman Numeral Converter turns any whole number from 1 to 3999 into a Roman numeral and back, using strict standard notation — only the six subtractive pairs IV, IX, XL, XC, CD and CM are accepted, I/X/C/M may repeat at most three times, and V, L and D never repeat. Both fields convert live in either direction, and a place-value breakdown splits the number into thousands, hundreds, tens and units so you can see how the symbols were assembled. When a numeral is rejected it explains exactly which rule broke, rather than just showing an error.",
  useCases: [
    "You are tattooing or engraving a birth year and want to be certain 1999 is MCMXCIX rather than the incorrect but common IMM.",
    "A student is checking homework and needs to see why IIII is wrong for 4 and how XC actually builds to 90, not just the right answer.",
    "You are reading a film's copyright line or a building's cornerstone — MMXIV — and want the year back out in digits.",
  ],
  benefits: [
    [
      "Explains the failure, not just the fact",
      "Rejects VX, IIII or DD with the specific rule broken — repeated V/L/D, four repeats, or a subtraction that is not one of the six allowed pairs.",
    ],
    [
      "Place-value breakdown",
      "Shows 2024 as MM + XX + IV with each place labelled, so the construction of the numeral is visible rather than memorised.",
    ],
    [
      "Two-way and live",
      "Typing digits fills the numeral and typing a numeral fills the digits, with year presets for quick checks.",
    ],
  ],
  faqs: [
    [
      "What is the highest number in Roman numerals?",
      "In standard notation the highest is 3999, written MMMCMXCIX, which is the upper limit this converter accepts. M (1000) may repeat at most three times, so 4000 and above need overline notation — a bar above a symbol multiplying it by 1000 — which is not part of the standard set.",
    ],
    [
      "Why is IIII wrong for 4?",
      "Because I, X, C and M can repeat at most three times in a row, so 4 is written IV — one subtracted from five. IIII does appear on some clock faces as a traditional exception, but it fails standard validation and the converter flags it.",
    ],
    [
      "Which subtractions are allowed in Roman numerals?",
      "Exactly six: IV (4), IX (9), XL (40), XC (90), CD (400) and CM (900). Any other smaller-before-larger combination, such as IL for 49 or VX for 5, is invalid; 49 is XLIX. Everything outside these pairs must run largest to smallest, left to right.",
    ],
    [
      "How do you write a year like 2024 in Roman numerals?",
      "2024 is MMXXIV — MM for 2000, XX for 20 and IV for 4. Break the year into place values, convert each separately, then join them from largest to smallest; that is exactly the breakdown the converter displays.",
    ],
  ],
};

export default seo;
