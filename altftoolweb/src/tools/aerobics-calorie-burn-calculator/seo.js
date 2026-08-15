const seo = {
  title: "Aerobics Calorie Burn Calculator - MET by Class",
  metaDescription:
    "Calories for low impact (4.8 MET), high impact (8.0), aqua and step classes at three riser heights, plus the walking or running distance that matches.",
  steps: [
    "Enter your Body weight (kg or lb) and Class length (minutes), or tap a preset chip - 30 min, 45 min, 60 min or 75 min. [pages/index.jsx:138-179, 202-211]",
    "Pick a Class type - the dropdown lists each option with its MET value, from Low impact aerobics (4.8 MET) to Step aerobics, 10-12 inch step (9 MET). [pages/index.jsx:183-197; lib.js:35-71]",
    "Read the Calories burned figure with its WHO intensity band and the matching brisk-walk and running distances, then press Copy result - Reset restores the defaults. [pages/index.jsx:102-117, 232-261]",
  ],
  intro:
    "The Aerobics Calorie Burn Calculator converts a class type and length into calories with the ACSM equation kcal/min = MET x 3.5 x kg / 200. Aerobics is one of the best-covered activities in the Compendium of Physical Activities, which lists separate values for low impact (4.8 MET), water aerobics (5.3), high impact (8.0) and step classes at three riser heights (5.5, 7.3 and 9.0 MET) — and the tool also reports the walking or running distance that would cost the same energy.",
  useCases: [
    "Decide whether to move from a 4-inch step to a 6-8 inch riser once a class stops feeling hard.",
    "Compare an aqua aerobics class against a low-impact studio class when managing joint pain.",
    "Translate a 45-minute class into the equivalent walking distance for a step-based fitness goal.",
    "Check whether your regular class counts as moderate or vigorous intensity for weekly activity targets.",
  ],
  benefits: [
    ["Step height priced properly", "A 10-12 inch riser is rated 9.0 MET against 5.5 for a 4-inch step — well over half again as much."],
    ["Distance equivalents", "Shows the brisk-walk and run distance that costs the same energy as the class."],
    ["Intensity band labelled", "Each class is marked moderate or vigorous against the 6 MET guideline threshold."],
  ],
  faqs: [
    [
      "How many calories does a 45-minute aerobics class burn?",
      "About 473 kcal for a 75 kg adult in a high-impact class (8.0 MET), around 284 kcal in a low-impact class (4.8 MET), and up to 532 kcal in a step class using a 10-12 inch riser (9.0 MET). Scale roughly in proportion to your own body weight.",
    ],
    [
      "Is low impact aerobics still worth doing?",
      "Yes. At 4.8 MET it sits just under the 6 MET vigorous-intensity threshold, so it still counts toward the 150 minutes of moderate activity per week in the WHO guidelines, and it removes the joint loading of jumping. High impact reaches 8.0 MET and counts toward the vigorous target instead.",
    ],
    [
      "Does step height really change the calorie burn that much?",
      "Yes — it is the single biggest variable in a step class. The published values are 5.5 MET for a 4-inch step, 7.3 MET for 6-8 inches and 9.0 MET for 10-12 inches, so raising the riser from 4 to 10 inches lifts the energy cost by more than half for the same choreography.",
    ],
    [
      "Does water aerobics burn fewer calories?",
      "Slightly, at 5.3 MET against 8.0 for a high-impact studio class, but water supports body weight and adds resistance in every direction, which makes it far easier on joints. It is a reasonable substitute when impact is the limiting factor rather than effort.",
    ],
  ],
};

export default seo;
