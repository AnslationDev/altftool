const seo = {
  title: "CAC Calculator: Per-Channel Cost and LTV:CAC Ratio",
  metaDescription:
    "Works out CAC per marketing channel and blended, grades your LTV:CAC ratio against the 3:1 benchmark, and exports the breakdown as CSV.",
  intro:
    "This calculator works out Customer Acquisition Cost channel by channel — CAC = spend ÷ customers acquired — and then a blended CAC from total spend ÷ total customers across every channel you list. Enter your average customer lifetime value and it grades the LTV:CAC ratio against the standard 3:1 benchmark, ranks channels from cheapest to most expensive, and shows the spend gap between your best and worst performer. Figures are in rupees, and everything stays in the browser.",
  useCases: [
    "You run Google Ads, Meta, SEO and a referral programme and want to know which one is actually buying customers cheapest before next quarter's budget is locked",
    "An investor asked for your LTV:CAC ratio and you need a defensible number plus the per-channel breakdown behind it",
    "Blended CAC has crept up over two months and you need to identify which single channel dragged it, rather than cutting spend across the board",
  ],
  benefits: [
    [
      "Blended and per-channel CAC side by side",
      "One channel at ₹1,500 hidden inside a ₹420 blended average is exactly the problem this surfaces, with BEST and HIGH badges on the outliers.",
    ],
    [
      "Spend share as well as cost",
      "Each channel shows what percentage of total budget it consumes next to its CAC, so an efficient channel starved of budget is easy to spot.",
    ],
    [
      "Export the whole picture",
      "Copy a plain-text summary or download a CSV with every channel's spend, customers, CAC and spend share plus the blended totals and LTV:CAC ratio.",
    ],
  ],
  faqs: [
    [
      "How is CAC calculated here?",
      "Per channel it is marketing spend ÷ customers acquired from that channel, and blended CAC is total spend across all channels ÷ total customers. So ₹50,000 on Google Ads producing 120 customers is a CAC of ₹417, while the same ₹50,000 producing 250 customers is ₹200.",
    ],
    [
      "What is a good LTV:CAC ratio?",
      "3:1 or higher is the widely used benchmark and is graded Excellent here. The tool bands 2–3x as Good, 1–2x as Needs Work because you are barely breaking even on acquisition, and anything below 1x as Unsustainable — you lose money on every customer.",
    ],
    [
      "What counts as an efficient CAC?",
      "The efficiency labels here use rupee bands: up to ₹200 is Very Efficient, up to ₹500 Efficient, up to ₹1,000 Average, up to ₹2,000 Above Average, and above ₹2,000 High Cost. These are rough guides only — the real test is your LTV:CAC ratio, since a ₹5,000 CAC is fine against a ₹25,000 lifetime value.",
    ],
    [
      "Should I include salaries in the spend figure?",
      "That depends on which definition you want. Paid-media-only CAC uses ad spend and is useful for comparing channels; fully loaded CAC adds marketing salaries, agency retainers and tooling, and is the figure investors usually mean. Pick one definition and apply it to every channel so the comparison stays honest.",
    ],
  ],
};

export default seo;
