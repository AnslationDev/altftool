const seo = {
  title: "Indian Resume Prompt Builder: Pages, Bullets",
  metaDescription:
    "Budget your resume at 46 lines a page and ~28 words a bullet, check job-description keyword coverage, and get an AI prompt with notice period and CTC.",
  steps: [
    "Under What you want written pick a Task such as Rewrite my experience bullets, set the Tone, and name the Target job title and Target sector (optional).",
    "In Length budget enter Total years of experience, Pages allowed (1, 2 or 3 pages) and Roles you will list, then paste the opening's terms into Key terms from the job description and your bullets into Your current resume text.",
    "Keyword coverage reports how many of the terms matched, with rows for Missing keywords, Page budget, Lines left for bullets and Bullet allocation (recent first); Copy prompt copies the finished prompt shown below them.",
  ],
  intro:
    "Indian Resume Prompt Builder sizes your resume and then writes the AI prompt to rewrite it, using an A4 line budget of 46 usable lines per page at 11 pt and about 14 words per line. It works out how many pages your experience warrants, how many bullets actually fit once the header, summary, skills and education blocks have taken their lines, and how much of a job description's vocabulary your current text already covers. The prompt it produces carries Indian recruiter conventions — notice period, CTC in lakhs — and ATS parsing constraints into the model.",
  useCases: [
    "You have eight years of experience and four roles to fit on two pages: the layout planner tells you how many bullets each role gets before you start writing, instead of finding out after the resume spills onto page three.",
    "Applying to a specific opening — paste the job description's key terms and your resume text to see which terms are missing before you decide which ones are genuinely true of you and worth working in.",
    "You want ChatGPT or Claude to rewrite your bullets but keep getting generic 'results-driven professional' output; the generated prompt pins the model to the XYZ pattern, a past-tense action verb and a 28-word cap per bullet.",
  ],
  benefits: [
    ["Bullet counts come from geometry, not guesswork", "Each bullet is budgeted at two printed lines, so the allocation across roles reflects the space your fixed sections actually leave."],
    ["Keyword matching is whole-term", "Coverage is measured with bounded matching, so 'react' does not falsely match 'reactive' and inflate your score."],
    ["Front-loads the most recent role", "Spare bullets go to your current role first, up to six, while older roles are capped at four and never drop below two."],
  ],
  faqs: [
    [
      "How many pages should an Indian resume be?",
      "One page under roughly five years of experience, two from five to fifteen, and three only for a long or deeply technical career. The tool caps the plan at three pages, because past that recruiters stop reading rather than scroll further.",
    ],
    [
      "How long should a resume bullet point be?",
      "Keep it to about 28 words — that is two printed lines at roughly 14 words per line on A4 at 11 pt. Longer bullets wrap to a third line, which quietly costs you one bullet elsewhere on the page.",
    ],
    [
      "What percentage of job description keywords should my resume match?",
      "Aim for 60 percent as a floor and 80 percent as a strong match, but treat these as targets to work toward rather than a pass mark. No applicant tracking system publishes a fixed rejection threshold — that figure is a myth; what is real is that mirroring the description's own wording reads as a closer fit to both parsers and humans.",
    ],
    [
      "Should I put a photo, date of birth or marital status on an Indian resume?",
      "Leave them off. They carry no hiring value and can confuse resume parsers, even though many Indian templates still include them. Notice period and current/expected CTC in lakhs per annum are the India-specific fields actually worth stating, because recruiters screen on them before reading your experience.",
    ],
  ],
};

export default seo;
