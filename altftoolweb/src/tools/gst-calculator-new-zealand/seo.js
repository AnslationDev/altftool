const seo = {
  intro:
    "This calculator converts between GST-exclusive and GST-inclusive prices in New Zealand at the 15% rate imposed by section 8 of the Goods and Services Tax Act 1985. Adding GST multiplies the net price by 1.15; removing it uses Inland Revenue's published shortcut of multiplying the inclusive price by 3 and dividing by 23, which is 0.15/1.15 written exactly. It is built for sole traders, contractors and small businesses pricing work, checking a supplier invoice, or testing turnover against the NZ$60,000 registration threshold.",
  useCases: [
    "A contractor quoting a job who has a target take-home figure and needs the GST-inclusive price to put on the quote.",
    "A retailer reconciling a month of shelf prices, splitting each inclusive total into its net and GST components for the GST return.",
    "A growing sole trader watching rolling 12-month turnover to see how close they are to the NZ$60,000 compulsory registration point.",
  ],
  benefits: [
    ["Exact 3/23 method", "Removes GST with Inland Revenue's own fraction rather than an approximated decimal, so cents match the return."],
    ["Historical rates included", "Restate pre-2010 invoices at 12.5% or 10% without hunting for the old rate."],
    ["Threshold and filing check", "Shows headroom to the NZ$60,000 registration point and which filing frequency the turnover allows."],
  ],
  faqs: [
    [
      "How do I calculate GST in New Zealand?",
      "To add GST, multiply the GST-exclusive price by 0.15 and add it, or simply multiply by 1.15 — a $100 net price becomes $115. To remove GST from an inclusive price, multiply by 3 and divide by 23, so $115 inclusive contains $15 of GST and $100 net.",
    ],
    [
      "Why is GST 3/23 of the price and not 15%?",
      "Because 15% is charged on the net price, not on the inclusive total. GST is 0.15/1.15 of an inclusive price, which is exactly 15/115 or 3/23 — about 13.04%. Applying 15% to the inclusive figure overstates the GST.",
    ],
    [
      "When do I have to register for GST in New Zealand?",
      "When your taxable supplies exceed NZ$60,000 in any 12-month period, looking back over the past 12 months or forward over the next 12, under section 51 of the GST Act. You can register voluntarily below that level, which lets you claim GST on business purchases.",
    ],
    [
      "When did New Zealand GST change to 15%?",
      "On 1 October 2010. GST started at 10% on 1 October 1986, rose to 12.5% on 1 July 1989, and has been 15% since October 2010. Invoices for supplies made before those dates use the rate in force at the time — check with an accountant if a supply straddles a rate change.",
    ],
  ],
};

export default seo;
