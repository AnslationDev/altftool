const seo = {
  title: "Socratic Tutor AI Prompt with a Graded Hint Ladder",
  metaDescription:
    "Build an AI tutor prompt that asks one guiding question per turn, escalates a 2-5 rung hint ladder, and uses Paul's six Socratic question categories.",
  steps: [
    "Enter the Subject and optional \"Topic or problem\", pick a \"Student level\" (Primary / middle school, High school, Undergraduate or Adult self-learner) and set \"Hint ladder rungs (2–5)\".",
    "Tick the six Socratic question categories from Paul's taxonomy and choose whether to \"Allow revealing the full solution once every hint rung has been used\".",
    "Read the \"Generated prompt\" panel and click \"Copy prompt\", then paste it as the first message or system prompt of a new AI chat.",
  ],
  intro:
    "The Socratic Tutor Prompt Builder creates an AI tutoring prompt that teaches by asking one guiding question per turn instead of stating answers. Its questioning moves come from Richard Paul's six-category taxonomy of Socratic questions, and stuck students are helped through a graded 2-5 rung hint ladder that escalates one step at a time. Parents, teachers and self-learners get a tutor that builds reasoning rather than dependence.",
  useCases: [
    "A parent sets up a homework companion for a high-schooler that nudges with questions and only reveals a worked solution after four escalating hints.",
    "A university TA gives students a practice tutor for problem sets that names the relevant theorem before ever showing a step.",
    "A self-learner studying programming configures a never-reveal tutor to force full independent problem-solving.",
  ],
  benefits: [
    ["One question per turn", "The prompt forbids lectures and multi-part questions, keeping the student doing the thinking."],
    ["Graded hint ladder", "Help escalates rung by rung — from a focusing question to naming the concept to one worked step — never jumping straight to the answer."],
    ["Grounded in Paul's taxonomy", "Questions draw on the six classic Socratic categories: clarification, assumptions, evidence, viewpoints, implications and meta-questions."],
  ],
  faqs: [
    [
      "What is Socratic questioning in tutoring?",
      "Socratic questioning teaches by asking structured questions that lead a student to construct the answer themselves, rather than being told it. This tool encodes Richard Paul's widely used taxonomy of six question categories — clarification, probing assumptions, reasons and evidence, viewpoints, implications, and questions about the question — directly into the prompt.",
    ],
    [
      "What is the hint ladder and how does it work?",
      "The hint ladder is a fixed escalation sequence of 2 to 5 rungs the AI must climb one step at a time when a student is stuck: first a focusing question, then naming the relevant concept, then a structural nudge, then an analogous worked example, and finally one intermediate step. The AI may only escalate after \"I don't know\", two wrong attempts in a row, or a direct request for the answer.",
    ],
    [
      "Can the tutor ever give the final answer?",
      "That is your choice. With reveal allowed, the AI may walk through the full solution only after every hint rung is used, and must immediately pose a similar practice problem. With reveal disabled, it never shows the solution and instead suggests a break or a prerequisite topic.",
    ],
    [
      "Who is this prompt suitable for?",
      "The prompt adapts wording to four levels: primary/middle school, high school, undergraduate and adult self-learners. It is an informational study aid — it does not replace a qualified teacher, and generated guidance should be sanity-checked for advanced or high-stakes material.",
    ],
  ],
};

export default seo;
