export const BOARD_SIZE = 15;
export const MAIN_ROUTE_SIZE = 52;
export const HOME_LANE_SIZE = 6;
export const HOME_LANE_BASE = 100;
export const HOME_ENTRY_STEPS = 50;
export const FINISH_STEPS = 56;
export const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];
export const PLAYER_STARTS = [0, 13, 39, 26]; // Red, Blue, Green, Yellow start indices

export const MAIN_ROUTE = [
  // Left arm, top row (0-4)
  { x: 1, y: 6 },
  { x: 2, y: 6 },
  { x: 3, y: 6 },
  { x: 4, y: 6 },
  { x: 5, y: 6 },
  // Top arm, left column (5-10)
  { x: 6, y: 5 },
  { x: 6, y: 4 },
  { x: 6, y: 3 },
  { x: 6, y: 2 },
  { x: 6, y: 1 },
  { x: 6, y: 0 },
  // Top middle cell (11)
  { x: 7, y: 0 },
  // Top arm, right column (12-17)
  { x: 8, y: 0 },
  { x: 8, y: 1 },
  { x: 8, y: 2 },
  { x: 8, y: 3 },
  { x: 8, y: 4 },
  { x: 8, y: 5 },
  // Right arm, top row (18-23)
  { x: 9, y: 6 },
  { x: 10, y: 6 },
  { x: 11, y: 6 },
  { x: 12, y: 6 },
  { x: 13, y: 6 },
  { x: 14, y: 6 },
  // Right middle cell (24)
  { x: 14, y: 7 },
  // Right arm, bottom row (25-30)
  { x: 14, y: 8 },
  { x: 13, y: 8 },
  { x: 12, y: 8 },
  { x: 11, y: 8 },
  { x: 10, y: 8 },
  { x: 9, y: 8 },
  // Bottom arm, right column (31-36)
  { x: 8, y: 9 },
  { x: 8, y: 10 },
  { x: 8, y: 11 },
  { x: 8, y: 12 },
  { x: 8, y: 13 },
  { x: 8, y: 14 },
  // Bottom middle cell (37)
  { x: 7, y: 14 },
  // Bottom arm, left column (38-43)
  { x: 6, y: 14 },
  { x: 6, y: 13 },
  { x: 6, y: 12 },
  { x: 6, y: 11 },
  { x: 6, y: 10 },
  { x: 6, y: 9 },
  // Left arm, bottom row (44-49)
  { x: 5, y: 8 },
  { x: 4, y: 8 },
  { x: 3, y: 8 },
  { x: 2, y: 8 },
  { x: 1, y: 8 },
  { x: 0, y: 8 },
  // Left middle cell (50)
  { x: 0, y: 7 },
  // Left arm, first top row cell (51)
  { x: 0, y: 6 },
];

export const HOME_LANES = [
  // Player 0 (Red) - Left to Right along middle row (y=7)
  [
    { x: 1, y: 7 },
    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 5, y: 7 },
    { x: 6, y: 7 },
  ],
  // Player 1 (Blue) - Top to Bottom along middle column (x=7)
  [
    { x: 7, y: 1 },
    { x: 7, y: 2 },
    { x: 7, y: 3 },
    { x: 7, y: 4 },
    { x: 7, y: 5 },
    { x: 7, y: 6 },
  ],
  // Player 2 (Green) - Bottom to Top along middle column (x=7)
  [
    { x: 7, y: 13 },
    { x: 7, y: 12 },
    { x: 7, y: 11 },
    { x: 7, y: 10 },
    { x: 7, y: 9 },
    { x: 7, y: 8 },
  ],
  // Player 3 (Yellow) - Right to Left along middle row (y=7)
  [
    { x: 13, y: 7 },
    { x: 12, y: 7 },
    { x: 11, y: 7 },
    { x: 10, y: 7 },
    { x: 9, y: 7 },
    { x: 8, y: 7 },
  ],
];

export const HOME_SPAWNS = [
  // Player 0 (Red)
  [
    { x: 2.0, y: 2.0 },
    { x: 4.0, y: 2.0 },
    { x: 2.0, y: 4.0 },
    { x: 4.0, y: 4.0 },
  ],
  // Player 1 (Blue)
  [
    { x: 11.0, y: 2.0 },
    { x: 13.0, y: 2.0 },
    { x: 11.0, y: 4.0 },
    { x: 13.0, y: 4.0 },
  ],
  // Player 2 (Green)
  [
    { x: 2.0, y: 11.0 },
    { x: 4.0, y: 11.0 },
    { x: 2.0, y: 13.0 },
    { x: 4.0, y: 13.0 },
  ],
  // Player 3 (Yellow)
  [
    { x: 11.0, y: 11.0 },
    { x: 13.0, y: 11.0 },
    { x: 11.0, y: 13.0 },
    { x: 13.0, y: 13.0 },
  ],
];

export function getStartPosition(playerId) {
  return PLAYER_STARTS[playerId] ?? PLAYER_STARTS[0];
}

export function getMainRouteCoord(index) {
  const safeIndex = Number.isInteger(index) ? index : 0;
  return MAIN_ROUTE[safeIndex] ?? MAIN_ROUTE[0];
}

export function getHomeLaneCoord(playerId, laneIndex) {
  return HOME_LANES[playerId]?.[laneIndex] ?? HOME_LANES[0][0];
}

export function getHomeSpawnCoord(playerId, tokenIndex) {
  return HOME_SPAWNS[playerId]?.[tokenIndex] ?? HOME_SPAWNS[0][0];
}

export function getRouteState(playerId, steps) {
  if (steps <= 1) {
    return {
      type: "main",
      position: getStartPosition(playerId),
      steps,
    };
  }

  if (steps <= HOME_ENTRY_STEPS) {
    return {
      type: "main",
      position: (getStartPosition(playerId) + steps - 1) % MAIN_ROUTE_SIZE,
      steps,
    };
  }

  if (steps <= FINISH_STEPS) {
    return {
      type: "home",
      position: HOME_LANE_BASE + playerId * 10 + (steps - HOME_ENTRY_STEPS),
      steps,
    };
  }

  return {
    type: "finish",
    position: 99,
    steps: FINISH_STEPS,
  };
}

export function getRouteTileKey(playerId, steps) {
  const state = getRouteState(playerId, steps);
  return state.type === "main" ? `main:${state.position}` : state.type === "home" ? `home:${state.position}` : "finish";
}
