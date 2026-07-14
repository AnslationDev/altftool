// Pure, reusable game logic. All randomness lives at module level so it
// never runs during a component's render (keeps React happy + deterministic
// renders on server/client).

export const RPS_CHOICES = ["rock", "paper", "scissors"];

// Beats map: key beats value.
const BEATS = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

export const RPS_META = {
  rock: { label: "Rock", beats: "scissors" },
  paper: { label: "Paper", beats: "rock" },
  scissors: { label: "Scissors", beats: "paper" },
};

export function randomChoice(list) {
  if (!list || list.length === 0) return undefined;
  return list[Math.floor(Math.random() * list.length)];
}

export function judgeRps(player, computer) {
  if (player === computer) return "draw";
  return BEATS[player] === computer ? "win" : "loss";
}

export function coinFace() {
  return Math.random() < 0.5 ? "heads" : "tails";
}

// Pretty timestamp helper kept out of render scope.
export function nowLabel() {
  try {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
