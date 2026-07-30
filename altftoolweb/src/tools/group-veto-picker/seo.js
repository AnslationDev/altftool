const seo = {
  intro:
    "The Group Veto Picker settles a group choice by elimination rather than by voting for a favourite: each member names the options they will not accept, and whatever collects the fewest vetoes survives as the finalist. You paste one option per line, then one line per member in the form 'Name | option, option', set how many vetoes each person is allowed, and it returns a full ranking with a veto count and a Finalist or Narrowed-out status against every option. It suits groups where the goal is something nobody objects to rather than something one loud person loves.",
  useCases: [
    "Six friends are picking a film and everyone has one hard no — collect the nos instead of the yeses and see which title is left standing.",
    "A team is choosing a restaurant with dietary restrictions in the group, so each person vetoes the places that do not work for them and the surviving options are genuinely viable for everyone.",
    "You are settling a meeting slot and want the choice to be defensible afterwards, with a written record of who vetoed what rather than a decision someone can claim was rigged.",
  ],
  benefits: [
    [
      "Enforces the veto budget",
      "Only the first N vetoes per member count, where N is the limit you set, and the overflow is reported per person so nobody can quietly veto everything.",
    ],
    [
      "Shows the whole ranking, not just the winner",
      "Every option appears with its veto count and status, so the runner-up is visible immediately if the finalist falls through.",
    ],
    [
      "Deterministic and reproducible",
      "Ties are broken alphabetically rather than randomly, so the same inputs always give the same table — anyone in the group can re-run it and get your result.",
    ],
  ],
  faqs: [
    [
      "How does veto-based picking differ from voting?",
      "Voting selects the option with the most support, which can crown something a minority strongly objects to. Veto picking selects the option with the least opposition, so the winner is the one fewest people rejected. The tool ranks by veto count ascending and marks everything on the lowest count as a finalist.",
    ],
    [
      "How many vetoes should each person get?",
      "One is the usual setting and the default here, because it forces people to spend their objection on what they actually cannot live with. Raising the limit narrows the field faster but risks eliminating everything; if every option ends up tied on the same count, they are all returned as finalists.",
    ],
    [
      "What happens if two options are tied?",
      "Both are returned as finalists — the tool does not pick between them for you. Ties are ordered alphabetically in the table, and the group should agree in advance on how to break one, whether by a coin toss, a second round or the organiser's call.",
    ],
    [
      "What format do the vetoes need to be in?",
      "One member per line, written as 'Name | option, option', with the option text matching the option lines exactly. Vetoes naming something not on the options list are ignored rather than silently counted, so check the spelling if a count looks lower than expected.",
    ],
  ],
};

export default seo;
