const seo = {
  title: "How Much Cash to Carry to Canada: CAD Float Planner",
  metaDescription:
    "Size the Canadian-dollar cash float against card spend, priced with the changer markup, GST, the RBI USD 3,000 note limit and the Rs 10 lakh LRS TCS line.",
  steps: [
    "Enter Trip length (days), Travellers and On-ground spend per person per day (CAD).",
    "Set Share of daily spend that will be cash (%), Money changer's markup on notes (%) and Card foreign-currency markup (%).",
    "Read Carry in dollars with the all-in rupee cost and the RBI cash limit per visit row, then press Copy plan.",
  ],
  intro:
    "This planner works out the small cash float a Canada trip actually needs and prices it against putting the same money on a card. The cash side applies the money changer's markup and the GST that Rule 32(2)(b) of the CGST Rules charges on a currency purchase; the card side applies the issuer's foreign-currency markup plus 18% GST on that fee. It also checks the plan against the RBI limit of USD 3,000 in currency notes per visit and the ₹10,00,000 Liberalised Remittance Scheme threshold at which 20% TCS begins.",
  useCases: [
    "Sizing the cash float for a student flying to Canada, where rent and groceries go on a card and only odd costs need notes.",
    "Deciding whether to buy Canadian dollars in India or draw them from an ATM after landing.",
    "Checking whether a year's tuition remittance plus travel forex crosses the ₹10,00,000 LRS threshold for TCS.",
  ],
  benefits: [
    ["Sized for a card economy", "Defaults to a low cash share because Interac and contactless cover almost all everyday spending in Canada."],
    ["All-in rupee cost", "Shows the effective rupees-per-dollar you end up paying on notes and on the card, after markup and GST."],
    ["Flags the Indian limits", "Tests the plan against the RBI note limit, the customs declaration thresholds and the LRS TCS threshold."],
  ],
  faqs: [
    [
      "How much cash should I carry to Canada?",
      "Very little — around 10% of your on-ground budget covers it. Cards work at cafés, transit, small shops and taxis, and restaurant terminals prompt for the tip, so a two-week trip often needs no more than C$150 to C$250 per person in notes.",
    ],
    [
      "Why is the shop price different from what I pay in Canada?",
      "Sales tax is added at the till rather than shown on the shelf, and it varies by province: Alberta charges the 5% federal GST alone, Ontario and the Atlantic provinces charge a combined HST, and most other provinces add a provincial sales tax on top of GST. Cash totals are also rounded to the nearest five cents because the penny was withdrawn in 2013.",
    ],
    [
      "What is cheaper — buying Canadian dollars in India or using an ATM there?",
      "For a small float, buying in India usually wins, because a foreign ATM withdrawal carries a flat fee of roughly ₹150 to ₹250 from your bank plus the machine's own surcharge, and Canadian convenience-store ATMs charge the most. For larger amounts the card markup versus the changer markup starts to matter more than the flat fee, which is what the comparison above works out.",
    ],
    [
      "Do I pay TCS on money sent to Canada for study?",
      "TCS applies once your LRS total for the financial year passes ₹10,00,000, the threshold in force from 1 April 2025. Education remittances have historically been treated more favourably than ordinary travel remittances, including a nil or reduced rate where the money is funded by an education loan from a specified institution. The rules are detailed and change with each Finance Act, so confirm your case with your bank or a chartered accountant rather than relying on a general figure.",
    ],
  ],
};

export default seo;
