const seo = {
  title: "AC Copper Pipe Cost Estimator: Past the Free 3 m",
  metaDescription:
    "Prices the extra copper pair, drain, cable, core holes and refrigerant top-up past the free 3 m, using the manual's chargeless length and g/m rate.",
  steps: [
    "Pick the Copper pair size for your capacity — 1/4\" + 3/8\" up to 1.5 ton, 1/4\" + 1/2\" for 1.8 to 2.5 ton, or 3/8\" + 5/8\" for 3 ton and above.",
    "Enter Copper run indoor to outdoor (m) and Length included free (m), your per-metre rates, Core-drilled wall holes, Height difference between units (m), plus Chargeless pipe length from the manual (m) and Top-up refrigerant (g per extra m).",
    "Read Total installation cost broken into Extra copper pair, Extra drain pipe, Core drilling, Refrigerant top-up and Installation labour, with warnings on runs past 15 m or a rise past 5 m, then press Copy result.",
  ],
  intro:
    "This estimator itemises what a split AC installation costs once the outdoor unit sits away from the indoor unit: extra copper pair, drain pipe and interconnecting cable beyond the free length, core-drilled wall holes, the outdoor stand, and the refrigerant top-up a long line needs. Brands typically bundle about 3 m of copper into a standard installation and charge per metre after that, while installation manuals specify a chargeless pipe length and a top-up rate in grams per additional metre. Every rate is editable so you can put your installer's actual quote against the quantities.",
  useCases: [
    "Price the difference before deciding whether the outdoor unit goes on the near balcony or the far one.",
    "Check an installer's bill line by line when the 'free installation' turned into a five-figure invoice.",
    "Work out whether a longer copper run is still within the maximum pipe length your model allows.",
  ],
  benefits: [
    ["Every chargeable item listed", "Copper, drain, cable, core holes, stand, gas top-up and labour shown separately."],
    ["Refrigerant top-up included", "Applies the manual's chargeless length and grams-per-metre rule most quotes leave unexplained."],
    ["Warns on long or steep runs", "Flags runs past the usual 15 m limit, height differences past 5 m, and where oil traps are needed."],
  ],
  faqs: [
    [
      "How much copper pipe is included in a free AC installation?",
      "Most brands include about 3 metres (10 feet) of copper pair, drain pipe and interconnecting cable in a standard installation. Anything beyond that is billed per running metre, and the rate depends on the pipe size — a 1/4 inch plus 3/8 inch pair for a 1.5 ton unit costs less per metre than the 3/8 plus 5/8 pair a 3 ton unit needs.",
    ],
    [
      "Does a longer copper pipe need extra gas?",
      "Yes, past the chargeless length printed in the installation manual — commonly around 7.5 m for a residential split. The manual states a top-up rate in grams per additional metre, often near 20 g/m for R32 or R410A units, so a 12 m run needs roughly 90 g of extra refrigerant.",
    ],
    [
      "What is the maximum copper pipe length for a split AC?",
      "Residential 1 to 2 ton splits are usually rated for a maximum pipe run around 15 m and a maximum height difference around 5 m, but the exact figures are model-specific and printed in the manual. Beyond the limit the unit loses cooling capacity, the compressor works harder, and warranty claims can be refused.",
    ],
    [
      "Why do I need oil traps on a tall AC pipe run?",
      "Compressor oil circulates with the refrigerant and has to be carried back up the suction line. On a vertical rise, gas velocity alone may not lift it, so a U-shaped trap is fitted roughly every 5 metres of rise to collect and slug the oil upward. Without them the compressor slowly loses lubrication.",
    ],
  ],
};

export default seo;
