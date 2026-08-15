const seo = {
  title: "SPPU Attendance Calculator — 75% Defaulter Check",
  metaDescription:
    "Enter lectures held and attended per subject to see which subjects sit under SPPU's 75% line, the exact safe bunks left, and the streak to recover.",
  steps: [
    "For each subject enter 'Lectures held' and 'Attended', using 'Add subject' for up to 20 subjects.",
    "The 75% check runs per subject as you type, marking each row Safe or 'Defaulter zone' immediately.",
    "Read 'Safe bunks left' and 'Attend in a row to recover' for every subject plus the aggregate, then click 'Copy result' for a shareable summary.",
  ],
  intro:
    "This calculator checks SPPU (Savitribai Phule Pune University) attendance subject by subject: percentage = lectures attended ÷ lectures held × 100, measured against the 75% line affiliated colleges use for defaulter lists. For safe subjects it computes the exact number of lectures you can still bunk while holding 75% — solving attended ÷ (held + n) ≥ 0.75 — and for short subjects, the consecutive lectures needed to climb back.",
  useCases: [
    "An SPPU engineering student checking each subject before the college publishes its monthly defaulter list",
    "Working out how many DBMS lectures can be skipped for a hackathon without falling under 75% in that subject",
    "A student at 65% in one subject finding the exact run of lectures needed to get out of the defaulter zone",
  ],
  benefits: [
    ["Subject-wise, like colleges check", "Defaulter lists are drawn per subject, so one weak subject is flagged even when the aggregate is healthy."],
    ["Exact safe bunk count", "Computes floor(100 × attended ÷ 75 − held) per subject — the real head-room, not a guess."],
    ["Recovery plan included", "Short subjects get the precise consecutive-lecture count needed to reach 75% again."],
  ],
  faqs: [
    [
      "What is the minimum attendance required in SPPU?",
      "75% of lectures and practicals in each subject is the line SPPU-affiliated colleges apply when preparing defaulter lists and deciding who is sent up for university exams. Colleges maintain the registers and take the final action, including any condonation on medical or genuine grounds.",
    ],
    [
      "How many lectures can I bunk and still keep 75% attendance?",
      "Solve attended ÷ (held + n) ≥ 0.75, giving n = floor(100 × attended ÷ 75 − held). At 34 of 40 lectures (85%) you can miss 5 more; at exactly 75% you can miss none — every further absence drops you below the line immediately.",
    ],
    [
      "What happens if I am on the SPPU defaulter list?",
      "Consequences are set by the college: typically a warning, fines, extra assignments, parents being informed, and in persistent cases being barred from term exams or not sent up for the university examination. Getting off the list means raising the subject's percentage back over 75%, which this tool quantifies exactly.",
    ],
    [
      "Is SPPU attendance counted per subject or overall?",
      "Colleges track it per subject — theory and practical registers are separate — so a strong overall average cannot cover one subject at 60%. This tool reports both the per-subject status and the aggregate so the difference is visible at a glance.",
    ],
  ],
};

export default seo;
