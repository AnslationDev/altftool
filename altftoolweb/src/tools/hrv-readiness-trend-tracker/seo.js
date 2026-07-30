const seo = {
  intro:
    "This tracker compares each day's heart-rate variability reading against a rolling baseline — the mean of the preceding readings, 7 by default — and reports the percentage deviation, flagging any day that sits more than your chosen threshold (±15% by default) away from that baseline. Paste your own readings as date | value, and you get a per-day table of HRV, prior baseline, deviation and whether it crossed the band. It is a trend aid for people already logging HRV from a chest strap or wearable, not a readiness score and not a medical assessment.",
  useCases: [
    "You have three months of morning HRV exported from an app that only shows a proprietary score, and you want to see the raw deviation from your own baseline instead",
    "Checking whether a bad night after a late meal or a drink actually moved your HRV or just felt like it did, before deciding what to do with tomorrow's session",
    "Reviewing a hard training block afterwards to see how many days fell outside your ±15% band and whether they clustered around the heaviest sessions",
  ],
  benefits: [
    ["Your baseline, not a vendor's", "The reference is the mean of your own preceding readings, so nothing is normalised against population data or a hidden scoring model."],
    ["Both the window and the band are yours", "Set a shorter window to react faster or a longer one to smooth noise, and set the flag percentage to whatever your own day-to-day spread justifies."],
    ["Refuses to flag on thin data", "A day is only marked for review once at least three prior readings exist, so the first few entries do not generate meaningless alerts."],
  ],
  faqs: [
    [
      "How is the HRV baseline calculated?",
      "It is the plain average of the readings immediately before the current one, up to the window size you set — 7 by default. The current day is excluded from its own baseline, so deviation = (today − baseline) ÷ baseline × 100. A reading of 48 against a prior mean of 57.8 gives roughly −17%.",
    ],
    [
      "What deviation threshold should I use?",
      "The default is ±15%, which is a common starting band, but the right figure depends on how variable your own readings are. If most normal days already exceed 15%, widen it until only genuinely unusual days trip the flag; if nothing ever flags, tighten it.",
    ],
    [
      "Why do my HRV numbers differ from another app's?",
      "Because HRV depends on the metric, the measurement window and the conditions. RMSSD, SDNN and an app's own 0-100 score are different quantities, and readings taken lying down on waking differ from ones taken overnight or seated. Only compare readings from the same device taken the same way — mixing sources makes the baseline meaningless.",
    ],
    [
      "Does a low HRV reading mean I should not train?",
      "It does not mean anything on its own. A dip can follow poor sleep, alcohol, illness, medication, stress, dehydration or simply a mistimed measurement, and this tool deliberately outputs 'review context' rather than a training instruction. It is informational only — if low readings persist or come with symptoms such as chest pain, breathlessness or an unusual resting heart rate, speak to a doctor.",
    ],
  ],
};

export default seo;
