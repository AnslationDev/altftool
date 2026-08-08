const seo = {
  title: "Future Partner Prediction Quiz (Just for Fun)",
  metaDescription:
    "Your name, zodiac sign and two questions produce a partner profile: occupation, sign, how you meet and three scores. Same answers, same result.",
  steps: [
    "Enter \"Your Name\", \"Your Zodiac Sign\", \"Your Gender\" and \"Preferred Partner Gender\", then press \"Proceed to Lifestyle Questions\".",
    "Answer the two quiz questions — your idea of a perfect date, and the trait you value most in a partner — picking one of four options each.",
    "The \"Future Spouse Profile\" card names an occupation, a partner zodiac sign and \"How You Will Meet\", with Overall Harmony Index, Communication Resonance and Lifestyle Synchronicity bars; Download saves future-partner-report.txt.",
  ],
  intro:
    "Future Partner Prediction turns your name, zodiac sign and two quick preference questions into a written profile of a hypothetical future partner — their occupation, personality, zodiac sign, how the two of you meet, and three compatibility percentages. The result is deterministic rather than random: a hash of your name and star sign is combined with the answers you picked, so the same inputs always produce the same partner profile. It is a novelty fortune-telling format, and the whole prediction can be copied or downloaded as a text report.",
  useCases: [
    "Killing time on a group video call by having everyone run the quiz and reading out whose predicted partner is a travel journalist and whose is an accountant.",
    "Making an entertaining Instagram story: run the prediction, screenshot the meeting scenario, and ask followers to guess whose it is.",
    "Settling a friendly bet about star signs by checking whether two friends with the same zodiac get the same partner sign predicted back.",
  ],
  benefits: [
    ["Written profile, not a one-word answer", "Each result names an occupation, a personality description, a zodiac sign and a specific meeting scenario rather than a single label."],
    ["Same answers, same prediction", "Because the seed is a hash of your name and sign plus your quiz choices, you can re-run it and get the identical profile back."],
    ["Two questions, full result", "The quiz is only two questions long, so the profile takes under a minute rather than a twenty-item personality test."],
  ],
  faqs: [
    [
      "How many questions does the quiz ask?",
      "Two: your idea of a perfect date, and the trait you value most in a partner, with four options each. Before the quiz you also enter your name, zodiac sign, gender and preferred gender.",
    ],
    [
      "What compatibility score will I get?",
      "Overall compatibility always lands between 84% and 99%, and the emotional harmony and shared energy figures fall between 79% and 99%. The ranges are deliberately flattering — this is entertainment, not a matching algorithm.",
    ],
    [
      "How many different partner profiles are possible?",
      "There are eight partner occupations, six meeting scenarios and all twelve zodiac signs to draw from, combined by a seed built from your name, sign and answers. Changing one quiz answer shifts the seed and can change the whole profile.",
    ],
    [
      "Is any of this a real prediction?",
      "No. Nothing here forecasts a real relationship — the profile is selected from fixed lists using a name hash, and astrology has no predictive power over who you will meet. Enjoy it as a game rather than guidance.",
    ],
  ],
};

export default seo;
