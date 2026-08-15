const seo = {
  title: "Bihar Board Percentage Calculator (BSEB 500 Marks)",
  metaDescription:
    "Enter five BSEB subject marks out of 100 for your Matric or Inter percentage on 500, pass status and First (300), Second (225) or Third (150) Division.",
  steps: [
    "Choose the Examination level and enter marks out of 100 for the five compulsory subjects (Hindi, second language, Mathematics, Science and Social Science for Matric).",
    "The result updates live, checking BSEB's 30% per-subject minimum and the 150-mark aggregate minimum before awarding a division.",
    "Read your percentage on the 500-mark aggregate and your Division against the 300/225/150 cutoff table, then click Copy result.",
  ],
  intro:
    "This calculator computes a Bihar Board (BSEB) Matric or Intermediate percentage on the board's 500-mark aggregate — five compulsory subjects of 100 marks each — and reports pass status and division. It applies BSEB's own cutoffs: First Division at 300 marks (60%), Second at 225 (45%), Third at 150 (30%), with a 30% minimum in every subject. It is meant for Class 10 and Class 12 students of Bihar verifying their result for admissions, scholarships and government forms.",
  useCases: [
    "A Matric student adding five subject scores to see whether the total crosses the 300-mark First Division line",
    "An Inter student converting 344 out of 500 into an exact percentage for a college admission form",
    "A student who scored 29 in one subject checking why the marksheet shows Fail despite a strong aggregate",
  ],
  benefits: [
    ["BSEB's real aggregate", "Works on 500 marks across five compulsory subjects, exactly as the board declares results."],
    ["Division cutoffs in marks", "Shows the 300/225/150 mark thresholds so you know how far you are from the next division."],
    ["Dual pass check", "Verifies both the 30% per-subject minimum and the 150-mark aggregate minimum before awarding a division."],
  ],
  faqs: [
    [
      "How is the Bihar Board percentage calculated?",
      "Total marks in the five compulsory subjects divided by 500, times 100. For example, 344 out of 500 is 68.8%. The optional sixth subject is not added to the aggregate — BSEB uses it only to substitute a failed compulsory subject.",
    ],
    [
      "How many marks are needed for First Division in Bihar Board?",
      "300 out of 500, which is 60% of the aggregate. Second Division needs 225 (45%) and Third Division 150 (30%). These cutoffs apply to both Matric and Intermediate results.",
    ],
    [
      "What are the passing marks in BSEB Matric and Inter?",
      "30% in each subject — 30 marks out of 100 — plus at least 150 marks in the 500-mark aggregate. This calculator marks a result Fail whenever either standard is missed. Separately, BSEB typically allows candidates who fail only one or two subjects to sit a compartmental exam rather than repeat the year — check the official BSEB notice for your session for exact eligibility, since this calculator only reports the aggregate percentage, division and pass/fail from the marks you enter, not compartmental eligibility.",
    ],
    [
      "Does the optional subject increase my Bihar Board percentage?",
      "No. BSEB computes the percentage only on the five compulsory subjects. The optional subject's marks are used to replace a failed compulsory subject so the candidate can still pass, but they never raise the 500-mark aggregate.",
    ],
  ],
};

export default seo;
