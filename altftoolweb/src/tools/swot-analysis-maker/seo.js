const seo = {
  intro:
    "A SWOT analysis sorts what you know about a decision onto two axes — internal versus external, helpful versus harmful — producing the four quadrants Strengths, Weaknesses, Opportunities and Threats. This maker builds that grid from four plain lists, flags quadrants that are empty or overloaded, and then crosses them into the four TOWS strategy types published by Heinz Weihrich in Long Range Planning in 1982: SO, WO, ST and WT. It is for founders writing a plan, managers preparing a strategy session, and students who need the grid and the reasoning that follows it.",
  useCases: [
    "Prepare a one-page strategy brief for a board meeting, with the grid and the SO/WO/ST/WT actions on the same sheet.",
    "Run a team workshop where each person fills one quadrant, then use the TOWS crosses to argue about which actions actually follow.",
    "Check a draft SWOT for the classic mistake of listing market conditions as Strengths when they are really Opportunities you do not control.",
  ],
  benefits: [
    ["It checks the grid, not just draws it", "Empty quadrants, quadrants with fewer than 3 items, and entries longer than 120 characters are all flagged."],
    ["TOWS is included, not an afterthought", "Every Strength is crossed with every Opportunity and Threat, and every Weakness likewise, so the grid turns into candidate actions."],
    ["Copy out as Markdown or CSV", "The whole analysis, including the TOWS section, comes out as a Markdown table you can paste into a doc, or a CSV you can sort."],
  ],
  faqs: [
    [
      "What are the four parts of a SWOT analysis?",
      "Strengths, Weaknesses, Opportunities and Threats. Strengths and Weaknesses are internal — things you control, like your team, cost base or technology. Opportunities and Threats are external — things you can only react to, like a competitor's move, a regulation or an interest rate. That internal/external split is the test that decides which box an item goes in.",
    ],
    [
      "How many items should each quadrant have?",
      "Three to seven. Fewer than three usually means the quadrant has not really been thought about, and more than seven stops the grid being readable in a meeting — at that point merge the weakest items into the stronger ones. This tool flags both cases as you type.",
    ],
    [
      "What is TOWS and how is it different from SWOT?",
      "TOWS crosses the SWOT quadrants to produce strategies rather than lists. Heinz Weihrich set it out in 1982 with four types: SO (maxi-maxi) uses a strength to take an opportunity, WO (mini-maxi) fixes a weakness that blocks one, ST (maxi-mini) uses a strength to blunt a threat, and WT (mini-mini) reduces a weakness a threat would exploit. SWOT tells you where you stand; TOWS is what you do about it.",
    ],
    [
      "Is a growing market a strength or an opportunity?",
      "An opportunity. The test is control: if you would still have it after a competitor copied you, it is internal and belongs in Strengths; if it exists whether or not your company does, it is external and belongs in Opportunities. A growing market, a new regulation and a rival's stumble are all opportunities; your cost base, your patents and your team are strengths.",
    ],
  ],
};

export default seo;
