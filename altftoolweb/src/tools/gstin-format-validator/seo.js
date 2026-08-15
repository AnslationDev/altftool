const seo = {
  title: "GSTIN Validator — Check Format, Checksum & State",
  metaDescription:
    "Validate 15-character GSTINs against the mod-36 checksum, decode the state and PAN, and see which rule failed. Bulk lists run locally with CSV export.",
  steps: [
    "Type a 15-character GSTIN into the \"GSTIN number\" field (formatted like 29 ABCDE1234F 1Z 5), or switch to Bulk List and paste GSTINs one per line.",
    "The breakdown updates as you type: decoded state, embedded PAN, entity code, checksum status and the expected check character when the 15th character is wrong, with a masked version safe to share.",
    "Press \"Copy Masked\" to copy share-safe values, or CSV to download gstin-format-validation.csv with the full per-GSTIN breakdown and issues.",
  ],
  intro:
    "This validator checks a 15-character GSTIN against its published structure — 2-digit state code, 10-character PAN, entity code, the fixed letter Z, and a mod-36 check character — and tells you which part failed. It decodes the state, extracts the embedded PAN, recomputes the checksum with the alternating 2/1 weighting used by the GST system, and produces a masked version safe to share. Single GSTINs and pasted bulk lists both run locally, and the list can be exported as CSV.",
  useCases: [
    "A vendor invoice arrives with a GSTIN that looks off, and you want to know before you claim credit whether the check digit actually computes",
    "You are cleaning a customer master of a few hundred GSTINs and need the malformed ones flagged with the reason, exported to CSV",
    "You need to quote a GSTIN in a support ticket or screenshot and want the PAN portion masked first",
  ],
  benefits: [
    [
      "Tells you which rule broke",
      "Reports the specific failure — bad state code, PAN pattern, entity code, missing Z or checksum mismatch — not just pass or fail.",
    ],
    [
      "Recomputes the expected check digit",
      "When the 15th character is wrong it shows the character the mod-36 algorithm actually expects.",
    ],
    [
      "Bulk mode with masked output",
      "Paste a whole list separated by newlines, commas or semicolons; copy masked values or download the full breakdown as CSV.",
    ],
  ],
  faqs: [
    [
      "What does each part of a GSTIN mean?",
      "A GSTIN is 15 characters: positions 1–2 are the state code, 3–12 are the holder's PAN, 13 is the entity number for that PAN within the state, 14 is the letter Z, and 15 is a checksum character. So 29ABCDE1234F1ZW is a Karnataka (29) registration on PAN ABCDE1234F.",
    ],
    [
      "How is the GSTIN check digit calculated?",
      "It is a mod-36 checksum over the first 14 characters. Each character is mapped to its value in the set 0–9 then A–Z, multiplied by an alternating factor of 2 and 1 working right to left, and the quotient and remainder of that product divided by 36 are added together; the check character is the symbol at (36 − sum mod 36) mod 36.",
    ],
    [
      "Does a valid format mean the GST registration is active?",
      "No. Structure and checksum validation only prove the number is well formed — a cancelled, suspended or never-issued GSTIN can still pass all 15-character checks. Confirm live registration status on the official GST portal before relying on it for input tax credit.",
    ],
    [
      "Which state does the first two digits refer to?",
      "They are the GST state code, running from 01 (Jammu & Kashmir) through 38 (Ladakh), with 97 reserved for Other Territory. Common ones are 07 Delhi, 24 Gujarat, 27 Maharashtra, 29 Karnataka, 33 Tamil Nadu and 36 Telangana; anything outside the recognised list is flagged as an invalid state code.",
    ],
  ],
};

export default seo;
