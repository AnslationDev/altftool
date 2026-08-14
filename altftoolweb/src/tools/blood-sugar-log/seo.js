const seo = {
  title: "Blood Sugar Log: Time in Range and Estimated HbA1c",
  metaDescription:
    "Scores each reading against its own ADA band, fasting 80-130 and 2h post-meal under 180 mg/dL, then reports time in range and an estimated HbA1c.",
  intro:
    "The Blood Sugar Log records each glucose reading against the context it was taken in — fasting, before a meal, two hours after a meal, bedtime or random — so it is judged against the ADA target band for that moment rather than one blanket number. It then reports your time in range against the 70-180 mg/dL zone, your average per context, and an estimated HbA1c from the ADAG regression A1c% = (average mg/dL + 46.7) / 28.7 over your last 90 days. It is a record to take to your care team, not a substitute for a lab test or for medical advice.",
  useCases: [
    "You test four times a day and want to know whether your high numbers are a fasting problem or a post-meal problem, because the fix is different — the per-context averages separate the two.",
    "Your next HbA1c blood test is months away and you want a rough read on where you are heading from the readings you already have.",
    "You are visiting a clinic in a country that uses mmol/L while your meter reads mg/dL, and you need the same log printed in either unit without re-entering anything.",
  ],
  benefits: [
    [
      "Context sets the target",
      "A 140 two hours after lunch is scored in range while a fasting 140 is not, because each reading is judged against its own ADA band.",
    ],
    [
      "Time in range, not just an average",
      "Splits your readings into very low, low, in range, high and very high bands so a flat average does not hide swings in both directions.",
    ],
    [
      "Unit changes never lose data",
      "Readings are stored in mg/dL and converted for display using the 18.0182 factor, so toggling to mmol/L and back does not round your history away.",
    ],
  ],
  faqs: [
    [
      "What is a good time in range for blood sugar?",
      "A commonly cited goal for many adults is more than 70% of readings inside 70-180 mg/dL (3.9-10.0 mmol/L), with under 4% below 70 mg/dL and under 1% below 54 mg/dL. This log calculates exactly those bands from your entries. Your own targets can be tighter or looser — pregnancy, older age and hypoglycemia unawareness all change them, so confirm yours with your care team.",
    ],
    [
      "How is estimated HbA1c calculated from finger-stick readings?",
      "It uses the ADAG study regression: A1c % = (average glucose in mg/dL + 46.7) / 28.7, applied to the average of your readings over the last 90 days, since that roughly matches the lifespan of a red blood cell. Treat it as a signal only — finger-stick readings are a biased sample that skips the overnight hours, and anaemia, pregnancy, kidney disease and haemoglobin variants shift real lab A1c independently.",
    ],
    [
      "What should I do about a reading under 70 mg/dL?",
      "Under 70 mg/dL (3.9 mmol/L) is hypoglycemia, and the standard response is the 15-15 rule: take 15 g of fast-acting carbohydrate such as four glucose tablets or 120 ml of juice, wait 15 minutes, and recheck — repeat if still under 70. Avoid chocolate and nuts, whose fat slows absorption. If someone is confused, seizing or unable to swallow, do not give anything by mouth; that needs glucagon and emergency help.",
    ],
    [
      "What are the fasting and post-meal targets used here?",
      "Fasting and pre-meal readings use the ADA band of 80-130 mg/dL, and two-hour post-meal readings use under 180 mg/dL, with 100 and 140 mg/dL marked as the tighter non-diabetes ideals. Bedtime uses a 90-150 mg/dL band to reduce overnight hypoglycemia risk. These are general adult figures, and only your clinician can set the ones that apply to you.",
    ],
  ],
};

export default seo;
