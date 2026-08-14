const seo = {
  title: "SpiceJet Baggage Allowance Checker & Excess Cost",
  metaDescription:
    "Check bags against SpiceJet's 7 kg / 55×35×25 cm cabin rule and pooled 15 kg check-in allowance, then price excess per kg the way the counter rounds.",
  steps: [
    "Enter Passengers on this PNR, the Free check-in allowance per passenger (kg) — or tap a fare preset — and the Excess baggage rate quoted (INR per kg).",
    "Add each piece with the Cabin bag and Check-in bag buttons and fill in its Weight (kg), Length, Width and Height (cm); every bag is judged live against the 55 × 35 × 25 cm gauge and per-piece limits.",
    "Read the Excess baggage to pay figure and the pooled-allowance breakdown, then use Copy result to save the summary.",
  ],
  intro:
    "This checker measures your packed bags against the baggage limits a SpiceJet domestic passenger normally travels under, and prices any excess per kilogram. It applies the two rules separately, because they behave differently: hand baggage is one piece per passenger of up to 7 kg and 55 × 35 × 25 cm and never pools, while free check-in weight — 15 kg per passenger on a standard fare — does pool across everyone on the same booking. No single hold piece may exceed 32 kg or 158 cm in total dimensions.",
  useCases: [
    "Two people travelling together, working out whether one 20 kg bag and one 10 kg bag clears the pooled 30 kg free allowance.",
    "Checking a cabin trolley against the 55 × 35 × 25 cm gauge before it gets pulled at the gate.",
    "Pricing prepaid excess before departure against what the airport counter will charge.",
  ],
  benefits: [
    ["Pooling handled correctly", "Check-in weight is summed across the booking; hand baggage is assessed one piece per passenger."],
    ["Bag-by-bag verdict", "Each bag is flagged on weight and size separately, so you know which one to repack."],
    ["Rounds the way the desk does", "Chargeable excess is rounded up to the next whole kilogram."],
  ],
  faqs: [
    [
      "What is the hand baggage allowance on SpiceJet?",
      "One piece per passenger weighing up to 7 kg, with maximum dimensions of 55 × 35 × 25 cm, plus one small personal article such as a handbag or laptop bag up to 3 kg. This 55 × 35 × 25 cm figure is the cabin baggage standard applied across Indian scheduled carriers, and gate staff check it against a physical gauge.",
    ],
    [
      "How much check-in baggage is free on a SpiceJet domestic flight?",
      "15 kg per passenger on a standard domestic fare, with higher allowances on premium fare families. Because the allowance pools across passengers on the same PNR, three travellers share 45 kg between them and it does not matter if one bag is heavier than another — as long as no single piece exceeds 32 kg.",
    ],
    [
      "Can two passengers combine their baggage allowance?",
      "For check-in baggage, yes — on a domestic booking the free weight of everyone on the same PNR is pooled and assessed as a total. Hand baggage does not pool: each passenger gets one cabin piece within the 7 kg limit, and you cannot carry a single 14 kg cabin bag between two people.",
    ],
    [
      "What happens if a single bag weighs more than 32 kg?",
      "It is refused at the counter regardless of how much excess you have paid, because 32 kg is a manual-handling limit for ground staff rather than a pricing rule. Split the contents into two bags, or ship the item as cargo. Allowances and excess rates vary by fare and route, so check your own booking before you travel.",
    ],
  ],
};

export default seo;
