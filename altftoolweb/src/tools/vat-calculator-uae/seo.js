const seo = {
  title: "UAE VAT Calculator: Add or Remove 5% VAT in AED",
  metaDescription:
    "Add 5% VAT to a net AED price or extract it from a tax-inclusive one with the 5/105 fraction, plus the AED 375,000 and 187,500 registration thresholds.",
  steps: [
    "Pick a Direction — \"Add VAT\" when the amount is before VAT, or \"Remove VAT\" when it already includes VAT — then type the AED amount and the Quantity.",
    "Leave Supply type on \"5% standard\", switch it to \"0% zero-rated\", or choose \"Custom rate\" and type your own figure into \"VAT rate (%)\"; every line recalculates as you type, with no calculate button.",
    "Read the net, VAT and gross to two decimal places plus both unit prices, and type your last-12-month taxable supplies into the \"Registration threshold check\" box to see where you sit against the AED 375,000 mandatory and AED 187,500 voluntary thresholds.",
  ],
  intro:
    "This calculator works out UAE VAT at the 5% standard rate in both directions: it adds VAT to a net price, and it extracts the VAT already sitting inside a tax-inclusive price using the 5/105 fraction. It follows Federal Decree-Law No. (8) of 2017, which introduced VAT in the UAE on 1 January 2018, and also flags where your 12-month taxable supplies sit against the AED 375,000 mandatory and AED 187,500 voluntary registration thresholds. It suits freelancers, retailers and finance teams checking invoice totals before filing a return.",
  useCases: [
    "A Dubai supplier quotes AED 12,500 net and you need the tax invoice total with 5% VAT shown separately.",
    "A receipt shows only AED 4,200 inclusive of VAT and your bookkeeping needs the net figure and the VAT component split out.",
    "A consultant crossing AED 375,000 in taxable supplies wants to confirm registration is now mandatory rather than voluntary.",
  ],
  benefits: [
    ["Both directions", "Add 5% on top of a net price or reverse it out of a gross price without rearranging the formula."],
    ["Invoice-ready split", "Shows net, VAT and gross to two decimal places so the three lines always reconcile on a tax invoice."],
    ["Threshold awareness", "Compares your 12-month taxable supplies against the mandatory and voluntary registration limits."],
  ],
  faqs: [
    [
      "What is the VAT rate in the UAE?",
      "The standard UAE VAT rate is 5%, unchanged since VAT began on 1 January 2018. Certain supplies such as exports outside the GCC, international transport and some healthcare and education services are zero-rated, while bare land, local passenger transport and some financial services are exempt.",
    ],
    [
      "How do I remove 5% VAT from a price in the UAE?",
      "Multiply the VAT-inclusive price by 5/105, which is the same as dividing by 1.05 and subtracting. On an AED 1,050 inclusive price the VAT is AED 50 and the net amount is AED 1,000 — note that dividing by 1.05 is correct while subtracting 5% of the gross is not.",
    ],
    [
      "When must a UAE business register for VAT?",
      "Registration is mandatory once taxable supplies and imports exceed AED 375,000 in any 12-month period, or are expected to in the next 30 days. Voluntary registration is available from AED 187,500 of taxable supplies or taxable expenses.",
    ],
    [
      "What is the minimum spend for a UAE tourist VAT refund?",
      "A tourist must spend at least AED 250 including VAT with a registered retailer on the tagged invoice to claim under the Federal Tax Authority refund scheme. The refund is 85% of the VAT paid, less a fixed fee of AED 4.80 per tax-free tag, and the goods must leave the country within 90 days. Confirm current scheme terms with the operator before relying on them.",
    ],
  ],
};

export default seo;
