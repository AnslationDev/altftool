const seo = {
  title: "Roll Number Format Validator: Length, O vs 0",
  metaDescription:
    "Checks a roll or application number for length, character set, prefix and hidden spaces, and flags O typed for 0 or I for 1 before the portal does.",
  steps: [
    "Paste the number into Roll / registration number and pick an Expected format — 12-digit numeric for a JEE Main application number, 8-digit numeric for a CBSE board roll number.",
    "Choose Custom rule to set Allowed characters, Required prefix (optional), Minimum length and Maximum length straight from your admit card.",
    "The Verdict reads Looks valid or Fix needed with every check marked Pass or Fail; take the Cleaned value to submit, or press Copy result for the whole report.",
  ],
  intro:
    "This validator checks a roll or registration number against structural rules — exact length, allowed characters, required prefix and stray whitespace — before you type it into an exam portal. It is built for candidates filling application, admit-card download or answer-key challenge forms, where a single lookalike character (letter O for zero, letter I for one) causes a 'record not found' error. Presets cover common formats such as 12-digit JEE Main application numbers and 8-digit CBSE roll numbers, and a custom mode lets you encode any rule from your own admit card.",
  useCases: [
    "A JEE Main candidate whose application number keeps failing on the result portal checks whether a letter O was typed in place of a zero",
    "A parent downloading a CBSE admit card verifies the 8-digit roll number copied from a WhatsApp message has no hidden spaces",
    "A government-exam aspirant sets a custom rule (7 digits, no prefix) from their admit card and validates the number before an answer-key objection deadline",
  ],
  benefits: [
    ["Catches lookalike characters", "Flags O vs 0, I/l vs 1, S vs 5 and B vs 8 when a digits-only format fails."],
    ["Whitespace detection", "Finds leading, trailing and embedded spaces that portals reject or silently store."],
    ["Custom rules", "Set exact length, character set and prefix straight from your own admit card."],
  ],
  faqs: [
    [
      "Why does the exam portal say my roll number is invalid?",
      "The most common causes are a lookalike character (the letter O typed instead of the digit 0, or I instead of 1), a hidden space copied along with the number, or a missing digit. Paste the number into this validator with the format from your admit card and it will show exactly which structural check fails.",
    ],
    [
      "How many digits is a JEE Main application number?",
      "JEE Main application numbers issued by the NTA are 12-digit numeric strings, typically beginning with digits derived from the exam year. Formats can change between cycles, so treat the number printed on your own confirmation page or admit card as final.",
    ],
    [
      "Is a roll number the same as a registration or application number?",
      "No. The application or registration number is issued when you fill the form, while the roll number is usually assigned later on the admit card, and the two often have different lengths. Portals ask for a specific one, so check the field label before pasting either.",
    ],
    [
      "Can this tool tell me if my roll number actually exists?",
      "No — it validates structure only (length, characters, prefix and spacing), not whether the number is registered in the exam body's database. If the format passes here but the portal still rejects it, contact the exam helpdesk with your confirmation page.",
    ],
  ],
};

export default seo;
