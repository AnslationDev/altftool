import { getValidMoves } from "../engine/gameEngine";
import { AI_THINK_MIN_MS, AI_THINK_MAX_MS } from "../engine/constants";

export function evaluateMoves(game, playerId, difficulty) {
  const moves = getValidMoves(game, playerId);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  const scored = moves.map((move) => ({
    move,
    score: scoreMove(game, playerId, move, difficulty),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0].move;
}

function scoreMove(game, playerId, move, difficulty) {
  let score = 0;

  if (move.action === "kill") {
    score += 100;
    const targetPlayer = game.players[move.killTarget.playerId];
    const targetTokensActive = targetPlayer.tokens.filter((t) => t.position >= 0 && !t.isFinished).length;
    if (targetTokensActive <= 1) score += 50;
  }

  if (move.action === "finish") {
    score += 200;
  }

  if (move.action === "enter") {
    const activeTokens = game.players[playerId].tokens.filter((t) => t.position >= 0 && !t.isFinished).length;
    if (activeTokens === 0) score += 80;
    else score += 30;
  }

  if (move.action === "move") {
    const homeEntry = 50;
    if (move.steps > homeEntry) {
      score += 40 + (56 - move.steps) * 2;
    }

    score += Math.min(move.steps, 50) * 0.5;

    const isSafe = [0, 8, 13, 21, 26, 34, 39, 47].includes(move.to);
    if (isSafe) score += 25;

    const threats = countThreats(game, move.to, playerId);
    if (threats > 0) score -= threats * 30;
  }

  return score;
}

function countThreats(game, pos, playerId) {
  let threats = 0;
  for (const player of game.players) {
    if (player.id === playerId) continue;
    for (const token of player.tokens) {
      if (token.position >= 0 && !token.isFinished) {
        for (let d = 1; d <= 6; d++) {
          if ((token.position + d) % 52 === pos) {
            threats++;
          }
        }
      }
    }
  }
  return threats;
}

export function getAIDelay(difficulty) {
  const base = difficulty === "easy" ? AI_THINK_MIN_MS : AI_THINK_MAX_MS;
  return base + Math.random() * (AI_THINK_MAX_MS - AI_THINK_MIN_MS);
}
