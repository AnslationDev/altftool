const seo = {
  intro:
    "The Condorcet Election Judge takes ranked ballots written one per line as \"A > B > C\" and runs every head-to-head matchup, declaring a Condorcet winner only if one option beats all the others one-on-one — that is, wins all n-1 pairwise contests. Committees, product teams and clubs get a full comparison table showing how many ballots preferred each side of every pair, plus an explicit \"no Condorcet winner\" verdict when the group's preferences form a cycle. It counts what you enter; it does not run the election or handle ballot secrecy.",
  useCases: [
    "Your team voted on four candidate names and the plurality leader only had 35% of first choices, so you want to know whether it would still win against each rival one-on-one.",
    "A club is picking a meeting night and you suspect the rankings are cyclic — Tuesday beats Thursday, Thursday beats Saturday, Saturday beats Tuesday — and need that shown before the room argues about it.",
    "You are documenting how a shortlist decision was reached and need a pairwise table you can paste into the minutes rather than just naming the winner.",
  ],
  benefits: [
    [
      "Cycles are reported, not hidden",
      "When no option beats every other, it says so outright instead of picking an arbitrary winner, which is the case a plurality count silently misrepresents.",
    ],
    [
      "Every pair shown with its raw counts",
      "The table lists both sides of each matchup with how many ballots preferred each, so anyone can recheck the arithmetic that produced the verdict.",
    ],
    [
      "Plain-text ballots",
      "Rankings are typed as A > B > C lines with no fixed candidate list to configure first, so you can paste what people actually sent you.",
    ],
  ],
  faqs: [
    [
      "what is a Condorcet winner",
      "The option that beats every other option in a one-to-one comparison of the ballots. With four candidates that means winning all 3 of its head-to-head matchups out of the 6 pairs compared in total; if no option manages that, there is no Condorcet winner.",
    ],
    [
      "why does it say no Condorcet winner",
      "Because the group's preferences are cyclic or a pair tied. The classic case is A beating B, B beating C, and C beating A — majority preference can be intransitive even when every individual ballot is a consistent ranking, which is why the tool reports the cycle rather than inventing a result.",
    ],
    [
      "how do I write the ballots",
      "One ballot per line, candidates separated by the > character in order of preference, for example A > B > C. Names can be words rather than letters, and the candidate list is built from whatever appears across all lines.",
    ],
    [
      "what happens if a voter ranks only some of the candidates",
      "A candidate that appears on a ballot is counted as preferred over any candidate that voter left off entirely, and a pair where neither name appears contributes nothing to that matchup. Truncated ballots therefore still count, but agree with your group on that rule before running the numbers.",
    ],
  ],
};

export default seo;
