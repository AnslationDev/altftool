const seo = {
  intro:
    "The Teacher Prompt Pack is a library of 10 fill-in-the-blank AI prompts for the recurring jobs of classroom teaching: lesson and unit planning, rubrics, written feedback, retrieval questions, differentiation, parent emails, report comments and routine resets. Each prompt fixes the constraints and the output format up front, pins down the year level for the ones that need it, and the sensitive ones carry built-in guardrails — no student names, observed behaviour instead of diagnoses, facts instead of speculation. You fill the blanks in your browser, the tool substitutes them into the template and shows the estimated size, then you copy the finished prompt into whichever assistant your school allows.",
  useCases: [
    "Turning shorthand marking notes like 'great dialogue, paragraphs run on' into a specific 120-word student comment with one improvement focus and a ten-minute next step.",
    "Building a four-level rubric for a persuasive letter where every descriptor is observable and the words 'good' and 'excellent' are banned.",
    "Drafting a first-contact parent email about missing homework that states dates and counts, invites the parent's perspective and proposes a specific call time.",
  ],
  benefits: [
    ["Privacy guardrails built in", "Prompts that touch students instruct the model to work from observed behaviour and [Student] placeholders — never names, records or diagnoses."],
    ["Objectives stay fixed", "The differentiation and planning prompts hold the learning objective constant, so scaffolded and stretch versions measure the same thing."],
    ["Runs locally", "Prompt assembly happens in the browser; no account, no API key and nothing you type leaves the page."],
  ],
  faqs: [
    [
      "Is it safe to put student information into an AI tool?",
      "Only if no personal data goes in. These prompts are written to work with observed behaviour, grades and your own notes, using a [Student] placeholder instead of names, and they never ask for records or diagnoses. Follow your school's data protection policy, and keep anything covered by FERPA, GDPR or an equivalent law out of any chatbot.",
    ],
    [
      "Can AI write my lesson plans for me?",
      "It can draft a workable structure in seconds, but the plan is only as good as what you tell it about prior knowledge, materials and timing. The lesson prompt here plans backwards from a stated objective, chunks direct instruction at eight minutes or less, and asks for the misconception to listen for in each segment — you still judge whether the sequence fits your actual class.",
    ],
    [
      "How do I get useful feedback comments instead of generic praise?",
      "Give the model your real marking notes and forbid it from inventing anything beyond them. The feedback prompt limits comments to 120 words, restricts improvement advice to one named focus, and requires a next step the student can do in under ten minutes on the same piece of work.",
    ],
    [
      "What makes a rubric descriptor usable?",
      "It describes observable features — what is present, absent or how often — rather than quality adjectives. The rubric prompt enforces this by banning words like 'good' and 'strong' and testing each cell against one standard: a colleague who has never met you could place a piece of work using only the words in the cell.",
    ],
  ],
};

export default seo;
