const seo = {
  intro:
    "This calculator converts a container's real dimensions into litres of each potting mix ingredient, using the parts-by-volume ratios gardeners actually work in. Pot volume is computed properly: a tapered nursery pot is a truncated cone, so its volume follows V = (π h / 3)(R² + Rr + r²) with the radius taken at the mix line rather than the rim — using rim diameter alone overstates a 12-inch pot by close to a third. Each ingredient then comes out in litres, in scoops of your chosen size, and in the units shops sell it by, including 5 kg cocopeat blocks.",
  useCases: [
    "You are repotting twelve 12-inch pots and want to buy exactly enough soil, compost and coir in one trip.",
    "You are mixing a seed-starting medium and need the three-parts-coir-to-one-part-compost ratio in litres, not vague handfuls.",
    "You are filling balcony troughs and want a cactus mix with enough sand and perlite to drain in seconds.",
  ],
  benefits: [
    ["Correct pot geometry", "Tapered pots, grow bags and rectangular troughs each use their own volume formula instead of a rough guess."],
    ["Ratios in parts", "Recipes stay in the two-parts-to-one form gardeners use, and are converted to litres and scoops for you."],
    ["Bought units, not just volume", "Soil and compost in kilograms, perlite in litres, cocopeat in compressed blocks — matching how each is actually sold."],
  ],
  faqs: [
    [
      "How much potting mix does a 12 inch pot need?",
      "About 13 litres of mix for a typical tapered 12-inch pot roughly 28 cm deep, once you leave 3 cm of headspace below the rim — at the general 2:1:1:0.5 ratio that is roughly 5.7 litres of soil, 2.9 litres each of compost and cocopeat, and 1.4 litres of perlite. A straight-sided 12-inch grow bag of the same depth takes closer to 17 litres of mix total, because none of the volume is lost to the taper.",
    ],
    [
      "What is the best potting mix ratio?",
      "For general container plants, two parts garden soil to one part compost, one part cocopeat and half a part perlite works well: the soil gives body, compost feeds, coir holds moisture and perlite keeps the mix from compacting. Seedlings want no soil at all — three parts coir, one compost, one perlite — and succulents want two parts coarse sand with only half a part compost.",
    ],
    [
      "Can I use garden soil alone in pots?",
      "It is the most common reason potted plants fail. Garden soil compacts into a dense block in a container, holds water at the base and starves roots of air, and it can carry soil-borne fungi. Keep it to about half the mix at most, and always add something coarse such as perlite or sand for drainage.",
    ],
    [
      "How much cocopeat do I need for one pot?",
      "About 3 litres for a 13-litre pot on a mix where coir is one part in four and a half. One 5 kg compressed block expands to roughly 75 litres, so a single block will fill the coir share of more than twenty such pots — buy blocks, not loose coir, and soak before measuring.",
    ],
  ],
};

export default seo;
