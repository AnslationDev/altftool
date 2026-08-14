const seo = {
  title: "TNEA Cutoff Calculator: Maths + (Physics+Chemistry)/2",
  metaDescription:
    "Cutoff out of 200 with Maths at full weight and Physics and Chemistry at half, for TNEA engineering or the medical/agriculture group, plus a target check.",
  steps: [
    "Pick Engineering (TNEA) or Medical / agriculture group, then set Maximum mark per subject on your marksheet to 100 or 200.",
    "Type the Mathematics or Biology mark with Physics mark and Chemistry mark, plus the Cutoff you are aiming for (out of 200).",
    "Cutoff mark gives the score out of 200 with the formula, each subject's contribution, and the stream mark still required for your target.",
  ],
  intro:
    "A Tamil Nadu cutoff is a mark out of 200 in which the stream subject counts in full and Physics and Chemistry count half each — Maths + (Physics + Chemistry) ÷ 2 for engineering, Biology + (Physics + Chemistry) ÷ 2 for the medical and agriculture group. This calculator applies that rule to your +2 marksheet, shows exactly how much each subject contributed, and works out the stream-subject mark still needed to hit a target cutoff. Marksheets scored out of 200 per subject are normalised first, so the older Maths ÷ 2 + Physics ÷ 4 + Chemistry ÷ 4 form gives the same answer.",
  useCases: [
    "Checking your TNEA cutoff the day HSC results are published, before the rank list is out",
    "Deciding whether a Physics or Chemistry re-evaluation is worth applying for, since each mark there only moves the cutoff by half a point",
    "Working out what Maths mark a supplementary or improvement exam would need in order to reach a target cutoff",
  ],
  benefits: [
    ["Shows the half-weight effect", "You can see that one extra Chemistry mark adds 0.5 to the cutoff while one extra Maths mark adds a full point."],
    ["Handles both marksheet scales", "Subjects out of 100 or out of 200 are normalised before the weighting is applied."],
    ["Reverse target check", "Enter the cutoff you want and it returns the stream-subject mark required, and says when that is impossible."],
  ],
  faqs: [
    [
      "How is the TNEA cutoff calculated in Tamil Nadu?",
      "Cutoff = Mathematics + (Physics + Chemistry) ÷ 2, out of 200. With Maths 95, Physics 88 and Chemistry 92 the cutoff is 95 + 90 = 185. Maths carries full weight, so it moves the cutoff twice as fast as the other two.",
    ],
    [
      "What is the maximum cutoff mark in Tamil Nadu?",
      "200. Full marks in Maths contribute 100, and full marks in Physics and Chemistry contribute 50 each. A cutoff above 200 is not possible, so any figure quoted higher than that is on a different scale.",
    ],
    [
      "Is the medical cutoff still used for MBBS in Tamil Nadu?",
      "No. MBBS and BDS seats have been allotted on NEET scores since 2017. The +2 cutoff of Biology + (Physics + Chemistry) ÷ 2 is still used by agriculture, veterinary, fisheries, allied-health and several B.Sc. streams, and NEET-qualified candidates still need to pass +2.",
    ],
    [
      "How do I calculate the cutoff if my marksheet is out of 200 per subject?",
      "Halve each subject first, then apply the same rule — which is the familiar Maths ÷ 2 + Physics ÷ 4 + Chemistry ÷ 4. Maths 190, Physics 176 and Chemistry 184 out of 200 give 95 + 44 + 46 = 185, identical to the 100-mark version.",
    ],
  ],
};

export default seo;
