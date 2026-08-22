const seo = {
  title: "TOEFL to IELTS Converter (ETS Linking Table)",
  metaDescription:
    "Add your four TOEFL iBT sections (0-30 each) to get the 0-120 total, ETS performance levels and the IELTS band from the ETS linking table (94-101 = 7.0).",
  steps: [
    "Enter your Reading, Listening, Speaking and Writing scores, each 0 to 30 (a 26/25/23/24 example loads by default).",
    "The TOEFL iBT total out of 120 and each section's ETS performance level update as you type.",
    "Read the IELTS equivalent from the ETS linking table — for example 102-109 maps to band 7.5 — then click Copy result for a text summary.",
  ],
  intro:
    "This converter computes the TOEFL iBT total — the sum of the Reading, Listening, Speaking and Writing sections, each scored 0–30 for a maximum of 120 — and maps it to an IELTS band using the score linking table ETS published from its TOEFL–IELTS comparison study. It also labels each section with the ETS performance level (Advanced, High-Intermediate, and so on) shown on official score reports, so applicants can read a practice score the way an admissions office would.",
  useCases: [
    "An applicant with R26 L25 S23 W24 checking their 98 total against a university's TOEFL 90 / IELTS 6.5 requirement",
    "A student who took IELTS before comparing an old 7.0 band with the TOEFL total they now need",
    "A test-taker deciding which section to retake by seeing which ETS performance level is dragging behind",
  ],
  benefits: [
    ["Official linking table", "IELTS comparison uses the ETS score comparison study, not an invented mapping."],
    ["ETS section levels", "Each 0–30 section is labelled with the performance level from post-2019 score reports."],
    ["Threshold clarity", "See exactly how close the total sits to the next IELTS-equivalent band boundary."],
  ],
  faqs: [
    [
      "What TOEFL score is equal to IELTS 7.0?",
      "94–101 on the TOEFL iBT total corresponds to IELTS band 7.0 in the ETS linking table, with 102–109 matching 7.5. The comparison comes from an ETS study of candidates who took both tests, so treat it as an approximation rather than a guarantee.",
    ],
    [
      "How is the TOEFL total score calculated?",
      "It is the simple sum of the four section scores — Reading, Listening, Speaking and Writing, each scaled 0–30 — giving a total from 0 to 120. There is no averaging or rounding; a 26 + 25 + 23 + 24 profile totals 98.",
    ],
    [
      "What is a good TOEFL score for university admission?",
      "Many universities set undergraduate minimums around 80 and competitive graduate programmes commonly ask for 90–100, with top programmes at 100+. Requirements are institution-specific and some also set per-section minimums, so check the exact figure for each programme.",
    ],
    [
      "What do the TOEFL performance levels like Advanced mean?",
      "ETS divides each section into proficiency bands on the score report — for Reading and Writing, Advanced is 24–30 and High-Intermediate is 18–23 and 17–23 respectively; for Listening, Advanced is 22–30; for Speaking, Advanced is 25–30. They summarise what a scorer at that range can typically do rather than changing the numeric score.",
    ],
  ],
};

export default seo;
