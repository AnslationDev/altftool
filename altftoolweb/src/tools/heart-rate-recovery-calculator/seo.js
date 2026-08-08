const seo = {
  title: "Heart Rate Recovery Calculator (HRR1 and HRR2)",
  metaDescription:
    "Enter peak HR and your pulse at 60 and 120 seconds for HRR1 and HRR2, checked against the 12 bpm cool-down and 18 bpm supine cut-offs.",
  steps: [
    "Enter Peak heart rate (bpm) and Heart rate at 1 minute (bpm); Heart rate at 2 minutes and Resting heart rate are optional.",
    "Answer 'What did you do right after stopping?' so the 12 bpm cool-down or the 18 bpm supine cut-off is the one applied.",
    "'One-minute recovery (HRR1)' shows with your fitness band, Two-minute recovery (HRR2), the drop in the second minute alone and HRR1 as a % of peak and of heart rate reserve; press Copy result.",
  ],
  intro:
    "Heart rate recovery is the number of beats your pulse falls in the first minute after stopping exercise: HRR1 = peak heart rate − heart rate at 60 seconds, with HRR2 measured the same way at 120 seconds. This calculator reports both, expresses them as a share of peak heart rate and of heart rate reserve, and compares HRR1 against the published cut-offs — 12 bpm after an active cool-down (Cole et al., NEJM 1999) or 18 bpm when recovery is seated or supine (Watanabe et al., Circulation 2001). It is a fitness and monitoring aid, not a diagnostic test.",
  useCases: [
    "Check whether the drop after your monthly hill-repeat test is improving as aerobic base training accumulates.",
    "Compare recovery after an active walking cool-down with recovery sitting down, using the correct threshold for each.",
    "Track how a heavy training block or a poor night's sleep blunts your usual one-minute drop.",
    "Record the numbers from a supervised treadmill test so you can discuss them at a follow-up appointment.",
  ],
  benefits: [
    [
      "Protocol-aware thresholds",
      "Applies the 12 bpm cool-down cut-off or the 18 bpm supine cut-off depending on what you actually did.",
    ],
    [
      "One and two minute figures",
      "Reports HRR1, HRR2 and the drop in the second minute alone, which fades much faster than the first.",
    ],
    [
      "Relative as well as absolute",
      "Shows recovery as a percentage of peak heart rate and of heart rate reserve, so results compare across fitness levels.",
    ],
  ],
  faqs: [
    [
      "What is a good heart rate recovery after 1 minute?",
      "A drop of 30 bpm or more in the first minute is typical of a recreationally fit adult, 40 to 50 bpm is good, and above 50 bpm is common in trained endurance athletes. Below about 20 bpm suggests limited aerobic conditioning, and 12 bpm or less after an active cool-down is the value flagged as abnormal in the research.",
    ],
    [
      "How do I measure heart rate recovery correctly?",
      "Note your peak heart rate as you stop, start a timer immediately, hold one posture, and record the reading at exactly 60 seconds and again at 120 seconds. Posture matters enormously — lying down produces a much larger drop than walking — so keep the protocol identical every time you retest.",
    ],
    [
      "Does a low heart rate recovery mean I have heart problems?",
      "Not on its own. A slow one-minute recovery has been linked to higher cardiovascular risk in large treadmill-testing studies, but a single reading from a wrist monitor after a gym session is not a diagnosis. Beta-blockers, dehydration, heat, illness and simply stopping in a different posture all reduce the figure. Persistent slow recovery is worth raising with a doctor.",
    ],
    [
      "Can I improve my heart rate recovery?",
      "Yes. Consistent aerobic training — several easy-to-moderate sessions a week — improves parasympathetic reactivation and typically raises the one-minute drop over weeks to months. Adequate sleep, hydration and limiting alcohol also help, while overreaching in training tends to flatten it temporarily.",
    ],
  ],
};

export default seo;
