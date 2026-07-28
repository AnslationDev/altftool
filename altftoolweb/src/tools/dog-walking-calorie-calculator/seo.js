const seo = {
  intro:
    "The Dog Walking Calorie Calculator works out the energy you burn on a walk by scoring moving time and sniff-stop time separately, using the ACSM equation kcal/min = MET x 3.5 x body mass in kg / 200 with 2011 Compendium of Physical Activities walking values (2.8 METs at 3.2 km/h up to 5.0 METs at 6.4 km/h, and 1.3 METs for standing still). It also gives your dog's resting and maintenance energy requirement from the veterinary allometric equation RER = 70 x body weight in kg to the power 0.75, and compares your daily walk time to usual exercise guidance for the dog's energy level.",
  useCases: [
    "See what two 45-minute walks a day actually contribute to your weekly energy expenditure.",
    "Understand why a stop-start puppy walk burns far less than a continuous walk of the same length.",
    "Get a starting daily calorie figure for a 20 kg neutered adult dog before discussing food portions with your vet.",
    "Check whether a single 20-minute walk is enough for a high-energy working breed.",
  ],
  benefits: [
    [
      "Sniff stops counted honestly",
      "Standing still is 1.3 METs, not walking intensity, so a stop-heavy walk is not overstated.",
    ],
    [
      "Both ends of the lead",
      "You get your own calories and your dog's daily energy requirement from the standard veterinary formula.",
    ],
    [
      "Daily and weekly totals",
      "Walks per day roll up into the numbers that actually matter for energy balance.",
    ],
  ],
  faqs: [
    [
      "How many calories does walking the dog burn?",
      "A 70 kg person walking 45 minutes at a moderate 4.8 km/h pace, with 20% of the time spent standing at sniff stops, burns about 169 kcal gross and 114 kcal above resting. The Compendium's generic walking-the-dog row is 3.0 METs, close to the 3.06 effective intensity that stop-start walk works out to.",
    ],
    [
      "How much exercise does a dog need each day?",
      "Commonly cited guidance is around 30 minutes a day for low-energy, flat-faced or senior dogs, roughly an hour for most companion breeds, and two hours or more for working, herding and sporting breeds. Age, joints, heat and individual health matter more than body size, so ask your vet for your dog specifically.",
    ],
    [
      "How many calories should my dog eat per day?",
      "Start from RER = 70 x body weight in kg to the power 0.75, then multiply by a life-stage factor — commonly 1.6 for a neutered adult, 1.8 intact, 2.0 for an active dog and 1.0 for vet-supervised weight loss. For a 20 kg neutered adult that is about 1,060 kcal a day. This is an estimate only; your vet should confirm the target and the food.",
    ],
    [
      "Does dog walking count as exercise for me?",
      "Yes, if you keep moving. A brisk 5.6 km/h pace is 4.3 METs, which counts as moderate-intensity activity under physical activity guidelines that call for 150 minutes of moderate activity per week. A very stop-start walk can fall to around 1.5 METs, which is barely above sitting.",
    ],
  ],
};

export default seo;
