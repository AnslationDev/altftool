const seo = {
  intro:
    "The CBSE Lesson Plan Prompt Builder converts a class, subject, chapter and period length into an AI prompt that already contains a minute-by-minute time split and the CBSE marks scheme that applies to that class. Time is divided using either the 5E learning cycle (Engage 10%, Explore 25%, Explain 30%, Elaborate 20%, Evaluate 15%) or the five Herbartian steps, allocated by the largest-remainder method so the phase minutes always add back to the full period. It is built for CBSE teachers and heads of department who need an inspection-ready plan file without hand-calculating the timings.",
  useCases: [
    "Writing a two-period Class 10 Science plan on Chemical Reactions and Equations where 90 minutes has to be split across the 5E phases exactly.",
    "Producing a Herbartian-format plan for a Class 7 Social Science lesson because the school's plan file template follows the five traditional steps.",
    "Preparing a Class 12 Physics plan that names the Theory 70 + Practical 30 split so the lesson's assessment ties back to the board scheme.",
  ],
  benefits: [
    ["Timings that add up", "Phase minutes are allocated by largest remainder, so 45 or 50 minute periods never drift by a minute."],
    ["Correct marks scheme", "Class 9-10 gets 80 + 20 with the four internal components; Classes 11-12 get 70/30 or 80/20 by subject."],
    ["No invented references", "The prompt explicitly forbids the model from inventing CBSE circular numbers or NCERT page numbers."],
  ],
  faqs: [
    [
      "What is the internal assessment scheme for CBSE Class 10?",
      "Each subject carries 80 marks of board or annual theory plus 20 marks of internal assessment. The 20 is split equally into Periodic Test (5), Multiple Assessment (5), Portfolio (5) and Subject Enrichment (5), so no single component decides the internal grade.",
    ],
    [
      "How long should a CBSE lesson plan be?",
      "Plan for the period you actually get, most commonly 35 to 45 minutes. Depth matters more than length: three to five observable learning outcomes, a stated time for each teaching phase, and one check for understanding before the bell is enough for a plan file.",
    ],
    [
      "What is the 5E lesson plan model?",
      "5E is a five-phase learning cycle - Engage, Explore, Explain, Elaborate, Evaluate - in which students investigate before the teacher explains. A common working split is 10 / 25 / 30 / 20 / 15 percent of the period, which on a 40 minute period gives 4, 10, 12, 8 and 6 minutes.",
    ],
    [
      "How many teaching days does CBSE require in a session?",
      "CBSE affiliation bye-laws set a minimum of 220 working days of teaching in an academic session, excluding admission and examination days. That figure is the practical ceiling when you spread a unit's periods across the year.",
    ],
  ],
};

export default seo;
