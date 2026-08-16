const seo = {
  title: "India Import Duty Calculator: Courier vs Baggage",
  metaDescription:
    "CIF, Basic Customs Duty, 10% Social Welfare Surcharge and IGST line by line for a courier parcel — or the flat 38.5% above a ₹50,000 baggage allowance.",
  intro:
    "An India import duty and landed cost calculator works out what a foreign purchase actually costs by the time it clears customs, across the two routes that carry completely different rates: a courier or postal import, and goods carried in on a flight. For a courier import it builds the statutory waterfall — assessable value as CIF under Section 14 of the Customs Act 1962, Basic Customs Duty on that value, Social Welfare Surcharge at 10% of the BCD under Section 110 of the Finance Act 2018, then IGST under Section 3(7) of the Customs Tariff Act 1975 charged on value plus duties. For baggage it applies the Baggage Rules 2016 — the ₹50,000 free allowance for an adult passenger of Indian origin and a flat 38.5% on everything above it. It is built for travellers, online shoppers and small importers who need to see where each rupee came from before they buy.",
  useCases: [
    "Price a phone, laptop or camera bought abroad against what the same model costs in India, with duty included rather than guessed at",
    "Check how much of a ₹50,000 baggage allowance is left before the flat 38.5% baggage rate starts biting",
    "See the courier duty waterfall on a CIF value line by line — BCD, then Social Welfare Surcharge on the BCD, then IGST on the sum of all three",
    "Work out how much gold jewellery a passenger can bring in duty free under Rule 5 and what the balance is charged at",
  ],
  benefits: [
    [
      "Both routes, side by side",
      "The same goods carry a flat 38.5% in baggage and a compounding BCD + surcharge + IGST stack by courier. The tool prices both instead of assuming one.",
    ],
    [
      "The HSN heading is shown, not hidden",
      "Every result prints the tariff heading and chapter the rate came from, because a wrong classification — not wrong arithmetic — is what makes an import estimate wrong.",
    ],
    [
      "Rates carry their source",
      "Each figure names the notification, rule or section behind it, and the page is stamped with the date the rates were read from the tariff.",
    ],
    [
      "It stops at the numbers",
      "The comparison reports the landed cost, the Indian price and the gap. It does not tell anyone what to buy, and it is not a customs valuation.",
    ],
  ],
  faqs: [
    [
      "How much duty do I pay on goods above the baggage allowance in India?",
      "38.5% of the value above the allowance. That is 35% Basic Customs Duty on baggage under tariff heading 9803, plus a Social Welfare Surcharge of 10% of that duty, which adds 3.5 percentage points. On ₹1,00,000 of excess the duty is ₹35,000 + ₹3,500 = ₹38,500. The free allowance itself is ₹50,000 for an adult Indian resident or tourist of Indian origin arriving from anywhere other than Nepal, Bhutan or Myanmar, under Rule 3 of the Baggage Rules, 2016.",
    ],
    [
      "How is customs duty calculated on a courier parcel to India?",
      "In four steps on the CIF value. Assessable value = cost + insurance + freight; Basic Customs Duty is a percentage of that assessable value; Social Welfare Surcharge is 10% of the BCD; and IGST is charged on assessable value + BCD + SWS, not on the goods alone. On a US$999 phone at ₹88, with ₹3,520 freight and ₹989 insurance, the assessable value is ₹92,421; BCD at 15% is ₹13,863; SWS is ₹1,386; IGST at 18% on ₹1,07,670 is ₹19,381 — ₹34,630 of duty in total, an effective 37.5% of the assessable value. The 1% landing charge that used to be added to CIF was removed on 26 September 2017 by Notification No. 91/2017-Customs (N.T.).",
    ],
    [
      "Is the ₹5,000 gift exemption still useful for imports to India?",
      "Almost never. Notification No. 171/93-Customs exempts bona fide gifts by post or air up to a CIF value of ₹5,000, but DGFT Notification No. 35/2015-2020 dated 12 December 2019 prohibited importing goods as gifts through courier or post altogether, other than life-saving drugs and rakhi. India also has no general de minimis threshold, so a consignment that falls outside these narrow exemptions is dutiable from the first rupee of value.",
    ],
    [
      "Can I bring a laptop into India duty free?",
      "Yes — one laptop computer, over and above the value allowance, for a passenger aged 18 or above who is not a member of the crew, under Notification No. 11/2004-Customs dated 8 January 2004. A flat-panel television is the opposite case: it is listed in Annexure I to the Baggage Rules, 2016, which means no free allowance applies to it at all and its full value is charged at 38.5%. Alcohol is free up to 2 litres and tobacco up to 100 cigarettes, 25 cigars or 125 g.",
    ],
  ],
  steps: [
    "Pick the route: a courier or postal import, goods carried in accompanied baggage, or gold and silver carried by a passenger.",
    "Choose the goods category. The tool shows the HSN heading and chapter it assumed, along with the Basic Customs Duty and IGST rates encoded against that heading.",
    "Enter the price abroad, the quantity, the currency and the exchange rate. Customs converts at the rate CBIC notifies under Section 14 of the Customs Act 1962, revised fortnightly, so use that rather than a card rate.",
    "For a courier import, accept the residual freight and insurance percentages from the Customs Valuation Rules 2007 or type the actual figures, and override the BCD or IGST rate if your sub-heading differs.",
    "For baggage, select the passenger profile that sets the free allowance and tick the one-laptop exemption if it applies.",
    "Read the waterfall line by line, then enter the Indian retail price to see the landed cost and the Indian price side by side with the difference between them.",
  ],
};

export default seo;
