const seo = {
  title: "Room Paint Calculator: Litres, Cans and Total Cost",
  metaDescription:
    "Wall area minus doors and windows, divided by your paint's coverage and coats, into a 20/10/4/1 L can list plus paint, labour and contingency cost.",
  steps: [
    "Fill Length (ft), Width (ft) and Height (ft) for the room, tick Include Ceiling if it is being painted, and enter No. Doors, No. Windows, Door area each (sqft) and Window area each (sqft) so the openings are deducted from wall area.",
    "Choose Interior Emulsion, Enamel, Distemper or Texture Finish to prefill Coverage (sqft/liter) and Price per liter, then set Wall coats, Ceiling coats, Primer coats, Wastage %, Labor Rate (₹/sqft) and Contingency %; + Add Room repeats this for each extra room.",
    "Read Total Paintable Area, Total Paint Needed in litres, Paint Cost, Labor Amount and Total Amount, then the Shopping List (Can Sizes) in 20L, 10L, 4L and 1L cans and the Room-by-Room Area Summary table.",
  ],
  intro:
    "The Room Paint Calculator estimates how many litres of paint a room needs by measuring wall area as 2 × (length + width) × height, subtracting every door and window opening, adding the ceiling as length × width, then dividing by your paint's coverage per litre and multiplying by the number of coats. You can add several rooms at once, set separate wall, ceiling and primer coats, add a wastage percentage, and it returns a shopping list broken into 20 L, 10 L, 4 L and 1 L cans plus a cost total of paint, labour at a rate per square foot, and a contingency percentage. It is for anyone pricing a repaint before calling a contractor or walking into a paint shop.",
  useCases: [
    "You are repainting a 12 × 14 ft bedroom with a 10 ft ceiling and need to know whether to buy one 20 L can or two 10 L cans before the shop closes.",
    "A contractor has quoted a lump sum for a three-room repaint and you want your own material-plus-labour figure to check it against.",
    "You are painting only the walls, not the ceiling, and want the door and window areas taken out so you are not buying litres for surfaces that will never see a roller.",
  ],
  benefits: [
    [
      "Openings are deducted, not ignored",
      "Enter door and window counts with the area of each, and the net wall area drops accordingly instead of assuming solid walls.",
    ],
    [
      "Coats costed separately",
      "Wall coats, ceiling coats and primer coats are each priced against their own surface area, so a primer-plus-two-coats job is not guessed at.",
    ],
    [
      "Buyable can sizes, not raw litres",
      "Converts the litre requirement into an actual 20/10/4/1 L purchase plan, which is what the shop sells.",
    ],
  ],
  faqs: [
    [
      "How do I calculate how much paint a room needs?",
      "Multiply 2 × (room length + width) × ceiling height for wall area, subtract the area of the doors and windows, then divide by the paint's coverage per litre and multiply by the number of coats. A 12 × 14 ft room with a 10 ft ceiling has 520 sq ft of gross wall area before openings are deducted.",
    ],
    [
      "How much wall area does one litre of paint cover?",
      "It depends on the product and the surface, which is why the coverage figure is an input you set rather than a fixed constant — read the litres-per-square-foot claim printed on the can. Selecting a paint type prefills a starting value, but a porous or previously unpainted wall will always drink more than the label suggests.",
    ],
    [
      "Should I add extra paint for wastage?",
      "Yes — a wastage percentage covers roller absorption, spills, touch-ups and the paint left in the tray and can. Enter it in the wastage field and it is applied to the whole requirement, primer included, before the can plan is worked out.",
    ],
    [
      "Does the estimate include labour?",
      "Only if you enter a labour rate per square foot, which is then applied to the total paintable area and added to the paint cost, with any contingency percentage on top of that subtotal. Rates vary by city and by finish, so use a quote you have actually been given rather than a national average.",
    ],
  ],
};

export default seo;
