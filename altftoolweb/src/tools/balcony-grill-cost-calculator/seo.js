const seo = {
  intro:
    "This calculator prices balcony and window grills both ways fabricators quote them — per square foot of grill and per kilogram of fabricated steel — and works out the weight from the actual section rather than a rule of thumb. Mass per metre is cross-section area times density, so a 12 mm square mild steel bar comes to 1.13 kg per metre and a 12 mm round bar to 0.89 kg, which is the familiar d²/162 shortcut derived properly. It also counts the vertical bars your spacing produces and reports the clear gap between them against the 100 mm maximum normally required for balcony infill.",
  useCases: [
    "Convert a fabricator's per-kilogram quote into a per-square-foot figure so two quotes can be compared.",
    "Check that the bar spacing on a balcony grill leaves a gap small enough to be safe with young children.",
    "Estimate the steel weight for several windows and a balcony in one go before calling for quotations.",
  ],
  benefits: [
    ["Weight from first principles", "Mass per metre computed from section and density, not a generic per-square-foot rate."],
    ["Both quoting methods", "Prices the same grill by area and by weight so you can see which quote is really cheaper."],
    ["Child-safety gap checked", "Reports the clear gap between bars and flags anything above the usual 100 mm limit."],
  ],
  faqs: [
    [
      "How is balcony grill cost calculated?",
      "Either by the grill's area in square feet, or by the weight of fabricated steel at a rate per kilogram that includes cutting, welding and labour. The two agree only if you know the weight: a 4 ft by 3 ft grill in 12 mm square mild steel bar at 100 mm spacing carries roughly 20 kg, so a rate of ₹110 per kg works out near ₹180 per square foot before paint and installation.",
    ],
    [
      "What is the safe gap between balcony grill bars?",
      "No more than 100 mm clear between bars. Guard-rail infill is specified so a small child cannot pass through or get their head trapped, which is why the gap and not the spacing is what matters — bar spacing of 100 mm centre to centre with 12 mm bars leaves under 90 mm clear, which is inside the limit.",
    ],
    [
      "How much does a 12 mm steel bar weigh per metre?",
      "A 12 mm round mild steel bar weighs about 0.89 kg per metre and a 12 mm square bar about 1.13 kg, because the square section has more steel in it. The general rule is cross-section area times density: mild steel is 7,850 kg per cubic metre, stainless 304 about 7,900, and aluminium only 2,700.",
    ],
    [
      "Is a stainless steel or aluminium grill worth the extra cost?",
      "Stainless 304 needs no painting and does not rust, which suits coastal and high-rainfall locations where mild steel needs recoating every few years. Aluminium weighs about a third of steel for the same section, so per-kilogram rates mislead — compare aluminium per square foot instead, and check the section is stiff enough for the span.",
    ],
  ],
};

export default seo;
