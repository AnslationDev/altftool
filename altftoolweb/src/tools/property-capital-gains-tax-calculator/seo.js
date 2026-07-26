const seo = {
  intro:
    "This calculator works out the long-term capital gains tax on a house, flat or plot in India using the CBDT's notified Cost Inflation Index. It compares the flat 12.5% rate introduced on 23 July 2024 with the older 20%-with-indexation route that pre-July-2024 owners can still choose, and shows what Section 54, 54F and 54EC exemptions do to the final bill. It is built for resident individual sellers, joint owners and anyone planning the timing of a property sale.",
  useCases: [
    "A flat bought in 2010 for ₹30 lakh and sold in 2025 for ₹1 crore — see whether indexation at 20% or the flat 12.5% leaves you paying less.",
    "Deciding how much of the sale proceeds to park in 54EC bonds (capped at ₹50 lakh) versus a new house under Section 54 before the tax return is filed.",
    "Checking whether a plot held for 20 months should be sold now or after the 24-month mark, since a short-term gain is taxed at your slab rate instead.",
  ],
  benefits: [
    ["Both routes side by side", "See the 12.5% no-indexation tax and the 20% indexed tax on the same sale, with the cheaper one highlighted."],
    ["Real CII table built in", "Indexed cost is computed from the notified index for every financial year from 2001-02 to 2025-26."],
    ["Exemptions modelled", "Section 54/54F reinvestment and 54EC bonds are applied to the gain, with the ₹50 lakh bond ceiling enforced automatically."],
  ],
  faqs: [
    [
      "Is indexation still available on property sales?",
      "For property sold on or after 23 July 2024 the headline LTCG rate is 12.5% without indexation. Resident individuals and HUFs who acquired the property before that date may instead pay 20% with indexation if it works out lower, and this calculator computes both.",
    ],
    [
      "How long must I hold property for the gain to be long term?",
      "More than 24 months from the date of acquisition. Sell earlier and the gain is short term, added to your total income and taxed at your slab rate with no indexation and no Section 54 relief.",
    ],
    [
      "How much can I invest in 54EC capital gains bonds?",
      "Up to ₹50 lakh in a financial year, in NHAI, REC, PFC or IRFC bonds, invested within six months of the transfer and locked in for five years.",
    ],
    [
      "What if the buyer paid less than the circle rate?",
      "Section 50C substitutes the stamp duty value for the sale consideration when the stamp duty value is higher by more than 10%. Enter the stamp duty value in that case so the gain is not understated.",
    ],
  ],
};

export default seo;
