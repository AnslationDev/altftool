const seo = {
  title: "Bookshelf Capacity Calculator - Books, Load, Sag",
  metaDescription:
    "Turn shelf span into a book count and load in kg, then predict sag from board thickness and material against the span/180 shelving limit.",
  steps: [
    "Enter \"Clear span between supports (cm)\", \"Shelf depth (cm)\", \"Board thickness (mm)\" and \"Number of shelves\".",
    "Pick the \"Shelf material\" and \"What is going on it\", and set \"Allowable sag: span divided by\" (180 is the accepted shelving limit).",
    "Read \"Books per shelf\", the load in kg and the \"Will it sag?\" verdict with predicted mid-span sag, then click \"Copy result\".",
  ],
  intro:
    "This bookshelf capacity calculator turns a shelf's span into a book count, a load in kilograms, and a sag prediction. Capacity comes from average spine thickness — around 2 cm for a mass-market paperback and 3.5 cm for a hardback — while sag uses the standard simply-supported beam formula, delta = 5qL⁴ / (32Et³), with long-term creep-adjusted stiffness for particleboard, plywood, softwood and hardwood. The verdict is measured against the span/180 sag limit used in shelving practice.",
  useCases: [
    "Checking whether a 120 cm particleboard shelf will bow before you fill it with hardbacks",
    "Sizing a built-in wall unit and deciding where the vertical dividers have to go",
    "Estimating the total weight a wall or floor will carry from a full-height bookcase",
  ],
  benefits: [
    ["Real beam mechanics", "Sag is calculated, not guessed, from span, board thickness and material stiffness."],
    ["Creep is included", "Uses long-term stiffness, which is why particleboard shelves that look fine at first bow within a year."],
    ["Capacity and load together", "Book count, kilograms per shelf and total unit weight in one place."],
  ],
  faqs: [
    [
      "How many books fit on a one metre shelf?",
      "About 49 mass-market paperbacks (2 cm spines), 39 trade paperbacks, or 28 hardbacks (3.5 cm spines) on a 100 cm shelf, allowing a 2 cm end gap so books can be pulled out. A mixed home library averages roughly 2.6 cm per spine, giving around 37 books per metre.",
    ],
    [
      "How much weight can a bookshelf hold?",
      "A shelf full of hardbacks carries about 20 kg per metre of length; art and coffee-table books can reach 60 kg per metre. The limiting factor is usually stiffness rather than strength — the board bows long before it breaks.",
    ],
    [
      "What is the maximum span for a bookshelf before it sags?",
      "For a 19 mm board under a normal book load and the span/180 limit, roughly 72 cm in particleboard or MDF, 92 cm in plywood, and about 120 cm in hardwood. Doubling the thickness roughly doubles the safe span, because deflection falls with the cube of thickness.",
    ],
    [
      "How do I stop a shelf from bowing?",
      "Shorten the span with a vertical divider, use a thicker or stiffer board, or glue a hardwood lipping along the front edge — the lipping adds depth exactly where the bending stress is highest. Turning the board on edge as a fixed shelf with a back panel also stiffens it considerably.",
    ],
  ],
};

export default seo;
