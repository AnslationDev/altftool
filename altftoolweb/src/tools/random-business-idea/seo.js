const seo = {
  intro:
    "Random Business Idea builds a startup concept by drawing one item at random from each of six lists — 28 industries, 27 common problems, 25 technologies, 23 business models, 24 target audiences and four startup-cost bands — then writing them up as a named company with a tagline, monetisation route, two likely competitors and two challenges. It is a brainstorming prompt generator for founders, students and hackathon teams who are stuck on a blank page, not a market research report. You can generate 1, 3, 5 or 10 concepts at a time, lock the industry, save the ones worth keeping, and copy any card as plain text.",
  useCases: [
    "You have a free weekend and want to build something, but every idea you write down is a copy of a product that already exists — generating ten random industry-plus-technology pairings gives you starting points you would not have reached on your own.",
    "You are running an entrepreneurship class or a hackathon kickoff and need each team to leave with a different, non-overlapping prompt instead of five teams all pitching a food delivery app.",
    "You already know you want to build in one sector — say healthcare or logistics — so you pin that industry and re-roll only the technology, audience and revenue model to explore angles inside it.",
  ],
  benefits: [
    ["Six-slot combination, not a one-liner", "Each idea names an industry, a problem, a technology, a business model, an audience and a cost band, so you get something you can actually argue with."],
    ["Comes with the objections attached", "Every concept ships with two named competitors and two specific challenges, which is usually where a brainstorm should start rather than end."],
    ["Save and history are separate", "Ideas you star are kept apart from the rolling log of the last 50 generated, so a long session does not bury the two you liked."],
  ],
  faqs: [
    [
      "How many different business ideas can this generate?",
      "The combination space is in the tens of millions: 28 industries x 27 problems x 25 technologies x 23 business models x 24 audiences, before the company name and monetisation slots multiply it further. In practice you will not see the same combination twice, though individual elements repeat often.",
    ],
    [
      "What does the feasibility score percentage mean?",
      "It is a randomly assigned number between 60% and 95%, not an assessment of the idea. It exists to give cards visual variety and a sort order — treat it as decoration and do your own validation before acting on any concept.",
    ],
    [
      "Can I choose the industry instead of getting a random one?",
      "Yes. The industry filter locks one of the 28 industries so every generated idea stays in that sector, while the problem, technology, business model, audience and cost band keep re-rolling. The other slots cannot currently be pinned from the interface.",
    ],
    [
      "Are these ideas checked against businesses that already exist?",
      "No. Nothing is validated against any company register, trademark database or market data — the generator only recombines its own word lists, so an idea may already exist or a generated company name may be taken. Search for prior art and speak to a professional before registering a name or committing money.",
    ],
  ],
};

export default seo;
