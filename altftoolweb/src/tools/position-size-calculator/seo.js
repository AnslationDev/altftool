const seo = {
  title: "Position Size Calculator from Stop Loss and Risk %",
  metaDescription:
    "Enter capital, entry, stop loss and risk (0.5-3% presets or a fixed rupee amount) to get the share count, margin needed and exact loss if the stop is hit.",
  steps: [
    "Enter Trading capital (INR), Entry price (INR) and Stop loss price (INR), plus the Leverage / margin multiplier (1x-50x) and Lot size (1 for cash equity).",
    "Set \"Risk per trade set as\" to \"% of capital\" — with 0.5%, 1%, 2% and 3% preset chips — or switch to \"Fixed rupee amount\" and type the rupees you will risk.",
    "Read the position size in shares with position value, margin needed and \"Actual loss if stopped out\"; \"How the number is built\" shows the budget ÷ risk-per-share arithmetic, and \"Copy result\" exports the summary.",
  ],
  intro:
    "Position size is the number of shares to buy so that, if your stop loss is hit, you lose only the amount of capital you decided to risk. It is derived from three inputs — account size, the percentage of it you are willing to risk on one trade, and the distance from your entry price to your stop — and it is what keeps a run of losing trades survivable.",
  useCases: [
    "Size a swing trade so a stop-loss hit costs no more than 1% of the account.",
    "Compare how a tighter or wider stop changes the number of shares you can hold at the same risk.",
    "Check whether a planned trade would exceed the capital you actually have available.",
  ],
  benefits: [
    ["Risk decided before entry", "The loss is fixed by the position size, not by how the trade feels later."],
    ["Stop distance drives the size", "A wider stop automatically gives a smaller position, so risk stays constant."],
    ["Flags over-leverage", "Shows when the required position costs more than the capital on hand."],
  ],
  faqs: [
    [
      "How do I calculate position size from a stop loss?",
      "Divide the rupees you are willing to risk by the per-share risk. If you will risk ₹5,000 and your stop is ₹20 below your entry, you buy 250 shares — because 250 × ₹20 is exactly ₹5,000.",
    ],
    [
      "What percentage of capital should I risk per trade?",
      "Most position-sizing rules use 1% to 2% of account equity on a single trade. At 1%, ten consecutive losses cost about 10% of the account; at 5% the same run would cost close to half of it.",
    ],
    [
      "Does position size change if I move my stop?",
      "Yes. Position size and stop distance move in opposite directions — halving the stop distance doubles the shares you can hold for the same rupee risk. That is the point of sizing from the stop rather than guessing a quantity.",
    ],
    [
      "Is position sizing the same as a stop loss?",
      "No. The stop loss decides where you exit; the position size decides how much that exit costs you. You need both — a stop with no sizing rule still lets one trade take an outsized loss.",
    ],
  ],
};

export default seo;
