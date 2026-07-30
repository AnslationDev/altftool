const seo = {
  intro:
    "The Workout Planner turns a goal, a training level, the days you can train and the equipment you own into a week-by-week block: each session gets an exercise, a set and rep prescription, and a time split of 20% warm-up, 65% main work and the remainder as cooldown. Choose a 4, 8 or 12-week block and every week carries a progression rule — add 2.5% for beginners or 5% otherwise while RPE stays at 8 or below — with week 4 written as a deload at 35% less volume. It also sizes daily calories, protein, water and sleep from your body weight, and tracks adherence and average RPE as you log sessions.",
  useCases: [
    "You have four evenings a week and 45 minutes each, and want those constraints turned into an actual schedule instead of copying a plan built for six days",
    "You are training at home with only dumbbells, so you need the barbell work swapped for goblet squats, floor presses and dumbbell RDLs rather than skipped",
    "You are three weeks into a block, your logged RPE keeps landing at 9, and you want the plan to tell you to hold volume flat instead of pushing the load again",
  ],
  benefits: [
    ["Progression written into every week", "Each week of the block carries its own prescription — a percentage increase gated on RPE, and an explicit deload week rather than an open-ended climb."],
    ["Exercises swapped to your equipment", "Selecting none, basic or full gym rewrites the main lift for each session, so a home plan is a real plan and not a gym plan with gaps."],
    ["Adherence and fatigue read together", "Logged sessions produce a completion percentage and an average RPE, and the coaching note changes at RPE 8.5 and at 70% adherence."],
  ],
  faqs: [
    [
      "How does it work out calories and protein?",
      "Both scale with body weight: calories are weight in kg times 29 for fat loss, 35 for muscle gain and 32 otherwise, and protein is set at 1.8 g per kg. Water is 0.035 L per kg and sleep is 8 hours for a strength block, 7.5 otherwise. These are rough planning starting points, not a prescription — adjust from real results, and see a dietitian or doctor if you have any medical condition.",
    ],
    [
      "What sets and reps does it prescribe?",
      "Four sets for strength, muscle gain and fat loss, three for endurance blocks, with reps of 4 to 6 for strength, 8 to 12 for muscle gain and 12 to 20 for fat loss and conditioning. Those ranges follow the usual load-versus-repetition split rather than any one program's template.",
    ],
    [
      "Why is week 4 lighter than the weeks around it?",
      "It is a planned deload — on any block of four weeks or more, week 4 drops volume by 35% while keeping technique strict, so accumulated fatigue clears before the next push. Every other week says to add 2.5% (beginner) or 5% (intermediate and advanced) if the previous session felt like RPE 8 or easier.",
    ],
    [
      "Can I keep or share the plan?",
      "Yes — the plan exports as JSON and prints to PDF, and everything is generated in the page rather than stored on a server. If you are returning from injury or have a health condition, treat the output as informational and clear it with a physiotherapist or doctor before you start; injury-aware mode only adds a pain-free-range reminder, it does not diagnose anything.",
    ],
  ],
};

export default seo;
