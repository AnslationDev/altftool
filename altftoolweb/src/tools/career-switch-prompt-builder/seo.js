const seo = {
  title: "Career Switch Prompt Builder: Score Your Skill",
  metaDescription:
    "Compare your skills against a target role's requirements, see the overlap percentage and gap list, and get an AI prompt with a study timeline.",
  steps: [
    "Enter your Current role and Target role, then paste comma-separated lists into the Current skills and Target skills boxes — the page opens on Marketing executive to Product manager.",
    "Choose a Plan focus — prioritise the gap list, the CV rewrite, the interview narrative or the outreach messages — and the Overlap percentage, Band and Learning time in weeks recalculate as you type.",
    "Read the Gaps line under the score, then press Copy prompt to put the generated switch-plan prompt on your clipboard; Reset basics restores the starting roles and focus.",
  ],
  intro:
    "The Career Switch Prompt Builder compares the skills you already have against the skills a target role advertises, scores the overlap as a percentage of the requirement list, and writes an AI prompt that turns that gap analysis into a switch plan. It also converts the gaps into a study budget — hours per missing skill multiplied by the number of gaps, divided by the hours you can study each week — so the plan has a real timeline attached. Built for people changing field who need to know what actually transfers before they rewrite a CV.",
  useCases: [
    "Paste requirements from three real job adverts and see how many of them your current role already covers.",
    "Work out how many weeks of evening study it would take to close the gaps at six hours a week.",
    "Get CV wording that restates finance or operations experience in the vocabulary of an engineering or product team.",
    "Prepare an honest answer to the 'you have never done this job before' objection before an interview.",
  ],
  benefits: [
    ["Overlap scored, not guessed", "Matching is case-insensitive and substring-aware, so 'Python' counts against 'Python scripting'."],
    ["A timeline, not a wish list", "Gaps × hours per skill ÷ hours per week gives a week count you can actually hold yourself to."],
    ["Asks the model to push back", "The prompt tells the AI to name which claimed skills would not survive a technical interview."],
  ],
  faqs: [
    [
      "How do I know if a career switch is realistic?",
      "Compare your skills against the requirement list of several real job adverts: above roughly 80% overlap the move reads as a sideways step, 55–80% is a credible stretch with one bridging project, and below 30% usually needs retraining or an intermediate role. The percentage measures paper overlap only — evidence and referrals move the odds far more than the score does.",
    ],
    [
      "What are transferable skills?",
      "Transferable skills are capabilities that keep their value when the job title changes — stakeholder management, data analysis, writing, forecasting, project delivery — as opposed to tools or domain knowledge tied to one field. The practical test is whether a hiring manager in the new field would recognise the skill from your description without you explaining your old industry.",
    ],
    [
      "How long does it take to close a skill gap?",
      "This tool uses a default planning figure of 40 hours of deliberate practice per missing skill, which is one full-time week, and you can change it. That is a budgeting assumption rather than a research finding — depth of skill, prior background and the complexity of the tool all move the real number substantially.",
    ],
    [
      "Should I list every skill I have?",
      "List the ones you could defend in an interview with a concrete example, and leave out anything you have only read about. Overstating overlap inflates the score and produces a plan that skips the gap you most need to close.",
    ],
  ],
};

export default seo;
