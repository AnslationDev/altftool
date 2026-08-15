const seo = {
  title: "AI Parenting Prompt Builder: Activities by Age",
  metaDescription:
    "Maps a child's age to a Piaget stage and a 2–5 minutes-per-year attention block, fits activities into the minutes you have, then writes the AI prompt.",
  steps: [
    "Enter Age in years and Minutes you have, then choose what the time is for and where you are — a small indoor flat, outdoors, a car or a quiet clinic.",
    "Add what they are into right now and what you have to hand; the Piagetian stage, the block length and 3 minutes per changeover fix how many fit.",
    "Activities that fit the time appears with the AAP media line and the sleep band; Copy prompt takes the wording with its word and token count.",
  ],
  intro:
    "The Parenting Prompt Builder maps a child's age onto one of Piaget's four stages of cognitive development, converts that age into a realistic attention block using the 2–5 minutes per year of age planning heuristic, then works out how many activities fit the minutes you actually have once 3 minutes of setup and tidying between blocks is counted. Those figures go straight into an AI prompt, so the model plans for a 4-year-old with 45 minutes — two blocks of about 14 minutes with 14 minutes of slack — instead of an average child with unlimited time. It is written for parents and carers who want age-appropriate activities and conversation starters that match the space they are in and the objects already in the house.",
  useCases: [
    "A parent with 45 minutes before dinner and a 4-year-old gets two 14-minute screen-free activities built around dinosaurs and whatever is in the kitchen cupboard.",
    "A carer in a clinic waiting room asks for quiet conversation starters for a 9-year-old, with open questions and one deeper follow-up each.",
    "A parent planning a bedtime wind-down for a 3-year-old gets low-light, low-movement activities plus the AAP media note for that age band and the 10–13 hour sleep range.",
  ],
  benefits: [
    [
      "Attention span drives the plan",
      "The block length comes from the 2–5 minutes per year of age heuristic, capped at 30 minutes, so a plan for a 3-year-old is never written as though they will sit still for half an hour.",
    ],
    [
      "Transitions are counted, not ignored",
      "Fitting n activities needs n−1 changeovers, and 3 minutes is allowed for each, so the plan actually fits the time rather than overrunning by a quarter of it.",
    ],
    [
      "Stage-appropriate, with explicit limits",
      "The prompt tells the model what the stage supports and what it does not — no hypotheticals for a preoperational child, no babyish framing for a teenager — and forbids medical, diagnostic or moralising output.",
    ],
  ],
  faqs: [
    [
      "How long is a child's attention span by age?",
      "A common planning rule is 2 to 5 minutes per year of age for an adult-directed task, so roughly 8–20 minutes at age 4 and 20–50 minutes at age 10. It is a heuristic for planning, not a clinical measure, and a child absorbed in self-chosen play will often go far longer. This tool takes the midpoint of that band, floors it at 5 minutes and caps it at 30.",
    ],
    [
      "What are Piaget's four stages of cognitive development?",
      "Sensorimotor (0–2 years), learning through senses and movement; preoperational (2–7), symbolic and pretend play with lots of 'why'; concrete operational (7–11), logical thinking about real objects and a strong sense of fairness; formal operational (11 and up), hypothetical and abstract reasoning. This tool picks the stage from the age and writes both what the stage supports and what it does not into the prompt.",
    ],
    [
      "How much screen time is recommended for young children?",
      "The American Academy of Pediatrics advises no screen media other than video chat before about 18 months, only high-quality co-viewed programming from 18 to 24 months, about one hour a day of high-quality programming for ages 2 to 5, and consistent limits from age 6 that still leave room for sleep, physical activity and offline play. The matching line for your child's age is shown alongside the plan.",
    ],
    [
      "How many hours of sleep does a child need?",
      "The American Academy of Sleep Medicine consensus, endorsed by the AAP, recommends 11–14 hours per 24 hours for ages 1–2 including naps, 10–13 hours for ages 3–5, 9–12 hours for ages 6–12 and 8–10 hours for ages 13–18. The tool shows the band for your child's age so an evening plan does not eat into it.",
    ],
  ],
};

export default seo;
