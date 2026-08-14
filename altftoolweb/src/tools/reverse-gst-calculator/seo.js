const seo = {
  title: "Reverse GST Calculator: Remove GST From a Total",
  metaDescription:
    "Divides a tax-inclusive amount by (1 + rate/100) to give the taxable value, split as CGST + SGST or IGST, with cess and the section 170 rounding.",
  steps: [
    "Enter the Tax-inclusive amount (INR), set the GST rate (%) or tap one of the 5%, 12%, 18% and 28% slab chips, and add a Compensation cess (%), if any.",
    "Choose Place of supply — Within the same state — CGST + SGST, or Across states — IGST — and Taxable value inside the bill recalculates as you type, dividing by 1 plus the rate.",
    "Read the CGST and SGST / UTGST rows at half the rate, Total tax, GST rounded to the nearest rupee (s.170) and Tax as a share of the bill, then press Copy result or Reset.",
  ],
  intro:
    "A reverse GST calculator recovers the taxable value hidden inside a tax-inclusive price by dividing the gross amount by (1 + rate ÷ 100), then reports the tax as CGST plus SGST for a supply within one state or as IGST for an inter-state supply. It follows section 15 of the CGST Act, 2017, under which GST is charged on the transaction value, and section 170, under which the tax payable is rounded to the nearest rupee. Handy for retailers quoting all-in prices, freelancers converting an agreed fee into an invoice, and anyone checking a restaurant or hotel bill.",
  useCases: [
    "A shopkeeper who advertises a Rs 1,180 all-in price and needs the Rs 1,000 taxable value for the invoice",
    "A freelancer who agreed a fixed Rs 50,000 fee inclusive of tax and must show the base and 18% GST separately",
    "A buyer checking a car bill where 28% GST and compensation cess are both built into the on-road price",
  ],
  benefits: [
    ["Cess handled", "Add an ad valorem compensation cess and the base value still comes out right."],
    ["Correct split", "Halves the tax into CGST and SGST for local supplies, or shows the full IGST."],
    ["Shows the trap", "Makes clear that 18% GST is only 15.25% of the gross bill, not 18%."],
  ],
  faqs: [
    [
      "How do I remove GST from a total amount?",
      "Divide the total by 1 plus the rate as a decimal. At 18% divide by 1.18, at 12% divide by 1.12 and at 5% divide by 1.05. A Rs 1,180 bill at 18% therefore contains Rs 1,000 of taxable value and Rs 180 of GST.",
    ],
    [
      "Why is 18% GST only 15.25% of the bill?",
      "Because the 18% is charged on the base, not on the total. Tax as a share of the gross amount is rate ÷ (100 + rate), so 18 ÷ 118 = 15.25%. Subtracting 18% from the total instead of dividing by 1.18 understates the base by about 2.7%.",
    ],
    [
      "How is the tax split between CGST, SGST and IGST?",
      "For a supply within one state the tax is split equally — 18% GST becomes 9% CGST plus 9% SGST or UTGST. For a supply between states the whole amount is IGST at the full rate. The split never changes the total tax, only which government receives it.",
    ],
    [
      "Should GST on an invoice be rounded off?",
      "Yes. Section 170 of the CGST Act requires the tax amount to be rounded to the nearest rupee, with an exact fifty-paise fraction rounded up. The calculator shows both the exact figure and the rounded one so your invoice ties up with your books.",
    ],
  ],
};

export default seo;
