const seo = {
  title: "Wood Stain Calculator: Litres, Coats and Tin Sizes",
  metaDescription:
    "Turns surface area into litres of stain, oil, sealer or varnish using spreading rate, texture and porosity factors and a 1.3x first coat on bare wood.",
  steps: [
    "Choose 'From piece dimensions' or 'I already know the area', then give Piece length (m), Piece width (m), Piece thickness (mm) and Number of pieces with the both-faces and edges tick boxes — or type the Surface area in square metres or square feet.",
    "Pick the Product, from Penetrating oil-based wood stain at 9 m²/L to Exterior decking / fence stain at 6, plus Surface texture, Wood porosity, Number of coats, Brush loss and wastage (%) and a Tin size (litres) between 0.25 L and 20 L.",
    "Read 'Finish to buy' in litres with the tin count, effective coverage, net requirement, leftover and cost, and the coat-by-coat table showing the heavier bare-wood first coat, then press 'Copy result'.",
  ],
  intro:
    "This calculator converts a wood surface area into the litres of stain, oil, sealer or varnish the job actually needs. It starts from the product's spreading rate in square metres per litre per coat, divides it by a texture factor and a porosity factor — rough-sawn timber and open-grained softwood both have far more real surface than their measured area — and loads the first coat on bare wood by 1.3× because raw grain drinks it. Furniture makers, decorators and DIY finishers use it to buy the right tin size instead of running out halfway through the second coat.",
  useCases: [
    "Working out whether one litre of oil-based stain finishes a 1.8 × 0.9 m table top on both faces and all four edges in two coats",
    "Estimating exterior stain for a rough-sawn pine fence, where coverage drops to roughly a third of the smooth-timber figure",
    "Comparing how many tins a three-coat Danish oil schedule needs against two coats of polyurethane on the same piece",
  ],
  benefits: [
    ["Real-world coverage", "Texture and porosity factors turn the tin's best-case spreading rate into what you will actually get."],
    ["Coat-by-coat breakdown", "Shows the heavier first coat separately from the later ones, so partial jobs can be costed too."],
    ["Buys in tin sizes", "Rounds up to 0.25 L through 20 L tins and reports the leftover, not just a raw litre figure."],
  ],
  faqs: [
    [
      "How much wood stain do I need per square metre?",
      "Roughly 0.11 litres per square metre per coat on smooth, planed timber, since typical interior stains cover 8–10 m² per litre. Rough-sawn or weathered wood can drop to 3–4 m² per litre, so the same area may need three times as much.",
    ],
    [
      "Does the first coat use more stain than the second?",
      "Yes — bare wood absorbs roughly 25–35% more on the first coat because the open grain soaks it up before any film forms. This calculator applies a 1.3× loading to coat one on bare timber and leaves later coats at the base rate.",
    ],
    [
      "How many coats of wood stain should I apply?",
      "Two coats is standard for pigmented stains and polyurethane, three for penetrating oils like Danish or teak oil, and one for a sanding sealer under a topcoat. More coats deepen the colour rather than adding protection, so the topcoat is what determines durability.",
    ],
    [
      "How do I convert a coverage figure from square feet per gallon?",
      "Divide square feet per US gallon by 40.7 to get square metres per litre. A stain quoted at 400 sq ft per gallon is about 9.8 m² per litre; one quoted at 150 sq ft per gallon, typical for rough exterior timber, is only about 3.7 m² per litre.",
    ],
  ],
};

export default seo;
