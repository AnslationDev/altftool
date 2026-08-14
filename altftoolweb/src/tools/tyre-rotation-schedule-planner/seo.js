const seo = {
  title: "Tyre Rotation Planner: Dates, Interval and Pattern",
  metaDescription:
    "Plan rotation dates from your odometer and monthly km with the six-month cap, and get the right pattern: forward cross, rearward cross, X or same-side.",
  steps: [
    "Enter \"Current odometer (km)\", \"Rotation interval (km)\", \"Average running (km per month)\" and \"Last rotation / start date\", plus \"Rotations to plan\" and \"Labour cost per rotation (INR)\".",
    "Set Drivetrain to \"Front wheel drive (FWD)\", \"Rear wheel drive (RWD)\" or \"All wheel drive / 4x4 (AWD)\" and Tyre tread to \"Standard (non-directional)\" or \"Directional tread\", then tick \"Staggered fitment\" or \"Include a full-size matching spare\" if they apply.",
    "\"Next rotation due at\" gives the odometer reading and approximate date and says whether it is distance- or time-limited; below it the named pattern lists each move, such as Left front to Left rear, and the Schedule table dates every rotation.",
  ],
  intro:
    "A tyre rotation schedule planner works out when each of your four tyres should change corner, and which corner it should move to, based on your drivetrain and your monthly running. It applies the two rules tyre makers publish together: a distance interval of roughly 8,000-10,000 km and a time cap of about six months, whichever comes first. The pattern it recommends follows the standard forward cross, rearward cross and X-pattern rules, with separate handling for directional tread and staggered fitments.",
  useCases: [
    "Working out the next four rotation dates for a front wheel drive hatchback that covers about 1,200 km a month",
    "Checking whether a rear wheel drive SUV should use the rearward cross rather than the diagonal X-pattern",
    "Deciding how to rotate directional tyres, which can only move front to rear on the same side",
  ],
  benefits: [
    ["Correct pattern, not a guess", "Picks forward cross, rearward cross, X-pattern or same-side based on drivetrain and tread."],
    ["Time cap applied", "Low-mileage cars get the six-month limit instead of an interval they would never reach."],
    ["Five-tyre option", "Includes the full-size spare in the cycle so all five tyres wear evenly."],
  ],
  faqs: [
    [
      "How often should tyres be rotated?",
      "Every 8,000-10,000 km, or every six months, whichever comes first. The six-month cap is for low-mileage cars that would otherwise take longer than six months to cover that distance. The interval exists because driven and steered wheels wear far faster than the others, so swapping positions evens out tread depth across the set.",
    ],
    [
      "What is the correct rotation pattern for a front wheel drive car?",
      "The forward cross: both front tyres move straight back, and the rear tyres cross over to the opposite front corner. Rear wheel drive vehicles use the mirror image, the rearward cross, where the rears move straight forward and the fronts cross to the rear. All wheel drive and 4x4 vehicles typically use the X-pattern instead, where every tyre moves diagonally to the opposite corner.",
    ],
    [
      "Can directional tyres be rotated?",
      "Yes, but only front to rear on the same side of the car. A directional tread has an arrow on the sidewall showing its rolling direction, and moving it across the car would run it backwards, which hurts wet grip and increases noise.",
    ],
    [
      "Does rotating tyres actually save money?",
      "It typically adds meaningful life to a set by keeping wear even, so all four tyres reach the 1.6 mm legal minimum at about the same time instead of two wearing out early. Rotation is usually cheap or free with a wheel balance, so the payback is easy. Ask your workshop to confirm the pattern your handbook specifies.",
    ],
  ],
};

export default seo;
