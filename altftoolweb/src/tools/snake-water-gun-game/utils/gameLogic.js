export const CHOICES = ["snake", "water", "gun"];

export const CHOICE_LABELS = {
  snake: "Snake",
  water: "Water",
  gun: "Gun",
};

export const CHOICE_EMOJIS = {
  snake: "🐍",
  water: "💧",
  gun: "🔫",
};

export const WIN_CONDITIONS = {
  snake: "water",
  water: "gun",
  gun: "snake",
};

export function getComputerChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

export function getRoundResult(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) return "draw";
  if (WIN_CONDITIONS[playerChoice] === computerChoice) return "win";
  return "lose";
}

export function getResultMessage(result, playerChoice, computerChoice) {
  if (result === "draw") {
    return `Both chose ${CHOICE_LABELS[playerChoice]} — it's a draw!`;
  }
  if (result === "win") {
    const beats = CHOICE_LABELS[WIN_CONDITIONS[playerChoice]];
    return `${CHOICE_LABELS[playerChoice]} beats ${beats} — you win!`;
  }
  const beats = CHOICE_LABELS[WIN_CONDITIONS[computerChoice]];
  return `${CHOICE_LABELS[computerChoice]} beats ${CHOICE_LABELS[playerChoice]} — computer wins!`;
}
