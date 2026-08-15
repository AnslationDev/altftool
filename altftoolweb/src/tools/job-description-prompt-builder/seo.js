const seo = {
  title: "Job Description Prompt Builder: Word Budget and Bias",
  metaDescription:
    "Build one AI prompt that keeps must-haves apart from nice-to-haves, splits your word target across six sections, and flags 22 coded wordings.",
  steps: [
    "Fill in the job title, level, employment type, working pattern, location and team context, then list must-have requirements and nice-to-haves one per line.",
    "Choose a tone and a target advert length between 150 and 900 words, and tick the equal-opportunity and interview-adjustments closing if you want one.",
    "Read the flagged wordings with their suggested swaps and the six-section word budget, then press Copy prompt.",
  ],
  intro:
    "The Job Description Prompt Builder converts role facts into a single AI prompt that forces hard requirements and optional extras into separate sections and allocates a word budget to each part of the advert. It splits your target length across six standard sections using the largest-remainder method, so the section figures always add up to the total, and it scans your input for gender-coded, age-coded and ableist wordings drawn from the masculine and feminine adjective lists used in Gaucher, Friesen and Kay's 2011 research on job-advert language. Written for hiring managers and recruiters who want a consistent advert structure instead of a blank page.",
  useCases: [
    "Rewrite a legacy advert that lists fourteen requirements down to a defensible set of hard filters plus a nice-to-have section.",
    "Give every hiring manager on a team the same prompt so adverts across ten open roles share one structure and tone.",
    "Check a draft for wordings like 'rockstar', 'digital native' or 'cultural fit' before the advert reaches a job board.",
    "Plan a 350-word advert for a mobile job feed and see how many words each section can afford.",
  ],
  benefits: [
    [
      "Hard filters stay separate",
      "The prompt forbids the model from phrasing an optional skill as 'required' or 'essential'.",
    ],
    [
      "Word budget that adds up",
      "Each section gets an exact word allowance and the six figures always sum to your target.",
    ],
    [
      "Bias wording flagged inline",
      "Twenty-two gender-coded, age-coded and ableist terms are matched with the reason and a suggested swap.",
    ],
  ],
  faqs: [
    [
      "How many requirements should a job description have?",
      "Keep hard requirements to about six; this tool caps the finished advert at that number. Recruiting style guides from LinkedIn, Indeed and the UK Government Digital Service all advise a short filter list because each extra must-have narrows the pool, and research on advert language shows the effect is stronger for candidates from under-represented groups. Everything else belongs under 'nice to have'.",
    ],
    [
      "What is the difference between must-have and nice-to-have in a job description?",
      "A must-have is a requirement you would reject an otherwise strong candidate for lacking on day one; a nice-to-have is anything you would still hire without. The practical test is whether you would actually screen someone out for it. Nice-to-haves must never be worded as 'required', 'essential' or 'minimum', because many candidates read any listed item as mandatory.",
    ],
    [
      "Which words make a job description less inclusive?",
      "Masculine-coded adjectives such as aggressive, dominant, ruthless and fearless; age proxies such as young, energetic, digital native and recent graduate; gendered nouns such as manpower and salesman; and ableist phrasing such as able-bodied. Hype titles like rockstar, ninja and guru also tell a candidate nothing about the actual work. This tool matches all of these and suggests a replacement.",
    ],
    [
      "How long should a job advert be?",
      "Roughly 300 to 600 words works for most roles, which is why this builder accepts 150 to 900. Below about 150 words you cannot cover the role, the requirements and the package; above about 900 words read-through falls away, particularly on mobile job feeds where most applications now start.",
    ],
  ],
};

export default seo;
