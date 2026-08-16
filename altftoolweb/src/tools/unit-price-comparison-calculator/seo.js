const seo = {
  title: "Unit Price Calculator: Per Kg, Litre or Piece",
  metaDescription:
    "Compare pack sizes by price per kg, per litre or per piece — multipack aware, mixed units normalised, cheapest option ranked with the % gap shown.",
  steps: [
    "Pick the Weight, Volume or Count mode, then enter each option's \"Price (₹)\", \"Size of one pack\" and unit (g, kg, oz, lb; ml, L, fl oz, gallon; or pieces, dozen).",
    "Set \"Packs in the deal\" for combos like 6 x 250 ml, and use \"Add option\" to compare more shelf choices.",
    "Read the \"Best value option\" ranking — every other option shows its % more per unit — then click \"Copy result\".",
  ],
  "intro": "Unit Price Comparison Calculator converts competing pack sizes to a single common unit — price per kg, per litre or per piece — so you can tell instantly which shelf option is actually cheaper. Enter price, pack size and how many packs a combo deal contains, and it ranks every option and shows how much more you pay per unit for the others. Built for grocery runs, online-store combos and bulk-buying decisions where the label maths is deliberately hard to do in your head.",
  "useCases": [
    "Decide between a 500 g pack and a 1 kg pack when the larger one is not proportionally cheaper.",
    "Check whether a '6 x 250 ml multipack offer' beats a single 1.5 litre bottle.",
    "Compare the same product across two online stores that list different pack sizes.",
    "Work out the per-piece cost of eggs, capsules or sachets sold in trays of 6, 12 and 30."
  ],
  "benefits": [
    [
      "Mixed units, one answer",
      "Grams, kilograms, ounces, pounds, millilitres, litres, fluid ounces and gallons all normalise to the same base before comparison."
    ],
    [
      "Multipack aware",
      "A separate packs field means combo deals like 3 x 750 g are priced correctly instead of being treated as a single unit."
    ],
    [
      "Ranked with the gap shown",
      "The cheapest option is highlighted and every other option shows exactly what percentage more it costs per unit."
    ]
  ],
  "faqs": [
    [
      "How is unit price calculated?",
      "Unit price = total price divided by total quantity, where total quantity is pack size multiplied by the number of packs in the deal. The result is then scaled to a familiar unit such as per kilogram or per litre."
    ],
    [
      "Is the bigger pack always cheaper per unit?",
      "No. Retailers regularly price mid-size or promotional packs below the largest one, and multipacks are often the most expensive per unit. That is exactly the case this calculator is designed to catch."
    ],
    [
      "Can I compare grams with millilitres?",
      "Not reliably. Weight and volume are different measures and the conversion depends on the product's density, so the calculator keeps weight, volume and count as separate modes."
    ],
    [
      "Should I always buy the lowest unit price?",
      "Only when you will use the whole pack. For perishables, storage-limited items or products you are trying for the first time, waste from an unfinished large pack can easily cancel out the per-unit saving."
    ]
  ]
};

export default seo;
