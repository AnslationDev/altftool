const seo = {
  title: "Future Child Predictor: Eye Color and Hair Type Odds",
  metaDescription:
    "Pick both parents' eye color and hair type for a percentage split of your child's traits, plus name ideas. Entertainment only - no photo, no upload.",
  steps: [
    "Type Father's Name and Mother's Name, then choose Father's Eye Color and Mother's Eye Color from Brown, Blue or Green.",
    "Set Father's Hair Type and Mother's Hair Type to Straight, Wavy or Curly, then press \"Predict Future Child Profile\".",
    "Read the Genetics & Trait Profile percentages with the name, personality and hobby suggestions, then press Download to save child-genetics-report.txt.",
  ],
  intro:
    "Future Child Predictor takes both parents' names plus their eye colour (brown, blue or green) and hair type (straight, wavy or curly) and returns a percentage split for the child's likely eye colour and hair, with name, personality and hobby suggestions attached. The trait percentages come from a fixed dominant/recessive style lookup — for instance straight-haired and curly-haired parents produce 70% wavy, 15% straight and 15% curly. No photos or uploads are involved: everything is derived from the six fields you pick, and the name-based parts are seeded by an order-independent hash so the same couple always gets the same report.",
  useCases: [
    "A couple planning ahead wants to see, in one screen, what the rough odds look like if one of them has green eyes and the other brown.",
    "Friends filling out a baby-shower prediction card need a printable line for eye colour, hair type and a guessed name, and download the text report to copy from.",
    "Someone curious whether two wavy-haired parents can have a straight-haired child checks the split and gets 25% straight, 50% wavy, 25% curly.",
  ],
  benefits: [
    ["Every parent pairing is covered", "Each of the six eye-colour pairings and six hair-type pairings maps to its own percentage split rather than one generic answer."],
    ["Deterministic by design", "Names are hashed after being sorted, so swapping who is entered as father and mother does not change the suggested names or personality."],
    ["Complete written report", "Eye and hair percentages, two boy names, two girl names, a personality profile and a hobby all come out as one copyable text block."],
  ],
  faqs: [
    [
      "Can two blue-eyed parents have a brown-eyed child?",
      "In this tool, no — two blue-eyed parents return 99% blue and 1% green, with brown at zero. In real genetics eye colour is controlled by several genes and rare exceptions do occur, so treat the figure as a simplification rather than a rule.",
    ],
    [
      "What does it predict for two curly-haired parents?",
      "80% curly and 20% wavy, with straight at zero. Two straight-haired parents sit at the other end of the table with 95% straight and 5% wavy.",
    ],
    [
      "Do I need to upload a photo?",
      "No. The tool asks only for two names, two eye colours and two hair types — six fields in total — and produces the full report from those, so nothing is uploaded and nothing is stored.",
    ],
    [
      "Is this a real genetic test?",
      "No, it is entertainment. Real trait inheritance is polygenic and cannot be predicted from a parent's visible eye or hair type alone, and the personality and hobby lines here are simply picked from four and six fixed descriptions; for anything medical, consult a doctor or genetic counsellor.",
    ],
  ],
};

export default seo;
