const seo = {
  title: "Baby Name Voting Board: 1-5 Ratings & Vetoes",
  metaDescription:
    "Each family member rates every name 1-5; a 1 is a veto that drops it below un-vetoed picks. Ranked by average with a consensus score, saved in-browser.",
  steps: [
    "Add up to 40 names with Add name and up to 12 voters with Add voter, then select who is scoring under 'Who is voting right now?'.",
    "Rate every name from 1 ('No — veto') to 5 ('Love it') for each voter in turn.",
    "Read the Leading name and the ranked table of averages, consensus scores and veto flags, then press Copy results; the board saves to this browser only.",
  ],
  intro:
    "The Baby Name Shortlist Voting Board collects a 1-to-5 rating from every family member for every name on your shortlist, then ranks the list by average score with a consensus figure alongside it. A rating of 1 is treated as a veto: the name drops below every un-vetoed option no matter how well it averages, because a name one parent cannot live with is not really a candidate. The whole board is stored in your own browser and never uploaded.",
  useCases: [
    "Settle a shortlist of eight names between two parents without another circular conversation.",
    "Include grandparents in the decision while keeping the veto power with the people who have to use the name.",
    "Spot the name everyone rates 4 rather than the one two people rate 5 and one rates 1.",
    "Copy the ranked result into a family chat with the averages and consensus figures attached.",
  ],
  benefits: [
    ["Veto is explicit", "One low rating removes a name from contention instead of being averaged into invisibility."],
    ["Agreement is measured", "Consensus is scored 0 to 100 from the spread of ratings, so a divided 4.0 is distinguishable from a united 4.0."],
    ["Nothing leaves the device", "The board lives in browser storage; there is no account and no upload."],
  ],
  faqs: [
    [
      "How should couples decide on a baby name?",
      "The method that ends arguments fastest is separate scoring followed by a joint look at the numbers: each person rates every name independently, then you compare. Rating privately first stops one person anchoring the other, and it surfaces the quiet 4-out-of-5 that both of you can actually live with.",
    ],
    [
      "Should each parent get a veto on baby names?",
      "Most couples find a mutual veto works better than majority voting, because a name is used every day for a lifetime and resentment about it outlasts the decision. This board implements that directly: a rating of 1 from anyone drops the name to the bottom of the list.",
    ],
    [
      "What does the consensus score mean?",
      "It is 100 minus the spread of ratings as a percentage of the full scale. All voters giving the same rating scores 100; one person giving 1 and another giving 5 scores 0. A name with a 4.0 average and consensus 100 is a much safer pick than a 4.0 with consensus 25.",
    ],
    [
      "Is my shortlist private?",
      "Yes. The names, voters and ratings are stored in your browser's local storage on the device you are using, and nothing is sent anywhere. Clearing site data or using a private window removes the board.",
    ],
  ],
};

export default seo;
