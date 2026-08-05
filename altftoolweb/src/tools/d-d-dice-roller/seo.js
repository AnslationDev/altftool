const seo = {
  intro:
    "This D&D dice roller rolls up to 10 dice with any whole-number size from 2 to 1000 faces — d4, d6, d8, d10, d12, d20, d100 or an unusual d7 — and prints every individual face plus the total. A seeded browser pseudorandom generator makes it useful for casual sessions without claiming cryptographic or independently auditable randomness.",
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
      "They use a seeded browser pseudorandom generator designed to spread results across the selected faces. It is suitable for a casual game night, but it is not cryptographic, independently auditable, or appropriate where money or security depends on the outcome.",
    ],
    [
      "What is the smallest die I can roll?",
      "Two faces is the minimum and 1000 is the maximum. The field accepts whole numbers only, so unusual dice such as d3 or d30 and percentile d100 rolls work while fractions and out-of-range values are rejected.",
    ],
  ],
};

export default seo;
