const seo = {
  intro:
    "This D&D dice roller rolls up to 10 dice of any size you name — d4, d6, d8, d10, d12, d20, d100 or anything else with at least 2 faces — and prints every individual face plus the total, so 4d6 comes back as something like 5 + 2 + 6 + 3 = 16. Each face is drawn independently and uniformly, exactly like a fair physical die. It is for players and DMs whose dice bag is at home, in another room, or scattered under the sofa mid-session.",
  useCases: [
    "Rolling 4d6 six times for a new character's ability scores when you are building a sheet on a laptop away from your dice",
    "Settling an attack or a saving throw over video call, where everyone can see the same numbers instead of trusting a muttered result",
    "Rolling a d100 for a random encounter or loot table while running a game from a PDF with no physical percentile dice on hand",
  ],
  benefits: [
    ["Every die shown, not just the sum", "Results print as individual faces plus the total, so you can drop the lowest die or check for a natural 20."],
    ["Any die size, not a fixed menu", "Type the number of faces yourself — d3, d7 and d1000 work as well as the standard polyhedral set."],
    ["Reroll without re-entering anything", "The regenerate control throws the same pool again, which is what you want across a long combat round."],
  ],
  faqs: [
    [
      "How many dice can I roll at once?",
      "Up to 10 per roll, with a minimum of 1. That covers almost every common case — 8d6 for a fireball, 4d6 for ability scores — and for larger pools you can roll twice and add the totals yourself.",
    ],
    [
      "Can I add a modifier like 1d20+5?",
      "Not in the roller itself — it returns the raw faces and their sum, so add your proficiency or ability modifier afterwards. Rolling clean also makes crits obvious, since a natural 20 or natural 1 on the d20 is visible before any bonus is applied.",
    ],
    [
      "Are the rolls actually random?",
      "They use the browser's pseudo-random generator, which produces a uniform result over the faces — each side of a d20 comes up 5% of the time over enough rolls. It is not cryptographically random, so it is right for a game night but not for anything where money or security depends on the outcome.",
    ],
    [
      "What is the smallest die I can roll?",
      "Two faces — a coin flip, in effect. There is no upper limit on sides, so unusual dice such as d3 or d30 and percentile d100 rolls all work by typing that number into the sides field.",
    ],
  ],
};

export default seo;
