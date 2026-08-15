const seo = {
  title: "Dubai Trip Cost Calculator with Tourism Dirham & VAT",
  metaDescription:
    "Price a Dubai trip with the 10% municipality fee, 10% service charge, 5% VAT and the 7-20 AED Tourism Dirham per room per night, then per person per day.",
  steps: [
    "Set Travel style, Season (moves the room rate), Property class (sets the Tourism Dirham), Travellers and Nights in Dubai.",
    "Edit the room and on-the-ground rate boxes and the Contingency buffer (%), ticking 'My quoted rate already includes the fees and VAT' if your booking site showed a tax-inclusive price.",
    "'Total trip cost' shows with the per person and per person per day figures and a table line for the municipality fee, service charge, VAT and Tourism Dirham; press Copy result.",
  ],
  intro:
    "This planner breaks a Dubai trip into flights, room, the charges stacked on that room, food, transport, activities and a contingency buffer, then reports the cost per person and per person per day. Dubai is the city where the quoted rate is least like the final bill, so the stay is itemised the way a hotel folio is: base rate, plus a 10% municipality fee and a 10% service charge, then 5% UAE VAT on that sum, then the Tourism Dirham — a flat charge per room per night set by the property's star rating, from 7 AED at a 1-star up to 20 AED at a 5-star.",
  useCases: [
    "Seeing what a 600 AED headline room rate actually costs once the fees, VAT and Tourism Dirham are added.",
    "Comparing a summer trip against a November trip when only the room rate moves and the flights do not.",
    "Checking whether a family needing two rooms is paying the Tourism Dirham twice over.",
  ],
  benefits: [
    ["Reproduces the hotel folio", "Applies the fees, VAT and Tourism Dirham in the order and on the base a Dubai bill uses."],
    ["Handles inclusive quotes", "Tick one box and the tool works backwards from a tax-inclusive rate instead of stacking the charges twice."],
    ["Per room, not per person", "Charges the Tourism Dirham per room-night, which is what makes a second room cost more than a shared one."],
  ],
  faqs: [
    [
      "What taxes and fees are added to a Dubai hotel bill?",
      "Four things sit on top of the room rate: a 10% municipality fee, a 10% service charge, 5% VAT calculated on the room plus those two fees, and the Tourism Dirham — a flat per-room, per-night charge. Together the percentages turn a quoted rate into 1.26 times itself, so a 600 AED room costs 756 AED before the Tourism Dirham is even counted.",
    ],
    [
      "How much is the Tourism Dirham in Dubai?",
      "It is charged per occupied room per night and depends on the property's classification: 20 AED at a 5-star hotel, 15 AED at a 4-star or a deluxe hotel apartment, 10 AED at a 3-star or standard apartment and 7 AED at a 1 or 2-star. It is a flat amount, so it does not rise with the room rate, and it is paid per room rather than per guest.",
    ],
    [
      "How much does a 4-night Dubai trip cost?",
      "On the comfort defaults here — a 4-star room shared two-up in peak season, taxis, a paid attraction most days and a 10% buffer — two people come to roughly 15,800 AED in total, about 7,900 AED each including return flights. A 3-star summer version of the same four nights lands at well under half that, because the room line is where almost all the difference sits.",
    ],
    [
      "When is Dubai cheapest to visit?",
      "June to August, when daytime temperatures pass 45°C and hotels discount heavily to fill rooms. The trade-off is that outdoor sightseeing becomes impractical for most of the day. November to March is the comfortable window and carries peak pricing, with the sharpest surge over New Year and during major exhibitions.",
    ],
  ],
};

export default seo;
