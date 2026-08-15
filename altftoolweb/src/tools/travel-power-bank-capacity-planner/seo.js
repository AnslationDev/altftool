const seo = {
  title: "Power Bank Size Calculator: mAh, Wh and 100 Wh",
  metaDescription:
    "Convert every device battery to watt-hours, add recharges per day and 75-90% transfer losses, and get the mAh to buy against the 100 Wh airline limit.",
  steps: [
    "For each device choose a Device type, then set Battery capacity (mAh), Battery voltage (V) and Full recharges per day; press Add device for another.",
    "Enter the days without a mains socket, the transfer efficiency percentage — real banks land near 75-90% — and a safety reserve.",
    "Read the power bank to buy in mAh, the stored watt-hours, banks to carry and the airline verdict against the 100 Wh threshold, then press Copy result.",
  ],
  intro:
    "This planner works out the power bank capacity a trip actually needs by converting every device battery to watt-hours (Wh = mAh ÷ 1000 × nominal cell voltage), multiplying by how often each one is recharged, then dividing by the bank's real transfer efficiency so the conversion losses are included rather than ignored. It is built for travellers, hikers, festival-goers and photographers who have to pick one bank and live with it for several days. It also checks the result against the ICAO/IATA lithium battery limits airlines enforce: no approval needed up to 100 Wh, operator approval between 100 and 160 Wh, and nothing above 160 Wh in passenger baggage.",
  useCases: [
    "Decide between a 10,000 mAh and a 20,000 mAh bank for a three-day trek with a phone, earbuds and a head torch.",
    "Check before booking whether the bank you already own is under the 100 Wh no-approval limit for cabin baggage.",
    "Work out how many spare camera and drone batteries a shoot needs versus charging them from a USB-C PD bank.",
  ],
  benefits: [
    ["Watt-hours, not marketing mAh", "Compares bank and device on the same energy scale so 10,000 mAh never looks like two phone charges."],
    ["Conversion losses built in", "Applies a realistic 75-90% transfer efficiency instead of assuming every stored milliamp-hour reaches your phone."],
    ["Airline limit checked", "Flags the 100 Wh and 160 Wh thresholds and splits the requirement across banks when one would be too big."],
  ],
  faqs: [
    [
      "How many phone charges does a 10,000 mAh power bank give?",
      "Usually about 1.5 charges of a 5,000 mAh phone, not two. The bank stores 10,000 mAh at roughly 3.7 V, which is 37 Wh, and about 15-25% of that is lost boosting to 5 V and in the phone's own charging circuit — leaving roughly 30 Wh against a phone battery of about 19 Wh.",
    ],
    [
      "What is the maximum power bank size allowed on a plane?",
      "100 watt-hours per battery with no approval needed, which is about 27,000 mAh at 3.7 V. Between 100 Wh and 160 Wh you need the airline's approval and may carry at most two spares. Above 160 Wh, lithium batteries are banned from passenger baggage entirely. Power banks must always go in carry-on, never checked luggage.",
    ],
    [
      "How do I convert mAh to Wh for a power bank?",
      "Divide the mAh by 1,000 and multiply by the cell's nominal voltage, normally 3.7 V for a lithium-ion power bank. A 20,000 mAh bank is 20 × 3.7 = 74 Wh. Reputable banks print the Wh figure on the casing, and that printed value is the one airline staff go by.",
    ],
    [
      "Why does a power bank never deliver its full rated capacity?",
      "Because the rating is measured at the 3.7 V cell voltage while the USB port outputs 5 V or higher, and the boost converter, the cable and the receiving device each waste some energy as heat. Typical end-to-end efficiency is 75-90%, and it drops further in cold weather or with fast charging at high current.",
    ],
  ],
};

export default seo;
