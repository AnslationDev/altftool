const seo = {
  intro:
    "This estimator turns an odometer reading into a periodic service bill for a bike or scooter: engine oil for the displacement band, every wear part whose replacement interval falls inside the current service window, chain lube and shop consumables, workshop labour and 18% GST. A part is treated as due when the odometer crosses a multiple of its interval since the last service — the same rule printed in OEM maintenance charts, so a 12,000 km service picks up the air filter and spark plug while a 9,000 km service does not. It is built for owners who want to sanity-check a workshop estimate before signing the job card.",
  useCases: [
    "Checking whether the ₹4,500 estimate quoted for a 12,000 km service on a 150 cc commuter is reasonable or padded with parts that are not yet due",
    "Comparing an authorised service centre against a multi-brand chain for the same job card, where only the labour rate differs",
    "Budgeting a year of servicing for a delivery rider covering 25,000 km, by multiplying one service bill by the number of intervals in the year",
  ],
  benefits: [
    ["Itemised, not a lump sum", "Every line shows the part, why it is due at this odometer and what it costs."],
    ["Odometer-driven", "Wear items appear only when their replacement interval is actually crossed."],
    ["Tax included", "Parts and labour are both taxed at 18% GST, so the figure matches the invoice format."],
  ],
  faqs: [
    [
      "How much does a bike service cost in India?",
      "A routine paid service on a 100-160 cc commuter typically lands between ₹1,200 and ₹2,500 including GST, while a 350-650 cc motorcycle usually runs ₹3,000 to ₹7,000 because it takes more oil and its spares cost more. The bill jumps at the intervals where the air filter, spark plug, brake pads or chain kit come due.",
    ],
    [
      "How often should a two-wheeler be serviced?",
      "Most Indian manufacturers specify every 3,000 to 6,000 km or every six months, whichever comes first, with the first service at around 500-750 km. Engine oil is changed at every one of those visits; the oil filter is usually every second change and the air filter and spark plug around 12,000 km.",
    ],
    [
      "Are free services really free?",
      "The free services bundled with a new two-wheeler — typically three to five — waive the labour charge only. Engine oil, filters, brake pads and any other consumables are still billed to you, along with GST, so a free service can still come to ₹700-1,200.",
    ],
    [
      "What GST applies to a two-wheeler service bill?",
      "Both automotive spare parts and workshop labour are taxed at 18% GST (9% CGST plus 9% SGST for an intra-state job). Ask for a tax invoice showing the split — this estimate is informational and your dealer's actual MRP and shop rate take precedence.",
    ],
  ],
};

export default seo;
