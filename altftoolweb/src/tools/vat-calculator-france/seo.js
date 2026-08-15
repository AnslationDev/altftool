const seo = {
  title: "France VAT Calculator - TVA HT to TTC at 20%, 10%, 5.5%",
  metaDescription:
    "Convert HT to TTC and back at France's 20%, 10%, 5.5% and 2.1% TVA rates or a custom rate, and check the article 293 B franchise en base thresholds.",
  steps: [
    "Choose the direction with the HT → TTC / TTC → HT toggle and enter the Montant HT or Montant TTC.",
    "Pick the Taux de TVA — the 20%, 10%, 5.5% or 2.1% band, or Custom rate for Corsica and the overseas départements.",
    "Read Montant HT, TVA and Montant TTC with the TVA fraction of the TTC price and press Copy result; the Franchise en base panel checks your annual turnover against the art. 293 B thresholds.",
  ],
  intro:
    "This calculator converts a French price between HT (hors taxes) and TTC (toutes taxes comprises) at any of the four TVA rates: 20% taux normal, 10% intermédiaire, 5.5% réduit and 2.1% particulier. Adding TVA multiplies the HT figure by 1 + taux; removing it divides the TTC figure by the same factor, so a 120 EUR TTC invoice at 20% is 100 EUR HT plus 20 EUR of tax. It also checks the franchise en base thresholds of article 293 B of the CGI.",
  useCases: [
    "Pricing a 10% restaurant or hotel bill so the menu shows a round TTC figure while the accounting still records the HT base.",
    "Working out the TVA hidden in a 105.50 EUR grocery receipt taxed at 5.5% before entering it in a livre de recettes.",
    "Checking whether an auto-entrepreneur providing services is still under the 37,500 EUR franchise en base threshold or has entered the 41,250 EUR tolerance band.",
  ],
  benefits: [
    ["All four French rates", "20%, 10%, 5.5% and 2.1% in one place, plus a custom rate for Corsica and the DOM."],
    ["HT and TTC both ways", "Add TVA to a net price or reverse it out of a gross one without retyping the figure."],
    ["Franchise en base check", "Compares turnover against both the base threshold and the higher tolerance ceiling."],
  ],
  faqs: [
    [
      "What are the VAT rates in France?",
      "France has four TVA rates: 20% standard, 10% intermediate for restaurants, hotels, passenger transport and home renovation work, 5.5% reduced for staple foods, water, books, cinema and energy-efficiency works, and 2.1% for reimbursable medicines and registered press titles. The 20% rate has applied since 1 January 2014.",
    ],
    [
      "How do I calculate HT from a TTC price?",
      "Divide the TTC amount by 1.20 at the standard rate, 1.10 at the intermediate rate, 1.055 at the reduced rate or 1.021 at the 2.1% rate. A 120 EUR TTC total at 20% is 100 EUR HT and 20 EUR TVA — the tax is exactly 1/6 of the TTC price.",
    ],
    [
      "What is the franchise en base de TVA threshold?",
      "Under article 293 B of the CGI the base thresholds are 85,000 EUR of turnover for sales of goods and accommodation and 37,500 EUR for services and liberal professions. Higher tolerance ceilings of 93,500 EUR and 41,250 EUR let you exceed the base figure for one year; passing them means charging TVA from that point.",
    ],
    [
      "Do Corsica and the overseas départements use the same rates?",
      "No. Corsica applies special rates of 0.9%, 2.1%, 10% and 13% to certain supplies, and Guadeloupe, Martinique and La Réunion use an 8.5% standard rate with a 2.1% reduced rate. Guyane and Mayotte are outside the scope of TVA entirely. Use the custom rate field for those cases and confirm the position with an expert-comptable.",
    ],
  ],
};

export default seo;
