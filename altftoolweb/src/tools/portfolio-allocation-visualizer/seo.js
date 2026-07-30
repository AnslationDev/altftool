const seo = {
  intro:
    "The Portfolio Allocation Visualizer takes a list of holdings you enter — amount, asset class, risk level and expected return — and turns it into four value-weighted figures: total value, weighted average expected return, a risk score on a Low=1 / Medium=2 / High=3 scale, and a diversification score derived from the Herfindahl-Hirschman Index of your category weights. Charts break the portfolio down by class and by risk, and a rules panel flags concentration above 45% in any one class. It is a self-entered planning view for investors who want to see their weights, not a live price tracker. Nothing here is investment advice.",
  useCases: [
    "You hold funds across three brokerages and a crypto exchange and have never seen the combined asset-class split in one place.",
    "You suspect one holding has grown into an oversized share of the portfolio and want the actual percentage before deciding whether to trim it.",
    "You are preparing for a meeting with an adviser and want a single CSV of every position with its class, risk band and assumed return.",
  ],
  benefits: [
    [
      "Weighted, not averaged",
      "Expected return and risk are weighted by the money in each position, so a large low-risk holding moves the profile more than a small speculative one.",
    ],
    [
      "A diversification score with a stated basis",
      "The score starts from 100 x (1 - HHI) across your asset-class weights, then adds small bonuses for the number of distinct classes and holdings, so it rewards spread rather than just count.",
    ],
    [
      "Threshold alerts, not vague warnings",
      "The insights panel fires on named cut-offs — over 45% in one class, over 60% in high-risk assets, over 75% in low-risk ones — so you can see exactly why a flag appeared.",
    ],
  ],
  faqs: [
    [
      "How is the risk profile calculated?",
      "Each holding gets a numeric weight of 1 for Low, 2 for Medium and 3 for High, and those are averaged by invested amount. A weighted score above 2.3 is labelled Aggressive, above 1.7 Moderate, and anything lower Conservative.",
    ],
    [
      "What counts as too concentrated?",
      "The tool warns when a single asset class exceeds 45% of portfolio value, and calls a portfolio balanced when every class sits at or below 35% across at least three classes. These are the tool's own heuristics, not a regulatory rule — your own plan may justify a different split.",
    ],
    [
      "Does it fetch live prices?",
      "No. Every amount and expected return is a figure you type in, so the dashboard reflects the numbers you last entered rather than today's market value. Update the amounts when you want a current picture.",
    ],
    [
      "Is my portfolio data sent anywhere?",
      "No, holdings are saved in your browser's local storage on that device only, and the CSV export is generated locally. Because this is a self-entered model with assumed returns, treat the output as informational and speak to a licensed adviser before acting on it.",
    ],
  ],
};

export default seo;
