const seo = {
  intro:
    "This countdown converts the days left before GATE into a dated subject rotation for your branch, using the halving rule that governs revision: each pass over the syllabus gets half the days of the pass before it, so three cycles split the calendar 4/7, 2/7 and 1/7. Days inside a cycle are shared between the official syllabus sections in proportion to the weight you give each one, and the schedule tells you which subject you are supposed to be on today. Subject lists are the section headings from the GATE syllabus for CS, ME, CE, EE and EC.",
  useCases: [
    "Turning six months before GATE into a dated plan that covers all ten Computer Science sections three times",
    "Giving Engineering Mathematics and Signals & Systems a heavier weight than Electromagnetics and seeing the rotation shift",
    "Checking mid-preparation which subject the plan says you should be revising today and how many days of that block are left",
  ],
  benefits: [
    ["Compression built in", "Later revision passes are automatically shorter, which is how revision actually works."],
    ["Official syllabus sections", "Each branch uses the section headings from the GATE syllabus, not an invented topic list."],
    ["Nothing quietly vanishes", "Subjects squeezed to zero days in any cycle are flagged so you notice before the exam does."],
  ],
  faqs: [
    [
      "When is the GATE exam held?",
      "GATE is written in early February, spread over two weekends in multiple sessions, and is conducted by one of the IITs or IISc on a yearly rotation. The organising institute publishes the exact session dates with the application notification, usually around August or September.",
    ],
    [
      "What is the GATE exam pattern and marking scheme?",
      "GATE is a 3 hour computer-based test of 65 questions for 100 marks, with General Aptitude carrying 15 marks and the subject paper 85. Multiple-choice questions carry negative marking of one third of a mark on 1 mark questions and two thirds on 2 mark questions, while multiple-select and numerical answer type questions carry no negative marking.",
    ],
    [
      "How long is a GATE score valid?",
      "A GATE score is valid for 3 years from the date the result is announced. That validity governs both postgraduate admissions and PSU recruitment through GATE, so a score obtained in one year can be used across three admission cycles.",
    ],
    [
      "How many times should I revise the GATE syllabus?",
      "Two to three full passes is the common pattern, and this planner defaults to three because the halving rule needs at least three cycles to show its effect. What matters more than the count is that later passes are shorter — if your second pass takes as long as your first, you are re-reading rather than revising.",
    ],
  ],
};

export default seo;
