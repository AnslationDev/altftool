const seo = {
  title: "GST on Advance Received: Goods vs Services Time of Supply",
  metaDescription:
    "Advances for services are taxed on receipt under section 13(2); goods are not. Get the verdict, CGST/SGST or IGST split, voucher and GSTR-1 line.",
  steps: [
    "Enter the Advance received, then choose What is being supplied, the supplier's registration status and Nature of supply.",
    "Set the GST rate, or tick \"Rate not determinable yet\" to apply the rule 50 fallback of 18%, and tick reverse charge or export under LUT if they apply.",
    "Read the verdict with the CGST/SGST or IGST split, then the Documents to issue and Where it is reported lists, and press Copy result.",
  ],
  intro:
    "Whether an advance attracts GST depends entirely on the time of supply: section 13(2) makes an advance for services taxable on the day the payment is received, while Notification No. 66/2017-Central Tax removes that liability for advances against goods for every registered person outside the composition scheme. This checker takes the receipt, the type of supply, the registration status and the nature of supply, then returns the verdict, the CGST/SGST or IGST split, the receipt voucher required under section 31(3)(d) and the exact GSTR-1 and GSTR-3B lines. It also applies the rule 50 fallbacks of 18% when the rate is unknown and inter-State treatment when the place of supply is unknown.",
  useCases: [
    "A consultant receives a 50% retainer before starting work and needs to know if GST must be paid this month.",
    "A trader takes a booking amount against machinery and wants confirmation that no GST is due until the invoice is raised.",
    "A business pays an advance to a goods transport agency under reverse charge and needs the tax and the return line.",
  ],
  benefits: [
    ["Goods and services separated correctly", "The single most common error — treating both the same way — is resolved by the notification that actually applies."],
    ["Rule 50 fallbacks applied", "An undeterminable rate defaults to 18% and an undeterminable place of supply is treated as inter-State, exactly as the provisos require."],
    ["Voucher and return line named", "The output tells you which document to issue and whether the amount belongs in Table 11A of GSTR-1 or nowhere at all."],
  ],
  faqs: [
    [
      "Is GST payable on an advance received for services?",
      "Yes. Under section 13(2) of the CGST Act the time of supply of services is the earlier of the invoice date or the date of receipt of payment, so tax is due in the month the advance is received. Issue a receipt voucher under section 31(3)(d) and report the amount in Table 11A of GSTR-1 and in outward supplies in GSTR-3B.",
    ],
    [
      "Is GST payable on an advance received for goods?",
      "No, for a registered person outside the composition scheme. Notification No. 66/2017-Central Tax dated 15 November 2017 exempts them from paying tax on advances for goods, so the time of supply is simply the date of the invoice. Charge GST when you raise the tax invoice, not when the booking amount arrives.",
    ],
    [
      "What rate applies if the GST rate is not known when the advance is received?",
      "18%. The first proviso to rule 50 of the CGST Rules requires tax at 18% where the rate is not determinable at the time of receipt, and the second proviso says that where the nature of the supply cannot be determined it is treated as an inter-State supply, so IGST is charged.",
    ],
    [
      "What happens to the GST if the advance is refunded and no supply takes place?",
      "Issue a refund voucher under section 31(3)(e) and adjust the tax already paid. The advance is reversed through Table 11B of GSTR-1 in the period of the refund, which releases the tax against your other liabilities. Keep the refund voucher and the bank entry together, since this is a commonly queried adjustment in departmental scrutiny.",
    ],
  ],
};

export default seo;
