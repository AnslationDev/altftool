const seo = {
  intro:
    "The PAN Format Validator checks an Indian Permanent Account Number against the official 10-character pattern — five letters, four digits, one letter, as in ABCDE1234F — and decodes what those characters mean. It reads the fourth character as the holder type (P for an individual, C for a company, H for a HUF, F for a firm or LLP, and so on), the fifth as the first letter of the holder's surname or name, and it can mask, normalise and bulk-check whole lists. It is a format and structure check for finance, HR and onboarding teams, not a lookup against the Income Tax Department's records.",
  useCases: [
    "You are cleaning a vendor or payroll spreadsheet and need to find which of a few hundred pasted PANs are malformed before they reach a TDS return and get rejected.",
    "A KYC form came back with a PAN typed as lowercase with dashes, and you want it normalised to the canonical uppercase 10-character form before you file it.",
    "You need to quote a customer's PAN in a support ticket or screenshot and want a masked version such as AB***1234F instead of the full number.",
  ],
  benefits: [
    [
      "Tells you which rule broke",
      "Instead of a bare invalid flag it lists the specific failures — wrong length, digits in the first five positions, an unrecognised holder-type letter in position four — so the entry can be corrected.",
    ],
    [
      "Decodes the structure",
      "It names the holder type from the fourth character and shows the name initial, series and numeric block separately, so you can sanity-check a PAN against the person or entity it belongs to.",
    ],
    [
      "Bulk lists and CSV out",
      "Paste PANs separated by newlines, commas, semicolons, pipes or tabs and export the whole verdict table — normalised value, masked value, status, holder type and issues — as a CSV.",
    ],
  ],
  faqs: [
    [
      "What is the correct format of a PAN card number?",
      "A PAN is exactly 10 characters: five letters, then four digits, then one letter — the pattern ABCDE1234F. Anything longer, shorter, or with a digit and letter in the wrong block fails the structural check.",
    ],
    [
      "What does the fourth letter of a PAN mean?",
      "It identifies the holder type. P is an individual, C a company, H a Hindu Undivided Family, F a firm or LLP, A an association of persons, B a body of individuals, T a trust, L a local authority, G a government body and J an artificial juridical person; any other letter in that position is flagged as unknown.",
    ],
    [
      "Does this confirm the PAN actually exists?",
      "No. This checks structure only — the 10-character pattern and the holder-type letter — and never contacts any government system. A correctly formatted PAN can still be unissued or belong to someone else, so verify genuine identity through the Income Tax Department's own verification channels.",
    ],
    [
      "What does the fifth character of a PAN represent?",
      "The fifth character is the first letter of the holder's surname for an individual, or of the entity's name for a company, firm or trust. The tool surfaces it as the name initial so you can compare it against the name on the document in front of you.",
    ],
  ],
};

export default seo;
