const seo = {
  intro:
    "A brick quantity calculator turns wall length, height and thickness into the number of bricks, the mortar volume and the cement and sand inside that mortar. It counts bricks by the nominal cell each one fills — brick size plus one mortar joint in all three directions, so a 190 × 90 × 90 mm brick with a 10 mm joint occupies exactly 0.002 m³ and gives the familiar 500 bricks per cubic metre — then takes the leftover volume as mortar and bulks it by 1.33 before splitting it by the cement : sand ratio. It is aimed at masons, contractors and homeowners pricing a wall before ordering.",
  useCases: [
    "Ordering bricks and cement for a 10 m × 3 m boundary wall in 230 mm brickwork after deducting a 2 m² gate opening",
    "Comparing how many bricks a 110 mm half-brick partition needs against the same wall built one brick thick",
    "Checking a supplier's quantity for AAC blocks, where the 600 × 200 × 100 mm block size changes the count per square metre completely",
  ],
  benefits: [
    ["Joint thickness matters", "A 10 mm joint versus a 15 mm joint changes both the brick count and the mortar volume, and both are recalculated."],
    ["Mortar broken down", "Wet mortar, dry mortar, cement bags, sand in m³, cft and kg, and mixing water — not just a brick number."],
    ["Six brick standards", "Indian modular and traditional, UK, US modular and AAC block sizes, plus a fully custom size."],
  ],
  faqs: [
    [
      "How many bricks are there in 1 cubic metre of brickwork?",
      "500 standard Indian modular bricks of 190 × 90 × 90 mm laid with a 10 mm joint, because each brick plus its joint fills 0.2 × 0.1 × 0.1 = 0.002 m³. A 230 × 110 × 70 mm traditional brick with the same joint gives about 434 per cubic metre.",
    ],
    [
      "How much mortar does a brick wall need?",
      "Roughly 20 to 25% of the wall volume for traditional brick sizes with a 10 mm joint — a 6.9 m³ wall works out to about 1.6 m³ of wet mortar. Smaller bricks mean more joints and more mortar; large blocks with thin-bed adhesive use far less.",
    ],
    [
      "How do I calculate cement and sand for brickwork mortar?",
      "Multiply the wet mortar volume by 1.33 to get the dry ingredient volume, then split it by the mix ratio. For 1.6 m³ of wet mortar at 1:6 that is 2.12 m³ dry, giving 0.30 m³ of cement — about 8.7 bags of 50 kg — and 1.82 m³ of sand.",
    ],
    [
      "What wastage allowance should I add when ordering bricks?",
      "5% is a normal allowance for breakage in transit and cutting; go to 10% for long haulage, soft handmade bricks, or a wall with many cut closers around openings. The allowance covers breakage only, so add separately for any bricks you plan to hold back as spares.",
    ],
  ],
};

export default seo;
