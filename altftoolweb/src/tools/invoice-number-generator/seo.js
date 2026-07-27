const seo = {
  "intro": "Invoice Number Generator builds a full invoice numbering series in one pass: you pick a prefix, a date segment, a separator and a zero-padded counter, and it generates every number in the batch. Choose whether the counter runs straight through or resets each month, each calendar year, or each Indian financial year (April to March). It is built for freelancers, small businesses and accountants who need a numbering scheme that stays unique, sequential and audit-friendly.",
  "useCases": [
    "Set up next year's invoice series before the financial year starts on 1 April, using an FY2026-27 style prefix.",
    "Pre-fill an invoice register or accounting spreadsheet with 100 reserved numbers so no two team members issue the same one.",
    "Switch from a messy ad-hoc numbering habit to a documented scheme like INV-2026-04-0001 and export the CSV as a reference."
  ],
  "benefits": [
    [
      "Four reset rules",
      "Run one continuous sequence, or reset the counter monthly, per calendar year, or per Indian financial year."
    ],
    [
      "Duplicate detection",
      "The tool warns you when a scheme would repeat a number or overflow the padding width mid-series."
    ],
    [
      "Copy or export the batch",
      "Copy the whole list to the clipboard, or download a CSV with the number, sequence value and period date."
    ]
  ],
  "faqs": [
    [
      "Does GST law require invoice numbers to be sequential?",
      "Under the CGST Rules a tax invoice needs a consecutive serial number, unique for a financial year, up to 16 characters using letters, digits, hyphens and slashes. This tool keeps numbers within those characters, but treat this as general information and confirm with your accountant."
    ],
    [
      "Should I reset invoice numbers every year?",
      "Many Indian businesses reset the counter at the start of each financial year and put the FY in the number, which keeps each year's series self-contained. A single never-resetting sequence is equally valid as long as numbers stay unique."
    ],
    [
      "Why is zero padding useful?",
      "Padding to a fixed width (0001 instead of 1) keeps invoice numbers the same length, so they sort correctly in spreadsheets and file names."
    ],
    [
      "Are the generated numbers saved anywhere?",
      "No. Everything is generated in your browser and nothing is uploaded, so you keep full control of the list you export."
    ]
  ]
};

export default seo;
