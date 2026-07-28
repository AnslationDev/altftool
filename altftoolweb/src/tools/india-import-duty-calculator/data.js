/**
 * Encoded rate data for the India Import Duty & Landed Cost Calculator.
 *
 * EVERY rate below is the standard effective rate on the HSN heading named in
 * the same row, as amended to 1 February 2025 (Union Budget 2025-26). Customs
 * rates move with every Union Budget (presented on 1 February) and by
 * notification in between, so the stamp below must be read before the numbers.
 *
 * Classification — not arithmetic — is where an estimate like this goes wrong.
 * The HSN heading is therefore surfaced on every result, and both the BCD and
 * IGST rate are user-overridable in the UI.
 */

export const RATES_AS_AMENDED_TO = "2025-02-01";
export const RATES_STAMP = "Rates as amended to 1 February 2025 (Union Budget 2025-26)";
export const BUDGET_CAVEAT =
  "Customs rates are reset at every Union Budget (1 February) and by notification in between. Rates encoded here were read from the tariff as amended to 1 February 2025 and may have moved since — including in later Budget cycles. Check the current CBIC tariff before you rely on a figure.";

/* ------------------------------------------------------------------ */
/* Currencies                                                          */
/* ------------------------------------------------------------------ */

/**
 * Exchange rate is a USER INPUT, never a live figure. Customs converts using
 * the rate notified by CBIC under Section 14 of the Customs Act, 1962, which
 * is revised fortnightly and is not the card or market rate.
 */
export const CURRENCIES = [
  { code: "INR", label: "INR — Indian rupee", symbol: "₹" },
  { code: "USD", label: "USD — US dollar", symbol: "$" },
  { code: "EUR", label: "EUR — Euro", symbol: "€" },
  { code: "GBP", label: "GBP — Pound sterling", symbol: "£" },
  { code: "AED", label: "AED — UAE dirham", symbol: "AED" },
  { code: "SGD", label: "SGD — Singapore dollar", symbol: "S$" },
  { code: "JPY", label: "JPY — Japanese yen", symbol: "¥" },
  { code: "AUD", label: "AUD — Australian dollar", symbol: "A$" },
  { code: "CAD", label: "CAD — Canadian dollar", symbol: "C$" },
  { code: "CHF", label: "CHF — Swiss franc", symbol: "CHF" },
  { code: "HKD", label: "HKD — Hong Kong dollar", symbol: "HK$" },
  { code: "THB", label: "THB — Thai baht", symbol: "฿" },
  { code: "MYR", label: "MYR — Malaysian ringgit", symbol: "RM" },
  { code: "SAR", label: "SAR — Saudi riyal", symbol: "SAR" },
  { code: "QAR", label: "QAR — Qatari riyal", symbol: "QAR" },
];

/* ------------------------------------------------------------------ */
/* Goods categories                                                    */
/* ------------------------------------------------------------------ */

/**
 * bcd    — Basic Customs Duty, % of assessable value (First Schedule,
 *          Customs Tariff Act 1975, read with the effective-rate notifications).
 * igst   — Integrated tax under Section 3(7) of the Customs Tariff Act 1975,
 *          % of (assessable value + BCD + SWS).
 * verify — true where the rate genuinely splits across sub-headings, value
 *          slabs or specifications, so the encoded figure is only a starting
 *          point. The UI shows a "check the sub-heading" flag for these.
 * annexureI — listed in Annexure I to the Baggage Rules, 2016, which means NO
 *          duty-free baggage allowance is available against it at all.
 * outsideGst — not subject to IGST because the goods sit outside GST; state
 *          excise and other levies apply instead.
 */
