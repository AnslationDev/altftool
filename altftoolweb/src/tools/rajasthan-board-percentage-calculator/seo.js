const seo = {
  title: "RBSE Percentage Calculator - Division on 60/48/36 Bands",
  metaDescription:
    "Plain RBSE aggregate from every subject's marks - division off the 60/48/36 bands, 33% per-subject minimum checks and the marks needed for the next band.",
  steps: [
    "Pick Class 10 (Secondary) or Class 12 (Senior Secondary) and enter each subject's Marks scored and Maximum marks, adding rows with Add subject if needed.",
    "Read the Aggregate percentage with its division, plus the Subject by subject table marking each subject Pass or 'Short by' against the 33% minimum.",
    "Check the Next division section for the extra marks the next band needs, then click Copy result for the summary.",
  ],
  intro:
    "RBSE percentage is a plain aggregate: total marks obtained divided by the grand total, times 100, with no subject dropped. Class 10 is normally six subjects out of 600 and class 12 five subjects out of 500. This calculator applies that, places the aggregate on the Rajasthan Board division bands (First from 60%, Second from 48%, Third from 36%), checks the 33% minimum subject by subject, and tells you how many marks separate you from the next division.",
  useCases: [
    "Turning an RBSE marksheet into the percentage a scholarship or college form demands",
    "Finding out how many marks a supplementary attempt needs to lift you from Second to First division",
    "Checking whether a weak subject has slipped below the 33% minimum even though the aggregate is comfortable",
  ],
  benefits: [
    ["Division read straight off the bands", "60 / 48 / 36 boundaries are applied exactly, so borderline aggregates are placed correctly."],
    ["Per-subject shortfall in marks", "Any subject under 33% shows how many marks short it fell — the figure a scrutiny application needs."],
    ["Next-division gap", "Shows the total marks the next band needs and the difference from your current total."],
  ],
  faqs: [
    [
      "What is the passing mark in RBSE?",
      "33% — that is 33 marks out of 100 in each subject, and 33% on the aggregate. One subject below 33 means the candidate is not declared passed, no matter how strong the overall percentage is.",
    ],
    [
      "How is the Rajasthan Board percentage calculated?",
      "Add every subject's marks and divide by the grand total, then multiply by 100. For class 12 with five subjects of 100 marks, 383 out of 500 is 76.60%. RBSE does not use a best-of-five rule, so every subject you sat counts.",
    ],
    [
      "What percentage is first division in RBSE?",
      "60% and above. Second division runs from 48% to just under 60%, third division from 36% to just under 48%, and an aggregate between 33% and 36% is recorded simply as a pass.",
    ],
    [
      "Do practical marks count towards the RBSE percentage?",
      "Yes. The subject total that appears on the marksheet already includes theory and practical, and that total is what enters the aggregate. Some subjects additionally require the theory portion to clear the minimum on its own, so check the circular for your subject.",
    ],
  ],
};

export default seo;
