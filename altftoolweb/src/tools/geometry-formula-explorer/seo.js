const seo = {
  title: "Geometry Formula Explorer: Area, Volume, Working",
  intro:
    "Geometry Formula Explorer calculates area, perimeter, surface area and volume for ten shapes — circle, rectangle, triangle, trapezoid, parallelogram and ellipse in 2D, plus sphere, cylinder, cone and rectangular prism in 3D — and shows the substitution line by line rather than just the answer. Enter the dimensions and every formula for that shape recalculates at once: a circle returns πr², 2πr and 2r together, a rectangular prism returns volume, surface area and the space diagonal √(l²+w²+h²). Results are rounded to four decimal places and a scaled diagram of the shape updates alongside the numbers.",
  useCases: [
    "A student checking homework wants to see the working — Given r = 5, Formula A = πr², A = π × 25 = 78.5398 — not just the final figure.",
    "Sizing a cylindrical water tank and needing both the volume it holds and the sheet metal area 2πr(r + h) required to build it.",
    "Working out whether a long box will fit through a doorway by reading the space diagonal of a rectangular prism instead of measuring the edges.",
  ],
  benefits: [
    ["Shows the substitution, not just the result", "Each calculation is expanded into Given, Formula and worked-substitution lines so you can copy the method into an answer sheet."],
    ["All the shape's formulas at once", "Choosing a shape computes every formula defined for it together, so area, perimeter and diagonal come from one set of inputs."],
    ["Diagram tracks the numbers", "A visual of the selected shape redraws as you change the dimensions, which catches an input typed into the wrong field straight away."],
  ],
  faqs: [
    [
      "Which formulas does it cover?",
      "Twenty-two formulas across ten shapes, including πr² and 2πr for a circle, ½(a + b)h for a trapezoid, (4/3)πr³ for a sphere and (1/3)πr²h for a cone. All results are rounded to four decimal places.",
    ],
    [
      "Is the cone's surface area the total or just the side?",
      "Just the side — the tool computes the lateral surface πr√(r² + h²), which excludes the circular base. Add πr² yourself if you need the total surface area of a closed cone.",
    ],
    [
      "How accurate is the ellipse perimeter?",
      "It uses Ramanujan's approximation π[3(a + b) − √((3a + b)(a + 3b))], because an ellipse perimeter has no exact closed form. The approximation is accurate to within a tiny fraction of a percent for ordinary eccentricities and only drifts for extremely elongated ellipses.",
    ],
    [
      "What units does it use?",
      "None — the calculation is unit-agnostic, so whatever unit you enter is the unit of the answer. Enter centimetres and area comes back in square centimetres and volume in cubic centimetres; just keep every field in the same unit, with a minimum value of 0.1.",
    ],
  ],
};

export default seo;
