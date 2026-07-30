const seo = {
  intro:
    "The Omega-3 Intake Calculator converts your weekly servings of fish, seeds, walnuts and any daily supplement into an average EPA + DHA figure in milligrams per day, then scores it against a 250 mg/day minimum and a 1,000 mg/day optimal target. It uses per-serving estimates of roughly 1,500 mg for salmon or mackerel, 1,200 mg for sardines or anchovies, 300 mg for leaner fish, and about 100 mg of EPA/DHA equivalent for plant sources after accounting for poor ALA conversion. It is for anyone wondering whether their actual eating pattern gets them near the intakes cited in heart and brain health guidance.",
  useCases: [
    "You eat salmon twice a week and nothing else oily, and you want to know whether a supplement is worth adding or whether you are already past the 250 mg/day mark.",
    "You are vegetarian and rely on chia and walnuts, and you want to see how far ALA-based sources actually get you once the inefficient conversion to EPA and DHA is taken into account.",
    "You have a fish-oil capsule listing 500 mg combined EPA+DHA and want to check what your total daily intake becomes once your usual two or three fish meals a week are added in.",
  ],
  benefits: [
    ["Weekly eating, daily number", "You log servings the way you actually eat — per week — and it averages the total across seven days so it lines up with per-day guidance."],
    ["Plant sources counted honestly", "Flax, chia and walnuts are credited at roughly 100 mg EPA/DHA equivalent per serving rather than their raw ALA content, because conversion in the body is only a few percent."],
    ["Scored, not just totalled", "The result is banded as deficient, adequate or optimal against the 250 mg and 1,000 mg thresholds, so you know whether to change anything."],
  ],
  faqs: [
    [
      "How much omega-3 should I get per day?",
      "Commonly cited guidance is at least 250–500 mg of combined EPA and DHA per day for general health, with 1,000 mg or more discussed for cardiovascular and cognitive benefit. This calculator flags anything under 250 mg/day as deficient and treats 1,000 mg/day as the optimal target. Talk to a clinician before using higher therapeutic doses.",
    ],
    [
      "How much omega-3 is in a serving of salmon?",
      "About 1,500 mg of EPA plus DHA in a 3.5 oz (100 g) serving of salmon or mackerel — the richest common source. Sardines and anchovies come in near 1,200 mg, while leaner fish such as cod or canned light tuna contribute closer to 300 mg per serving.",
    ],
    [
      "Do flaxseed and walnuts count towards omega-3?",
      "Partly. They supply ALA, not EPA or DHA, and the body converts only a small fraction — commonly quoted as around 5% — so a tablespoon of chia or an ounce of walnuts is credited here as roughly 100 mg of EPA/DHA equivalent rather than its much larger ALA figure.",
    ],
    [
      "Can I get enough omega-3 without eating fish?",
      "Yes, but usually only with an algae-oil supplement, because algae provide preformed DHA and EPA that plants do not. Enter the combined EPA+DHA milligrams printed on the label into the supplement field to see whether it carries you to the 1,000 mg/day target; this is informational and not a substitute for medical advice.",
    ],
  ],
};

export default seo;
