const seo = {
  title: "Random Decision Maker: Magic 8-Ball Answers",
  metaDescription:
    "Ask a yes/no question and shake for one of nine classic Magic 8-Ball replies, each equally likely - a yes about 44% of the time. Re-shake in one click.",
  intro:
    "Random Decision Maker is a Magic 8-Ball in a web page: you type a yes/no question and it returns one of nine fixed replies picked uniformly at random, from \"It is certain\" to \"Very doubtful\". Four of the nine are affirmative, three are negative and two tell you to ask again, so a shake lands positive about 44% of the time. It is for settling low-stakes ties and for the moment when hearing an answer tells you which one you were hoping for.",
  useCases: [
    "You and a friend have been going back and forth about whether to order the same takeaway again — you type the question, shake once, and accept whatever comes up rather than debating for another ten minutes.",
    "You are stuck between two equally fine options at work and want a nudge, because your gut reaction to the answer is more informative than the answer itself.",
    "You are running a game night or a classroom warm-up and need an oracle that gives the same nine canonical 8-ball replies to everyone who asks.",
  ],
  benefits: [
    ["The question stays on screen", "Whatever you typed is shown as the caption under the reply, so a screenshot makes sense on its own."],
    ["Classic nine-answer set, unweighted", "It uses the traditional affirmative, non-committal and negative replies with no hidden bias toward yes."],
    ["Re-shakeable in one click", "Regenerate draws a fresh answer without retyping the question, which is the whole point of an 8-ball."],
  ],
  faqs: [
    [
      "What are the odds of getting a yes?",
      "About 44%. Four of the nine replies are affirmative (\"Yes, definitely\", \"It is certain\", \"Most likely\", \"Outlook good\"), three are negative and two are non-committal, and each is equally likely on every shake.",
    ],
    [
      "Is it actually random, or does it favour certain answers?",
      "Each of the nine replies has the same 1-in-9 chance every time. The pick uses the browser's built-in random number generator with no memory of previous shakes, so repeats are normal — the same answer twice in a row happens roughly one shake in nine.",
    ],
    [
      "What does \"Reply hazy, try again\" mean?",
      "It is one of the two non-committal replies and simply means shake again — the original 8-ball reserves them for a deliberate non-answer. Getting one does not change the odds of the next shake.",
    ],
    [
      "Should I use this for real decisions?",
      "No — treat the result as a coin flip with personality, not advice. It has no information about your situation, so keep it to low-stakes ties and take anything involving money, health, or legal consequences to a qualified professional.",
    ],
  ],
};

export default seo;
