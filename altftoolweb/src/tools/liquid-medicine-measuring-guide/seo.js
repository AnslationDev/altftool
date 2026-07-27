const seo = {
  intro:
    "The Liquid Medicine Measuring Guide converts a prescribed dose into the millilitres you actually draw up, using the proportion volume = dose in mg divided by concentration in mg per mL. It picks the smallest oral syringe that holds the dose in one draw, rounds to that syringe's printed graduation, and shows how many milligrams the rounded marking really delivers. It exists because household teaspoons have been measured anywhere from 2.5 mL to over 7 mL, which is why medicines-safety bodies insist on millilitres and a syringe.",
  useCases: [
    "Turning \"250 mg three times a day\" into millilitres when the bottle says 250 mg per 5 mL.",
    "Checking whether a 1.4 mL infant dose should go in a 1 mL, 3 mL or 5 mL syringe.",
    "Working out how many days a 60 mL bottle of antibiotic will last at the prescribed frequency.",
    "Confirming the mg-per-kilogram figure for a child's dose before giving the first spoonful.",
  ],
  benefits: [
    ["Right syringe, not the biggest one", "Chooses the smallest device that holds the dose, because a small volume in a large barrel has far more relative error."],
    ["Shows the rounding cost", "Reports the dose the nearest graduation actually delivers and the percentage difference from what was prescribed."],
    ["Bottle planning built in", "Converts bottle size into doses and days of supply so you know when to reorder."],
  ],
  faqs: [
    [
      "How many mL is a teaspoon of medicine?",
      "A medicine teaspoon is exactly 5 mL and a tablespoon is 15 mL. Kitchen teaspoons are not: studies of real household spoons have found volumes from about 2.5 mL to over 7 mL, so a spoonful can deliver half or one and a half times the intended dose.",
    ],
    [
      "How do I convert mg to mL for liquid medicine?",
      "Divide the dose in milligrams by the concentration in milligrams per millilitre. A bottle labelled 125 mg per 5 mL is 25 mg per mL, so a 200 mg dose is 200 divided by 25, which is 8 mL.",
    ],
    [
      "Which size oral syringe should I use?",
      "The smallest one that holds the whole dose in a single draw. Measuring 0.6 mL in a 10 mL syringe is far less accurate than in a 1 mL syringe, and safety guidance advises against using a syringe when the dose fills less than roughly 40% of the barrel and a smaller size is available.",
    ],
    [
      "What if the dose falls between two markings on the syringe?",
      "You can only measure to the nearest printed graduation, so the tool shows the dose that marking actually delivers and how far off the prescription it is. If the difference is more than a few percent, or the medicine has a narrow safe range, ask the pharmacist whether to round up or down rather than guessing.",
    ],
  ],
};

export default seo;
