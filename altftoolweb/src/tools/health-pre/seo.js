const seo = {
  title: "Symptom Checker: Match Symptoms to 10 Common",
  metaDescription:
    "Tick symptoms across eight body systems and see the top five of ten conditions, each scored as matched symptoms over that condition's full list.",
  steps: [
    "Fill Personal Information — Full Name, Age and Gender, with Email Address (Optional) — then press Next: Select Symptoms.",
    "Under Select Your Symptoms tick everything that applies across the eight groups, from General Symptoms, Neurological and Respiratory through to Mental & Emotional and Digestive, then press Analyze Symptoms.",
    "Health Analysis Results lists Potential Conditions with an X% Match badge on each and your Selected Symptoms alongside; New Analysis clears the form for a fresh run.",
  ],
  intro:
    "Health Pre is an informational symptom checker that compares the symptoms you tick off against a built-in reference list of ten common conditions and scores each one by the share of its listed symptoms you matched. You pick symptoms from eight body-system groups — general, neurological, respiratory, cardiovascular, skin and allergy, vision and hearing, mental and emotional, and digestive — and it returns the top five conditions with a percentage match. The score is a simple overlap calculation, not a diagnosis; anything worrying belongs with a clinician.",
  useCases: [
    "You have had a fever, cough and body aches for two days and want to see which common illnesses share that exact cluster before you call the clinic.",
    "You are writing down what to tell a doctor and want a checklist that groups symptoms by body system so you do not forget the dizziness or the blurred vision.",
    "A family member describes several vague symptoms at once and you want to see whether they point at one pattern or several unrelated ones.",
  ],
  benefits: [
    ["Transparent scoring", "The match percentage is matched symptoms divided by that condition's full symptom list — no hidden weighting."],
    ["Organised by body system", "Around fifty symptoms are grouped into eight categories so nothing gets missed while you tick."],
    ["Honest about its limits", "Results are labelled as statistical correlation and every screen states this is not a diagnosis."],
  ],
  faqs: [
    [
      "How does this symptom checker calculate a match percentage?",
      "It divides the number of your selected symptoms that appear in a condition's reference list by the total number of symptoms in that list, then multiplies by 100. If a condition lists five symptoms and you selected three of them, it shows 60% match. Conditions scoring above zero are ranked and the top five are displayed.",
    ],
    [
      "Which conditions does the tool check against?",
      "Ten: common cold, flu, migraine, COVID-19, food poisoning, asthma, allergic reaction, depression, hypertension and diabetes. That is a deliberately small reference set of frequently seen conditions, so a low or absent match does not rule anything out — it only means your symptoms do not overlap these ten patterns.",
    ],
    [
      "Can a symptom checker diagnose me?",
      "No. This tool performs a text overlap between your selections and a fixed symptom list; it does not examine you, review your history, or run tests, all of which a diagnosis requires. Treat the output as a prompt for a conversation with a qualified clinician, and seek urgent care for chest pain, severe breathlessness, confusion or any symptom that is rapidly worsening.",
    ],
    [
      "Is my symptom and personal information stored?",
      "No. The name, age, gender and symptom selections stay in the page's memory in your browser for the duration of the session and are cleared when you hit New Analysis or close the tab. Nothing is uploaded and no account is needed.",
    ],
  ],
};

export default seo;
