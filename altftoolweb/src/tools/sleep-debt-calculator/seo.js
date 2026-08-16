const seo = {
  title: "Sleep Debt Calculator: 14 Nights & Repayment Plan",
  metaDescription:
    "Log 7, 10 or 14 nights on a slider, let surplus nights offset the shortfall, and see hours owed, your weekday-weekend gap and nights to clear it.",
  steps: [
    "Set Your sleep need with the hours-per-night slider, or tap an age guideline — Teen (14–17), Adult (18–64) or 65 and over.",
    "In Your sleep log pick the Most recent morning date and Nights to include (7, 10 or 14), then drag each night's slider in 15-minute steps.",
    "Read Net sleep debt with its severity band, Average night, Total shortfall and Surplus banked, pick a repayment rate from +0.5h to +2h, then Copy report.",
  ],
  intro:
    "The Sleep Debt Calculator adds up how many hours you fell short of your nightly need across the last 7, 10 or 14 nights, letting nights you overslept offset the shortfall, and floors the result at zero. You set your need from an age band — 7 to 9 hours for adults aged 18 to 64 — log each night on a slider, and get your total debt, a severity band, your weekday-versus-weekend gap, and how many nights of extra sleep would clear it. It is for people who suspect they are running behind but have never put a number on it.",
  useCases: [
    "After a fortnight of 6-hour weeknights and long weekend lie-ins, you want to know whether you are 8 hours behind or 25, because those call for very different responses.",
    "You are deciding whether it is safe to drive four hours on Friday evening after a short-sleep week, and want the honest total rather than a vague sense of being tired.",
    "You keep catching up on Saturdays and want to see the actual weekday-to-weekend gap, which is the social jetlag pattern that keeps the debt coming back.",
  ],
  benefits: [
    ["Surplus nights actually count", "Hours slept above your need offset your deficit rather than being ignored, so a genuine catch-up weekend is reflected instead of the debt only ever going up."],
    ["A repayment plan, not just a number", "It shows how many nights it takes to clear at +0.5, +1, +1.5 and +2 hours a night, so you can pick a rate you will actually keep to."],
    ["Weekday versus weekend, separated", "It averages your work nights and free nights separately and reports the gap, which is what a chronic short-sleep pattern looks like before the total gets alarming."],
  ],
  faqs: [
    [
      "How is sleep debt calculated?",
      "Debt is the sum of (nightly need − hours actually slept) across the window you choose, with nights you slept more than your need subtracting from the total, and the result never going below zero. Seven nights at 6 hours against an 8-hour need is 14 hours of debt.",
    ],
    [
      "How many hours of sleep do I actually need?",
      "For most adults aged 18 to 64 it is 7 to 9 hours a night; teenagers aged 14 to 17 need 8 to 10, and adults 65 and over typically 7 to 8. Your own figure sits somewhere in that range, so pick the point where you wake without an alarm feeling rested.",
    ],
    [
      "Can I catch up on sleep at the weekend?",
      "Partially, and only for small debts. Adding an extra hour a night clears a 5-hour debt in about five nights, but a 20-hour debt takes roughly 20 nights at that rate — which is why one long Saturday does not undo a bad fortnight. Very long lie-ins also shift your body clock and make the following Monday worse.",
    ],
    [
      "When is sleep debt serious enough to see a doctor?",
      "If you are consistently 20 or more hours behind, if you are having attention lapses or nodding off during the day, or if you cannot sleep even when you have the opportunity, it is worth medical attention rather than more discipline. This tool is informational and does not diagnose anything — persistent insomnia, snoring with daytime sleepiness, or suspected sleep apnoea should be assessed by a doctor.",
    ],
  ],
};

export default seo;
