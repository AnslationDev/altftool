const seo = {
  intro:
    "This checker works out how much cargo a roof can legally and safely take by subtracting the rack and any carrier from the lower of two ratings: the vehicle's dynamic roof load from the handbook, and the rack system's own rated load. It then checks that the roof load still fits inside gross vehicle mass, since roof weight is part of payload rather than extra to it, and shows what the load does to rollover resistance using NHTSA's Static Stability Factor, track width divided by twice the centre of gravity height. A fuel figure is included from the drag equation, because an added frontal area costs half the air density times CdA times speed squared in extra force for every kilometre driven.",
  useCases: [
    "Checking whether a 20 kg roof box plus two bikes still fits under a 75 kg dynamic roof load once the bars are counted",
    "Confirming a fully loaded family car with a roof box is still inside its gross vehicle mass before a long drive",
    "Seeing how much fuel an empty set of roof bars costs over a motorway journey before deciding whether to remove them",
  ],
  benefits: [
    ["Both ratings compared", "The vehicle limit and the rack limit are checked together, and the lower one is used — the mistake most people make is using only one."],
    ["Rack weight counted", "The bars and the box come off the allowance before any cargo does, which is what the handbook figure actually means."],
    ["Stability quantified", "The load's effect on the centre of gravity is shown as a Static Stability Factor and an NHTSA rollover band, not as vague advice to drive carefully."],
  ],
  faqs: [
    [
      "Does the roof rack count towards the roof load limit?",
      "Yes. The dynamic roof load in the handbook is the total mass on the roof, so the bars, the feet, a roof box and a bike carrier all come out of it before any luggage does. A 75 kg limit with 6 kg of bars and a 20 kg box leaves 49 kg for cargo.",
    ],
    [
      "What is the difference between static and dynamic roof load?",
      "Dynamic roof load is the maximum while the vehicle is moving and is the figure that matters for driving; static roof load applies only when parked and is what a roof tent's occupants are assessed against. The static figure is much higher, and it must come from the manufacturer rather than be assumed as a multiple of the dynamic one.",
    ],
    [
      "How much fuel does a roof box use?",
      "At 100 km/h a large roof box adding roughly 0.30 m² of drag area costs about 1.7 litres per 100 km on a petrol car, and even bare bars adding 0.08 m² cost around 0.4 litres. Because drag rises with the square of speed, the same box costs substantially more at 120 km/h than at 90.",
    ],
    [
      "Is a loaded roof rack dangerous?",
      "It raises the centre of gravity, which lowers rollover resistance measurably: 66 kg on the roof of a typical car can move the Static Stability Factor from about 1.29 to 1.21, a whole NHTSA rollover band. It is manageable within the stated limits, but reduce speed, allow more distance for braking, and be careful with crosswinds and sudden lane changes. Follow the vehicle and rack manufacturers' instructions rather than this estimate.",
    ],
  ],
};

export default seo;
