const seo = {
  intro:
    "This estimator calculates the mechanical power a ride demands — rolling resistance, aerodynamic drag and gravity — and converts that work into calories at 24% gross cycling efficiency, the ratio that makes one kilojoule of pedalling work cost almost exactly one kilocalorie. Because it models the physics rather than looking up a single activity code, it responds properly to gradient, headwind, tyre and surface type, and the weight of the bike as well as the rider. The 2011 Compendium of Physical Activities MET figure is shown alongside for comparison, and the two often differ because MET values were measured over mixed real-world riding.",
  useCases: [
    "Working out the energy cost of a 20 km commute at 25 km/h before deciding what to eat afterwards",
    "Comparing a flat road ride against the same distance on a 6% climb, where gravity becomes the dominant resistance",
    "Seeing how much a 15 km/h headwind adds to the effort on an otherwise easy training ride",
  ],
  benefits: [
    ["Physics, not a lookup table", "Gradient, wind, surface and total mass all change the answer."],
    ["Shows the breakdown", "See what share of your power goes to drag, rolling resistance and climbing."],
    ["Two methods side by side", "Power-model calories and the Compendium MET figure, so you can judge the range."],
  ],
  faqs: [
    [
      "How many calories does cycling 20 km burn?",
      "For a 75 kg rider on a road bike at 25 km/h on flat tarmac, roughly 300 kcal — about 105 watts of average power for 48 minutes. The same 20 km at 15 km/h into a headwind or up a 4% average gradient can easily double that, which is why distance alone is a poor guide.",
    ],
    [
      "Is one kilojoule really one calorie on a bike?",
      "Near enough. Cyclists convert food energy to pedal work at roughly 20-25% gross efficiency, and at 24% the conversion from kilojoules of work to kilocalories of food energy comes out at 0.996 — so reading kilojoules off a head unit and calling them calories is accurate to within about half a percent.",
    ],
    [
      "Why does this give a lower number than my fitness app?",
      "Most apps use Compendium MET values, which were measured across varied real-world riding and tend to run higher than a steady effort on flat tarmac. Both figures are shown here; the power-model number is the better guide for a controlled ride, and the MET number for stop-start mixed riding.",
    ],
    [
      "Does going faster burn more calories per kilometre?",
      "Yes, and disproportionately, because aerodynamic drag power rises with the cube of speed. Doubling speed from 15 to 30 km/h on the flat multiplies the drag component roughly eightfold, so the per-kilometre cost climbs steeply even though the ride takes half as long.",
    ],
  ],
};

export default seo;