export const CATEGORIES = [
  {
    id: "smartphone",
    label: "Smartphone / mobile phone",
    group: "Electronics & computing",
    hsn: "8517 13 00",
    chapter: "85",
    bcd: 15,
    igst: 18,
    note: "BCD on mobile phones was cut from 20% to 15% by Notification No. 34/2024-Customs dated 23 July 2024.",
  },
  {
    id: "phone-charger",
    label: "Phone charger / power adapter",
    group: "Electronics & computing",
    hsn: "8504 40",
    chapter: "85",
    bcd: 15,
    igst: 18,
    note: "Chargers and adapters for mobile phones were moved to 15% alongside handsets in July 2024. A generic power supply not presented with a phone can sit at a different rate.",
    verify: true,
  },
  {
    id: "laptop",
    label: "Laptop / notebook computer",
    group: "Electronics & computing",
    hsn: "8471 30 10",
    chapter: "84",
    bcd: 0,
    igst: 18,
    note: "Automatic data processing machines under heading 8471 are bound at nil BCD under India's ITA-1 commitment. IGST is still payable on a courier import.",
  },
  {
    id: "tablet",
    label: "Tablet computer",
    group: "Electronics & computing",
    hsn: "8471 30 10",
    chapter: "84",
    bcd: 0,
    igst: 18,
    note: "A tablet with a cellular calling function has in several cases been classified under 8517 instead of 8471, which changes BCD from nil to 15%.",
    verify: true,
  },
  {
    id: "desktop-pc",
    label: "Desktop / all-in-one computer",
    group: "Electronics & computing",
    hsn: "8471 41 00",
    chapter: "84",
    bcd: 0,
    igst: 18,
    note: "Same ITA-1 nil BCD as a laptop.",
  },
  {
    id: "computer-parts",
    label: "Computer parts (SSD, RAM, graphics card)",
    group: "Electronics & computing",
    hsn: "8473 30",
    chapter: "84",
    bcd: 0,
    igst: 18,
    note: "Parts and accessories of heading 8471 machines. Peripherals that are complete machines in their own right are classified elsewhere and are not nil.",
    verify: true,
  },
  {
    id: "printer",
    label: "Printer / scanner (computer-connectable)",
    group: "Electronics & computing",
    hsn: "8443 32",
    chapter: "84",
    bcd: 0,
    igst: 18,
    note: "Printers capable of connecting to an automatic data processing machine. A standalone photocopier is a different sub-heading and is not nil.",
    verify: true,
  },
  {
    id: "headphones",
    label: "Headphones / earphones / earbuds",
    group: "Electronics & computing",
    hsn: "8518 30 00",
    chapter: "85",
    bcd: 20,
    igst: 18,
    note: "Headphones and earphones, whether or not combined with a microphone.",
  },
  {
    id: "speaker",
    label: "Bluetooth / portable speaker",
    group: "Electronics & computing",
    hsn: "8518 22 00",
    chapter: "85",
    bcd: 20,
    igst: 18,
    note: "Multiple loudspeakers mounted in the same enclosure.",
  },
  {
    id: "smartwatch",
    label: "Smartwatch / fitness band",
    group: "Electronics & computing",
    hsn: "8517 62 90",
    chapter: "85",
    bcd: 20,
    igst: 18,
    note: "Customs has classified smartwatches as communication apparatus under 8517 62 90 rather than as watches under Chapter 91. A band with no communication function may fall elsewhere.",
    verify: true,
  },
  {
    id: "wrist-watch",
    label: "Wrist watch (quartz or mechanical)",
    group: "Fashion & personal",
    hsn: "9102",
    chapter: "91",
    bcd: 20,
    igst: 18,
    note: "Watches with a precious-metal case are classified under 9101 instead of 9102.",
    verify: true,
  },
  {
    id: "digital-camera",
    label: "Digital camera / camcorder",
    group: "Electronics & computing",
    hsn: "8525 89 00",
    chapter: "85",
    bcd: 20,
    igst: 18,
    note: "Some digital still image video cameras carry a concessional rate depending on recording capability, so the sub-heading matters.",
    verify: true,
  },
  {
    id: "camera-lens",
    label: "Camera lens",
    group: "Electronics & computing",
    hsn: "9002 11 00",
    chapter: "90",
    bcd: 20,
    igst: 18,
    note: "Mounted objective lenses for cameras, projectors or enlargers.",
  },
  {
    id: "flat-panel-tv",
    label: "Flat-panel television (LCD / LED / OLED)",
    group: "Electronics & computing",
    hsn: "8528 72",
    chapter: "85",
    bcd: 20,
    igst: 28,
    annexureI: true,
    note: "Flat-panel televisions are listed in Annexure I to the Baggage Rules, 2016 — a passenger gets NO duty-free allowance against a TV, so the whole value is dutiable at the baggage rate. On a courier import, sets up to 32 inches attract 18% IGST and larger sets 28%.",
    verify: true,
  },
  {
    id: "game-console",
    label: "Video game console",
    group: "Fun & leisure",
    hsn: "9504 50 00",
    chapter: "95",
    bcd: 20,
    igst: 28,
    note: "Video game consoles and machines, other than coin-operated ones.",
  },
  {
    id: "toys",
    label: "Toys (non-electronic)",
    group: "Fun & leisure",
    hsn: "9503 00",
    chapter: "95",
    bcd: 70,
    igst: 12,
    note: "BCD on toys of heading 9503 was raised from 60% to 70% by Notification No. 02/2023-Customs dated 1 February 2023. Electronic toys attract 18% IGST rather than 12%.",
  },
  {
    id: "sports-equipment",
    label: "Sports & fitness equipment",
    group: "Fun & leisure",
    hsn: "9506",
    chapter: "95",
    bcd: 20,
    igst: 12,
    note: "Heading 9506 covers general physical exercise, gymnastics and outdoor game equipment. Several sub-headings differ.",
    verify: true,
  },
  {
    id: "perfume",
    label: "Perfume / eau de toilette",
    group: "Fashion & personal",
    hsn: "3303 00",
    chapter: "33",
    bcd: 20,
    igst: 18,
    note: "Perfumes and toilet waters. Note the separate baggage limit on alcohol does not apply to perfume.",
  },
  {
    id: "cosmetics",
    label: "Cosmetics / skincare / make-up",
    group: "Fashion & personal",
    hsn: "3304",
    chapter: "33",
    bcd: 20,
    igst: 18,
    note: "Beauty or make-up preparations and preparations for the care of the skin.",
  },
  {
    id: "apparel-knitted",
    label: "Apparel — knitted or crocheted",
    group: "Fashion & personal",
    hsn: "61",
    chapter: "61",
    bcd: 20,
    igst: 12,
    note: "Several garment sub-headings carry an alternative specific rate — a rupees-per-piece figure applies where it is higher than the ad valorem rate. IGST is 5% where the sale value of a piece is up to ₹1,000 and 12% above that.",
    verify: true,
  },
  {
    id: "apparel-woven",
    label: "Apparel — woven (not knitted)",
    group: "Fashion & personal",
    hsn: "62",
    chapter: "62",
    bcd: 20,
    igst: 12,
    note: "Same alternative specific-rate and IGST slab points as knitted apparel.",
    verify: true,
  },
  {
    id: "footwear",
    label: "Footwear",
    group: "Fashion & personal",
    hsn: "64",
    chapter: "64",
    bcd: 35,
    igst: 18,
    note: "BCD on footwear was raised to 35% in the 2020-21 Budget — one of the highest rates a traveller runs into. Parts of footwear are a different heading.",
    verify: true,
  },
  {
    id: "handbag-luggage",
    label: "Handbag / suitcase / travel goods",
    group: "Fashion & personal",
    hsn: "4202",
    chapter: "42",
    bcd: 20,
    igst: 18,
    note: "Heading 4202 covers trunks, suitcases, handbags and similar containers in leather, plastic or textile. Sub-headings differ by outer surface material.",
    verify: true,
  },
  {
    id: "sunglasses",
    label: "Sunglasses",
    group: "Fashion & personal",
    hsn: "9004 10",
    chapter: "90",
    bcd: 20,
    igst: 18,
    note: "Spectacles fitted with corrective lenses sit under a different sub-heading from sunglasses.",
    verify: true,
  },
  {
    id: "spectacle-frames",
    label: "Spectacle frames",
    group: "Fashion & personal",
    hsn: "9003",
    chapter: "90",
    bcd: 20,
    igst: 18,
    note: "Frames and mountings for spectacles, goggles or the like.",
    verify: true,
  },
  {
    id: "imitation-jewellery",
    label: "Imitation jewellery",
    group: "Fashion & personal",
    hsn: "7117",
    chapter: "71",
    bcd: 20,
    igst: 3,
    note: "Imitation jewellery carries the 3% precious-goods IGST rate, not 18%. Real gold or silver is NOT covered here — use the gold and silver panel.",
    verify: true,
  },
  {
    id: "shaver-trimmer",
    label: "Shaver / hair trimmer / grooming device",
    group: "Home & personal care",
    hsn: "8510",
    chapter: "85",
    bcd: 20,
    igst: 18,
    note: "Shavers, hair clippers and hair-removing appliances with a self-contained electric motor.",
  },
  {
    id: "kitchen-appliance",
    label: "Small kitchen / home appliance",
    group: "Home & personal care",
    hsn: "8509 / 8516",
    chapter: "85",
    bcd: 20,
    igst: 18,
    note: "Heading 8509 covers electro-mechanical domestic appliances and 8516 electro-thermic ones. Rates within these headings vary by appliance.",
    verify: true,
  },
  {
    id: "supplements",
    label: "Dietary supplement / protein powder",
    group: "Home & personal care",
    hsn: "2106 90",
    chapter: "21",
    bcd: 30,
    igst: 18,
    note: "Food preparations not elsewhere specified. Heading 2106 spans an unusually wide range of rates by sub-heading, and food imports separately need FSSAI clearance, which is a bigger practical obstacle than the duty.",
    verify: true,
  },
  {
    id: "printed-books",
    label: "Printed books",
    group: "Home & personal care",
    hsn: "4901",
    chapter: "49",
    bcd: 0,
    igst: 0,
    note: "Printed books are free of Basic Customs Duty and exempt from GST. Printed matter that is not a book — brochures, calendars — is a different heading.",
  },
  {
    id: "spirits",
    label: "Spirits / liquor",
    group: "Fun & leisure",
    hsn: "2208",
    chapter: "22",
    bcd: 150,
    igst: 0,
    outsideGst: true,
    note: "Undenatured ethyl alcohol and spirituous beverages carry a 150% BCD. Alcohol for human consumption is outside GST, so no IGST is charged at import — state excise and VAT apply separately and are not estimated here. A passenger's baggage allowance covers up to 2 litres of alcoholic liquor or wine.",
  },
];

