const seo = {
  intro:
    "A palindrome checker tests whether a word, phrase, sentence or number reads the same backwards as forwards, and this one shows the comparison character by character rather than just returning yes or no. It normalises your text — lowercasing it and stripping everything except letters and digits, both optional — then compares the cleaned string against its exact reverse and highlights every position where the two disagree. Useful for word-game players, teachers demonstrating string reversal, and anyone settling an argument about whether a name or phrase really is a palindrome.",
  useCases: [
    "You are checking a phrase like \"A man, a plan, a canal: Panama\" and want proof that it works only once the commas, colon and spaces are ignored — the parsed string is shown next to its reverse.",
    "A student is learning string reversal and needs to see which character positions break the symmetry instead of only being told the answer is false.",
    "You are naming a product or choosing a numeric ID and want to confirm a candidate like 12321 reads identically in both directions before committing to it.",
  ],
  benefits: [
    [
      "Shows the mismatch, not just the verdict",
      "Every character gets a numbered cell, teal where it matches the character at the mirrored position and red where it does not, so you can see exactly where a near-palindrome fails.",
    ],
    [
      "Normalisation you control",
      "Case folding and punctuation stripping are separate toggles, so you can test the strict literal string or the conventional letters-and-digits-only reading.",
    ],
    [
      "Both strings shown side by side",
      "The parsed original and the parsed reversal are printed in full, which makes the result auditable instead of something you have to take on trust.",
    ],
  ],
  faqs: [
    [
      "Do spaces and punctuation count in a palindrome?",
      "By convention they do not, and the tool ignores them by default — with \"Ignore Spaces & Punctuation\" on, everything except letters A-Z and digits 0-9 is removed before the comparison. Turn the toggle off to test the literal string with every space and comma included.",
    ],
    [
      "Is a number like 12321 a palindrome?",
      "Yes. Digits are treated exactly like letters, so 12321 reverses to 12321 and passes. This works for any length of number, including dates written without separators.",
    ],
    [
      "Does capitalisation matter?",
      "Not by default. The \"Ignore Letter Case\" option lowercases the text first, so Radar and radar both pass; switch it off and an uppercase R will no longer match a lowercase r at the mirrored position.",
    ],
    [
      "What is the longest well-known palindrome sentence?",
      "\"A man, a plan, a canal: Panama\" is the most cited English example, and it is loaded as the default input. Once punctuation and case are ignored it reduces to a 21-character string that reverses to itself exactly.",
    ],
  ],
};

export default seo;
