const seo = {
  title: "Ranked-Choice Vote Tabulator: Show Every Round",
  metaDescription:
    "Paste ranked ballots as \"A > B > C\" and see each instant-runoff round — votes, share, eliminations — until one option passes 50% of live ballots.",
  steps: [
    "Type your ballots into the Ranked ballots box, one per line highest to lowest as \"A > B > C\", and set the Tie-break order field (default \"A, B, C\") — or press the Five ballots chip under Examples to load a worked set.",
    "Every keystroke re-runs the count with no calculate button: the lowest-scoring candidate is eliminated each round and those ballots transfer to the next surviving preference, with your Tie-break order settling a tie for last place.",
    "Read the winner line with its \"Majority in round N\" caption and the Round / Candidate / Votes / Share table beneath it, then use the Copy or Download buttons to save it as ranked-choice-vote-tabulator.txt.",
  ],
  intro:
    "Ranked-Choice Vote Tabulator runs a full instant-runoff count on ranked ballots you paste in one per line as \"A > B > C\", and shows every round: each candidate's first-preference votes, their share, and who was eliminated. A candidate wins the moment they hold more than 50% of the ballots still counting; otherwise the lowest-scoring candidate is dropped and those ballots transfer to their next surviving preference. It is for anyone running a group decision — a committee, a club, a team picking a venue — who needs the arithmetic to be visible rather than asserted.",
  useCases: [
    "Your team collected preference ballots for an offsite location and the plurality favourite only has 40% support, so you need to show which option actually commands a majority once second choices transfer.",
    "You are chairing a club or society election and want to publish the round-by-round table so members can see exactly when their candidate was eliminated and where the votes went.",
    "You are teaching or explaining ranked-choice voting and want a worked example where changing one ballot visibly flips the outcome.",
  ],
  benefits: [
    ["Every round is shown, not just the winner", "The table lists each candidate's votes and percentage in each round plus the elimination line, so a contested result can be audited by anyone in the room."],
    ["Explicit, agreed-in-advance tie-breaks", "You supply the tie-break order yourself, so ties are settled by a rule the group set beforehand rather than by whatever order the data happened to be in."],
    ["Exhausted ballots are handled correctly", "A ballot whose ranked candidates are all eliminated stops counting toward the majority threshold, which is how real instant-runoff counts work."],
  ],
  faqs: [
    [
      "How do I enter the ballots?",
      "One ballot per line, with preferences highest to lowest separated by the greater-than sign — for example \"A > B > C\". Ballots can be different lengths; a voter who only ranks one candidate simply has nothing to transfer once that candidate is out.",
    ],
    [
      "What counts as a majority?",
      "More than 50% of the ballots still counting in that round, not 50% of all ballots cast. Ballots whose ranked candidates have all been eliminated drop out of the denominator, so the threshold falls as rounds progress.",
    ],
    [
      "How are ties broken?",
      "By the tie-break order you enter, listed best first. Among candidates tied for last place, the one furthest down that list is eliminated, and the same order breaks ties in the round-by-round ranking — so agree on it with participants before you count.",
    ],
    [
      "Can I use this to run an official election?",
      "Treat it as a transparent decision aid, not certified election software: it has no ballot secrecy, no voter authentication and no audit trail beyond the table on screen. For binding or statutory elections, follow your organisation's rules and use the process they require.",
    ],
  ],
};

export default seo;
