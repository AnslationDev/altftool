const seo = {
  title: "Calorie Deficit Calculator: Goal Weight",
  metaDescription:
    "Turns kg to lose and weeks into a daily deficit using 7,700 kcal per kg, and shows the weekly loss rate that deficit implies.",
  intro:
    "This calculator converts a weight-loss goal and a deadline into the daily calorie deficit it implies, using the standard approximation that one kilogram of body fat stores about 7,700 kcal: daily deficit = kg to lose × 7,700 ÷ (weeks × 7). Enter your current weight, target weight and the number of weeks, and it returns the deficit per day alongside the weekly loss rate that deficit represents. Seeing both together is the point — a target that needs 1,200 kcal a day off is telling you the deadline is wrong, not that you need more willpower.",
  useCases: [
    "You have a wedding, a trek or a medical check-up on a fixed date and want to know whether the weight you had in mind is achievable in the weeks left",
    "Someone told you to \"just cut 500 calories\" and you want to see what that actually delivers over your particular timeline before committing",
    "You are deciding between a 12-week and a 20-week plan for the same goal and want the two daily deficits side by side",
  ],
  benefits: [
    ["Turns a deadline into a daily number", "Instead of a vague goal, you get the exact per-day shortfall the timeline demands, which is the figure you can act on at meals."],
    ["Exposes unrealistic targets immediately", "The weekly loss rate is shown next to the deficit, so a plan that needs 1.5 kg a week is obvious before you start it rather than three weeks in."],
    ["Uses one transparent constant", "The whole calculation rests on the 7,700 kcal-per-kg figure, stated openly, so you know exactly what assumption the answer depends on."],
  ],
  faqs: [
    [
      "What daily deficit do I need to lose 8 kg in 12 weeks?",
      "About 733 kcal per day. That comes from 8 kg × 7,700 kcal ÷ 84 days, and it works out to roughly 0.67 kg of loss per week. Stretch the same 8 kg over 20 weeks and the daily deficit drops to about 440 kcal.",
    ],
    [
      "How many calories are in a kilogram of fat?",
      "Roughly 7,700 kcal, which is the constant this tool uses (the imperial equivalent is about 3,500 kcal per pound). It is an approximation based on the energy density of adipose tissue, and real losses include water and some lean mass, so early weeks often move faster than the maths predicts and later weeks slower.",
    ],
    [
      "Is there a deficit that is too large?",
      "Deficits beyond roughly 1,000 kcal a day, or loss faster than about 1% of body weight per week, are generally where sustainability and nutrient adequacy start to suffer. If the calculator returns a figure in that range, lengthening the timeline is usually the better fix. Anyone considering an aggressive cut should discuss it with a doctor or dietitian first.",
    ],
    [
      "Why has my weight stalled even though I am hitting the deficit?",
      "Because the deficit is measured against maintenance, and maintenance falls as you lose weight — a lighter body burns less at rest and in movement. Recalculate your maintenance every 4-5 kg, and remember day-to-day scale swings of 1-2 kg from water, salt and glycogen can hide real fat loss for a week or more.",
    ],
  ],
};

export default seo;
