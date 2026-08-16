const seo = {
  title: "Compost Calculator: Browns & Yield from Scraps",
  metaDescription:
    "Enter your weekly kitchen waste to get the browns needed for a ~30:1 C:N blend, realistic compost yield, bin size and landfill waste diverted.",
  steps: [
    "Enter 'Kitchen waste a week (kg)' and pick what the waste mostly is — mixed kitchen scraps, vegetable peel, coffee grounds or grass clippings — each option showing its C:N ratio.",
    "Choose the brown material you can add (dry leaves 60:1, shredded paper 170:1, cardboard 350:1 …), a target starting C:N near 30, and the weeks a batch takes to mature.",
    "Read the finished-compost-per-year headline plus the browns to add each week, the greens-to-browns blend by dry weight, bin volume in litres and waste diverted, then hit 'Copy result'.",
  ],
  intro:
    "Composting kitchen waste is a mass balance: water evaporates, roughly half the dry organic matter is respired away as CO2 by the microbes, and what remains is finished compost at around 40% moisture. This estimator runs that balance on your weekly waste, and first solves the carbon-to-nitrogen blend — kitchen scraps sit near 20:1 and a pile works best near 30:1, so it calculates exactly how much dry brown material to add by weight.",
  useCases: [
    "Sizing a home compost bin before buying one, from the volume a full cycle actually needs",
    "Working out how many bags of dry leaves or shredded paper to save each week to balance the scraps",
    "Estimating how much of a household's waste stream a compost bin genuinely removes from landfill",
  ],
  benefits: [
    ["Solves the C:N blend for you", "Balances greens and browns on dry weight, the way the chemistry actually works."],
    ["Realistic yield, not a guess", "Models water loss and carbon respiration separately instead of applying a flat percentage."],
    ["Values the output", "Reports the nitrogen in your compost and what that is worth as urea equivalent."],
  ],
  faqs: [
    [
      "How much compost do you get from kitchen waste?",
      "Around 25 to 35% of the wet weight you put in, once the browns are included. Most of the loss is water evaporating, with roughly half the dry organic matter respired away as carbon dioxide, so 60 kg of mixed feedstock a year yields something like 20 kg of finished compost.",
    ],
    [
      "What is the right carbon to nitrogen ratio for compost?",
      "About 25:1 to 30:1 at the start. Below that the pile goes anaerobic and smells of ammonia because there is surplus nitrogen; much above it the pile stays cold because the microbes run short of nitrogen to build cells with. Kitchen scraps are around 20:1, dry leaves 60:1 and cardboard 350:1.",
    ],
    [
      "How many browns do I add to kitchen scraps?",
      "It depends entirely on the brown. Balancing dry leaves at 60:1 against kitchen scraps at 20:1 needs about one part browns to one part greens by dry weight, but cardboard at 350:1 needs only about half a part. Because browns are dry and greens are three-quarters water, the volumes look very different from the weights.",
    ],
    [
      "Should I put meat and dairy in a home compost bin?",
      "Not in an open or passive home heap. They attract rodents and flies and rarely reach the temperature needed to break down safely. Vegetable and fruit peel, coffee grounds, eggshells, and garden material compost cleanly; meat, dairy and cooked oily food are better handled by a sealed bokashi system or municipal collection.",
    ],
  ],
};

export default seo;
