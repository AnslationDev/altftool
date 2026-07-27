const seo = {
  intro:
    "The Salary Negotiation Prompt Builder converts your current pay, target pay and researched market range into a ready-to-paste roleplay prompt that makes a chat model argue back as the manager or recruiter across as many rounds as you choose. Alongside the prompt it works out compa-ratio (your ask divided by the band midpoint) and range penetration ((ask − minimum) ÷ (maximum − minimum)), the two figures compensation teams use to judge where a number sits inside a band. It is for anyone who wants to hear the objections once in private before hearing them for real.",
  useCases: [
    "Rehearse a promotion conversation against a budget-constrained manager who insists the band is frozen this cycle.",
    "Pressure-test an ask that sits at 85% range penetration before you send it to a recruiter in writing.",
    "Practise refusing to name a number first when a recruiter asks for your current salary.",
    "Rehearse trading base salary for a signing bonus, an earlier review date or extra remote days when cash is capped.",
  ],
  benefits: [
    ["Places your ask in the band", "Compa-ratio and range penetration show whether your number reads as safe, midpoint or top-of-band."],
    ["Five counterpart personas", "Practise against a hard bargainer, a data-driven HR partner or a friendly manager who keeps deferring."],
    ["Built-in debrief", "The prompt tells the model to break character and score your anchoring, evidence and concessions with quotes."],
  ],
  faqs: [
    [
      "What is a good compa-ratio to ask for?",
      "A compa-ratio of 1.00 means you are asking for exactly the midpoint of the band, which is the number most employers treat as fully competent and fully proven. Asking between 0.95 and 1.10 is usually defensible with evidence; above roughly 1.20 most banding policies require a written justification or a level change.",
    ],
    [
      "How do I calculate range penetration?",
      "Range penetration = (your number − band minimum) ÷ (band maximum − band minimum), expressed as a percentage. On a band of 130,000 to 170,000, an ask of 145,000 gives (15,000 ÷ 40,000) = 37.5%, so the ask sits just above the bottom third of the band.",
    ],
    [
      "Should I say my current salary when asked?",
      "Naming your current salary anchors the conversation on your old employer's budget rather than the role's market value, so most negotiation coaches suggest redirecting to your researched range instead. Several US states and jurisdictions also restrict employers from asking for salary history — check your local rules, and treat this tool as rehearsal, not legal advice.",
    ],
    [
      "Can I use this prompt with any AI chat model?",
      "Yes. The output is plain text with no model-specific syntax, so it works in ChatGPT, Claude, Gemini, Copilot or a local model. The prompt explicitly instructs the model to stay in character, wait for your reply after each turn, and break character for the debrief at the end.",
    ],
  ],
};

export default seo;
