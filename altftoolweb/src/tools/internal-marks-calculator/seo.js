const seo = {
  title: "Internal Marks Calculator: Weighted Sessional Total",
  metaDescription:
    "Each component contributes (scored ÷ max) × weight% × internal max. Add your tests, assignments and attendance to get the exact and rounded internal.",
  steps: [
    "Set the 'Internal component maximum (marks)' field — it opens on 30 — or start from a preset button such as 'Mid-terms 60% + assignments 25% + attendance 15%'.",
    "For every component fill in its name, Marks scored, 'Out of (maximum)' and 'Weight (% of internal)', using Add component and Remove so the weights match your university's scheme.",
    "Internal marks shows as total / internal maximum with the percentage and the rounded figure usually recorded, and one breakdown line per component reading scored/max (percent) × weight; Copy result copies the breakdown.",
  ],
  intro:
    "This calculator computes your internal assessment (sessional) marks by the weighted-percentage formula universities actually use: each component's score fraction times its weight, scaled to the internal maximum — contribution = (scored ÷ max) × weight% × internal max. Enter your mid-term tests, assignments and attendance with the weights from your university's scheme, and see the exact contribution of each component plus the rounded total that goes on record. Built for students tracking sessionals through the semester.",
  useCases: [
    "A B.Tech student combining two mid-terms (60%), assignments (25%) and attendance (15%) into an internal out of 30 before the end-semester exam",
    "A student who bombed one class test checking how much the assignments component can still recover in the weighted total",
    "A CBCS-programme student converting a test, seminar and attendance record into the sessional out of 40 their university records",
  ],
  benefits: [
    ["Real weighted formula", "Each component contributes (scored ÷ max) × weight% × internal max — exactly how sessional totals are assembled."],
    ["Any scheme, any split", "Add or remove components, set any weights summing to 100%, and any internal maximum from 25 to 50 or beyond."],
    ["Raw and rounded totals", "See the exact decimal total alongside the nearest-integer figure that typically goes on the marksheet."],
  ],
  faqs: [
    [
      "How are internal marks calculated in university?",
      "Each assessment component is converted to a fraction (marks scored divided by maximum), multiplied by its weight, and scaled to the internal maximum: contribution = (scored ÷ max) × weight% × internal max, summed over all components. A typical split is 50–60% from tests, 25–30% from assignments and 10–20% from attendance, but every university publishes its own scheme.",
    ],
    [
      "How much of internal marks come from attendance?",
      "Where attendance carries marks, it is usually 10–20% of the internal component — for example 5 marks out of an internal 30. Separately, most Indian universities require a minimum of around 75% attendance just to be allowed to sit the end-semester exam, which is an eligibility rule rather than a marks formula.",
    ],
    [
      "Are internal marks rounded off?",
      "Almost always — universities record internals as whole marks, most commonly by rounding to the nearest integer, though some ordinances round up in the student's favour. This calculator shows both the exact decimal total and the nearest-integer figure so you can apply whichever rule your ordinance states.",
    ],
    [
      "Can internal marks compensate for a poor external exam score?",
      "Only within the pass rules: internals raise your subject total, but most universities also require a separate minimum in the external paper alone (commonly around 35–40% of the external maximum), so high internals cannot rescue an external score below that floor. Check your scheme's passing-minimum clause for both the total and the external component.",
    ],
  ],
};

export default seo;
