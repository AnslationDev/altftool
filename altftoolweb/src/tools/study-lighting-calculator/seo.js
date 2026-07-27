const seo = {
  intro:
    "This calculator sizes study-room lighting with the lumen method: installed lumens = (target lux x floor area) / (utilisation factor x maintenance factor), where the utilisation factor is read against the room index K = (L x W) / (Hm x (L + W)) and Hm is measured from the 0.75 m desk plane, not the floor. It applies the maintained illuminance targets used in EN 12464-1 and IS 3646 Part 1 — 300 lux for general room lighting, 500 lux for reading and writing, 750 lux for drafting. Useful when you are wiring a child's study, converting a bedroom corner into a work desk, or checking whether one ceiling light is genuinely enough.",
  useCases: [
    "Deciding how many 20 W LED battens a 12 x 10 ft study needs to reach 500 lux on the desk instead of guessing from wattage",
    "Working out the lumen rating of a desk lamp when the ceiling light only delivers about 300 lux",
    "Checking that fittings are not spaced further apart than 1.25 times their height above the desk, which is what causes dim patches between them",
  ],
  benefits: [
    ["Lux, not watts", "Sizes the scheme from measured illuminance targets, so LED and old tube ratings compare fairly."],
    ["Room index applied", "Small or high rooms get a lower utilisation factor automatically, the way a real lighting layout does."],
    ["Layout as well as count", "Returns the grid, the spacing and the wall offset, plus a warning when the spacing is too sparse."],
  ],
  faqs: [
    [
      "How many lux do you need for studying?",
      "500 lux maintained on the desk is the figure EN 12464-1 and IS 3646 give for reading, writing and typing, with 300 lux enough for general movement around the room and 750 lux for technical drawing. Illuminance is measured on the task itself at about 0.75 m above the floor, not at the ceiling.",
    ],
    [
      "How many lumens does a study room need?",
      "Divide the target lux by the utilisation and maintenance factors, then multiply by floor area: a 10.5 sqm room at 500 lux with a utilisation factor of 0.42 and a maintenance factor of 0.8 needs about 15,600 installed lumens, or eight 2,000 lumen battens. Rooms with dark walls or high ceilings need noticeably more for the same target.",
    ],
    [
      "Is a desk lamp better than a brighter ceiling light?",
      "A desk lamp is usually the cheaper way to hit 500 lux, because it only has to light about half a square metre rather than the whole floor. Lighting the room to 300 lux and adding a lamp of roughly 200 to 350 lumens over the page typically uses around a third less connected load than pushing the ceiling scheme to 500 lux everywhere.",
    ],
    [
      "Where should a study lamp be placed?",
      "Place it on the side opposite your writing hand — left side for a right-handed person — about 400 mm above the page, so your hand does not cast a shadow on the line you are writing. Angle the head away from your eyes and avoid putting the desk directly facing a bright window or a bare bulb, since the contrast is what causes eye strain.",
    ],
  ],
};

export default seo;
