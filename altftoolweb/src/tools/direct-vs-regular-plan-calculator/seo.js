const seo = {
  title: "Direct vs Regular Plan Calculator – Mutual Fund TER Cost",
  metaDescription:
    "See what the TER gap between a direct and regular mutual fund plan costs in rupees: commission paid plus compounding lost, for a lumpsum or SIP.",
  steps: [
    "Choose Lumpsum or Monthly SIP under Investment mode, then enter the amount, Holding period (years), Gross return before expenses (% a year), and the Direct plan TER (%) and Regular plan TER (%) from the scheme document.",
    "Read the Commission drag over the period headline and the breakdown that separates Distributor commission inside the TER from Compounding lost on that commission.",
    "Open the Gap year by year table to watch the direct and regular balances diverge, then press Copy result for the summary or Reset to restore defaults.",
  ],
  intro:
    "A regular mutual fund plan pays distributor commission out of its total expense ratio, and this calculator converts that expense ratio gap into rupees you can see. It compounds the same investment twice — once at the gross return minus the direct plan TER and once minus the regular plan TER — then separates the commission actually paid from the compounding lost on it. Direct plans have been mandatory in every scheme since SEBI circular CIR/IMD/DF/21/2012 took effect on 1 January 2013.",
  useCases: [
    "Deciding whether to switch a Rs 10 lakh lumpsum from a regular equity plan at 1.75% TER to the direct plan at 0.6%.",
    "Showing a first-time investor what a 1.1 percentage point expense ratio gap costs a 20-year SIP.",
    "Comparing an index fund at 0.2% direct TER with the regular version at 1.0%, where the gap is a large share of the expected return.",
  ],
  benefits: [
    [
      "Splits commission from lost compounding",
      "See both the money that went to the distributor and the growth that money would have produced.",
    ],
    [
      "Lumpsum and SIP",
      "Handles a one-time investment or a monthly instalment with the same expense-ratio logic.",
    ],
    [
      "Year-by-year gap",
      "A table of both balances side by side shows how slowly the gap opens and how wide it gets late on.",
    ],
  ],
  faqs: [
    [
      "How much cheaper is a direct plan than a regular plan?",
      "For an actively managed equity fund the gap is usually 0.7 to 1.2 percentage points of TER a year — for example 0.6% direct against 1.75% regular. On index funds the absolute gap is smaller but often a bigger share of the expected return.",
    ],
    [
      "Where do I find the expense ratio of a scheme?",
      "Every AMC publishes the TER of the direct and regular plan of each scheme on its website and in the scheme information document, and it is also shown on the AMFI website. The figure is updated whenever the AMC changes it, with at least three days' notice.",
    ],
    [
      "Does switching from regular to direct trigger tax?",
      "Yes. A switch is treated as a redemption of the regular plan and a fresh purchase of the direct plan, so capital gains tax and any applicable exit load apply on the units redeemed. Equity schemes typically charge exit load only within one year, but the tax position depends on your holding period and gains — check with a tax professional.",
    ],
    [
      "Is a direct plan always the better choice?",
      "It always has the lower expense ratio, since SEBI requires the direct plan TER to be below the regular plan TER. Whether it is better for you depends on whether you would make good scheme choices without a distributor or adviser; the fee saved is worth little if it leads to worse decisions.",
    ],
  ],
};

export default seo;
