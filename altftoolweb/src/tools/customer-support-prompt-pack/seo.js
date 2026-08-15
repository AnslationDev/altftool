const seo = {
  title: "Customer Support Reply Prompts + Flesch Grade",
  metaDescription:
    "Score a draft reply with Flesch reading ease and Flesch-Kincaid grade, then build a rewrite prompt carrying your channel cap, tone and policy facts.",
  steps: [
    "Under \"What are you writing?\" pick one of the six jobs — Rewrite a macro, Soften the tone, Escalation summary, Decline a request, Apology with a remedy or Follow-up / closing note — then paste your text into Draft reply or ticket notes.",
    "Set Channel (Email reply at 1200 chars through Public reply on X at 280), Tone, Target reading grade (4-14), and add anything binding under \"Policy and facts the reply may rely on\".",
    "Draft reading grade appears with Flesch reading ease, average words per sentence, syllables per word and Draft length vs channel cap; Copy prompt takes \"Your rewrite prompt\" into any AI chat.",
  ],
  intro:
    "Customer Support Prompt Pack scores a draft support reply with the Flesch Reading Ease and Flesch-Kincaid Grade Level formulas, then assembles a rewrite prompt that carries the score, your channel's character cap, your tone and your policy facts into any AI assistant. It covers the six jobs a support queue repeats daily: rewriting a macro, softening tone, summarising an escalation, declining a request, apologising with a remedy and closing the loop. Written for support agents, team leads and anyone maintaining a saved-reply library.",
  useCases: [
    "Rewrite a saved macro that reads like a legal notice into something a customer can follow in one pass.",
    "Soften a refusal without accidentally promising a refund the policy does not allow.",
    "Turn scattered ticket notes into an escalation summary an engineer can act on without reading the thread.",
    "Cut a 900-character email reply down to fit a 280-character public reply on X.",
  ],
  benefits: [
    ["Measured, not guessed", "Flesch reading ease and Flesch-Kincaid grade are calculated from your actual draft before the prompt is written."],
    ["Policy stays fixed", "The prompt forbids adding any refund, credit, deadline or policy that is not in your draft or your facts box."],
    ["Channel-aware", "Character caps per channel, including X's hard 280-character limit for a standard post."],
  ],
  faqs: [
    [
      "What reading level should a customer support reply be written at?",
      "Aim for a Flesch-Kincaid grade level of about 6 to 8, which corresponds to a Flesch Reading Ease score in the 60-80 range. That is roughly the reading level of a popular newspaper and it stays readable for people reading on a phone, in a second language, or while frustrated.",
    ],
    [
      "How is the Flesch Reading Ease score calculated?",
      "Reading ease = 206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words). Scores of 90-100 are very easy, 60-69 is standard plain English, and anything below 30 reads like a legal document. The companion Flesch-Kincaid grade level = 0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59.",
    ],
    [
      "How do I say no to a customer without sounding rude?",
      "Put the decision in the first sentence rather than after a paragraph of apology, give one plain reason drawn from the actual policy, then offer the nearest thing you can do. Burying the refusal makes the customer read twice and reply angrier; a single clear 'no' plus a real alternative usually ends the thread.",
    ],
    [
      "Does a readability score mean the reply is good?",
      "No. These formulas only measure sentence length and syllable count, so a short but factually wrong reply can score well. Use the score to catch bloated sentences, then check accuracy, tone and policy compliance yourself before sending.",
    ],
  ],
};

export default seo;
