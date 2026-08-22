const seo = {
  title: "Interview Prep Prompt Builder for AI Roleplay",
  metaDescription:
    "Builds a roleplay prompt that runs your round one question at a time — question count from the minutes left in the slot, follow-ups scaled to level.",
  steps: [
    "Under \"Which round?\" pick one of the seven rounds: Recruiter / phone screen, Technical / coding, System design, Behavioural, Hiring manager, Take-home review or Values / final round.",
    "Fill in Role you are interviewing for, Level (Entry / junior up to Staff / principal) and Slot length (minutes), then list Topics to cover, one per line and Things you want pushed on.",
    "\"Questions that fit\" shows how many questions the slot holds, with Minutes per question and Your speaking time per question; Copy prompt copies the Your mock interview prompt block to paste into an AI chat.",
  ],
  intro:
    "Interview Prep Prompt Builder writes a roleplay prompt that makes an AI run a mock interview the way a real interviewer does: one question at a time, follow-ups scaled to the level, and a score against the rubric that round is assessed on. The number of questions is calculated from the slot, not guessed — five minutes goes to introductions, five to your own questions, and the rest is divided by the typical length of a question in that round at that level. Covers phone screens, coding, system design, behavioural, hiring manager, take-home review and final rounds.",
  useCases: [
    "Rehearse a 45-minute behavioural round and find out you only have time for three stories, so pick the right three.",
    "Practise system design where the interviewer starts vague and adds a constraint halfway through.",
    "Get scored against a named rubric with the exact sentence that earned each score quoted back.",
    "Force practice on the answer you keep avoiding by listing it as something to push on.",
  ],
  benefits: [
    ["Realistic pacing", "Question count comes from the minutes actually left after introductions and candidate questions."],
    ["Level-appropriate pressure", "Follow-up depth scales from one follow-up at entry level to reasoning-limit probing at staff level."],
    ["Rubric scoring", "Each round carries its own four-to-five dimension rubric, scored 1-4 with evidence quoted."],
  ],
  faqs: [
    [
      "How many questions are asked in a 45-minute behavioural interview?",
      "Typically three to four. Allowing five minutes for introductions and five for your questions leaves 35 minutes, and a behavioural question with follow-ups runs about 8 minutes at mid level or 10 at senior — so three to four stories, not ten.",
    ],
    [
      "How long should a STAR answer be?",
      "About 90 seconds to two minutes for the initial answer, then several minutes of follow-up. Across the whole question you will speak for roughly 60% of the slot; the rest is the interviewer asking, probing and taking notes.",
    ],
    [
      "Can practising with an AI actually help interview performance?",
      "It helps with the mechanical parts: saying the answer out loud, keeping to time, remembering the result and how it was measured, and not saying 'we' when asked what you did. It cannot tell you a company's real bar, and a score from a model is not a prediction of the outcome.",
    ],
    [
      "What is the difference between a phone screen and a hiring manager round?",
      "A phone screen is breadth: motivation, recent work, compensation and timeline, usually 30 minutes and fast. The hiring manager round is depth on scope and judgement — what you owned, what you decided and what you would do differently — and is the round that most often decides the offer.",
    ],
  ],
};

export default seo;
