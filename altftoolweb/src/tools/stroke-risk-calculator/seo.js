const seo = {
  intro:
    "This stroke risk calculator scores the CHA₂DS₂-VASc model used in atrial fibrillation — congestive heart failure, hypertension, age 65–74, diabetes, vascular disease and female sex each add 1 point, while age ≥ 75 and a prior stroke, TIA or thromboembolism add 2 — for a total out of 9, then maps that total to an estimated annual stroke rate. You can also switch to the older CHADS₂ model and score HAS-BLED alongside it to see bleeding risk in the same view. It is an educational reference for patients and students, not a substitute for a clinician's assessment.",
  useCases: [
    "You have just been told you have atrial fibrillation and want to understand why your cardiologist raised blood thinners before your follow-up appointment.",
    "A nursing or medical student checking their own CHA₂DS₂-VASc arithmetic against a worked example while revising anticoagulation guidelines.",
    "A caregiver comparing an elderly relative's stroke score against their HAS-BLED bleeding score so they can ask informed questions at the next review.",
  ],
  benefits: [
    ["Scores both models side by side", "Toggle between CHA₂DS₂-VASc and the older CHADS₂ to see how adding vascular disease, age 65–74 and sex category changes the total."],
    ["Pairs stroke risk with bleeding risk", "A built-in HAS-BLED tally shows the other half of the anticoagulation decision instead of the stroke score alone."],
    ["Produces a shareable summary", "Copy or download a plain-text report listing every risk factor selected, the score, the risk band and its interpretation."],
  ],
  faqs: [
    [
      "What CHA₂DS₂-VASc score means I need a blood thinner?",
      "Guidelines generally recommend oral anticoagulation from a score of 2 or more, treat 1 as an individual risk-benefit discussion, and consider no anticoagulation at 0. The final decision belongs to your doctor, who will weigh bleeding risk, kidney function and your own preferences.",
    ],
    [
      "Which factors are worth 2 points instead of 1?",
      "Only two: age 75 or older, and a prior stroke, TIA or systemic embolism. Heart failure, hypertension, age 65–74, diabetes, vascular disease and female sex are worth 1 point each, giving a maximum of 9.",
    ],
    [
      "What annual stroke risk does each score correspond to?",
      "Roughly 1.9% a year at a score of 0, about 2.8% at 1, 4.0% at 2, 5.9% at 3, around 9% in the 4–5 band and 15% or more at 6 and above. These are population estimates from published cohorts, so your personal risk can differ.",
    ],
    [
      "What does a HAS-BLED score of 3 mean?",
      "A HAS-BLED score of 3 or more flags high bleeding risk on anticoagulation. It is not a reason to withhold treatment on its own — it is a prompt to correct modifiable factors such as uncontrolled blood pressure above 160 mmHg, NSAID use or heavy alcohol intake, and to review the patient more often.",
    ],
  ],
};

export default seo;
