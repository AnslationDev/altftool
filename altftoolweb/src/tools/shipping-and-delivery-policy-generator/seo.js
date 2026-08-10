const seo = {
  title: "Shipping Policy Generator with a Working-Day ETA",
  metaDescription:
    "Walks working days from your dispatch cut-off — skipping Sundays, non-shipping Saturdays and your holidays — then drafts the Rule 5(3) policy text.",
  steps: [
    "Under Delivery ETA check set Order placed on and Order placed at, the Same-day dispatch cut-off, Packing time (working days), Destination zone such as Metro to metro, and Holidays with no dispatch or delivery.",
    "Tick Ships on Saturday, Ships on Sunday or This order is COD, then complete Store and charges — free shipping threshold, flat charge, COD fee and limit, damage reporting window and grievance hours.",
    "Expected delivery window prints the earliest and latest dates with the cut-off verdict, the date the parcel is handed to the carrier and the calendar-day span, and the policy text renders underneath for Copy policy.",
  ],
  intro:
    "The Shipping and Delivery Policy Generator writes an ecommerce shipping page and, alongside it, calculates a real delivery window by walking working days rather than adding a flat number of calendar days. It applies the dispatch cut-off, packing time, zone transit band, non-shipping Saturdays, Sundays and your own holiday list, then drafts clauses on charges, cash on delivery, tracking, damaged parcels and delays. The disclosure requirements it follows come from Rule 5(3) of the Consumer Protection (E-Commerce) Rules 2020.",
  useCases: [
    "Answer a customer who ordered at 3pm on a Friday and wants to know the honest delivery date, not a marketing promise.",
    "Publish zone-wise timelines that separate metro-to-metro from North-East and island PIN codes instead of quoting one range for all of India.",
    "Write down the exact damaged-parcel process — refuse at the door, unboxing video above a threshold, keep the packing — so support does not improvise.",
    "Check how a festival holiday block or a Saturday shutdown pushes every delivery date before you announce a sale.",
  ],
  benefits: [
    ["Working-day arithmetic", "Sundays, non-shipping Saturdays and listed holidays are skipped, so the date shown is the date achievable."],
    ["Cut-off logic built in", "An order placed after the cut-off starts packing the next day, exactly as the warehouse actually works."],
    ["Required disclosures covered", "Delivery timelines, shipping charges, COD terms and grievance contacts are all present, as Rule 5(3) requires."],
  ],
  faqs: [
    [
      "What must an Indian ecommerce shipping policy disclose?",
      "Rule 5(3) of the Consumer Protection (E-Commerce) Rules 2020 requires a seller to provide delivery and shipment details, the cost of return shipping, and refund, exchange, warranty and grievance redressal information before the consumer agrees to buy. Rule 4(5) separately requires complaints to be acknowledged within 48 hours and redressed within one month.",
    ],
    [
      "How should delivery time be counted — calendar days or working days?",
      "Count working days after dispatch, and say so on the page. A parcel handed over on a Tuesday with a 4 to 7 working-day band for the rest of India arrives roughly the following Saturday to the Wednesday after, which is 5 to 9 calendar days — quoting the calendar figure without the working-day basis is what generates complaints.",
    ],
    [
      "What should a customer do when a parcel arrives damaged?",
      "Refuse a visibly damaged or re-taped parcel at the door and have the rider mark it damaged, because a refused parcel returns automatically and needs no further proof. If it is already accepted, photograph the outer packing, the shipping label with the AWB number and the contents, keep all packing material, and report within the seller's stated window. A claim against a common carrier must be notified in writing within 180 days of booking under Section 16 of the Carriage by Road Act 2007.",
    ],
    [
      "Can a seller charge extra for cash on delivery?",
      "Yes, provided the COD handling fee is shown before payment rather than added later; an undisclosed charge added at the door can be treated as an unfair trade practice under the Consumer Protection Act 2019. COD parcels also often take a day or two longer because carriers route them differently, which is worth stating in the policy. This is general information, not legal advice.",
    ],
  ],
};

export default seo;
