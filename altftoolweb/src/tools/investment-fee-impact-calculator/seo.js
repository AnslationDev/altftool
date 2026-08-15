const seo = {
  title: "Investment Fee Impact: What 1.5% Costs Over 20 Years",
  metaDescription:
    "Compound your money at the gross return and at return minus fee, side by side: a 1.5% charge removes about 24% of a 20-year corpus.",
  steps: [
    "Enter Investment Amount in ₹, Expected Return (% p.a.), Investment Period (Years) and Annual Expense Ratio (%) — the total annual drag, fund expense ratio plus any advisory or platform fee.",
    "Press Calculate; the same principal is compounded twice, once at the return and once at return minus the fee, so the lost growth on lost growth is counted rather than a flat charge subtracted.",
    "Value After Fees appears as the headline with Fees Cost You beneath it, and the Without Fees, With Fees, Fees Consumed and Fees Impact % tiles give the gap in rupees and as a share of the fee-free corpus.",
  ],
  intro:
    "The Investment Fee Impact Calculator shows how much of your final corpus an annual fee consumes, by compounding your investment twice — once at the gross return and once at the return minus the fee — and reporting the gap. Enter a lump sum, an expected annual return, a holding period and a total annual fee such as an expense ratio, and it returns the value with fees, the value without, the rupee amount lost and that loss as a percentage. It is for anyone comparing funds, advisory plans or PMS charges before committing money for a decade or more.",
  useCases: [
    "You are choosing between an index fund at a 0.2% expense ratio and an active fund at 1.8%, and want to see what that 1.6-point gap costs on a ₹10 lakh investment over 20 years.",
    "An advisor quotes a 1% annual assets-under-management fee on top of fund charges, and you want the combined drag expressed as a share of your final corpus before you sign.",
    "You are deciding whether to stay in an old ULIP or high-cost regular-plan fund for another 15 years, and need the fee cost in rupees rather than in basis points.",
  ],
  benefits: [
    [
      "Fees as rupees, not basis points",
      "Converts an abstract 1.5% expense ratio into the exact amount missing from your corpus at the end of the period.",
    ],
    [
      "Both paths side by side",
      "Compounds the same principal at the gross rate and the net-of-fee rate so you see the fee-free counterfactual next to reality.",
    ],
    [
      "Percentage-of-corpus view",
      "Reports fees consumed as a share of the fee-free value, which is the number that exposes how a small annual charge becomes a large lifetime cost.",
    ],
  ],
  faqs: [
    [
      "How much does a 1.5% annual fee actually cost over 20 years?",
      "About 24% of the corpus you would otherwise have. On ₹10,00,000 growing at 10% a year, 20 years of compounding gives roughly ₹67.3 lakh without fees but about ₹51.1 lakh at a net 8.5% — a gap of roughly ₹16.2 lakh, far more than the ₹3 lakh of fees you might expect from a rough 1.5% × 20 estimate.",
    ],
    [
      "Why is the fee cost bigger than fee rate times years?",
      "Because every rupee paid in fees also stops compounding. The calculator models this by growing your money at (return − fee) rather than subtracting a flat charge, so the lost growth on lost growth is included — which is why a 1% annual fee removes roughly a quarter of a 30-year corpus at a 10% gross return.",
    ],
    [
      "What should I enter as the fee?",
      "Enter the total annual drag as a single percentage — fund expense ratio plus any advisory or platform fee. An Indian index fund typically runs 0.1–0.4%, a regular-plan active equity fund 1.5–2.25%, and a separate advisory fee of 0.5–1% would be added on top.",
    ],
    [
      "Does this account for taxes or exit loads?",
      "No. It models only a constant annual percentage fee against a constant annual return, so capital gains tax, exit loads, one-off transaction charges and variable market returns are not included. Treat the result as an illustration of fee drag and speak to a registered adviser before switching an actual investment.",
    ],
  ],
};

export default seo;
