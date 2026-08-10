const seo = {
  title: "Parent Progress Summary: Marks, Grade, Attendance",
  metaDescription:
    "Turn subject marks and attendance into a copy-ready summary: weighted percentage, A1-E grade band, the 75% attendance check, strengths and focus areas.",
  steps: [
    "Enter Student name, Term / exam label and Attendance (%), then fill each subject's Marks obtained and Maximum marks.",
    "Press 'Add subject' for extra rows; the overall figure is total obtained over total maximum, graded on the 10-point A1 to E bands.",
    "Read the overall grade, strengths at 75%+ and focus areas below 60%, then press Copy summary to paste the one-page text.",
  ],
  intro:
    "This tool converts a student's subject-wise marks and attendance percentage into a plain-language, one-page progress summary a parent can read in a minute. The overall score uses the weighted percentage (total obtained over total maximum), grades follow the 10-point bands common on Indian report cards (A1 for 91-100 down to E below 33), and attendance is checked against the widely used 75% minimum for exam eligibility. Teachers, tutors and parents get a copy-ready text block with strengths and focus areas already picked out.",
  useCases: [
    "A class teacher preparing short written summaries for thirty students before parent-teacher meetings",
    "A tutor sending a monthly progress note to parents on WhatsApp without retyping the whole mark sheet",
    "A parent condensing a dense school report card into the three things worth discussing at home",
  ],
  benefits: [
    ["Copy-ready text", "The full summary is generated as plain text you can paste into an email, message or diary note."],
    ["Attendance rule built in", "Attendance is flagged whenever it falls below the common 75% eligibility minimum."],
    ["Automatic triage", "Subjects at 75%+ are listed as strengths and those below 60% as focus areas — no manual sorting."],
  ],
  faqs: [
    [
      "How do I write a progress summary for parents?",
      "Lead with the overall percentage and grade, then attendance, then two or three specific strengths and focus subjects. This tool generates exactly that structure from raw marks, so the summary stays factual rather than impressionistic.",
    ],
    [
      "What do the grades A1, A2, B1 on a report card mean?",
      "They are 10-point absolute bands used on CBSE-pattern report cards: A1 is 91-100%, A2 is 81-90%, B1 is 71-80%, and so on down to D (33-40%, the usual pass band) and E below 33%. Individual schools and boards can apply different bands, so treat them as a common convention rather than a universal rule.",
    ],
    [
      "Why does attendance matter on a progress report?",
      "Because most Indian boards and universities require roughly 75% attendance for exam eligibility — CBSE's examination bye-laws and UGC norms both use that figure. The tool flags any attendance below 75% so the conversation happens before it becomes an eligibility problem.",
    ],
    [
      "How are strengths and focus areas chosen?",
      "Subjects scoring 75% or more are listed as strengths and subjects under 60% as focus areas, each sorted by score. The thresholds are this tool's rubric — a full grade above and below the middle bands — and the raw subject table is always shown so you can apply your own judgement.",
    ],
  ],
};

export default seo;
