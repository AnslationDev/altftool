const seo = {
  title: "Lab Attendance Calculator: 75% Bar and Contact Hours",
  metaDescription:
    "Scores practical attendance against its own bar, shows the combined figure by session count and by contact hours, and counts unsigned experiments.",
  steps: [
    "Fill the Theory paper block: Lectures held, Lectures attended, Lectures still to come, Contact hours per lecture and Attendance required (%).",
    "Do the same under Practical / lab course, adding Contact hours per lab session, Experiments prescribed and Experiments completed and signed.",
    "Compare Combined, counting sessions against Combined, counting contact hours plus Experiments still pending, then press Copy result for the summary.",
  ],
  intro:
    "This tracker scores practical attendance as its own head of account rather than folding it into the theory average, because that is how universities detain students. It computes the lab percentage as sessions attended ÷ sessions held × 100, tests it against a separate bar (usually 75%), and reports the combined figure two ways — counting sessions and counting contact hours, since a two-period lab slot is marked as two hours on the roll. Pending experiments are tracked alongside, because a complete record book is a second, independent condition for a practical course.",
  useCases: [
    "An engineering student at 88% in theory but 66% in the Data Structures lab checking whether the four remaining lab slots are enough to reach 75%.",
    "Working out why the college portal shows a lower combined attendance than a simple session count suggests, when three-hour lab slots are weighted by contact hours.",
    "A student who attended every lab but has four experiments unsigned, seeing that the record book alone can hold up the practical result.",
  ],
  benefits: [
    ["Treats the lab as its own bar", "Shows the practical shortfall that a strong theory percentage hides."],
    ["Weights sessions by contact hours", "Reproduces the combined figure institutions publish for two- and three-period labs."],
    ["Counts the record book", "Puts unsigned experiments next to the percentages as a separate blocker."],
  ],
  faqs: [
    [
      "Is lab attendance counted separately from theory?",
      "Yes. A practical course carries its own course code, its own roll and its own attendance percentage, so a student can clear the theory bar and still be detained in the lab. Check the practical figure on its own line in the portal rather than reading only the overall average.",
    ],
    [
      "How is combined theory and practical attendance calculated?",
      "Either by counting sessions — (theory attended + labs attended) ÷ (theory held + labs held) — or by weighting each entry by its contact hours, which is what most timetable-driven portals do. A student at 32 of 40 lectures and 8 of 12 two-hour labs is 76.9% by session count but exactly 75.0% by contact hours, because the missed labs carry double weight.",
    ],
    [
      "How many lab classes can I miss?",
      "At a 75% bar, one missed session in four is the ceiling, but labs run weekly rather than daily, so a semester may hold only 12 to 15 sessions in total — three absences out of 12 already puts you at exactly 75% with no margin left. This is why a lab shortfall is far harder to recover than a lecture shortfall.",
    ],
    [
      "What happens if my lab record is incomplete?",
      "Most institutions treat the completed and signed record, along with the prescribed list of experiments, as a condition for the practical examination that is separate from attendance. Sessions attended without the write-up submitted usually do not count as the experiment being performed. Ask your lab in-charge about a repeat or make-up slot while the semester is still running.",
    ],
  ],
};

export default seo;
