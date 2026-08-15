const seo = {
  title: "Ibuprofen Timer: Next Dose and mg Left in 24 Hours",
  metaDescription:
    "Enter the last dose time to get the earliest next dose and the mg still left under the 1200 mg OTC, 3200 mg Rx or 40 mg/kg child ceiling.",
  steps: [
    "Under \"Who is the dose for?\" pick Adult / 12+ over-the-counter, Adult prescription strength or Child (weight based).",
    "Enter Single dose (mg), Gap between doses (hours), Last dose taken at and Total taken in the last 24 h (mg).",
    "Read the earliest permitted next dose and Remaining doses in this 24-hour window, then press Copy result.",
  ],
  intro:
    "The Ibuprofen Dose Interval Timer converts the time of your last dose into the earliest hour the next one is due and shows how many milligrams remain under the 24-hour ceiling. It follows the dosing rules printed on the pack: 200-400 mg every 4-6 hours with a 1200 mg daily maximum for adult over-the-counter use, 400-800 mg every 6-8 hours up to 3200 mg on prescription, and 5-10 mg/kg every 6-8 hours capped at 40 mg/kg a day for children. It is a timing and arithmetic aid for people already taking ibuprofen as directed, not a substitute for the label or a pharmacist.",
  useCases: [
    "You took 400 mg at 8am for period pain and want to know whether 11am is too early for the next tablet.",
    "A parent giving weight-based ibuprofen syrup overnight needs to check the child has not passed four doses or 40 mg/kg in 24 hours.",
    "You are alternating ibuprofen with paracetamol for a fever and want a written schedule of ibuprofen times to stick on the fridge.",
    "A prescription says 800 mg three times a day and you want to confirm the running total stays under the 3200 mg limit.",
  ],
  benefits: [
    ["Ceiling tracking", "Shows milligrams already used and how many full doses still fit under the 24-hour limit."],
    ["Minimum-gap guard", "Separates the earliest permitted dose time from your chosen gap, so you never shorten the interval by accident."],
    ["Weight-based paediatric check", "Flags a child's dose that falls outside the 5-10 mg/kg band or breaches 40 mg/kg a day."],
  ],
  faqs: [
    [
      "How many hours apart should ibuprofen doses be?",
      "At least 4 hours for adult over-the-counter doses of 200-400 mg, and 6-8 hours for prescription strengths and for children. Most packs suggest every 6 to 8 hours so that three or four doses cover the whole day without exceeding the daily maximum.",
    ],
    [
      "What is the maximum ibuprofen in 24 hours?",
      "1200 mg in 24 hours for adult self-treatment without a doctor's direction — for example three 400 mg doses. A doctor may prescribe up to 3200 mg a day short term, but higher doses carry more stomach, kidney and cardiovascular risk, so the lowest effective dose for the shortest time is the standard advice.",
    ],
    [
      "How much ibuprofen can a child have?",
      "Paediatric dosing is 5-10 mg per kilogram of body weight per dose, no more often than every 6-8 hours, with a maximum of four doses and 40 mg/kg in 24 hours. A 20 kg child therefore takes roughly 200 mg a dose and must stay under 800 mg for the day. Ibuprofen is not given to infants under 3 months without a doctor.",
    ],
    [
      "Can I take ibuprofen and paracetamol together?",
      "They work by different mechanisms and are often alternated or combined under medical guidance, because they do not share a daily limit. Track each drug's own ceiling separately, check that cold and flu combination products are not adding a hidden dose of either, and ask a pharmacist or doctor before starting a combined routine — especially in children or with existing kidney, stomach or heart conditions.",
    ],
  ],
};

export default seo;
