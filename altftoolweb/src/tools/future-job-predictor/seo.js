const seo = {
  title: "Future Job Predictor: Rank 5 Careers on 10 Skills",
  metaDescription:
    "Rate 10 skills on 0-100 sliders; each career starts at 70 and moves 0.15 per point off 50. Returns a ranked list, radar chart and study roadmap.",
  steps: [
    "On step 1 enter Age, Country, \"Education Level\" and \"Current Occupation\", then on step 2 rate all ten skills — Programming, Communication, Leadership, Creativity, Mathematics, Design, Writing, AI Knowledge, Data Analysis, Problem Solving — on 0-100 sliders.",
    "Pick your interests, personality traits and work preferences (Remote, Hybrid, Office, Startup, Corporate, High Salary, Work Life Balance) across steps 3 to 5, then press \"Run Compatibility Engine\".",
    "Open the \"Fit Analytics\" tab for the five ranked careers with Salary range, Future Demand, Automation Risk and Est. Prep Time, or \"Study Roadmap\" for the missing skills and certification sequence.",
  ],
  intro:
    "Future Job Predictor scores you against five forward-looking careers — AI & Prompt Engineer, Climate Restoration Architect, Cybersecurity Analyst Pro, UI & UX Designer and Space Operations Engineer — by rating ten skills on 0-100 sliders and picking your interests, personality traits and work preferences. Each career starts from a base match of 70 and moves by 0.15 points for every point your rating on its four required skills sits above or below 50, with a further +5 for a Remote or High Salary preference match, capped at 100. The ranked result comes with a skill-fit radar, a salary comparison chart, a four-stage roadmap and each role's automation-risk and demand figures.",
  useCases: [
    "A final-year student deciding between a cybersecurity certificate and a design portfolio wants to see which of the two scores higher against their own skill ratings.",
    "Someone mid-career weighing a switch checks the automation-risk numbers side by side — 5 for Space Operations Engineer against 25 for UI & UX Designer — before committing to retraining.",
    "A careers adviser running a workshop needs a screen that turns a student's self-rated strengths into a ranked shortlist plus a named certification to start with.",
  ],
  benefits: [
    ["Shows the working, not just a job title", "The radar chart plots your rating against each required skill, so you can see exactly which gap is costing you the match."],
    ["Ranks all five, not one answer", "Every career gets a score and the list is sorted, so the second and third choices stay visible for comparison."],
    ["Turns the match into next steps", "The roadmap names the missing skills, target certifications and a months-1-3 to year-3 sequence for the career you select."],
  ],
  faqs: [
    [
      "How is the career match score calculated?",
      "Every career starts at 70. For each of its four required skills, the score moves by 0.15 for every point your slider sits above or below 50 — so rating all four at 100 adds 30 and takes the match to the 100 cap — and preferences for Remote or High Salary can add 5 each where the career qualifies.",
    ],
    [
      "How long does it say each career takes to enter?",
      "The learning estimate is tied to difficulty: 3-5 months for Low, 6-9 months for Medium and 12-18 months for High. Separately each career carries a years-to-enter figure, from 1 year for AI & Prompt Engineer or UI & UX Designer up to 4 years for Space Operations Engineer.",
    ],
    [
      "Are the salary ranges real market data?",
      "No — they are fixed US-dollar reference bands built into the tool, such as $110,000-$175,000 for AI & Prompt Engineer and $130,000-$210,000 for Space Operations Engineer. Check current listings and national salary surveys for your own country before treating any figure as a target.",
    ],
    [
      "What is the 2050 section?",
      "It is a novelty spinner that lands on one of five invented future roles, including Asteroid Mining Superintendent and Quantum Security Warden. It is separate from the scored prediction and is there for fun rather than planning.",
    ],
  ],
};

export default seo;
