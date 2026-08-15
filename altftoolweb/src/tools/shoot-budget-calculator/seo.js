const seo = {
  title: "Shoot Budget Calculator: Crew, Gear, Contingency",
  metaDescription:
    "Build an AICP-style shoot budget from crew day rates, gear and location fees, travel and post hours — contingency on the subtotal, then tax on top.",
  steps: [
    "Set the head count and day rate for each crew role, then fill in shoot days, gear rental days and rate, location, travel, lodging, meals and post hours.",
    "Set the \"Contingency (%)\" and \"GST / sales tax (%)\" fields — contingency applies to the direct subtotal, tax to the contingency-inclusive figure.",
    "Read the total with cost per shoot day and per finished minute, then click \"Copy result\" for the line-item breakdown.",
  ],
  intro:
    "A shoot budget calculator turns crew day rates, equipment rental, location fees, travel and living, and post-production hours into a single line-item production budget. It follows the structure of a standard AICP-style bid form: direct costs are totalled first, a contingency percentage is applied to that subtotal, and tax is added last on the contingency-inclusive figure. Useful for freelancers, agencies and in-house content teams who need a defensible number before quoting a client.",
  useCases: [
    "Quote a two-day brand film shoot with a five-person crew and 24 hours of edit time before sending the client a proposal.",
    "Compare a one-day studio shoot against a two-day location shoot when travel and lodging for six people are added.",
    "Work out the cost per finished minute of content so you can price a series of videos instead of a single deliverable.",
    "Check how much a 10% contingency and 18% GST add to a budget that already looks tight.",
  ],
  benefits: [
    ["Bid-form structure", "Direct costs, then contingency, then tax — the same order a production bid is read in."],
    ["Per-day and per-minute figures", "Shows cost per shoot day and per finished minute so you can price by output, not by effort."],
    ["Every rate editable", "Preset day rates are starting points; change any head count, rate or fee and the whole budget re-totals."],
  ],
  faqs: [
    [
      "How much contingency should a shoot budget have?",
      "10% of the direct-cost subtotal is the conventional contingency line on AICP and AICE bid forms. Controlled studio work is sometimes bid at 5%, while documentary, outdoor or travel-heavy shoots commonly carry 15% because weather and access risks are higher.",
    ],
    [
      "What GST applies to video production in India?",
      "Motion picture, video and television programme production and post-production services fall under SAC heading 9986 and are taxed at 18% GST. Set the tax field to 0 if you are billing an overseas client as an export of services or are below the registration threshold.",
    ],
    [
      "Should gear rental days match shoot days?",
      "Usually not. Rental houses normally charge for pickup and return days as well, so a two-day shoot often books three or four gear days. This calculator keeps gear days as a separate field so you can bill them accurately.",
    ],
    [
      "How do I work out cost per finished minute?",
      "Divide the all-in total by the runtime of the delivered edit. A two-day shoot totalling around 3 lakh that yields a two-minute film costs roughly 1.5 lakh per finished minute — a figure worth quoting when a client asks for extra cutdowns.",
    ],
  ],
};

export default seo;
