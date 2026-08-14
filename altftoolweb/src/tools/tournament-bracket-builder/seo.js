const seo = {
  title: "Tournament Bracket Generator with Seeded Byes",
  metaDescription:
    "Paste entrants in seed order for a full single-elimination draw: field padded to the next power of two, byes opposite the top seeds, every round labelled.",
  steps: [
    "Type your entrants one per line into Entrants in seed order, strongest seed first.",
    "Choose Single elimination or Double elimination outline; the field is padded to the next power of two and byes land opposite the top seeds.",
    "Read the Round, Match, Side A, Side B and Advances table, where later matches read as Winner R1M3, then use Download to save tournament-bracket-builder.txt.",
  ],
  intro:
    "The Tournament Bracket Builder turns a seed-ordered list of entrants into a full elimination draw: it rounds the field up to the next power of two, fills the gap with byes, and pairs seeds using the standard highest-versus-lowest rule so seed 1 meets the bottom seed, seed 2 meets the next lowest, and so on. You get every round and match laid out in a table, with byes already advanced and later matches labelled by the winner they feed from. It is for anyone running a knockout — a club ladder, an office table-tennis day, a school quiz — who needs a defensible draw in seconds.",
  useCases: [
    "You have 13 sign-ups for a badminton knockout and need to know how many byes to give and which seeds get them before you post the draw.",
    "A five-a-side league organiser wants the whole match schedule written out — round by round — so players can see who they would meet in the semi-final if they win.",
    "You are running an internal hackathon judging knockout and want a bracket everyone agreed on in advance, rather than pairings decided after the entrants are known.",
  ],
  benefits: [
    [
      "Byes placed by seeding, not by hand",
      "The field is padded to 8, 16, 32 and so on, and each bye lands opposite the strongest seed so the top of the draw is not accidentally punished.",
    ],
    [
      "Every round pre-labelled",
      "Later matches are written as Winner R1M3 versus Winner R1M4, so the path from first round to final is readable before a single result is in.",
    ],
    [
      "Order in, order out",
      "The entrant list is read in seed order, so the draw is reproducible — the same list always yields the same bracket, which is what makes it arguable in front of participants.",
    ],
  ],
  faqs: [
    [
      "How many byes does my tournament need?",
      "The number of byes is the next power of two above your entrant count minus the entrant count — so 6 entrants use an 8-slot bracket and get 2 byes, 13 entrants use a 16-slot bracket and get 3 byes, and 20 entrants use a 32-slot bracket and get 12. A field that is already a power of two, like 8 or 16, needs none.",
    ],
    [
      "How many rounds are there in a single-elimination bracket?",
      "It is log2 of the bracket size: an 8-slot draw runs 3 rounds, 16 runs 4, 32 runs 5, and 64 runs 6. The builder reports the round count with the draw, and the final round is always a single match.",
    ],
    [
      "Who should get the byes?",
      "By convention the top seeds do, and that is what this builder does — pairing is highest seed against lowest, so the empty slots at the bottom of the seed list end up opposite the strongest entrants. If your group prefers to draw byes at random, agree that before you generate the bracket.",
    ],
    [
      "Does it produce a full double-elimination bracket?",
      "No. Single elimination is generated in full; choosing double elimination adds the winner bracket plus an outline row for the losers bracket, because losers-bracket seeding depends on which entrants actually lose and in which round. Fill the losers side in from live results as the event runs.",
    ],
  ],
};

export default seo;
