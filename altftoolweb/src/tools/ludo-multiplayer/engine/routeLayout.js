export const BOARD_SIZE = 15;
export const MAIN_ROUTE_SIZE = 52;
export const HOME_LANE_SIZE = 6;
export const HOME_LANE_BASE = 100;
export const HOME_ENTRY_STEPS = 50;
export const FINISH_STEPS = 56;
export const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];
export const PLAYER_STARTS = [0, 13, 26, 39];

function buildMainRoute() {
  const route = [];

  for (let x = 2; x <= 14; x += 1) {
    route.push({ x, y: 0 });
  }

  for (let y = 1; y <= 13; y += 1) {
    route.push({ x: 14, y });
  }

  for (let x = 13; x >= 1; x -= 1) {
    route.push({ x, y: 14 });
  }

  for (let y = 13; y >= 1; y -= 1) {
    route.push({ x: 0, y });
  }

  return route;
}

export const MAIN_ROUTE = buildMainRoute();

const HOME_LANES = [
  [
    { x: 6, y: 6 },
    { x: 5, y: 5 },
    { x: 4, y: 4 },
    { x: 3, y: 3 },
    { x: 2, y: 2 },
    { x: 1, y: 1 },
  ],
  [
    { x: 8, y: 6 },
    { x: 9, y: 5 },
    { x: 10, y: 4 },
    { x: 11, y: 3 },
    { x: 12, y: 2 },
    { x: 13, y: 1 },
  ],
  [
    { x: 6, y: 8 },
    { x: 5, y: 9 },
    { x: 4, y: 10 },
    { x: 3, y: 11 },
    { x: 2, y: 12 },
    { x: 1, y: 13 },
  ],
  [
    { x: 8, y: 8 },
    { x: 9, y: 9 },
    { x: 10, y: 10 },
    { x: 11, y: 11 },
    { x: 12, y: 12 },
    { x: 13, y: 13 },
  ],
];

export const HOME_SPAWNS = [
  [
    { x: 1.5, y: 1.5 },
    { x: 4.5, y: 1.5 },
    { x: 1.5, y: 4.5 },
    { x: 4.5, y: 4.5 },
  ],
  [
    { x: 10.5, y: 1.5 },
    { x: 13.5, y: 1.5 },
    { x: 10.5, y: 4.5 },
    { x: 13.5, y: 4.5 },
  ],
  [
    { x: 1.5, y: 10.5 },
    { x: 4.5, y: 10.5 },
    { x: 1.5, y: 13.5 },
    { x: 4.5, y: 13.5 },
  ],
  [
    { x: 10.5, y: 10.5 },
    { x: 13.5, y: 10.5 },
    { x: 10.5, y: 13.5 },
    { x: 13.5, y: 13.5 },
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
