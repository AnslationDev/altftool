const seo = {
  intro:
    "Pythagorean Name Numerology converts a written name into three numbers: the expression (destiny) number from every letter, the soul urge from the vowels alone, and the personality number from the consonants alone. It uses the Pythagorean chart in which the alphabet cycles 1 to 9 — A=1 through I=9, J=1 through R=9, and S=1 through Z=8 — and leaves the master numbers 11, 22 and 33 unreduced. Totals of 13, 14, 16 and 19 are flagged as the classical karmic debt numbers so you can see them before reduction.",
  useCases: [
    "Deciding between two spellings of the same name, such as Jon and John, by seeing which of the three numbers actually change.",
    "Working out a soul urge number when a name contains a Y and you need to control whether it counts as a vowel.",
    "Checking whether a name total lands on a master number 11, 22 or 33 rather than reducing to a single digit.",
    "Following a numerology worksheet step by step, with the letter values and each reduction stage shown rather than hidden.",
  ],
  benefits: [
    ["All three core numbers", "Expression, soul urge and personality are computed from the same name in one pass, with the vowel split shown."],
    ["Master numbers preserved", "11, 22 and 33 stop the reduction instead of being flattened to 2, 4 and 6."],
    ["Y handled explicitly", "A documented rule decides when Y is a vowel, and you can override it to always-vowel or always-consonant."],
  ],
  faqs: [
    [
      "How do you calculate a Pythagorean expression number?",
      "Give each letter its chart value (A=1 … I=9, J=1 … R=9, S=1 … Z=8), add them all, then reduce by digit-summing until you reach 1–9 or a master number. John Smith totals 44, which reduces to 8.",
    ],
    [
      "What is the difference between the soul urge and personality number?",
      "The soul urge uses only the vowels in the name and the personality number uses only the consonants; together they add up to the expression number. In John Smith the vowels O and I total 15 (soul urge 6) and the consonants total 29, which reduces to the master number 11.",
    ],
    [
      "Is Y a vowel or a consonant in numerology?",
      "It depends on whether it carries the vowel sound. The rule applied here counts Y as a vowel when neither the letter before nor the letter after it is A, E, I, O or U — so Y is a vowel in Lynn and Yvonne, but a consonant in Yash and Maya. You can override the rule if your source uses a different convention.",
    ],
    [
      "How does Pythagorean numerology differ from Chaldean?",
      "Pythagorean assigns values 1–9 by alphabet position and reads mainly the reduced digit; Chaldean assigns values 1–8 only, never uses 9 for a letter, and treats the unreduced compound total as meaningful. The two systems routinely give different numbers for the same name. Both are cultural traditions rather than science and are not a basis for medical, legal or financial decisions.",
    ],
  ],
};

export default seo;
