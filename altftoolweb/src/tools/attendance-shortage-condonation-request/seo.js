const seo = {
  title: "Attendance Condonation Letter & 75% Shortfall",
  metaDescription:
    "Get your exact attendance percentage, how many classes short of 75% you are, and how many more would fix it — then draft the condonation request.",
  steps: [
    "Enter Classes or working days conducted, Classes attended, Attendance required (%), Classes still to be held and the Institution's condonation floor (%).",
    "Choose Why the classes were missed, set Absent from and Absent until, and use Add the specifics (optional) so the matching evidence list appears.",
    "Read Your attendance percentage with Minimum classes needed so far and Classes short right now, fill Student name, Roll or register number, Programme and Department, then press Copy letter.",
  ],
  intro:
    "A condonation request asks an institution to waive a shortfall against its attendance rule so a student can still sit the examination, and this tool does the arithmetic before it writes the letter. From classes conducted and attended it gives the exact percentage, the number of classes you are short of the 75% bar that Indian boards and universities normally apply, and the smallest number of remaining classes that would pull you back over it — solved from (attended + x) / (conducted + x) >= the required fraction. It then drafts the application with the ground, the specific documents that ground needs, and the undertaking a committee expects to see.",
  useCases: [
    "Check whether attending every remaining class can still take you past 75%, or whether condonation is the only route.",
    "Draft the request after a hospitalisation, listing the discharge summary and fitness certificate as enclosures.",
    "Show a department how many classes you can still afford to miss while staying eligible.",
    "Put a written catch-up undertaking on record alongside the request so it reads as a plan, not an excuse.",
  ],
  benefits: [
    ["Exact shortfall", "Converts a vague percentage into the whole number of classes you are actually short."],
    ["Recovery maths", "Solves for the classes still to attend, and tells you when the gap can no longer be closed."],
    ["Ground-specific evidence", "Each ground brings its own document list, because an unsupported request is usually refused."],
  ],
  faqs: [
    [
      "What is the minimum attendance to sit an exam in India?",
      "Seventy-five per cent of classes or working days is the standard bar. CBSE Examination Bye-laws require 75% attendance for admission to the Class 10 and Class 12 examinations, and most university ordinances apply the same figure per subject or per semester.",
    ],
    [
      "How many classes do I need to attend to get back to 75%?",
      "Solve (attended + x) / (conducted + x) >= 0.75 for x, which gives x >= (0.75 x conducted - attended) / 0.25. For a student at 78 of 120 classes that works out to 48 more classes, so if fewer than 48 remain the shortfall cannot be recovered by attendance alone.",
    ],
    [
      "On what grounds is attendance shortage condoned?",
      "Documented ones: prolonged illness or hospitalisation, surgery and recovery, a death or serious illness in the immediate family, representing the institution or state in sport or NCC/NSS, and approved academic or cultural duty. Condonation is discretionary, and most institutions will not consider it below a second floor, commonly 65%.",
    ],
    [
      "What should I attach to a condonation letter?",
      "Proof that matches the ground and the exact dates — a doctor's certificate naming the diagnosis and rest period, a discharge summary, a death certificate, or a selection letter from a recognised federation. Attach the attendance statement from the department as well, so the committee is checking your figures rather than recalculating them.",
    ],
  ],
};

export default seo;
