const seo = {
  title: "Speed Limit Converter: km/h, mph, Knots, m/s",
  metaDescription:
    "Convert posted limits with exact factors (1 mile = 1609.344 m), plus the nearest multiple of 5 and the time to cover one kilometre and one mile.",
  steps: [
    "Type the number on the sign into Posted speed limit, or tap one of the 30, 50, 60, 80, 100 and 120 preset chips.",
    "Set Sign is posted in and Convert to from Kilometres per hour, Miles per hour, Knots, Metres per second and Feet per second; Swap units reverses the pair.",
    "Read the converted figure with the nearest sign value in multiples of 5, all five units listed, Time to cover 1 km, Time to cover 1 mile and the wrong-unit misread warning, then press Copy result.",
  ],
  intro:
    "This converter turns a posted speed limit from one unit into another — km/h, mph, knots, metres per second or feet per second — using the exact international definitions, where 1 mile is 1609.344 m and 1 nautical mile is 1852 m, so km/h and mph conversion is exact rather than approximated at 1.6. Alongside the precise figure it shows the nearest multiple of 5, because road authorities post limits in fives, and the time the limit takes to cover a kilometre and a mile. It is built for drivers crossing a unit border, riders reading a foreign sign, and anyone checking a rental car's speedometer against the roadside number.",
  useCases: [
    "Work out what a 100 km/h motorway sign in France means for a driver used to reading mph.",
    "Check whether a UK 30 mph built-up-area limit is stricter or looser than the 50 km/h used across most of Europe.",
    "Convert a boat or aircraft speed given in knots into km/h before comparing it with a road or rail figure.",
  ],
  benefits: [
    [
      "Exact, not the 1.6 shortcut",
      "Every factor is a defined value — 1609.344 m per mile, 1852 m per nautical mile — so nothing drifts.",
    ],
    [
      "Sign-realistic rounding",
      "Shows the nearest multiple of 5 next to the exact figure, matching how limits are actually posted.",
    ],
    [
      "Shows the cost of misreading",
      "Tells you how far over the limit you would be if you drove the sign's number in the wrong unit.",
    ],
  ],
  faqs: [
    [
      "How many mph is 100 km/h?",
      "100 km/h is 62.14 mph, found by dividing 100 by 1.609344. A road signed at 100 km/h therefore sits between the 60 mph and 65 mph limits used in mph countries, closer to 60.",
    ],
    [
      "Is a 50 km/h limit the same as 30 mph?",
      "Not exactly — 50 km/h is 31.07 mph, and the UK's 30 mph built-up-area limit is 48.28 km/h, so the UK limit is slightly stricter. The two are treated as equivalent urban limits in practice, but the numbers are about 1.8 km/h apart.",
    ],
    [
      "Which countries post speed limits in mph?",
      "The United Kingdom and the United States are the main ones, along with a small number of territories such as the Bahamas, Belize and several Caribbean islands. Nearly everywhere else posts limits in km/h; Ireland completed its switch from mph to km/h in January 2005.",
    ],
    [
      "Will my speedometer match the converted figure?",
      "Usually it will read a little high. Under UN ECE Regulation 39, which EU and UK type approval follows, a speedometer must never show less than your true speed and may over-read by up to 10% of the true speed plus 4 km/h — so an indicated 100 km/h can be as low as about 87 km/h in reality. Use the vehicle's own GPS or trip computer reading if you need the true figure.",
    ],
  ],
};

export default seo;
