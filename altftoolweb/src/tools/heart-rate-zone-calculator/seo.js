const seo = {
  title: "Heart Rate Zone Calculator with Karvonen Option",
  metaDescription:
    "Turns your age into five bpm zones — Warm Up to Maximum — via 220 minus age, or tick Use Karvonen Method to recompute from heart rate reserve.",
  steps: [
    "Type your Age (years) — 5 to 120 — and optionally tick Use Karvonen Method and enter a Resting Heart Rate (bpm) between 30 and 120.",
    "Press Calculate Zones: max HR is computed as 220 − age, and in Karvonen mode each zone percentage is applied to heart rate reserve (max HR minus resting HR) instead.",
    "Read the five zone cards — Warm Up 50-60% through Maximum 90-100% — each with its bpm range, plus the summary panel showing Max HR, Method and the 220 − age working; Reset clears the form.",
  ],
  intro:
    "This calculator converts your age into five named training zones — Warm Up, Fat Burn, Cardio, Peak and Maximum — using the classic 220 minus age estimate of maximum heart rate. Tick the Karvonen option and add your resting pulse and the same five bands are recalculated from heart rate reserve instead, which raises every boundary to match your own fitness. It suits anyone whose watch or gym machine labels zones this way and who wants the underlying bpm numbers spelled out.",
  useCases: [
    "Your treadmill shows a 'fat burn' band and you want to know the actual bpm range that label maps to for your age.",
    "You are told to keep an easy session below the cardio zone and need the exact ceiling before you start.",
    "You want to see how much the zone edges shift when the maths switches from plain 220 minus age to Karvonen with your resting pulse.",
  ],
  benefits: [
    ["Both methods side by side", "One toggle switches between percentage of max HR and Karvonen heart rate reserve so you can compare the two."],
    ["Named zones with bpm ranges", "Each band shows its number, its label, its percentage window and the beats-per-minute range it works out to."],
    ["Shows the working", "The summary panel prints the formula used, your max HR and, in Karvonen mode, your heart rate reserve."],
  ],
  faqs: [
    [
      "What is the 220 minus age formula?",
      "It estimates maximum heart rate by subtracting your age from 220 — a 35-year-old gets 185 bpm, a 50-year-old 170 bpm. It is the most widely used rule of thumb and the default here, though individual maximums commonly vary by 10-12 bpm from the estimate, so treat the zones as a starting point rather than a hard limit.",
    ],
    [
      "What heart rate should I be in to burn fat?",
      "The Fat Burn band here is 60-70% of maximum heart rate, which for a 40-year-old max of 180 bpm means roughly 108-126 bpm. Fat supplies the largest share of fuel at this moderate intensity, but harder efforts burn more total calories per minute, so which zone is 'better' depends on whether you are optimising fuel mix or total energy cost.",
    ],
    [
      "How does the Karvonen option change the numbers?",
      "It applies each zone percentage to heart rate reserve — max HR minus resting HR — and then adds resting HR back: target = resting + (reserve x percentage). With a max of 185 and a resting rate of 60, the 70% point becomes 148 bpm under Karvonen versus 130 bpm under plain percentage of max, so Karvonen zones sit noticeably higher.",
    ],
    [
      "How much time should I spend in the higher zones?",
      "Peak (80-90%) and Maximum (90-100%) are meant for short intervals rather than sustained work, while most weekly training sits in the Warm Up and Fat Burn bands. This is general fitness information, not a prescription — if you have a heart condition, are on rate-limiting medication such as a beta blocker, or are returning from a long layoff, agree your intensity limits with a doctor first.",
    ],
  ],
};

export default seo;
