const seo = {
  title: "Repair Quote Comparator: Tax-Inclusive Totals",
  metaDescription:
    "Paste quotes as Provider | parts | labour | other | hours | warranty | exclusions, add your tax rate, and rank tax-inclusive totals cheapest first.",
  steps: [
    "In the \"Repair quotes\" box, paste one quote per line as Provider | parts | labour | other | turnaround hours | warranty | exclusions.",
    "Set \"Tax rate to add (%)\" — 18 by default, or 0 when the quotes you were given already include tax.",
    "Read the ranked Provider / Subtotal / Total / Hours / Warranty / Exclusions table with the lowest total named, then Copy it or Download repair-quote-comparator.txt.",
  ],
  intro:
    "The Repair Quote Comparator turns competing repair estimates into one ranked table: it adds parts, labour and other charges into a subtotal, applies your tax rate (18% by default) to get the real total, and sorts the quotes cheapest first while keeping each one's turnaround hours, warranty terms and exclusions visible in the same row. It is for anyone holding two or more workshop or service-centre quotes that are written in different formats and hard to line up. Enter one quote per line as Provider | parts | labour | other | hours | warranty | exclusions and you get totals that are actually comparable.",
  useCases: [
    "Two garages quote for the same gearbox job — one loads the cost into parts, the other into labour — and you want the tax-inclusive totals side by side before you commit.",
    "A phone repair shop is cheaper on paper but only offers 6 months on parts against a rival's 12 months, and you need the price gap and the warranty gap in one view.",
    "An appliance service centre quotes a lower headline figure but excludes diagnostics and pickup, so you want those exclusions parked next to the total rather than buried in the fine print.",
  ],
  benefits: [
    ["Compares totals, not headline prices", "Parts, labour and other charges are summed and taxed at your rate, so a quote that hides cost in a separate line cannot look cheaper than it is."],
    ["Keeps the non-price terms in the row", "Turnaround hours, warranty length and exclusions sit alongside each total, so the cheapest quote is judged against what it actually covers."],
    ["Ranks automatically", "Quotes are sorted ascending by tax-inclusive total and the lowest is named, with the highest shown too so you can see the spread."],
  ],
  faqs: [
    [
      "How do I compare two repair quotes fairly?",
      "Bring both to the same tax-inclusive total and then compare warranty and turnaround at that price. The tool sums parts, labour and other charges, multiplies by one plus your tax rate, and prints warranty terms and exclusions in the same row so the comparison is not price-only.",
    ],
    [
      "What format do I enter the quotes in?",
      "One quote per line, seven pipe-separated fields: Provider | parts | labour | other | turnaround hours | warranty | exclusions. Only the three cost fields need to be numbers; the last three are free text and are carried through to the output table unchanged.",
    ],
    [
      "Does it include tax in the comparison?",
      "Yes. A single tax rate, defaulting to 18%, is applied to every quote's subtotal, so the ranked totals are tax-inclusive. Set the rate to 0 if the quotes you were given already include tax.",
    ],
    [
      "Is the cheapest quote the one I should accept?",
      "Not necessarily — the tool names the lowest entered total, but a 6-month parts warranty against a 12-month one, or an exclusion for diagnostics, can easily outweigh a small price gap. Treat the ranking as a starting point and read the exclusions column before deciding.",
    ],
  ],
};

export default seo;
