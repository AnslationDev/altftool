const seo = {
  intro:
    "This calculator divides a single shared cab fare between passengers by the kilometres each one actually rode. Fixed charges — base fare, booking fee, tolls and parking — are split equally because they do not change with who is in the car, and the remaining distance fare is spread at a constant rate per kilometre and then cut at every drop point, so each stretch is paid for only by the people still on board. On a ₹450 fare over 20 km with a ₹50 base and drops at 5, 12 and 20 km, the shares come out at ₹50, ₹120 and ₹280.",
  useCases: [
    "Settle an airport cab shared by three colleagues who live in different parts of the city.",
    "Split a nightly office pool car among riders who get down at different stops on the same route.",
    "Show a group why an equal split is unfair to whoever gets out first, with the numbers to prove it.",
  ],
  benefits: [
    ["Segment-wise, not guesswork", "Cuts the route at every drop and shares each stretch only among the riders still in the car."],
    ["Fixed charges handled separately", "Base fare, tolls and parking are divided equally instead of being loaded onto the longest ride."],
    ["Shares always add up", "Whole-rupee amounts are rounded by the largest remainder method, so the total always reconciles to the rounded fare."],
  ],
  faqs: [
    [
      "How do you split a cab fare between passengers going different distances?",
      "Split the fixed charges equally, then divide the distance fare stretch by stretch: the kilometres before the first drop are shared by everyone, the next stretch by whoever is left, and so on. On a 20 km ride with drops at 5, 12 and 20 km, the first passenger pays only a third of the first 5 km while the last passenger carries the final 8 km alone.",
    ],
    [
      "Is it fair to split a shared ride equally?",
      "Only when everyone travels roughly the same distance. If one passenger gets out at 5 km of a 20 km trip, an equal split can make them pay three times what the segment method says — ₹150 instead of ₹50 on a ₹450 fare. Equal splitting is simple, but it quietly subsidises the longest ride.",
    ],
    [
      "Should tolls and the base fare be shared equally?",
      "Yes. A base fare, booking fee, toll or parking charge is incurred once for the whole trip and does not grow with distance, so every passenger who benefited from the ride shares it equally. Only the per-kilometre portion should follow distance, which is why this tool asks for the two separately.",
    ],
    [
      "What if two people got out at the same place?",
      "Enter the same drop distance for both. They ride identical segments, so they end up with identical shares — the calculation handles duplicate drop points without any special treatment.",
    ],
  ],
};

export default seo;
