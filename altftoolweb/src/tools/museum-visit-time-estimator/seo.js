const seo = {
  title: "Museum Visit Time Estimator: How Long It Really",
  metaDescription:
    "Estimates a visit from objects on display and your pace, using the 17-21 second median look recorded at the Met and the Art Institute of Chicago.",
  steps: [
    "Enter the Museum, Objects on display and Gallery rooms, then pick 'Your viewing pace' — each option prints its seconds per object and the share of works you stop at.",
    "Set 'Works you will give real time to' and 'Seconds on each of those', then fill 'Everything that is not looking': queue and tickets, cloakroom, café, shop, Rest break length and 'Time you actually have (min, 0 to skip)'.",
    "Read Total visit time with 'Objects you will stop at', 'Share of the collection seen' and the rest-break count, check 'In the time you actually have', then press Copy estimate.",
  ],
  intro:
    "Estimates how long a museum visit actually takes by combining the collection's size with measured visitor behaviour: timing studies at the Metropolitan Museum of Art recorded a median of 17 seconds spent in front of a single work, and a repeat at the Art Institute of Chicago recorded 21 seconds. Those medians, the share of objects a visitor stops at, walking time between rooms, queue and cloakroom time, and a sit-down break for each hour of gallery time are added together — and the calculation also runs backwards to say how much of a collection fits in the hours you actually have.",
  useCases: [
    "Deciding whether the Louvre fits into an afternoon or needs a whole day before booking a timed ticket",
    "Planning a museum stop between a hotel checkout and an evening train without missing the train",
    "Setting a realistic route with children, where the honest answer is one wing rather than the whole building",
  ],
  benefits: [
    ["Built on timing studies", "Per-object times come from published visitor research, not from an assumption about how long art takes."],
    ["Answers the reverse question", "Give it the hours you have and it returns the number of objects and the share of the collection."],
    ["Fatigue treated as real", "Schedules a rest per hour of gallery time and flags visits past the point where attention has gone."],
  ],
  faqs: [
    [
      "How long do people actually look at a painting?",
      "About 17 to 21 seconds at the median. Smith and Smith timed visitors at the Metropolitan Museum of Art in 2001 and found a median of 17 seconds per work; Smith, Smith and Tinio repeated the method at the Art Institute of Chicago in 2017 and found a median of 21 seconds with a mean of 28.6 seconds. Means run higher than medians because a few visitors linger for several minutes.",
    ],
    [
      "How much time should I allow for a large museum?",
      "For a big national collection, three to four hours is a realistic single visit including the queue, cloakroom and a break, and that will still only cover a fraction of what is on display. Seeing everything in a museum like the Louvre or the Hermitage is not a scheduling problem, it is an arithmetic impossibility — at 20 seconds an object, 35,000 objects is over 190 hours of looking.",
    ],
    [
      "What is museum fatigue?",
      "The measurable decline in attention, stopping frequency and time per object as a visit continues. Benjamin Ives Gilman named the effect in 1916 and it has been repeatedly confirmed since; visitors stop at fewer objects and look at them for less time in the later rooms regardless of what is in them. A ten-minute sit-down each hour restores the pace better than pushing through.",
    ],
    [
      "Should I book a timed ticket for a museum?",
      "Yes wherever one is offered — it is the single biggest saving in a visit plan. Door queues at major museums routinely run 20 to 45 minutes at peak times and can exceed an hour in high season, which is time subtracted directly from the galleries. Early slots also tend to be quieter than late morning.",
    ],
  ],
};

export default seo;
