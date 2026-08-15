const seo = {
  title: "E-Way Bill Validity Calculator: Days and Expiry",
  metaDescription:
    "Enter distance and cargo type to get validity days under Rule 138(10) — 200 km or 20 km per day — and the exact midnight the e-way bill lapses.",
  steps: [
    "Type the Approximate distance (km), or tap the 100, 350, 800, 1400 or 2200 km chip, then set Cargo / vehicle type to Regular cargo (road, rail, air), Over dimensional cargo (ODC) or Multimodal shipment with a leg by ship.",
    "Set Date of generation, Time of generation and Consignment value (INR); the Validity period figure updates as you type, applying Rule 138(10) at one day per 200 km, or per 20 km for ODC and ship legs.",
    "Read Valid through, Expires at — 00:00 on the named date — plus Distance headroom in this slab and Next extra day starts at, then press Copy result to take the whole summary.",
  ],
  intro:
    "The E-Way Bill Distance Validity Calculator converts an approximate transport distance into the number of validity days allowed under Rule 138(10) of the CGST Rules, and then shows the exact midnight at which the bill lapses. It handles both the normal slab of one day per 200 km and the tighter one day per 20 km slab that applies to over dimensional cargo and multimodal shipments with a leg by ship. Transporters, dispatch clerks and accounts teams can use it to plan a run, spot when a consignment will need an extension, and see how much distance headroom is left inside the current slab.",
  useCases: [
    "A transporter dispatching from Delhi to Chennai (about 2,180 km) wants to know how many days the e-way bill covers before booking the driver's schedule.",
    "A project logistics team moving an over dimensional transformer 260 km needs the 20 km per day slab applied instead of the normal 200 km slab.",
    "A dispatch supervisor generating a bill late in the evening wants the exact expiry timestamp so the truck is not stopped for an expired e-way bill at a checkpoint.",
  ],
  benefits: [
    ["Correct slab automatically", "Picks 200 km per day or 20 km per day based on whether the cargo is normal or over dimensional."],
    ["Exact expiry midnight", "Counts each day as ending at midnight of the day immediately following the generation date, as the rule requires."],
    ["Shows slab headroom", "Tells you how many more kilometres fit in the current validity and where the next extra day begins."],
  ],
  faqs: [
    [
      "How is e-way bill validity calculated?",
      "Under Rule 138(10) of the CGST Rules, validity is one day for every 200 km or part thereof for cargo other than over dimensional cargo, and one day for every 20 km or part thereof for over dimensional cargo or a multimodal shipment where one leg is by ship. A 450 km road movement therefore gets three days.",
    ],
    [
      "When exactly does a one-day e-way bill expire?",
      "A day is counted as the period expiring at midnight of the day immediately following the date of generation. So a one-day bill generated at any time on 14 March stays valid through 15 March and lapses at 00:00 on 16 March.",
    ],
    [
      "Can an expired e-way bill be extended?",
      "Validity can generally be extended on the e-way bill portal within eight hours before or eight hours after expiry, provided the consignment is still in transit and the reason for the delay is recorded. Outside that window a fresh bill is usually needed.",
    ],
    [
      "When is an e-way bill required at all?",
      "An e-way bill is generally required for the movement of goods where the consignment value exceeds Rs 50,000, subject to exemptions for specified goods, certain intra-state movements and short hauls. Some states set their own intra-state thresholds, so check the rules for your state.",
    ],
  ],
};

export default seo;
