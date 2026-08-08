const seo = {
  title: "Football Calorie Burn Calculator: MET by Position",
  metaDescription:
    "Calories burned playing football from MET 10 for competitive play, scaled by the distance your position covers — 5.6 km keeper to 11.5 km midfield.",
  intro:
    "The Football Calorie Burn Calculator estimates how many calories a match or training session costs you, using the MET equation kcal/min = MET x 3.5 x body weight in kg / 200 from the Compendium of Physical Activities. Competitive 11-a-side play is rated at 10 METs and casual play at 7 METs, and the result is then scaled by how far your position actually runs — from roughly 5.6 km for a goalkeeper to about 11.5 km for a central midfielder over 90 minutes. It is built for players, coaches and five-a-side regulars who want a defensible number rather than a wristwatch guess.",
  useCases: [
    "Work out what a full 90-minute league match costs you as a central midfielder versus a centre-back at the same body weight.",
    "Compare a 60-minute training session of drills and small-sided games with a Sunday-league kickabout of the same length.",
    "Estimate the calories a substitute burns in 25 minutes so post-match refuelling matches the actual workload.",
    "Show a youth squad how goalkeeper, full-back and winger workloads differ across a season of matches.",
  ],
  benefits: [
    ["Position-aware", "Match GPS distances scale the MET value, so a winger and a keeper never get the same answer."],
    ["Published MET values", "Intensities come from the Compendium of Physical Activities, not from invented multipliers."],
    ["Gross and net burn", "Shows total calories and the figure net of the calories you would have burned resting."],
  ],
  faqs: [
    [
      "How many calories does playing football burn?",
      "A 70 kg central midfielder burns roughly 1,170 kcal in a competitive 90-minute match. That comes from 10 METs for competitive soccer, scaled up about 6% for midfield running volume, giving around 13 kcal per minute; a casual kickabout at 7 METs is around 820 kcal for the same player.",
    ],
    [
      "Does your position change how many calories you burn in football?",
      "Yes, substantially. Elite match analysis puts central midfielders and wingers around 11.5 km per match, centre-backs near 9.9 km and goalkeepers around 5.6 km, so a keeper burns roughly half what a midfielder does over the same 90 minutes.",
    ],
    [
      "What is a MET and why is it used to calculate calories?",
      "One MET is the oxygen cost of sitting quietly, about 3.5 ml of oxygen per kilogram per minute. Multiplying an activity's MET value by 3.5, by your weight in kilograms, and dividing by 200 converts that oxygen cost into kilocalories per minute, which is the standard method behind most published activity tables.",
    ],
    [
      "Is the calorie figure the same as what my fitness watch shows?",
      "Rarely, and neither number is exact. MET tables describe an average adult and ignore heat, pitch size, altitude and your individual efficiency, while watches infer burn from heart rate and their own proprietary models. Treat both as informational estimates and consult a sports dietitian before using them to plan weight change.",
    ],
  ],
};

export default seo;
