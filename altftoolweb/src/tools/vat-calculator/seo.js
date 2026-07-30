const seo = {
  intro:
    "The VAT Calculator works in both directions at any rate: to add tax it computes VAT = net × rate ÷ 100 and gross = net + VAT, and to strip it out it divides back with net = gross ÷ (1 + rate ÷ 100), then reports VAT as the difference. Every result breaks out net, VAT and gross to two decimals alongside the tax fraction — rate ÷ (100 + rate) — which is the share of a tax-inclusive price the tax actually represents. It accepts any percentage, so the same box handles a 5%, 18% or 27% regime; the rate field simply starts at 18%.",
  useCases: [
    "A supplier sends a single inclusive figure and your bookkeeping needs the net and the tax split out before it can be entered.",
    "You are pricing a product to land on a round tax-inclusive shelf price and need to know what the pre-tax figure has to be.",
    "Checking an invoice where the stated tax looks wrong, and you want the exact VAT amount for the rate that should have applied.",
  ],
  benefits: [
    [
      "Reverse VAT done correctly",
      "Removing tax divides by (1 + rate ÷ 100) rather than subtracting the rate from the gross — the mistake that makes a 20% removal come out 4% short.",
    ],
    [
      "Shows the tax fraction, not just the total",
      "It prints rate ÷ (100 + rate) as a percentage of gross, so you can see that an 18% rate is 15.25% of an inclusive price and reuse that multiplier on other figures.",
    ],
    [
      "Rate-agnostic",
      "Nothing is hard-coded to one country's VAT or GST rate; type the percentage that applies, including fractional rates, and both directions recalculate.",
    ],
  ],
  faqs: [
    [
      "How do I remove VAT from a price that already includes it?",
      "Divide the gross amount by 1 plus the rate as a decimal — for an 18% rate, gross ÷ 1.18 — and the VAT is whatever is left over. Subtracting 18% from the gross is a different, smaller number and gives the wrong net.",
    ],
    [
      "How do I add VAT to a net amount?",
      "Multiply the net by the rate divided by 100 to get the VAT, then add it to the net. On 1,000 at 18% that is 180 of VAT and a gross of 1,180.",
    ],
    [
      "What is the VAT fraction and why does it matter?",
      "It is rate ÷ (100 + rate), the proportion of a tax-inclusive price that is tax. At 20% it is exactly one sixth, or 16.67%; at 18% it is 15.25%. Multiplying a gross figure by that fraction extracts the tax in one step.",
    ],
    [
      "Does this work for GST and sales tax as well as VAT?",
      "The same arithmetic applies to any single-rate tax expressed as a percentage of price, including GST. It does not model multi-slab structures, split CGST/SGST components, reverse-charge treatment or exemptions — for filing and compliance, check the figures with an accountant or your tax authority.",
    ],
  ],
};

export default seo;
