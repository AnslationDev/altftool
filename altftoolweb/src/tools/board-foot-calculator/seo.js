const seo = {
  intro:
    "A board foot is a unit of timber volume equal to 144 cubic inches — a piece one inch thick, twelve inches wide and twelve inches long — and this calculator works it out as thickness x width x length in inches divided by 144. It converts the same volume to cubic feet (the CFT that Indian timber yards quote), cubic metres and cubic inches, adds a waste allowance and prices the order on whichever unit your supplier bills in. Woodworkers, furniture makers and site supervisors use it to turn a cutting list into a purchase quantity.",
  useCases: [
    "Turning a cutting list into the board feet to order before visiting a hardwood yard",
    "Comparing a quote priced per cubic foot against one priced per board foot on the same timber",
    "Costing a furniture project with a realistic offcut allowance built into the quantity",
  ],
  benefits: [
    ["Mixed units accepted", "Enter inches, feet, millimetres, centimetres or metres in any combination."],
    ["CFT and cubic metres too", "Gives the volume in the unit your supplier actually quotes."],
    ["Quarter sizes built in", "One tap for 4/4 through 16/4 rough hardwood thicknesses."],
  ],
  faqs: [
    [
      "How do you calculate board feet?",
      "Multiply thickness in inches by width in inches by length in inches, then divide by 144. A 2 x 4 that is eight feet long works out to 2 x 4 x 96 / 144 = 5.33 board feet.",
    ],
    [
      "How many board feet are in a cubic foot?",
      "Exactly 12. A cubic foot is 1,728 cubic inches and a board foot is 144 cubic inches, so 1,728 divided by 144 gives 12 board feet per cubic foot, or roughly 424 board feet per cubic metre.",
    ],
    [
      "What does 4/4 mean in lumber?",
      "It is rough thickness expressed in quarters of an inch, so 4/4 is one inch, 5/4 is one and a quarter, 8/4 is two inches. The board is measured before surfacing, which is why a 4/4 board planed on both faces finishes around 13/16 of an inch but is still billed as one inch.",
    ],
    [
      "Should I use nominal or actual dimensions for board feet?",
      "Use the rough or nominal size the yard measured at, because that is what you are charged for. Softwood sold as a 2 x 4 actually measures 1.5 x 3.5 inches after surfacing, so a board-foot figure taken from the finished size will understate the invoice by about 34%.",
    ],
  ],
};

export default seo;
