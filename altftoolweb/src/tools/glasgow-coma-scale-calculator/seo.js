const seo = {
  intro:
    "The Glasgow Coma Scale Calculator adds the three Glasgow Coma Scale components — eye opening (1-4), verbal response (1-5) and best motor response (1-6) — into a total between 3 and 15, and reports it in the standard E/V/M notation. It also applies the conventional severity bands (3-8 severe, 9-12 moderate, 13-15 mild) and the GCS-Pupils score, which subtracts the number of unreactive pupils from the total. Wording follows the Glasgow Structured Approach to Assessment, with a separate option set for pre-verbal children.",
  useCases: [
    "Nursing and paramedic students drilling the E/V/M components before an exam or OSCE station.",
    "Checking how a documented score such as E3 V4 M5 breaks down and which severity band it falls into.",
    "Learning the GCS-Pupils extension, where a patient with GCS 4 and two unreactive pupils scores GCS-P 2.",
    "Comparing the adult verbal descriptors with the pre-verbal paediatric adaptation side by side.",
  ],
  benefits: [
    ["Standardised wording", "Component descriptors follow the 2014 Glasgow Structured Approach, including 'to sound' and 'to pressure'."],
    ["Handles intubated cases", "Marking the verbal response not testable reports the sum with a T suffix instead of inventing a score."],
    ["GCS-Pupils included", "Subtracts the pupil reactivity score from the total, giving the 1-15 GCS-P used in head-injury prognosis."],
  ],
  faqs: [
    [
      "What is a normal Glasgow Coma Scale score?",
      "A fully alert person scores 15 — the maximum, made up of E4 (eyes open spontaneously), V5 (orientated) and M6 (obeys commands). The lowest possible score is 3, since each of the three components has a minimum of 1; there is no score of 0.",
    ],
    [
      "What GCS score means coma or severe brain injury?",
      "A total of 8 or below is conventionally classed as severe and is the usual threshold at which airway protection becomes the priority, because patients at or below 8 often cannot maintain their own airway. Scores of 9-12 are moderate and 13-15 mild.",
    ],
    [
      "How do you score GCS when a patient is intubated?",
      "The verbal component cannot be tested, so it is recorded as VNT or VT rather than scored. The eye and motor components are summed and reported with a T suffix — for example E4 VNT M6 is written as 10T. Severity bands are not applied to an incomplete scale.",
    ],
    [
      "What is the difference between GCS and GCS-P?",
      "GCS-Pupils (GCS-P) subtracts a pupil reactivity score from the GCS total: 0 if both pupils react to light, 1 if one is unreactive and 2 if neither reacts. It extends the bottom of the scale from 3 down to 1, separating patients who all score 3 on the standard scale. This page is informational only — interpretation of any score belongs with the treating clinician.",
    ],
  ],
};

export default seo;
