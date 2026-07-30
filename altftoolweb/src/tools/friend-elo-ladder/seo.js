const seo = {
  intro:
    "Friend ELO Ladder runs the standard Elo rating formula over a list of casual matches and returns a ranked ladder plus the rating after every game. It uses the textbook maths — expected score E = 1 / (1 + 10^((Rb − Ra) / 400)) and the update R' = R + K × (S − E), with players starting at 1200 and a K-factor of 32 by default — so beating someone stronger moves you further than beating someone weaker. It is for friend groups, office leagues and club nights who want a fair running order for chess, table tennis, pool or FIFA without signing up to a league platform.",
  useCases: [
    "Settling who is actually best after a month of office table-tennis games, when the raw win counts are misleading because people played different opponents",
    "Seeding a weekend tournament bracket from the season's results so the two strongest players do not meet in round one",
    "Rebuilding a ladder after keeping results in a group chat: paste the matches in order and get every player's current rating and the game-by-game history",
  ],
  benefits: [
    ["Strength of opponent counts", "Elo weights each result by the rating gap, so wins against stronger players are worth more than padding a record against beginners."],
    ["Every step is shown", "The output lists each match with both players' updated ratings afterwards, so anyone can check how the ladder was arrived at."],
    ["Draws and carried-over ratings supported", "Scores accept 1, 0.5 or 0, and you can seed players with existing ratings instead of restarting everyone at 1200."],
  ],
  faqs: [
    [
      "How is an Elo rating calculated?",
      "Each player's expected score comes from the rating gap: E = 1 / (1 + 10^((opponent − player) / 400)), so a 400-point lead implies about a 91% expected score. After the game the rating changes by K × (actual − expected), where actual is 1 for a win, 0.5 for a draw and 0 for a loss.",
    ],
    [
      "What K-factor should I use?",
      "32 is the default and suits casual ladders because ratings settle quickly — a win between equally rated players moves each by 16 points. Lower values like 16 or 10 make ratings more stable and are used for established or high-rated players; you can set any value from 1 upward.",
    ],
    [
      "What rating do new players start at?",
      "1200. Anyone named in a match but missing from the starting list is added at 1200 automatically, and you can override the starting figure for any player to carry a rating over from a previous season.",
    ],
    [
      "Does the order of matches matter?",
      "Yes — matches are processed in the order you list them, exactly as they would be in a real league, because each result updates the ratings used to compute the next expected score. Re-ordering the same set of games can give slightly different final numbers.",
    ],
  ],
};

export default seo;
