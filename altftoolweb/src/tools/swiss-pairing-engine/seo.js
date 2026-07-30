const seo = {
  intro:
    "This pairing engine takes a list of players with their current score and the opponents they have already faced, and produces the next round's matchups by pairing each player with the closest-scoring opponent they have not already played. It sorts the field by score descending (ties broken alphabetically), then walks down the standings greedily, skipping anyone already on a player's history list and flagging the pairing as \"Rematch unavoidable\" when no fresh opponent is left. An odd number of players leaves the last one with a BYE, shown explicitly in the table.",
  useCases: [
    "You are running a six-person board game or chess evening, round four is next, and you want the top scorers meeting each other without anyone replaying the same opponent twice",
    "A club quiz or debate league needs its next round drawn in front of everyone, and you want a visible rule — score order, no repeats — rather than someone shuffling names in a spreadsheet",
    "You are checking a draw someone else produced: paste the same standings and history in and see whether the rematches in their bracket were genuinely unavoidable",
  ],
  benefits: [
    ["Rematch avoidance is explicit, not implied", "Each row is labelled either \"No prior match\" or \"Rematch unavoidable\", so a repeat pairing is visibly a constraint of the field, not an oversight."],
    ["Byes are shown, never silently dropped", "With an odd number of players the unpaired name appears as its own row against BYE instead of vanishing from the table."],
    ["One text block is the whole input", "Standings go in as \"Name | score | previous opponents\", one player per line, so the history that drives the draw stays readable and checkable by everyone in the room."],
  ],
  faqs: [
    [
      "How do I enter the standings?",
      "One player per line as Name | score | previous opponents, with earlier opponents comma-separated — for example \"Asha | 3 | Ben,Dia\". A player with no history yet just leaves the third field empty, and the score defaults to 0 if it is missing or unreadable.",
    ],
    [
      "How does it decide who plays whom?",
      "It sorts everyone by score from highest to lowest, breaking ties alphabetically, then takes the top unpaired player and matches them with the highest-placed remaining player who is not in their opponent history. That is the core Swiss idea: similar scores meet, and nobody repeats an opponent until the field forces it.",
    ],
    [
      "Is this a FIDE-legal Swiss draw?",
      "No. It is a transparent score-adjacent greedy pairing, not the Dutch system used in rated chess — it does not balance colours or sides, does not track who has already received a bye, does not float players between score groups by rank, and does not run the full weighted matching that a FIDE-approved pairing program uses. Use it for casual events and agree the method with participants beforehand.",
    ],
    [
      "Why did it pair two people who have already played?",
      "Because every other remaining opponent was also on that player's history list. When the greedy pass finds no unplayed opponent left in the pool it falls back to the next player in score order and marks the row \"Rematch unavoidable\" — a signal that the field has run short of fresh matchups, which typically happens once the round count approaches the number of players.",
    ],
  ],
};

export default seo;