export const CATEGORY_GROUPS = [
  "Electronics & computing",
  "Fashion & personal",
  "Fun & leisure",
  "Home & personal care",
];

/* ------------------------------------------------------------------ */
/* Baggage allowance profiles — Baggage Rules, 2016                    */
/* ------------------------------------------------------------------ */

export const BAGGAGE_PROFILES = [
  {
    id: "indian-adult",
    label: "Indian resident / tourist of Indian origin, adult — arriving from anywhere except Nepal, Bhutan or Myanmar",
    allowance: 50000,
    rule: "Baggage Rules, 2016 — Rule 3(a)",
    condition:
      "Covers used personal effects, travel souvenirs and articles other than those in Annexure I, up to ₹50,000 carried on the person or in accompanied baggage.",
  },
  {
    id: "foreign-tourist",
    label: "Tourist of foreign origin, adult — arriving from anywhere except Nepal, Bhutan or Myanmar",
    allowance: 15000,
    rule: "Baggage Rules, 2016 — Rule 3(b)",
    condition: "A foreign-origin tourist gets ₹15,000, not ₹50,000.",
  },
  {
    id: "nbm-air",
    label: "Arriving from Nepal, Bhutan or Myanmar, other than by land route",
    allowance: 15000,
    rule: "Baggage Rules, 2016 — Rule 4",
    condition: "The reduced ₹15,000 allowance applies to arrivals from these three countries by air.",
  },
  {
    id: "nbm-land",
    label: "Arriving from Nepal, Bhutan or Myanmar by land route",
    allowance: 0,
    rule: "Baggage Rules, 2016 — Rule 4, proviso",
    condition: "No value allowance at all — used personal effects only.",
  },
  {
    id: "infant",
    label: "Infant",
    allowance: 0,
    rule: "Baggage Rules, 2016 — Rules 3 and 4",
    condition: "An infant gets used personal effects only; no value allowance.",
  },
  {
    id: "tr-3-6m",
    label: "Transfer of residence — 3 to 6 months abroad",
    allowance: 60000,
    rule: "Baggage Rules, 2016 — Rule 6, Annexure III",
    condition:
      "Personal and household articles, other than Annexure I or II goods, up to ₹60,000. This is a transfer-of-residence concession, not a shopping allowance.",
  },
  {
    id: "tr-6-12m",
    label: "Transfer of residence — 6 months to 1 year abroad",
    allowance: 100000,
    rule: "Baggage Rules, 2016 — Rule 6, Annexure III",
    condition: "Personal and household articles other than Annexure I or II goods, up to ₹1,00,000.",
  },
  {
    id: "tr-1-2y",
    label: "Transfer of residence — at least 1 year abroad in the preceding 2 years",
    allowance: 200000,
    rule: "Baggage Rules, 2016 — Rule 6, Annexure III",
    condition:
      "Up to ₹2,00,000, provided the passenger has not availed this concession in the preceding three years.",
  },
  {
    id: "tr-2y",
    label: "Transfer of residence — 2 years or more abroad",
    allowance: 500000,
    rule: "Baggage Rules, 2016 — Rule 6, Annexure III",
    condition:
      "Up to ₹5,00,000, provided total stay in India in the preceding two years did not exceed six months and the concession was not availed in the preceding three years.",
  },
];

