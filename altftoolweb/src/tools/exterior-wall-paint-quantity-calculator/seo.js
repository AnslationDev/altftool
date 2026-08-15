const seo = {
  title: "Exterior Wall Paint Calculator: Litres, Tins",
  metaDescription:
    "Litres = paintable area x coats ÷ spreading rate, corrected for smooth, porous, sand-faced or textured walls, then split into 20, 10, 4 and 1 L tins.",
  steps: [
    "Choose Perimeter x height or I know the area, then fill Total wall length / perimeter (ft) and Wall height (ft) — or Gross wall area (sq ft) — plus Windows, doors and grilles to deduct (sq ft).",
    "Set Number of finish coats (2 by default, up to 6), pick the Surface condition option that matches the wall — Repaint over sound old paint, Smooth cement plaster (primed), Bare / new cement plaster, Sand-faced or rough plaster, Textured / exterior texture finish or Exposed brick or block work — and adjust Wastage allowance (%) and Emulsion price (INR per litre).",
    "Paint required shows the litres over rows for Paintable area, Effective coverage in sq ft / L / coat, Tins to buy, Left over after the job, Material cost and Cost per sq ft of wall, plus a Two ways to buy it table comparing Least paint bought with Fewest tins to carry in 20, 10, 4 and 1 L packs. Copy result copies the estimate.",
  ],
  intro:
    "The Exterior Wall Paint Quantity Calculator converts wall dimensions into litres of exterior emulsion using the standard trade relation litres = paintable area x coats / spreading rate. It starts from the 100-140 sq ft per litre per coat that Indian exterior emulsion data sheets quote for smooth plaster, then scales that rate down for porous, sand-faced, textured or bare masonry surfaces. Homeowners get a shopping list of tin sizes and a material cost; contractors get a defensible number to quote against.",
  useCases: [
    "Costing a full exterior repaint of an independent house before calling painters for quotes.",
    "Checking whether a contractor's paint requirement is padded, by comparing it against the coverage printed on the tin.",
    "Ordering paint for a sand-faced or textured elevation, where the same area can need 40% more emulsion than smooth plaster.",
  ],
  benefits: [
    ["Surface-corrected coverage", "Applies a factor for texture and porosity instead of using one flat spreading rate."],
    ["Tin-level shopping list", "Turns the litre figure into the exact 20 L, 10 L, 4 L and 1 L packs to buy."],
    ["Openings deducted", "Windows, doors and grilles come off the gross area before any paint is costed."],
  ],
  faqs: [
    [
      "How much area does one litre of exterior emulsion cover?",
      "Around 100-140 sq ft per litre per coat on smooth, primed cement plaster, which is the band printed on most Indian exterior emulsion data sheets. On rough sand-faced plaster expect roughly 70-90 sq ft, and on textured finishes it can drop below 70 sq ft per litre per coat.",
    ],
    [
      "How many coats of exterior paint do I need?",
      "Two finish coats over a primed surface is the standard specification for exterior emulsion, and it is what most manufacturer warranties assume. A third coat is worth it only for a strong colour change, a deep shade going over white, or a chalky old surface.",
    ],
    [
      "Should I subtract windows and doors from the wall area?",
      "Yes, deduct any opening you are not painting. Rule of thumb sizes are about 21 sq ft for a standard 3 ft x 7 ft door and about 15 sq ft for a 4 ft x 4 ft window, but measuring the actual openings gives a far better estimate on a facade with a lot of glazing.",
    ],
    [
      "Do I need primer as well as paint?",
      "On bare or newly plastered exterior walls, yes - an exterior primer seals the surface so the emulsion is not absorbed unevenly, and it is what makes the quoted spreading rate achievable. A sound, previously painted wall that is clean and not chalking can usually be recoated without a full primer coat.",
    ],
  ],
};

export default seo;
