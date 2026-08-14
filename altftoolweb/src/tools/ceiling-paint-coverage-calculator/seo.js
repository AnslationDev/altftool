const seo = {
  title: "Ceiling Paint Calculator: Litres, Tins and Cove Area",
  metaDescription:
    "Litres = area × coats ÷ spreading rate, from 140 sq ft per litre per coat, with the cove band added and a tin-by-tin buy list at your paint price.",
  steps: [
    "Enter room length and width in feet, the cove or cornice drop in inches, how many identical ceilings you are painting, and the number of coats (1 to 6).",
    "Pick the Ceiling surface — gypsum board or POP false ceiling, repaint over sound existing paint, smooth plastered RCC slab, bare plaster, or textured — which corrects the 140 sq ft per litre per coat base rate, then set the wastage allowance (8% by default) and your paint price per litre.",
    "You get the litres needed, flat and cove area, effective coverage, and two buy lists — \"Least paint bought\" and \"Fewest tins to carry\" — built from 20, 10, 4 and 1 litre tins with the material cost and cost per sq ft.",
  ],
  intro:
    "The Ceiling Paint Coverage Calculator turns room length and width into the litres of emulsion a ceiling needs, using litres = area x coats / spreading rate with the 130-160 sq ft per litre per coat that interior emulsion data sheets quote for smooth primed surfaces. It adds the cove or cornice band, which is measured as perimeter x drop and is routinely left out of hand estimates, and corrects coverage for gypsum board, bare plaster or a textured finish. The output is a litre figure, a tin-by-tin shopping list and a material cost.",
  useCases: [
    "Buying paint for the ceilings of a whole flat at once, by entering the largest room and the number of similar rooms.",
    "Estimating the extra paint a deep POP cove adds to what looks like a simple 12 ft x 15 ft ceiling.",
    "Sanity-checking a painter's material list before agreeing to a labour-plus-material quote.",
  ],
  benefits: [
    ["Cove area included", "Adds perimeter x cove drop, the part most rough estimates miss entirely."],
    ["Surface-aware coverage", "Gypsum, bare plaster and textured ceilings each get their own spreading rate."],
    ["Buy-it-two-ways", "Shows both the least-paint and the fewest-tins purchase so you can pick on price."],
  ],
  faqs: [
    [
      "How much paint does a 12 x 15 ft ceiling need?",
      "About 2.5 litres for two coats on a smooth primed slab: 180 sq ft x 2 coats divided by roughly 140 sq ft per litre per coat, before a wastage allowance. A textured ceiling of the same size can need 4 litres or more because the profile adds real surface area.",
    ],
    [
      "How many coats of paint does a ceiling need?",
      "Two coats over a primed surface is standard and is what gives an even sheen under overhead light. One coat is enough only when you are refreshing the same shade on a clean, sound ceiling; a stained or patched ceiling usually needs a stain-blocking primer first rather than a third finish coat.",
    ],
    [
      "Can I use wall emulsion on the ceiling?",
      "Yes, interior wall emulsion works on ceilings, but dedicated ceiling paint is formulated to be thicker and flatter so it drips less and hides roller lines under grazing light. Whatever you use, a matt finish is far more forgiving on a ceiling than a sheen.",
    ],
    [
      "Should I paint the ceiling before or after the walls?",
      "Paint the ceiling first. Overspray and roller spatter from the ceiling land on the walls, and any ceiling paint that runs onto the wall line gets covered when you cut in the wall colour afterwards.",
    ],
  ],
};

export default seo;
