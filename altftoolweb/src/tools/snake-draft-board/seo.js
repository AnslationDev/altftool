const seo = {
  title: "Snake Draft Board: Serpentine Pick Order Generator",
  metaDescription:
    "Enter players in seed order and rounds to get every numbered pick, direction reversing each round. Recorded selections are checked for out-of-turn picks.",
  steps: [
    "List 'Players in seed order', one per line, and set 'Rounds' (1 to 50).",
    "Record picks as they happen in 'Recorded selections' as Player | selection, one line per pick in order.",
    "Read the numbered board of players-times-rounds slots with Pick, Round, Player and Selection — empty slots show 'Open' and out-of-turn picks are flagged 'Player mismatch'.",
  ],
  intro:
    "The Snake Draft Board builds a serpentine pick order from a seeded list of players, reversing direction every round so round 1 runs top-to-bottom, round 2 bottom-to-top, and so on. Enter your players in seed order and a round count, and you get a numbered board of every pick slot — players multiplied by rounds — with each selection you record slotted against the pick that owns it. It also cross-checks each recorded selection against the player whose turn it actually is and flags a mismatch.",
  useCases: [
    "Running a fantasy league draft night where the last seed picks 4th and 5th back-to-back, and you need the full turn order printed before anyone starts arguing about it.",
    "Splitting a shared resource among a team — desk allocations, on-call weekends, conference slots — so the person who picks last in one round picks first in the next.",
    "Auditing a draft that already happened: paste the recorded picks in order and see whether any of them were made out of turn.",
  ],
  benefits: [
    ["Direction flips automatically", "Odd rounds run in seed order and even rounds reverse, so you never hand-write the turn list."],
    ["Picks are checked against turns", "Each recorded selection is matched to the player who owned that slot and marked 'Player mismatch' if it was not theirs."],
    ["Open slots stay visible", "Every pick with no recorded selection shows as 'Open', so the board doubles as a live tracker mid-draft."],
  ],
  faqs: [
    [
      "What is a snake draft order?",
      "A snake draft reverses the pick order every round: if round 1 goes 1-2-3-4, round 2 goes 4-3-2-1, round 3 goes 1-2-3-4 again. It exists to offset the advantage of picking first, since the last seed in a round is immediately first in the next one.",
    ],
    [
      "How many total picks will my draft have?",
      "Players multiplied by rounds. Four players over four rounds is 16 pick slots, and the board numbers all of them from 1 upward with their round attached.",
    ],
    [
      "How do I enter the selections that were made?",
      "One per line in the format 'Player | selection', in the order the picks happened. The board matches line 1 to pick 1, line 2 to pick 2, and so on, then compares the name you typed to the name the schedule expects.",
    ],
    [
      "What does 'Player mismatch' mean on a row?",
      "It means the name on that recorded selection is not the player whose turn that pick slot belongs to — usually a pick taken out of order, or a line entered in the wrong sequence. Rows that line up correctly show 'Ready'.",
    ],
  ],
};

export default seo;
