const seo = {
  intro:
    "The Utility Tariff CSV Comparator runs one electricity usage profile against several plans at once and ranks them by total cost, using total = (fixed charge + Σ kWh × rate for each usage label) × (1 + tax %). You paste your consumption as 'label | kWh' lines — off-peak, standard, peak, or whatever bands your bill uses — and each plan as 'Plan | fixed charge | label:price, label:price', and it returns a sorted table with fixed, energy and total for every plan. It is for anyone holding two or three tariff offers who wants the comparison done on their own numbers rather than the supplier's example household.",
  useCases: [
    "A retention offer arrives with a lower unit rate but a higher daily standing charge, and you need to know which one actually wins at your consumption.",
    "You have a time-of-use meter and want to check whether shifting 100 kWh from peak to off-peak changes which plan is cheapest.",
    "A small shop is choosing between a low fixed charge with high peak rates and the reverse, and wants both totals on the same tax basis before signing.",
  ],
  benefits: [
    [
      "Compares plans with different rate structures",
      "Each plan carries its own fixed charge and its own per-label prices, so a two-band plan and a three-band plan can be ranked against the same usage profile.",
    ],
    [
      "Flags rates you forgot to enter",
      "A 'Missing labels' column lists any usage band a plan has no price for — those kWh are costed at zero, so the column tells you when a total is understated rather than genuinely cheap.",
    ],
    [
      "Separates fixed from energy cost",
      "The table breaks each plan into fixed charge and energy charge before the total, which shows whether a plan wins on the standing charge or on the unit rate.",
    ],
  ],
  faqs: [
    [
      "How is the total for each plan calculated?",
      "Total = (fixed charge + energy charge) × (1 + tax rate). The energy charge is every usage line's kWh multiplied by that plan's price for the matching label, summed; tax is entered as a percentage and applied to the whole subtotal, defaulting to 0%.",
    ],
    [
      "What format do I enter usage and tariffs in?",
      "Usage is one line per band as 'label | kWh', for example 'off-peak | 180'. Tariffs are one line per plan as 'Plan | fixed charge | label:price, label:price', for example 'Plan A | 150 | off-peak:5, standard:8, peak:12'. Labels must match between the two boxes for the rate to apply.",
    ],
    [
      "Why does a plan show a suspiciously low total?",
      "Check its Missing labels column. Any usage band the plan has no rate for is priced at 0, so a plan that is missing a peak rate will look cheaper than it is. Add the missing label:price pair and re-compare.",
    ],
    [
      "Can I rely on this to pick my energy supplier?",
      "Treat it as an estimate for comparison, not a quote. It applies a single flat tax percentage and a flat rate per band, so it does not model slab or tiered pricing, seasonal rates, capacity charges, discounts or exit fees — confirm the final figures against the supplier's own tariff sheet before you switch.",
    ],
  ],
};

export default seo;