/* ------------------------------------------------------------------ */
/* Fixed allowances a passenger gets alongside the value allowance     */
/* ------------------------------------------------------------------ */

export const PASSENGER_FIXED_ALLOWANCES = [
  {
    item: "One laptop computer",
    limit: "1 unit, duty free, over and above the value allowance",
    source: "Notification No. 11/2004-Customs dated 8 January 2004 — passenger aged 18 or above, not a member of the crew",
  },
  {
    item: "Alcoholic liquor or wine",
    limit: "2 litres",
    source: "Annexure I, Baggage Rules, 2016 — the excess gets no allowance",
  },
  {
    item: "Cigarettes / cigars / tobacco",
    limit: "100 sticks, or 25 cigars, or 125 g of tobacco",
    source: "Annexure I, Baggage Rules, 2016 — the excess gets no allowance",
  },
  {
    item: "Flat-panel television",
    limit: "No free allowance at all",
    source: "Annexure I, Baggage Rules, 2016 — the full value is dutiable",
  },
  {
    item: "Gold or silver, other than ornaments",
    limit: "No free allowance under Rule 3",
    source: "Annexure I, Baggage Rules, 2016 — see the gold and silver panel",
  },
];

export const METAL_FORMS = [
  { id: "jewellery", label: "Jewellery / ornaments" },
  { id: "bars-coins", label: "Bars, coins or other non-ornament form" },
];

export const GENDERS = [
  { id: "male", label: "Gentleman passenger" },
  { id: "female", label: "Lady passenger" },
];
