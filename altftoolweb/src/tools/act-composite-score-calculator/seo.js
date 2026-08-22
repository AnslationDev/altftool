const seo = {
  title: "ACT Composite Score Calculator: Classic/Enhanced",
  metaDescription:
    "Average your 1-36 section scores into the ACT Composite with ACT's half-up rounding — 31.5 becomes 32 — for classic and enhanced 2025 formats.",
  steps: [
    "Choose an 'ACT format' of 'Enhanced ACT (April 2025 onwards) — English, Math, Reading' or 'Classic ACT — English, Math, Reading, Science'.",
    "Enter each scale score from 1 to 36 under English, Math, Reading and Science; on the enhanced format Science is optional and feeds only the STEM score.",
    "Read the ACT Composite beside 'Sum of counted sections', 'Unrounded average', 'Sections in Composite' and 'STEM score (Math + Science)', then press Copy result.",
  ],
  intro:
    "This calculator computes the ACT Composite score — the average of your section scale scores (each 1–36) rounded to the nearest whole number, with fractions of one-half or more rounding up, exactly as ACT, Inc. reports it. It supports both the classic four-section format (English, Math, Reading, Science) and the enhanced ACT introduced from April 2025, where the Composite averages English, Math and Reading and Science is an optional stand-alone score. Test-takers use it to convert practice-test section scores into the Composite that colleges see.",
  useCases: [
    "A student who scored E30 M31 R32 S33 on a classic practice test checking whether the 31.5 average rounds to 32",
    "A 2025 test-taker on the enhanced ACT verifying their Composite from English, Math and Reading alone",
    "A junior comparing two practice attempts to see which section gain would actually move the rounded Composite",
  ],
  benefits: [
    ["Official rounding", "Applies ACT's rule exactly — an average of 31.5 becomes 32, while 31.49 stays 31."],
    ["Both formats", "Handles the classic 4-section Composite and the enhanced 2025 3-section Composite."],
    ["STEM score included", "Also reports the rounded Math + Science average that appears on ACT score reports."],
  ],
  faqs: [
    [
      "How is the ACT composite score calculated?",
      "Add your section scale scores and divide by the number of sections, then round to the nearest whole number — fractions of 0.5 or more round up, below 0.5 round down. On the classic ACT that is the average of English, Math, Reading and Science; on the enhanced ACT (from April 2025) it is the average of English, Math and Reading only.",
    ],
    [
      "Does a 31.5 average round up to 32 on the ACT?",
      "Yes. ACT rounds fractions of one-half or more up, so section scores averaging 31.5 produce a Composite of 32. An average of 31.25 would round down to 31.",
    ],
    [
      "Does the Science section still count toward the ACT composite?",
      "Not on the enhanced ACT rolled out from April 2025 — Science became optional and is reported as a separate 1–36 score, with the Composite averaging English, Math and Reading. On classic ACT score reports, Science was one of the four sections averaged into the Composite.",
    ],
    [
      "What is a good ACT composite score?",
      "The national average Composite has hovered around 19–20 in recent years, while competitive universities typically see admitted-student middle ranges above 30. A useful benchmark is the middle 50% range published by each college you are targeting rather than a single cutoff.",
    ],
  ],
};

export default seo;
