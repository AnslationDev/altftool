const seo = {
  intro:
    "The Eisenhower Matrix Tool sorts a task list into four quadrants by testing two 1-10 scores against a single threshold: important means importance is at or above the threshold, urgent means urgency is. That gives Do now (urgent and important), Schedule (important, not urgent), Delegate (urgent, not important) and Drop (neither) — the grid Stephen Covey drew from Eisenhower's 1954 remark that the urgent are not important and the important are never urgent. It is for anyone whose to-do list has stopped telling them what to work on next, and it adds an hours column so you can see how much of the week is going to firefighting.",
  useCases: [
    "Sort a 20-item Monday backlog and find out how many hours are actually sitting in the Do-now quadrant.",
    "Show a manager that half the week's estimated hours are delegatable admin rather than important work.",
    "Raise the threshold from 6 to 8 to see which tasks are genuinely critical when the week is already full.",
  ],
  benefits: [
    ["A rule, not a hunch", "Quadrants come from one explicit threshold test on both axes, so the sort is reproducible."],
    ["Hours, not just counts", "Weights each quadrant by estimated hours, which is what actually competes for your week."],
    ["Adjustable strictness", "Move the threshold to change what counts as important or urgent without re-scoring every task."],
  ],
  faqs: [
    [
      "What are the four quadrants of the Eisenhower Matrix?",
      "Q1 urgent and important (do it now), Q2 important but not urgent (schedule it), Q3 urgent but not important (delegate it) and Q4 neither (drop it). Q2 is the quadrant that gets squeezed out, and it is the one that prevents future Q1 emergencies.",
    ],
    [
      "Where do I set the cut-off between high and low scores?",
      "This tool defaults to 6 on a 1-10 scale, so a task scoring 6 or more on an axis counts as high. Scoring 6 for importance and 6 for urgency lands in Q1; 5.9 and 5.9 lands in Q4, which is why the threshold is adjustable rather than fixed.",
    ],
    [
      "How do I turn a deadline into an urgency score?",
      "The tool's convention is that a task due today or already overdue scores 10, a task due at or beyond the 14-day planning horizon scores 1, and everything in between is linear — so seven days out scores 5.5. You can override any derived score by typing your own.",
    ],
    [
      "Is the Eisenhower Matrix the same as the Covey time-management matrix?",
      "They are the same four-quadrant grid. Eisenhower supplied the urgent-versus-important distinction; Covey popularised it as a 2x2 in The 7 Habits of Highly Effective People and named quadrant two as the one to protect.",
    ],
  ],
};

export default seo;
