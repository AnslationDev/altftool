const seo = {
  title: "JNTU CGPA to Percentage Converter",
  metaDescription:
    "Convert JNTUH, JNTUK or JNTUA CGPA using the notified (CGPA − 0.75) × 10 rule — 8.5 becomes 77.5% — with class bands and an SGPA-to-CGPA combiner.",
  steps: [
    "Choose a mode — CGPA to %, % to CGPA or SGPA to CGPA — pick University and regulations, and enter Your CGPA (0 to 10) or percentage",
    "The converter applies the notified equivalence shown in its Formula row: percentage = (CGPA − 0.75) × 10, or the inverse CGPA = % ÷ 10 + 0.75",
    "Read the converted figure with its Class band — Distinction, First, Second or Pass — then press Copy result to copy the conversion",
  ],
  intro:
    "This converter turns a JNTU CGPA into an equivalent percentage using the rule the credit regulations of JNTU Hyderabad, Kakinada and Anantapur notify: percentage = (CGPA − 0.75) × 10, so a CGPA of 8.5 reads as 77.5%. It also inverts the formula for forms that ask for a CGPA, combines semester SGPAs credit-weighted into a CGPA, and maps the result to the class bands the regulations award — Distinction at 7.75, First Class at 6.75, Second Class at 5.75 and Pass Class at 5.0.",
  useCases: [
    "A JNTUH B.Tech graduate converting a 7.9 CGPA to 71.5% for a placement portal that only accepts percentages",
    "A JNTUK student checking whether their CGPA crosses the 7.75 needed for First Class with Distinction before ordering transcripts",
    "A JNTUA student combining completed-semester SGPAs, credit-weighted, to project the final degree CGPA and class",
  ],
  benefits: [
    ["Regulation-correct rule", "Uses the (CGPA − 0.75) × 10 equivalence the JNTU credit regulations notify, not a generic × 9.5 shortcut."],
    ["Class band included", "Shows Distinction (7.75+), First (6.75+), Second (5.75+) or Pass (5.0+) alongside every conversion."],
    ["All three JNTUs", "Covers JNTUH, JNTUK and JNTUA regulation families in one selector, plus a two-way and SGPA-combining mode."],
  ],
  faqs: [
    [
      "How do I convert JNTU CGPA to percentage?",
      "Multiply (CGPA − 0.75) by 10 — the equivalence notified under the credit regulations of JNTUH, JNTUK and JNTUA. A CGPA of 8.5 becomes 77.5% and 7.75 becomes exactly 70%. Regulations older than the credit system (R09 and earlier) printed percentages directly on the memo, so no conversion applies there.",
    ],
    [
      "What CGPA is First Class with Distinction in JNTU?",
      "A CGPA of 7.75 and above, which converts to 70% — commonly with the condition that all subjects were cleared within the regular course period. First Class starts at 6.75 (60%), Second Class at 5.75 (50%) and Pass Class at 5.0 (42.5%), which is also the minimum CGPA for the degree.",
    ],
    [
      "Is the CGPA-to-percentage formula the same for JNTUH, JNTUK and JNTUA?",
      "Yes — all three universities' credit regulations notify the same linear equivalence, percentage = (CGPA − 0.75) × 10. What differs slightly between regulation years is the wording of award conditions such as the first-attempt requirement for Distinction, so quote your own regulation (R16, R18, R19, R20 or R22) alongside the converted figure.",
    ],
    [
      "What percentage is a 7.0 CGPA at JNTU?",
      "62.5%, computed as (7.0 − 0.75) × 10 — a First Class figure, since First Class begins at CGPA 6.75. Under UGC's generic CGPA × 9.5 the same CGPA would read 66.5%, which is why the receiving form should always be told which formula was used.",
    ],
  ],
};

export default seo;
