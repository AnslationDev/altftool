const seo = {
  title: "Tennis Calorie Burn Calculator: Per Set and Match",
  metaDescription:
    "Calories per set and per match from body weight, sets and minutes per set, using Compendium METs: singles 8.0, doubles 6.0, general 7.3, drills 5.0.",
  steps: [
    "Enter your Body weight (kg or lb) and pick the Format played — Singles match (8 MET), Doubles match (6 MET), general play (7.3) or hitting drills (5).",
    "Set Sets played (up to 7) and Average minutes per set — the totals recalculate as you type, with no submit button.",
    "Read the total calories with the Calories per set row and the side-by-side cost of every other tennis format for the same court time, then press Copy result.",
  ],
  intro:
    "The Tennis Calorie Burn Calculator estimates the energy cost of a set and of a full match from your body weight and time on court, using the MET equation kcal/min = MET x 3.5 x kg / 200. Every intensity it offers is a published entry in the Compendium of Physical Activities: singles at 8.0 METs, doubles at 6.0, general play at 7.3 and non-game hitting drills at 5.0. It is aimed at club players, coaches and anyone matching post-match refuelling to the actual workload of the match.",
  useCases: [
    "Price a three-set singles match at 40 minutes a set against the same court time spent in doubles.",
    "Work out the calorie cost of a one-hour coaching session of feeding and drills rather than match play.",
    "Estimate the burn for a long five-set match to plan carbohydrate and fluid intake between sets.",
    "Compare a weekly doubles fixture with a gym session of the same length when planning training load.",
  ],
  benefits: [
    ["Per-set figure", "Splits the total into calories per set so you can plan changeover fuelling."],
    ["Published METs only", "Singles, doubles, general play and drills all use Compendium activity codes, not estimates."],
    ["Side-by-side formats", "Shows what the same court time would have cost in every other tennis format."],
  ],
  faqs: [
    [
      "How many calories does an hour of tennis burn?",
      "About 630 kcal for a 75 kg player in singles and about 470 kcal in doubles. Those come from the Compendium values of 8.0 METs for singles and 6.0 METs for doubles applied to the standard MET equation.",
    ],
    [
      "How many calories is one set of tennis?",
      "A 40-minute set of singles costs a 75 kg player around 420 kcal, so a three-set match lands near 1,260 kcal. Shorter, one-sided sets of 25 minutes drop that to roughly 260 kcal per set.",
    ],
    [
      "Why does doubles burn fewer calories than singles?",
      "Doubles splits court coverage between two players, which cuts running volume considerably. The Compendium reflects that with 6.0 METs for doubles against 8.0 METs for singles — about a 25% lower burn rate for the same time on court.",
    ],
    [
      "Should I count warm-up and changeover time?",
      "Enter only the time the set was actually in progress; the published MET values already average in the short changeovers within a set. Long warm-ups or breaks between matches burn far less and would overstate the total if included.",
    ],
  ],
};

export default seo;
