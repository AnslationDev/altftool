const seo = {
  intro:
    "The Apgar Score Calculator adds the five newborn signs described by Virginia Apgar in 1953 — Appearance (colour), Pulse (heart rate), Grimace (reflex response), Activity (muscle tone) and Respiration (breathing effort) — each scored 0, 1 or 2, for a total out of 10. It records the assessment at 1 and 5 minutes after birth, and at 10 minutes when the 5-minute total is below 7, which is the point at which AAP/ACOG guidance says scoring should continue every five minutes. Totals of 7-10 are described as reassuring, 4-6 as moderately abnormal and 0-3 as low.",
  useCases: [
    "Midwifery, nursing and medical students learning the five signs and their 0/1/2 descriptors before an exam.",
    "Making sense of the two numbers written in a birth record, such as 'Apgar 6 at 1 minute, 9 at 5 minutes'.",
    "Practising the case where a 5-minute score under 7 triggers a 10-minute reassessment.",
    "Seeing which individual sign is pulling a total down, rather than only reading the sum.",
  ],
  benefits: [
    ["All three time points", "Records 1, 5 and optional 10-minute assessments side by side and shows the change between them."],
    ["Full descriptors", "Every option spells out what a 0, 1 or 2 looks like, including the under-100 bpm heart rate cut-off."],
    ["Flags the follow-up rule", "Automatically points out when a 5-minute score below 7 means scoring should carry on every five minutes."],
  ],
  faqs: [
    [
      "What is a normal Apgar score?",
      "A total of 7 to 10 is considered reassuring, 4 to 6 moderately abnormal and 0 to 3 low. Most healthy newborns score 7-9 at one minute; a score of 10 is uncommon because mild blueness of the hands and feet is normal in the first minutes and costs a point on Appearance.",
    ],
    [
      "What do the letters in APGAR stand for?",
      "Appearance (skin colour), Pulse (heart rate, scoring 2 at 100 beats per minute or more), Grimace (reflex response to stimulation), Activity (muscle tone) and Respiration (breathing effort and cry). The backronym was created after the score, which is named for the anaesthesiologist Virginia Apgar.",
    ],
    [
      "When is the Apgar score taken?",
      "At 1 minute and 5 minutes after birth. If the 5-minute score is below 7, the joint American Academy of Pediatrics and ACOG guidance is to keep scoring every 5 minutes up to 20 minutes, which is why this calculator includes a 10-minute assessment.",
    ],
    [
      "Does a low Apgar score mean the baby will have problems?",
      "Not on its own. The score describes condition at a moment in time and is deliberately not used to decide whether to start resuscitation or to predict long-term outcome; a low 1-minute score followed by a normal 5-minute score is common and usually reassuring. Any concerns about a birth record should be discussed with the clinicians involved.",
    ],
  ],
};

export default seo;
