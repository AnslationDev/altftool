const seo = {
  intro:
    "This converter turns any whole number from 1 to 3999 into standard Roman numerals using the greedy subtractive method — repeatedly taking the largest available value from M, CM, D, CD, C, XC, L, XL, X, IX, V, IV and I until nothing is left. Alongside the answer it shows the composition symbol by symbol, the character length, and the number split into thousands, hundreds, tens and ones, so you can see how each place value became its own group of letters. It is the form used on clock faces, book prefaces, film copyright lines and monument inscriptions.",
  useCases: [
    "You are writing the copyright line for a film title card and need 2024 rendered correctly as MMXXIV rather than the non-standard MMXXIIII.",
    "You are numbering the front matter of a report in Roman numerals and want to confirm that page 47 is XLVII, with the subtractive XL rather than XXXX.",
    "A tattoo or engraving needs a birth year in Roman numerals, and you want the character-by-character composition before it goes onto something permanent.",
  ],
  benefits: [
    [
      "Shows the composition, not just the answer",
      "Lists the individual symbols the greedy pass emitted, so you can check where a subtractive pair like CM or IV came from.",
    ],
    [
      "Place-value breakdown alongside",
      "Splits the input into thousands, hundreds, tens and ones, which is how Roman numerals are actually assembled group by group.",
    ],
    [
      "Standard subtractive form only",
      "Uses the six recognised subtractive pairs and never emits four repeated symbols, so the output matches modern convention.",
    ],
  ],
  faqs: [
    [
      "Why is the limit 3999?",
      "Standard Roman numerals have no symbol worth more than M (1000), and repeating a symbol four times is not allowed, so the largest number expressible is 3999 = MMMCMXCIX. Values of 4000 and above need a vinculum — an overline that multiplies a numeral by 1000 — which is not part of the standard character set.",
    ],
    [
      "What is 2024 in Roman numerals?",
      "2024 is MMXXIV: MM for 2000, XX for 20, and IV for 4. The IV is a subtractive pair, meaning one less than five, which is why it is not written as IIII.",
    ],
    [
      "What are the subtractive pairs in Roman numerals?",
      "There are six: IV (4), IX (9), XL (40), XC (90), CD (400) and CM (900). A smaller symbol placed before a larger one is subtracted from it, and only I, X and C are ever used this way — never V, L or D.",
    ],
    [
      "Is there a zero in Roman numerals?",
      "No. The system has no symbol for zero and no place-value column, which is why it starts at 1 (I) and why arithmetic in Roman numerals is so awkward. Medieval scribes wrote the Latin word nulla when a zero was needed.",
    ],
  ],
};

export default seo;
