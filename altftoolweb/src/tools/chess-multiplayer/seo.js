const seo = {
  title: "Pass-and-Play Chess With a Clock and SAN Notation",
  metaDescription:
    "Two players on one device: a legal-move engine with castling, en passant, promotion and every draw rule, plus clocks from bullet to 30-minute classical.",
  intro:
    "This is a full pass-and-play chess board for two people sharing one device, with a complete rules engine behind it: only legal moves are accepted, and castling, en passant, promotion, check and checkmate are all handled properly. It also recognises every standard draw — stalemate, insufficient material, the 50-move rule and threefold repetition — and runs a clock offering five choices on the New Match card, from 1-minute bullet up to 30-minute classical plus an Unlimited option. Move history is recorded in standard algebraic notation with correct disambiguation, alongside captured pieces and the running material count.",
  useCases: [
    "Two of you are waiting somewhere with one phone between you and want a real game with a clock rather than an app that pairs you with a stranger",
    "You are teaching someone the rules and want the board to refuse illegal moves, so a pinned knight simply will not lift",
    "You are playing an over-the-board game and want the device to keep the notation and the clock while the pieces stay on the real board",
  ],
  benefits: [
    ["A genuine legal-move generator", "Every candidate move is played out and rejected if it leaves your own king attacked, so pins and check evasions are enforced, not approximated."],
    ["All four draw conditions detected", "Stalemate, insufficient material including same-colour bishops, 100 half-moves without a pawn move or capture, and threefold repetition of the exact position."],
    ["Proper algebraic notation", "Move history writes real SAN, adding file or rank disambiguation when two identical pieces can reach the same square, plus O-O and O-O-O for castling."],
  ],
  faqs: [
    [
      "Can I play someone online with this?",
      "No, this is local pass-and-play: both players use the same device and take turns, with a flip-board button so each can see the position from their own side. There is no matchmaking or network opponent.",
    ],
    [
      "What time controls are available?",
      "Five buttons on the New Match card: Bullet at 1 minute, Blitz at 5, Rapid at 10, Classical at 30, and Unlimited. None of them add increment — every timed choice is a straight countdown, and when a clock reaches zero the game ends on Time forfeit.",
    ],
    [
      "How does the 50-move rule work here?",
      "The half-move counter resets on any pawn move or capture and otherwise increments, and the game is declared drawn once it reaches 100 half-moves — that is 50 moves by each side. Threefold repetition is checked separately, by comparing full position keys that include side to move, castling rights and the en passant square.",
    ],
    [
      "Does it handle en passant and pawn promotion?",
      "Yes, both. A double pawn push sets the en passant target square for exactly one move, and a pawn reaching the last rank opens a promotion dialog where you choose queen, rook, bishop or knight, which is then written into the notation as =Q, =R, =B or =N.",
    ],
  ],
};

export default seo;
