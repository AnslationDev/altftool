const seo = {
  intro:
    "Fabric heat loss through a surface is area × U-value × temperature difference, and this estimator applies that steady-state formula to each wall, roof and window you list, once at its current U-value and again at the U-value you would reach after insulating. Enter surfaces as name | area m² | current U | improved U, plus a design indoor-outdoor difference in kelvin and your annual equivalent heating hours, and you get the watts saved per surface, the percentage the fabric loss drops, and the kWh and cost that represents over a year. It is a fabric-only comparison for ranking retrofit options, not a survey or a grant assessment.",
  useCases: [
    "Deciding whether to spend the budget on loft insulation or on replacing single-glazed windows, by entering both improved U-values and seeing which removes more watts",
    "Sanity-checking an installer's claimed annual saving before signing, using your own measured wall area and the U-value stated on their product datasheet",
    "Working out how much of a cold room's loss is the 20 m² of glazing versus the 120 m² of uninsulated wall, so the money goes where the heat actually leaves",
  ],
  benefits: [
    ["Per-surface breakdown, not one number", "A table shows current watts, improved watts and watts saved for every element, so you can see which one dominates before choosing."],
    ["Two U-values side by side", "You model the before and after in the same row, which is what makes the output a retrofit comparison rather than a bare heat-loss sum."],
    ["Converts watts into a yearly figure", "Design-condition watts are multiplied by your equivalent heating hours to give kWh per year and a cost at your own price of useful heat."],
  ],
  faqs: [
    [
      "What formula does the heat-loss calculation use?",
      "Q = A × U × ΔT. A 120 m² wall at U 1.5 W/m²K across a 20 K difference loses 120 × 1.5 × 20 = 3,600 W; insulating it to U 0.3 drops that to 720 W. Annual energy is the total watts saved × your heating hours ÷ 1,000, so 4,592 W over 1,800 hours is about 8,266 kWh a year.",
    ],
    [
      "What U-value should I enter for my walls?",
      "Use the figure from a survey or the product datasheet if you have one; otherwise typical starting points are around 1.5–2.0 W/m²K for an uninsulated solid wall, 0.8–1.5 for an unfilled cavity, and 2.8–5.0 for single glazing. Modern insulated targets sit near 0.3 for walls, 0.15–0.2 for roofs and 1.2–1.4 for good double glazing.",
    ],
    [
      "What are 'annual equivalent heating hours' and what value is realistic?",
      "It is the number of hours the house would need full design-condition heating to use the same energy as a real heating season, which lets a single steady-state calculation stand in for a whole year. The 1,800-hour default suits a temperate climate; a milder or shorter season is lower and a cold one higher, and the honest way to set it is from degree-day data for your location.",
    ],
    [
      "Why is my real saving smaller than the estimate?",
      "Because this model counts fabric conduction only. It ignores air leakage and ventilation, thermal bridges at junctions, solar and internal gains, heating system efficiency, moisture risk and the way people actually take part of a retrofit as extra warmth rather than lower bills. For grant applications or a heat pump design, get a proper assessment from a qualified retrofit assessor.",
    ],
  ],
};

export default seo;
