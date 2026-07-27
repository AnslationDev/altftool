const seo = {
  intro:
    "A roof box capacity planner checks a packing list against the two ceilings that actually stop you: the usable litres inside the box and the vehicle's dynamic roof load limit, which must cover the crossbars, the empty box and the contents together. It applies a packing-efficiency factor to the box's gross litre rating, because rigid suitcases leave corner voids and rarely fill more than about 70% of it, then reports which of the two limits you hit first. It also estimates the highway fuel penalty a loaded box adds.",
  useCases: [
    "Deciding before a hill-station trip whether four suitcases and a tent will fit a 400 L box on a hatchback rated for 75 kg on the roof",
    "Checking that crossbars plus an empty 15 kg box still leave enough allowance to be worth fitting at all",
    "Budgeting the extra fuel a roof box costs on a 1,000 km highway run before choosing between the box and a smaller packing list",
  ],
  benefits: [
    ["Both limits at once", "Shows whether litres or kilograms run out first, instead of only one of them."],
    ["Honest volume", "Discounts the gross litre rating by how you actually pack, not by the brochure figure."],
    ["Fuel cost included", "Prices the aerodynamic penalty for your trip distance and local fuel rate."],
  ],
  faqs: [
    [
      "How much weight can I put on my car roof?",
      "Use the dynamic roof load figure in your owner's manual — typically 50 kg to 75 kg on a hatchback or sedan and up to 100 kg on a large SUV — and remember it includes the crossbars and the empty box, not just the luggage. A 75 kg limit with 4 kg bars and a 15 kg box leaves 56 kg for contents, and the box maker's own payload rating may cut that further.",
    ],
    [
      "How many suitcases fit in a 400 litre roof box?",
      "About four medium 70-litre check-in cases, because only around 320 of the 400 litres are usable once you allow for packing gaps. Soft duffels do better than hard shells — they compress into the tapered nose and tail of the box, which rigid cases cannot use at all.",
    ],
    [
      "Does a roof box reduce fuel economy?",
      "Yes — independent road tests put the highway penalty between 10% and 25%, and this planner uses 15% as a working mid-point. On 800 km at 15 km/l that is roughly 8 extra litres, so removing the box when it is empty is worth doing rather than leaving it on all season.",
    ],
    [
      "How fast can you drive with a roof box?",
      "Thule, Yakima and most other makers specify a maximum of 130 km/h, and lower where the local speed limit is lower. Beyond the warranty question, the load sits above the roofline and raises the centre of gravity, which lengthens an emergency lane change — treat the manufacturer figure as a ceiling, not a target, and re-check the straps after the first hour of driving.",
    ],
  ],
};

export default seo;
