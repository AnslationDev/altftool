const seo = {
  title: "E-Way Bill Validity Calculator: Rule 138(10)",
  metaDescription:
    "Work out e-way bill validity under Rule 138(10): 200 km a day, 20 km for ODC, expiry at midnight of the next day, and the 8-hour extension window.",
  steps: [
    "Enter 'Approximate distance (km)', the 'Generation date' and 'Generation time (24h HH:MM)', or click the '420 km regular' or '65 km ODC' example preset.",
    "Set 'Movement type' to 'Regular / non-ODC' or 'Over-dimensional cargo' to switch between the 200 km and 20 km per day slabs.",
    "Read the '<n> days estimated validity' with the Slab, Estimated end and 'Extension window' rows, then Copy it or Download e-way-bill-validity-calculator.txt.",
  ],
  intro:
    "This calculator applies Rule 138(10) of the CGST Rules, 2017 to work out how long an e-way bill remains valid: one day for the first 200 km and one further day for every additional 200 km or part of it for ordinary cargo, and blocks of 20 km instead for over dimensional cargo or a multimodal shipment with a leg by ship. It also applies the Explanation to that rule, under which validity expires at midnight of the day following the date of generation, and shows the eight-hour window either side of expiry in which a transporter may extend the bill. For consignors, transporters and logistics teams planning a route.",
  useCases: [
    "A transporter planning a 450 km run and confirming the bill covers three days rather than two",
    "A consignor shipping an over dimensional load where every 20 km adds a day of validity",
    "A dispatch desk checking whether a bill generated last week has already lapsed before the truck moves",
  ],
  benefits: [
    ["Both cargo rules", "Switches between the 200 km and 20 km blocks in one place."],
    ["Exact expiry moment", "Applies the midnight rule instead of counting 24-hour periods from dispatch."],
    ["Extension window shown", "Displays the eight hours before and after expiry in which Part B can be updated."],
  ],
  faqs: [
    [
      "How many days is an e-way bill valid for?",
      "One day for the first 200 km and one additional day for every further 200 km or part of it. A 450 km journey therefore carries three days of validity. Over dimensional cargo and multimodal shipments with a leg by ship use 20 km blocks instead.",
    ],
    [
      "When exactly does an e-way bill expire?",
      "At midnight of the day immediately following the date of generation, for a one-day bill. The Explanation to Rule 138(10) counts a day that way rather than as 24 hours, so a bill generated at 11 pm on 5 July still runs to the end of 6 July.",
    ],
    [
      "Can the validity of an e-way bill be extended?",
      "Yes. The transporter may update Part B and extend the validity within eight hours before or eight hours after expiry, under the third proviso to Rule 138(10). The Commissioner can also extend the period by notification for particular categories of goods.",
    ],
    [
      "What happens if goods move on an expired e-way bill?",
      "The consignment can be detained and released only on payment of penalty under section 129 of the CGST Act. Extend the bill on the portal within the eight-hour window rather than continuing the journey, and consult your tax adviser if a detention notice has already been issued.",
    ],
  ],
};

export default seo;
