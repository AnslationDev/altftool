import assert from "node:assert/strict";
import test from "node:test";

import { createBoard, findMatches, hasPossibleMoves, replaceDeadBoard } from "./board.js";

const boardFromTypes = (types) =>
  types.map((row, rowIndex) =>
    row.map((type, columnIndex) => ({
      id: rowIndex * row.length + columnIndex,
      type,
    })),
  );

test("a dead board is replaced and the replacement becomes the returned board", () => {
  const deadBoard = boardFromTypes([
    [0, 1],
    [1, 0],
  ]);
  const replacement = boardFromTypes([
    [0, 1, 0],
    [2, 0, 2],
    [1, 0, 1],
  ]);

  assert.equal(hasPossibleMoves(deadBoard), false);
  assert.equal(findMatches(replacement).size, 0);
  assert.equal(hasPossibleMoves(replacement), true);
  assert.deepEqual(replaceDeadBoard(deadBoard, () => replacement), {
    board: replacement,
    replaced: true,
  });
});

test("a playable board is retained without calling the replacement factory", () => {
  const playable = boardFromTypes([
    [0, 1, 0],
    [2, 0, 2],
    [1, 0, 1],
  ]);
  let replacementCalls = 0;

  assert.deepEqual(
    replaceDeadBoard(playable, () => {
      replacementCalls += 1;
      return [];
    }),
    { board: playable, replaced: false },
  );
  assert.equal(replacementCalls, 0);
});

test("board creation remains match-free and playable when random attempts are exhausted", () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    const board = createBoard(8, 8, 6);
    assert.equal(findMatches(board).size, 0);
    assert.equal(hasPossibleMoves(board), true);
  } finally {
    Math.random = originalRandom;
  }
});

test("board creation rejects dimensions that cannot support match-three play", () => {
  assert.throws(() => createBoard(2, 8, 6), /at least 3 rows/i);
  assert.throws(() => createBoard(8, 2, 6), /at least 3 rows/i);
  assert.throws(() => createBoard(8, 8, 2), /at least 3 rows/i);
});
