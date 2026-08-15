const seo = {
  title: "Prediabetes Risk Self-Check: ADA/CDC Score",
  metaDescription:
    "One set of answers scores the seven-item ADA/CDC risk test out of 11 and the Indian Diabetes Risk Score out of 100, with every point shown.",
  steps: [
    "Enter your age, 'Sex recorded at birth', height, weight and 'Waist at the navel (cm)'.",
    "Pick 'Usual physical activity' and 'Family history of diabetes', and tick 'Ever told you have high blood pressure' if it applies.",
    "Read both scores against the ADA high-risk threshold, the 'How each score was built' points table, and 'What to do next'.",
  ],
  intro:
    "The Prediabetes Risk Self-Check scores your chance of having prediabetes or developing type 2 diabetes using two published questionnaires from one set of answers: the seven-item ADA/CDC prediabetes risk test scored out of 11, and the Indian Diabetes Risk Score (IDRS) scored out of 100 from age, waist, activity and family history. It returns both scores, an item-by-item breakdown, and lifestyle targets taken from the Diabetes Prevention Program. It is a screening prompt, not a diagnosis — only a blood test can confirm prediabetes.",
  useCases: [
    "Check whether your age, waist and family history put you above the ADA score of 5 that flags high risk.",
    "Compare a Western risk test with the IDRS, which uses the lower Asian waist cut-offs of 90 cm for men and 80 cm for women.",
    "See the exact kilograms that a 7% Diabetes Prevention Program weight-loss goal works out to for your weight.",
    "Decide what to ask for at your next appointment — HbA1c, fasting glucose or an OGTT — with the numeric ranges to hand.",
  ],
  benefits: [
    ["Two validated instruments", "ADA/CDC risk test and the MDRF Indian Diabetes Risk Score, not an invented scoring scheme."],
    ["Every point shown", "A table lists what each answer contributed, so you can see which item is driving your score."],
    ["Actions tied to evidence", "Targets come from the Diabetes Prevention Program: 7% weight loss and 150 minutes of activity a week."],
  ],
  faqs: [
    [
      "What score means I am at high risk of prediabetes?",
      // IDRS band wording must stay in sync with IDRS_BANDS in lib.js: low 0-29, moderate 30-59, high 60+.
      "On the ADA/CDC risk test, 5 or more out of 11 is the published cut-off for high risk. On the Indian Diabetes Risk Score, below 30 is low risk, 30 to 59 is moderate and 60 or above is high risk. Neither score diagnoses anything — a high score is a reason to ask for a blood test.",
    ],
    [
      "What blood sugar levels count as prediabetes?",
      "By the ADA criteria, prediabetes is an HbA1c of 5.7% to 6.4% (39 to 47 mmol/mol), a fasting plasma glucose of 100 to 125 mg/dL (5.6 to 6.9 mmol/L), or a 2-hour value of 140 to 199 mg/dL in a 75 g oral glucose tolerance test. Values above those ranges meet the criteria for diabetes and need medical follow-up.",
    ],
    [
      "Can prediabetes be reversed?",
      "Progression to type 2 diabetes can often be prevented or delayed. The Diabetes Prevention Program found that a lifestyle programme aiming at 7% body-weight loss and 150 minutes a week of moderate activity reduced the incidence of type 2 diabetes by 58% over an average 2.8 years, and by 71% in participants aged 60 and over. Discuss a plan with a clinician rather than relying on a score alone.",
    ],
    [
      "Why does waist size matter more than weight for Indian populations?",
      "Central fat is more strongly linked to insulin resistance than total body weight, and South Asians develop it at lower body weights. That is why the IDRS and Indian consensus guidelines use waist cut-offs of 90 cm for men and 80 cm for women, well below the 102 cm and 88 cm often used elsewhere.",
    ],
  ],
};

export default seo;
