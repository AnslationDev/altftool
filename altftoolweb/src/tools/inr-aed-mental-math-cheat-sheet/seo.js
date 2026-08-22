const seo = {
  title: "AED to INR Mental Math You Can Do at a Till",
  metaDescription:
    "Turn today’s rupee-dirham rate into a head calculation: add a zero, times 7, divide by 3 (70/3). Each rule’s error shows as a % of the exact answer.",
  steps: [
    "Enter 'Rupees per 1 dirham (today's rate)' and 'A quoted price (AED)'.",
    "Adjust the Service charge (%), Municipality fee (%) and VAT (%) boxes so the add-ons match the bill you are pricing.",
    "The exact rupee figure appears with the till figure after the compounded add-ons and a 'Best rule to memorise' row giving each shortcut's error; press Copy sheet.",
  ],
  intro:
    "This cheat sheet turns today's rupee-dirham rate into a multiplication you can run at a till. It rewrites the rate as a decimal shift plus a working multiplier between 1 and 10, then tests rounding to the nearest quarter or half, an easy percentage nudge, and the closest simple fraction — reporting each rule's error as a fixed percentage of the exact answer. Because the dirham has been pegged to the US dollar at 3.6725 since 1997, the rupee-dirham rate only moves when the rupee-dollar rate moves, which makes a memorised rule unusually durable here.",
  useCases: [
    "Pricing gold or electronics in a Dubai souk in rupees before you start negotiating.",
    "Working out what a hotel's quoted nightly rate becomes once the service charge, municipality fee and VAT are on the folio.",
    "Setting a per-day dirham allowance that maps to a round rupee number you can hold in your head.",
  ],
  benefits: [
    ["A rule tuned to the dirham", "\"Add a zero, times 7, divide by 3\" beats any round multiplier at typical rates."],
    ["Bill add-ons compounded", "Service, municipality fee and VAT stack in sequence, which is more than their sum."],
    ["Peg made explicit", "Shows the rupee-dollar rate your dirham rate implies, so an off-market quote stands out."],
  ],
  faqs: [
    [
      "How do I convert dirhams to rupees in my head?",
      "Add a zero, multiply by 7 and divide by 3 — that is the fraction 70/3, or about ₹23.33 per dirham, and at a rate near ₹23.4 it lands under 0.3% from the exact answer. AED 300 becomes 3,000, then 21,000, then ₹7,000 against an exact ₹7,020. If dividing by 3 is awkward, multiply by 22.5 instead and accept being about 4% low.",
    ],
    [
      "Is the UAE dirham pegged to the dollar?",
      "Yes. The dirham has been fixed at 3.6725 to the US dollar since 1997, so it does not float against the rupee independently — the rupee-dirham rate is simply the rupee-dollar rate divided by 3.6725. That is why a dirham rule stays usable for months at a time, and why a quote that implies an odd rupee-dollar rate is a sign you are being charged a wide spread.",
    ],
    [
      "What extra charges appear on a Dubai hotel bill?",
      "Typically a 10% service charge, a municipality fee of around 7% on hotel bills, and 5% VAT, each applied to the running total rather than to the base — so the multiplier is 1.10 × 1.07 × 1.05 = 1.2359, about 23.6% on top of the quoted rate rather than 22%. Dubai also charges a flat Tourism Dirham per room per night, banded by hotel classification. Shop prices are a different matter: UAE rules require retail prices to be displayed inclusive of VAT.",
    ],
    [
      "Can tourists claim back VAT in the UAE?",
      "Yes, on eligible goods bought from registered retailers and taken out of the country, through the operator-run tax refund scheme at the airports and land borders. The purchase has to meet a minimum of AED 250, the goods must leave the UAE within the permitted window, and the refund is a portion of the 5% VAT after a per-claim fee, so the net recovery on a small purchase is modest. Confirm the current thresholds and fees with the Federal Tax Authority before counting on it.",
    ],
  ],
};

export default seo;
