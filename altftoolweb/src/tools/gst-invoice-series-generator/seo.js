const seo = {
  title: "GST Invoice Series Generator - Rule 46(b) Length Check",
  metaDescription:
    "Design a financial-year invoice series and check every number against Rule 46(b): sixteen characters max, allowed characters, e-invoice-safe start.",
  steps: [
    "Type a Prefix (letters, digits, hyphen and slash only, up to 12 characters) and the 'Financial year starting in' year - the defaults build INV/2025-26/0001. [pages/index.jsx:29-38, 116-147]",
    "Set 'How the year is written', 'Order of the parts', the Separator, 'Digits in the running number' (1-10) and 'Start numbering at'. [pages/index.jsx:148-246]",
    "Check the preview table's Length and Rule 46(b) columns and the 'Accepted by the e-invoice schema' row, then press Copy series to take every number. [pages/index.jsx:296, 310-334, 343-377]",
  ],
  intro:
    "This generator builds a tax invoice numbering series for an Indian financial year and checks it against Rule 46(b) of the CGST Rules, 2017, which requires a consecutive serial number of not more than sixteen characters made up only of letters, digits, hyphen and slash, unique for the financial year. It also flags numbers the e-invoice schema would reject, such as one beginning with 0, / or -. Aimed at business owners and accountants setting up a numbering scheme on 1 April.",
  useCases: [
    "A firm setting up its invoice series for a new financial year and checking that INV/2025-26/0001 fits in sixteen characters",
    "A business with separate books for exports and domestic sales designing two parallel series",
    "Someone about to cross the e-invoicing turnover limit who needs a document number the IRP will accept",
  ],
  benefits: [
    ["Length checked live", "Shows how many of the sixteen characters each number uses and how many are spare."],
    ["e-invoice safe", "Warns when the number starts with a character the e-invoice schema rejects."],
    ["Capacity shown", "Tells you how many invoices fit before the padded digits widen the number."],
  ],
  faqs: [
    [
      "What is the maximum length of a GST invoice number?",
      "Sixteen characters. Rule 46(b) of the CGST Rules, 2017 requires a consecutive serial number not exceeding sixteen characters, so INV/2025-26/0001 is exactly at the limit while INVOICE/2025-26/0001 is four characters over.",
    ],
    [
      "Which special characters are allowed in a GST invoice number?",
      "Only the hyphen and the slash, alongside letters and numerals. Rule 46(b) names them expressly, so a hash, space, underscore, full stop or hash symbol makes the invoice number non-compliant.",
    ],
    [
      "Can I use more than one invoice series?",
      "Yes. Rule 46(b) permits one or multiple series, so separate books for branches, export sales or B2C counters are allowed provided each series is consecutive and each number is unique within the financial year.",
    ],
    [
      "Do I have to restart invoice numbers on 1 April?",
      "The rule requires uniqueness for a financial year, so the usual practice is to restart the running number each 1 April with the year built into the prefix. Carrying an unbroken sequence across years is not itself prohibited, but restarting keeps the year identifiable and avoids duplicates — confirm your approach with your GST practitioner.",
    ],
  ],
};

export default seo;
