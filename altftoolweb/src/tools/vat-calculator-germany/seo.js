const seo = {
  title: "German VAT Calculator — 19% & 7% Netto–Brutto (MwSt)",
  metaDescription:
    "Switch netto and brutto at 19% or 7%, see the Umsatzsteuer and the 19/119 tax fraction, and test the 25,000/100,000 EUR Kleinunternehmer limits.",
  steps: [
    "Choose the direction — 'Netto → Brutto' or 'Brutto → Netto' — and enter the amount in euros.",
    "Pick the Steuersatz: 19% Regelsteuersatz, 7% ermäßigter Satz, 0% Nullsatz, or a custom rate for historic comparisons like 2020's 16%.",
    "Read netto, Umsatzsteuer and brutto rounded to cents plus the tax fraction of the brutto price, then 'Copy result' — or test the § 19 UStG limits in the Kleinunternehmer check.",
  ],
  intro:
    "This calculator converts between netto and brutto prices under German Umsatzsteuer law: it multiplies a net figure by 1.19 at the 19% Regelsteuersatz, or divides a gross figure by 1.19 to strip the tax back out. The 7% ermäßigter Satz under § 12 Abs. 2 UStG is one click away, as is the tax fraction of the gross price — 19/119 at the standard rate. It is aimed at freelancers, Kleinunternehmer and anyone reconciling a German invoice.",
  useCases: [
    "Turning a 1,000 EUR net freelance fee into the 1,190 EUR brutto figure that goes on the Rechnung and into the customer's bank transfer.",
    "Splitting the food portion of a 53.50 EUR restaurant receipt at 7% (drinks stay at 19%) into 50.00 EUR netto and 3.50 EUR Umsatzsteuer for expense bookkeeping.",
    "Checking whether last year's turnover stayed under 25,000 EUR so the Kleinunternehmerregelung still applies and no VAT has to be shown on invoices.",
  ],
  benefits: [
    ["Netto and brutto both ways", "One toggle switches between adding 19% or 7% and reversing it out of a gross figure."],
    ["Cent-accurate invoices", "Net, tax and gross are rounded to whole cents so the three lines always add up."],
    ["Kleinunternehmer test built in", "Checks both § 19 UStG limits — 25,000 EUR prior year and 100,000 EUR current year."],
  ],
  faqs: [
    [
      "What is the VAT rate in Germany?",
      "The standard rate (Regelsteuersatz) is 19% and has been since 1 January 2007. A reduced rate of 7% applies to groceries, books, newspapers, cut flowers, local public transport, cultural admissions, and (permanently since 1 January 2026) restaurant and takeaway food — though drinks served with the meal stay at 19%. Exports and intra-EU supplies are zero-rated, and residential photovoltaic systems have been taxed at 0% since 1 January 2023.",
    ],
    [
      "How do I calculate netto from brutto in Germany?",
      "Divide the brutto amount by 1.19 for the 19% rate or by 1.07 for the 7% rate. A 119 EUR brutto invoice is 100 EUR netto plus 19 EUR Umsatzsteuer. Equivalently, the tax inside a standard-rated gross price is 19/119 of it, or about 15.97%.",
    ],
    [
      "Who qualifies as a Kleinunternehmer in 2025 and later?",
      "Under § 19 UStG as reformed on 1 January 2025, you can stay outside the VAT charge if turnover was 25,000 EUR or less in the previous calendar year and does not exceed 100,000 EUR in the current one. Crossing the 100,000 EUR mark makes you liable from that transaction onward, so watch the running total rather than the year-end figure.",
    ],
    [
      "Is Mehrwertsteuer the same as Umsatzsteuer?",
      "In everyday use, yes. Umsatzsteuer is the legal term used in the UStG and on tax returns; Mehrwertsteuer, usually abbreviated to MwSt, is the common commercial term you see on receipts. Both describe the same tax at the same 19% or 7% rates. For your own filing position, ask a Steuerberater.",
    ],
  ],
};

export default seo;
