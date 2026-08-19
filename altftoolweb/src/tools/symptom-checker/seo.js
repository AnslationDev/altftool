const seo = {
  title: "Symptom Checker: How Soon to Be Seen",
  metaDescription:
    "Tick symptoms, duration and severity: fixed red-flag rules - FAST, sepsis signs, neck stiffness - give one urgency band and name the rule that fired.",
  steps: [
    "Enter age in years — use a fraction such as 0.25 for a three-month-old — how many days so far, and overall severity: Mild, Moderate or Severe.",
    "Tick the symptoms in each group and anything else that applies, such as taking an anticoagulant, pregnancy, or a head injury in the last 7 days.",
    "Read the suggested urgency band and the Why this band table naming each warning-sign rule that matched, then press Copy summary to read out.",
  ],
  intro:
    "This is a red-flag triage aid, not a diagnosis engine. Tick the symptoms you have, say how long they have run, how severe they feel and anything relevant in your background, and it runs the lot against a fixed, published list of warning-sign rules — the FAST stroke signs, fever with neck stiffness, the sepsis screening signs, chest pain with radiation or sweating, fever under three months old, a head injury while on an anticoagulant, the three-week cough and unexplained weight-loss referral triggers. The output is a single answer: how quickly to be seen, and exactly which rules produced that answer. There is no probability model and no ranked list of conditions, because a description alone cannot support one. Everything runs in your browser; nothing you tick is uploaded, stored or sent anywhere.",
  useCases: [
    "It is Saturday evening, someone at home has a fever and a headache, and you need to decide between paracetamol and the out-of-hours service — the neck-stiffness and sepsis-sign rules tell you which side of that line you are on",
    "A parent is describing a small child's third day of vomiting over the phone and you want the age-specific threshold rather than a general 'keep an eye on it'",
    "You are about to call a nurse line or walk into a clinic and want a clean written summary of symptoms, duration, severity and background to read out instead of remembering it under pressure",
  ],
  benefits: [
    ["Every rule is shown, not hidden", "The result lists each warning-sign rule that matched, its urgency band and the reasoning behind it, so you can judge the advice rather than take it on trust."],
    ["No invented numbers", "There is no confidence percentage and no condition ranking. Rules either match or they do not, so the same answers always produce the same band."],
    ["Nothing leaves the page", "Symptoms, age and medical background are processed entirely in the browser. There is no API call, no analytics event carrying your answers and nothing written to a server."],
  ],
  faqs: [
    [
      "Will this tell me what I have?",
      "No, and that is deliberate. Naming a condition from a symptom list without an examination, a history or any tests produces confident-sounding guesses, which is worse than useless when someone is deciding whether to wait until Monday. This tool answers the question that a description genuinely can answer — how soon to be seen — and shows the rule that drove it.",
    ],
    [
      "Why did a mild symptom come back as an emergency?",
      "Some signs are treated as emergencies regardless of how mild they feel, because the description cannot separate the harmless version from the dangerous one. New chest pain, a face that has dropped on one side, a rash that stays visible under a pressed glass, and a fever in a baby under three months are all in that group. The matched-rule table names which one fired and why.",
    ],
    [
      "Does it use my location, my medical records or any online lookup?",
      "None of them. It is a fixed rule set compiled into the page, so it cannot check a drug interaction, read a test result or know what is going around locally. That also means it works offline and that your answers never travel.",
    ],
    [
      "What should I do if the result says self-care but I still feel something is wrong?",
      "Act on your own judgement. A self-care band only means no warning-sign rule matched what you ticked, and the rules can only see what you gave them — not how you look, your medical history or how quickly something is changing. The page lists the specific things that should make you escalate, but a strong sense that something is seriously wrong is itself a reason to get checked.",
    ],
  ],
};

export default seo;
