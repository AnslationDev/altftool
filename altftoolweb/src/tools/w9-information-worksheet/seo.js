const seo = {
  title: "W-9 Worksheet: Line 1 Name, Classification, TIN",
  metaDescription:
    "Work out the name for line 1, the box on line 3a and the right TIN type before you sign — including the single-member LLC rule and 24% backup withholding.",
  steps: [
    "Pick your Federal tax classification, then fill Line 1 — Name on your tax return and Line 2 — Business or disregarded entity name.",
    "Choose the Kind of taxpayer number, enter it under Part I — Taxpayer identification number, and add Lines 5 and 6 — Address plus any Line 4 — Exempt payee code.",
    "Enter Expected payment this year (USD) and the 1099-NEC reporting threshold (USD); the result names the Box to tick on line 3a, whether the TIN format is valid, and what backup withholding at 24% would cost.",
  ],
  intro:
    "This worksheet works out what belongs on each line of IRS Form W-9 — the name on line 1, the business name on line 2, the federal tax classification on line 3a, exemptions on line 4 and the taxpayer identification number in Part I — before you sign the certification in Part II. It applies the rule that catches most filers: a single-member LLC that is disregarded for tax does not tick the LLC box, and puts the owner's name on line 1 with the LLC's name on line 2. It also shows the 24 per cent backup withholding under section 3406 that applies when a correct TIN is not furnished.",
  useCases: [
    "Decide whether your single-member LLC ticks the LLC box or the individual box before a client's onboarding portal rejects the form.",
    "Check the shape of an EIN or SSN so a payer's TIN matching request does not come back as a mismatch.",
    "See what 24 per cent backup withholding would cost on an expected year of invoices.",
    "Confirm that a foreign contractor should be sent a W-8BEN rather than a W-9.",
  ],
  benefits: [
    ["Classification-aware", "Each classification changes which name goes on line 1 and which taxpayer number is expected."],
    ["Catches the LLC trap", "The single-member LLC rule is applied automatically instead of being buried in the instructions."],
    ["Stays local", "Names and taxpayer numbers are processed in the browser and never uploaded."],
  ],
  faqs: [
    [
      "What name goes on line 1 of a W-9 for a single-member LLC?",
      "The owner's name, not the LLC's. A single-member LLC that is disregarded for federal tax purposes puts the owner on line 1, the LLC on line 2, ticks the individual/sole proprietor box rather than the LLC box, and generally gives the owner's SSN. Ticking the LLC box here is the most common cause of a TIN mismatch notice.",
    ],
    [
      "What is the backup withholding rate?",
      "24 per cent of the reportable payment, under section 3406. It applies when the payee does not furnish a correct taxpayer identification number, fails to certify the number, or has been notified by the IRS that they are subject to backup withholding for underreported interest or dividends.",
    ],
    [
      "Should a sole proprietor give an SSN or an EIN on a W-9?",
      "Either is permitted if the sole proprietor has an EIN, but the IRS prefers the SSN because it matches the individual name that must appear on line 1. If you give the EIN, the name on line 1 still has to be the individual's, with the business name on line 2.",
    ],
    [
      "Do foreign contractors fill in a W-9?",
      "No. A foreign individual uses Form W-8BEN, a foreign entity uses Form W-8BEN-E, and a foreign person with income effectively connected to a US trade or business uses Form W-8ECI. Signing a W-9 certifies that you are a US person, so a non-resident should never be asked for one.",
    ],
  ],
};

export default seo;
