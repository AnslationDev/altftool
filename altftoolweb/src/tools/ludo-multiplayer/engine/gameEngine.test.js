import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, getValidMoves, applyMove, getRouteState, getRouteTileKey } from './gameEngine.js';

test('route movement uses a continuous path and unlocks tokens correctly', () => {
  const game = createGame(2);
  const player = game.players[0];

  game.diceValue = 6;
  const unlockMoves = getValidMoves(game, 0);
  assert.equal(unlockMoves.length, 4);
  assert.equal(unlockMoves[0].action, 'enter');

  applyMove(game, 0, unlockMoves[0]);
  const startState = getRouteState(0, player.tokens[0].steps);
  assert.equal(startState.type, 'main');
  assert.equal(getRouteTileKey(0, 1), getRouteTileKey(0, player.tokens[0].steps));

  game.diceValue = 1;
  const move = getValidMoves(game, 0).find((candidate) => candidate.steps === 2);
  assert.ok(move, 'expected a one-step move from the start tile');
  applyMove(game, 0, move);
  assert.equal(player.tokens[0].steps, 2);
});

test('a capture sends the opponent token home', () => {
  const game = createGame(2);
  const attacker = game.players[0];
  const defender = game.players[1];

  const attackerToken = attacker.tokens[0];
  const defenderToken = defender.tokens[0];

  attackerToken.steps = 1;
  defenderToken.steps = 1;
  attackerToken.position = 1;
  defenderToken.position = 1;

  const attackerTile = getRouteState(0, attackerToken.steps);
  const defenderTile = getRouteState(1, defenderToken.steps);
  assert.equal(attackerTile.tileKey, defenderTile.tileKey);

  const captureMove = { tokenIndex: 0, from: 1, to: 1, action: 'kill', steps: 1, killTarget: { playerId: 1, tokenIndex: 0 } };
  applyMove(game, 0, captureMove);

  assert.equal(defenderToken.position, -1);
  assert.equal(defenderToken.steps, 0);
});
