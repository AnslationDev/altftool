import { TOTAL_CELLS, TOKENS_PER_PLAYER, SAFE_POSITIONS, HOME_ENTRY, MAX_CONSECUTIVE_SIXES } from "./constants";

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
        moves.push({ tokenIndex: idx, from: -1, to: getStartPosition(playerId), action: "enter" });
      }
      return;
    }

    const newPos = (token.position + game.diceValue) % TOTAL_CELLS;
    const newSteps = token.steps + game.diceValue;

    if (newSteps > 56) return;

    if (newSteps === 56) {
      moves.push({ tokenIndex: idx, from: token.position, to: 99, action: "finish" });
      return;
    }

    if (isInHomeStretch(token.steps, newSteps, playerId)) {
      moves.push({ tokenIndex: idx, from: token.position, to: newPos, action: "move", steps: newSteps });
      return;
    }

    if (canMoveTo(newPos, playerId, token.steps, newSteps)) {
      const kill = wouldKill(game, newPos, playerId);
      moves.push({ tokenIndex: idx, from: token.position, to: newPos, action: kill ? "kill" : "move", steps: newSteps, killTarget: kill });
    }
  });

  return moves;
}

function getStartPosition(playerId) {
  return [0, 13, 26, 39][playerId];
}

function isInHomeStretch(currentSteps, newSteps, playerId) {
  const homeEntry = 50 + playerId * 13;
  return currentSteps >= homeEntry || newSteps > 50;
}

function canMoveTo(pos, playerId, currentSteps, newSteps) {
  const start = getStartPosition(playerId);
  const homeEntryVal = 50;

  if (currentSteps <= 50 && newSteps > 50) return true;
  if (newSteps > 56) return false;
  return true;
}

function wouldKill(game, pos, attackerId) {
  for (const player of game.players) {
    if (player.id === attackerId) continue;
    for (const token of player.tokens) {
      if (token.position === pos && !token.isFinished && !SAFE_POSITIONS.includes(pos)) {
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
    token.steps = 0;
  } else if (move.action === "finish") {
    token.position = 99;
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
