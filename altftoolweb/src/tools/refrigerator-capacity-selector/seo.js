const seo = {
  title: "Refrigerator Size Calculator: Litres",
  metaDescription:
    "Fridge litres from a 60 L base plus 55 L per adult and 30 L per child, adjusted for cooking, shopping and frozen use, then matched to real sizes.",
  steps: [
    "Enter Adults in the home and Children under 12, then pick a Cooking style — Mostly eat out or order in, Regular home cooking, or Heavy cooking, batch prep or frequent guests.",
    "Set \"How often you shop for groceries\" (daily fresh through fortnightly or monthly bulk buy), your Diet and your Frozen food use.",
    "Recommended capacity comes back in litres with the format that fits, freezer and fresh-food volumes and litres per person, and the \"How the number was built\" table lists every element and its effect; Copy result copies it.",
  ],
  intro:
    "This selector converts household habits into a refrigerator capacity in litres using an explicit additive model: a 60 litre base for door bins and staples, 55 litres per adult and 30 litres per child, then multipliers for cooking style, shopping frequency, diet and frozen food use. The output is matched to the gross capacities actually sold — 190, 215, 240, 265, 292, 340, 407, 465 litres and up — and to the door format that fits. Every constant is shown in the breakdown so you can judge the assumptions rather than trust a black box.",
  useCases: [
    "Decide between a 240 L single door and a 265 L double door for a family of four that shops weekly.",
    "Size a fridge for a shared flat where everyone cooks separately and buys groceries in bulk.",
    "Check whether a household that shifted to fortnightly bulk shopping has outgrown its current fridge.",
  ],
  benefits: [
    ["Habits, not just headcount", "Bulk shopping and frozen food change the answer more than one extra person does."],
    ["Matched to real catalogue sizes", "Rounds up to a capacity you can actually buy instead of an arbitrary number."],
    ["Shows the working", "Every litre and multiplier is listed, so you can adjust for your own household."],
  ],
  faqs: [
    [
      "What size refrigerator do I need for a family of 4?",
      "Usually 250-400 litres. A family of four that cooks at home and shops weekly lands near 300-350 L, which is double-door frost-free territory. Bulk shopping, heavy frozen use or frequent guests can push the same family past 450 L.",
    ],
    [
      "How many litres of fridge per person?",
      "Roughly 80-110 litres per person once the fixed base volume is shared out, but the ratio falls as the household grows because condiments, door bins and staples do not scale with headcount. A single person often needs 120-190 L while six people rarely need six times that.",
    ],
    [
      "Is a single door or double door refrigerator better?",
      "Single door direct-cool models are cheaper to buy and typically use less electricity for the same litres, but the freezer must be defrosted by hand and capacity tops out around 250 L. Double door frost-free models keep the freezer separate and self-defrosting, which matters once you store frozen food regularly.",
    ],
    [
      "Does a bigger fridge cost much more to run?",
      "Not proportionally. Compare the annual energy figure printed on the BEE star label rather than assuming litres map to units — a 5-star 300 L model can consume less than a 3-star 250 L one. A half-empty large fridge also holds temperature better than a crammed small one.",
    ],
  ],
};

export default seo;
