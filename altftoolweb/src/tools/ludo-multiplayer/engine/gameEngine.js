import { TOTAL_CELLS, TOKENS_PER_PLAYER, SAFE_POSITIONS, MAX_CONSECUTIVE_SIXES, MAX_PATH_STEPS, HOME_STRETCH_SIZE } from "./constants.js";
import { getStartPosition, getRouteState, getRouteTileKey } from "./routeLayout.js";

let nextId = 1;
function uid() { return nextId++; }

export function createToken(playerId) {
  return {
    id: uid(),
    playerId,
    position: -1,
    steps: 0,
    isHome: false,
    isFinished: false,
    isSafe: false,
  };
}

export function createPlayer(id, name, color) {
  return {
    id,
    name,
    color,
    tokens: Array.from({ length: TOKENS_PER_PLAYER }, () => createToken(id)),
    finished: 0,
    consecutiveSixes: 0,
    isAI: false,
  };
}

export function createGame(playerCount = 2) {
  const colors = ["#EF4444", "#3B82F6", "#22C55E", "#F59E0B"];
  const names = ["Red", "Blue", "Green", "Yellow"];
  const players = [];
  for (let i = 0; i < playerCount; i++) {
    players.push(createPlayer(i, names[i], colors[i]));
  }
  return {
    players,
    currentPlayer: 0,
    diceValue: 1,
    diceRolled: false,
    phase: "roll",
    moves: [],
    winner: null,
    turnCount: 0,
    gameOver: false,
    startedAt: Date.now(),
    started: false,
    canRoll: true,
    validMoves: [],
  };
}

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export function getValidMoves(game, playerId) {
  const player = game.players[playerId];
  if (!player) return [];
  const moves = [];

  player.tokens.forEach((token, idx) => {
    if (token.isFinished) return;

    if (token.position === -1) {
      if (game.diceValue === 6) {
        moves.push({ tokenIndex: idx, from: -1, to: getStartPosition(playerId), action: "enter", steps: 1, tileKey: getRouteTileKey(playerId, 1) });
      }
      return;
    }

    const currentSteps = token.steps;
    const newSteps = currentSteps + game.diceValue;
    const nextState = getRouteState(playerId, newSteps);

    if (newSteps > MAX_PATH_STEPS) return;
    if (newSteps === MAX_PATH_STEPS) {
      moves.push({ tokenIndex: idx, from: token.position, to: 99, action: "finish", steps: newSteps, tileKey: "finish" });
      return;
    }

    const killTarget = wouldKill(game, nextState, playerId, newSteps);
    const action = killTarget ? "kill" : "move";
    moves.push({ tokenIndex: idx, from: token.position, to: nextState.position, action, steps: newSteps, killTarget, tileKey: nextState.type === "main" ? getRouteTileKey(playerId, newSteps) : `home:${nextState.position}` });
  });

  return moves;
}

function wouldKill(game, nextState, attackerId, steps) {
  if (nextState.type !== "main") return null;
  if (SAFE_POSITIONS.includes(nextState.position)) return null;
  for (const player of game.players) {
    if (player.id === attackerId) continue;
    for (const token of player.tokens) {
      if (token.isFinished) continue;
      if (token.position === nextState.position && token.position >= 0) {
        return { playerId: player.id, tokenIndex: player.tokens.indexOf(token) };
      }
    }
  }
  return null;
}

export function applyMove(game, playerId, move) {
  const player = game.players[playerId];
  const token = player.tokens[move.tokenIndex];

  if (move.action === "enter") {
    token.position = getStartPosition(playerId);
    token.steps = 1;
    token.isHome = false;
  } else if (move.action === "finish") {
    token.position = 99;
    token.steps = MAX_PATH_STEPS;
    token.isFinished = true;
    player.finished++;
    if (player.finished === TOKENS_PER_PLAYER) {
      game.winner = playerId;
      game.gameOver = true;
    }
  } else {
    if (move.killTarget) {
      const target = game.players[move.killTarget.playerId].tokens[move.killTarget.tokenIndex];
      target.position = -1;
      target.steps = 0;
      target.isFinished = false;
      target.isHome = false;
    }
    token.position = move.to;
    token.steps = move.steps;
  }

  game.moves.push({
    player: playerId,
    token: move.tokenIndex,
    from: move.from,
    to: move.to,
    action: move.action,
    dice: game.diceValue,
    turn: game.turnCount,
    timestamp: Date.now(),
  });

  return game;
}

export function checkForExtraTurn(diceValue) {
  return diceValue === 6;
}

export function checkThreeConsecutiveSixes(player) {
  return player.consecutiveSixes >= MAX_CONSECUTIVE_SIXES;
}

export { getStartPosition, getRouteState, getRouteTileKey } from "./routeLayout.js";
